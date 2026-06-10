import { CheckInRepository } from '@/repositories/CheckInRepository';
import { AchievementRepository } from '@/repositories/AchievementRepository';
import { processEvent } from './processEvent';

const checkInRepo = new CheckInRepository();
const achievementRepo = new AchievementRepository();

export async function reconcile(): Promise<number> {
  let fixed = 0;
  const checkIns = await checkInRepo.getAll();
  const uniqueLocations = await checkInRepo.countUniqueLocations();
  const uniqueCountries = await checkInRepo.countUniqueCountries();
  const uniqueContinents = await checkInRepo.countUniqueContinents();

  const countResults = await processEvent({ type: 'checkin_count', uniqueLocations });
  const countryResults = await processEvent({ type: 'country_count', uniqueCountries });
  const continentResults = await processEvent({ type: 'continent_count', uniqueContinents });

  fixed = countResults.length + countryResults.length + continentResults.length;

  for (const checkIn of checkIns) {
    if (checkIn.country) {
      const results = await processEvent({
        type: 'checkin_completed',
        country: checkIn.country,
        continent: checkIn.continent ?? '',
      });
      fixed += results.length;
    }
  }

  return fixed;
}
