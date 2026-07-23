import { LocationService } from './LocationService';
import { assertNoImpossibleTravel } from '@/utils/locationIntegrity';
import { emitCheckInGameEvents } from './checkInEvents';
import { checkWeatherAndEmitEvents } from './WeatherService';
import { checkEarthquakeAndEmitEvents } from './EarthquakeService';
import { checkSunEvent } from './SunriseService';
import { awardCheckInRewards, awardAchievementRewards } from './CompanionService';
import { CheckInRepository } from '@/repositories/CheckInRepository';
import { updateQuestProgress } from './QuestService';
import { getCheckInQuestTriggers } from './questTriggers';
import { Logger } from '@/utils/logger';

export interface CheckInDependencies {
  locationService: LocationService;
  checkInRepo: CheckInRepository;
}

export interface CheckInResult {
  success: boolean;
  location: { lat: number; lng: number; country: string | null; continent: string | null; address: string | null };
  isNewLocation: boolean;
  isNewLocationToday: boolean;
  unlockedAchievements: string[];
  completedQuests: string[];
  sunPhase: 'sunrise' | 'sunset' | null;
}

let _deps: CheckInDependencies | null = null;

export function initCheckIn(deps: CheckInDependencies) {
  _deps = deps;
}

function deps(): CheckInDependencies {
  if (_deps) return _deps;
  _deps = {
    locationService: new LocationService(),
    checkInRepo: new CheckInRepository(),
  };
  return _deps;
}

const MAX_CHECKINS_PER_DAY = 10;

export async function performCheckIn(): Promise<CheckInResult> {
  const { locationService, checkInRepo } = deps();

  const todayCount = await checkInRepo.countToday();
  if (todayCount >= MAX_CHECKINS_PER_DAY) {
    throw new Error('DAILY_LIMIT_REACHED');
  }

  const loc = await locationService.getCurrentPosition();

  const isNewLocationToday = !(await checkInRepo.hasLocationToday(loc.latitude, loc.longitude));
  const isNewLocation = !(await checkInRepo.hasLocationEver(loc.latitude, loc.longitude));
  Logger.info(
    'CheckIn',
    `coords=${loc.latitude.toFixed(4)},${loc.longitude.toFixed(4)} newToday=${isNewLocationToday} newEver=${isNewLocation}`,
  );

  const previous = await checkInRepo.getLatest();
  assertNoImpossibleTravel(
    { latitude: loc.latitude, longitude: loc.longitude },
    previous
      ? { latitude: previous.latitude, longitude: previous.longitude, createdAt: previous.created_at }
      : null,
  );

  await checkInRepo.save(loc.latitude, loc.longitude, loc.country, loc.continent, loc.address);

  const uniqueLocations = await checkInRepo.countUniqueLocations();
  const uniqueCountries = await checkInRepo.countUniqueCountries();
  const uniqueContinents = await checkInRepo.countUniqueContinents();

  const now = new Date();
  const unlocked = await emitCheckInGameEvents({
    country: loc.country,
    continent: loc.continent,
    latitude: loc.latitude,
    longitude: loc.longitude,
    altitudeMeters: loc.altitudeMeters,
    uniqueLocations,
    uniqueCountries,
    uniqueContinents,
    hour: now.getHours(),
    weekday: now.getDay(),
    previous: previous
      ? {
          latitude: previous.latitude,
          longitude: previous.longitude,
          country: previous.country,
        }
      : null,
  });

  const coords = { latitude: loc.latitude, longitude: loc.longitude };
  const weatherUnlocked = await checkWeatherAndEmitEvents(coords);
  unlocked.push(...weatherUnlocked);

  const earthquakeUnlocked = await checkEarthquakeAndEmitEvents(coords);
  unlocked.push(...earthquakeUnlocked);

  const sun = checkSunEvent(loc.latitude, loc.longitude);
  const completedQuests: string[] = [];
  for (const trigger of getCheckInQuestTriggers(now.getHours())) {
    completedQuests.push(...(await updateQuestProgress(trigger, 1)));
  }
  if (isNewLocation) {
    completedQuests.push(...(await updateQuestProgress('new_location', 1)));
  }

  await awardCheckInRewards();
  if (unlocked.length > 0) {
    await awardAchievementRewards(unlocked.length);
  }

  return {
    success: true,
    location: { lat: loc.latitude, lng: loc.longitude, country: loc.country, continent: loc.continent, address: loc.address },
    isNewLocation,
    isNewLocationToday,
    unlockedAchievements: unlocked,
    completedQuests,
    sunPhase: sun.phase,
  };
}
