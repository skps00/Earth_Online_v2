import { LocationService } from './LocationService';
import { checkSunEvent } from './SunriseService';
import { CheckInRepository } from '@/repositories/CheckInRepository';
import { processEvent } from '@/engine/processEvent';
import { updateQuestProgress } from './QuestService';
import type { GameEvent } from '@/types/events';

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

  const unlocked: string[] = [];

  if (loc.country) {
    const results = await processEvent({
      type: 'checkin_completed',
      country: loc.country,
      continent: loc.continent ?? '',
    });
    unlocked.push(...results);
  }

  const countResults = await processEvent({ type: 'checkin_count', uniqueLocations });
  unlocked.push(...countResults);

  const countryResults = await processEvent({ type: 'country_count', uniqueCountries });
  unlocked.push(...countryResults);

  const continentResults = await processEvent({ type: 'continent_count', uniqueContinents });
  unlocked.push(...continentResults);

  const sun = checkSunEvent(loc.latitude, loc.longitude);
  if (sun.phase) {
    const sunResults = await processEvent({
      type: 'sunrise_sunset',
      phase: sun.phase,
      localTime: sun.localTime ?? '',
    });
    unlocked.push(...sunResults);
  }

  // Update daily quest progress
  const completedQuests = await updateQuestProgress('checkin', 1);

  return {
    success: true,
    location: { lat: loc.latitude, lng: loc.longitude, country: loc.country, continent: loc.continent, address: loc.address },
    unlockedAchievements: unlocked,
    completedQuests,
    sunPhase: sun.phase,
  };
}
