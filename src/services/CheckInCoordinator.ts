import { LocationService } from './LocationService';
import { emitCheckInGameEvents } from './checkInEvents';
import { checkWeatherAndEmitEvents } from './WeatherService';
import { checkEarthquakeAndEmitEvents } from './EarthquakeService';
import { checkSunEvent } from './SunriseService';
import { awardCheckInRewards, awardAchievementRewards } from './CompanionService';
import { CheckInRepository } from '@/repositories/CheckInRepository';
import { updateQuestProgress } from './QuestService';
import { getCheckInQuestTriggers } from './questTriggers';

export interface CheckInDependencies {
  locationService: LocationService;
  checkInRepo: CheckInRepository;
}

export interface CheckInResult {
  success: boolean;
  location: { lat: number; lng: number; country: string | null; continent: string | null; address: string | null };
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
  });

  const weatherUnlocked = await checkWeatherAndEmitEvents();
  unlocked.push(...weatherUnlocked);

  const earthquakeUnlocked = await checkEarthquakeAndEmitEvents();
  unlocked.push(...earthquakeUnlocked);

  const sun = checkSunEvent(loc.latitude, loc.longitude);
  const completedQuests: string[] = [];
  for (const trigger of getCheckInQuestTriggers(now.getHours())) {
    completedQuests.push(...(await updateQuestProgress(trigger, 1)));
  }

  await awardCheckInRewards();
  if (unlocked.length > 0) {
    await awardAchievementRewards(unlocked.length);
  }

  return {
    success: true,
    location: { lat: loc.latitude, lng: loc.longitude, country: loc.country, continent: loc.continent, address: loc.address },
    unlockedAchievements: unlocked,
    completedQuests,
    sunPhase: sun.phase,
  };
}
