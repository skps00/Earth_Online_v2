import { CheckInRepository } from '@/repositories/CheckInRepository';
import { processEvent } from './processEvent';
import { crossedNationalBorder, crossesDateLine } from '@/utils/checkInTransitions';

const checkInRepo = new CheckInRepository();

export async function reconcile(): Promise<number> {
  let fixed = 0;
  const checkInsDesc = await checkInRepo.getAll();
  const checkIns = [...checkInsDesc].reverse();
  const uniqueLocations = await checkInRepo.countUniqueLocations();
  const uniqueCountries = await checkInRepo.countUniqueCountries();
  const uniqueContinents = await checkInRepo.countUniqueContinents();

  const countResults = await processEvent({ type: 'checkin_count', uniqueLocations });
  const countryResults = await processEvent({ type: 'country_count', uniqueCountries });
  const continentResults = await processEvent({ type: 'continent_count', uniqueContinents });

  fixed = countResults.length + countryResults.length + continentResults.length;

  let previous: (typeof checkIns)[number] | null = null;
  for (const checkIn of checkIns) {
    if (checkIn.country) {
      const results = await processEvent({
        type: 'checkin_completed',
        country: checkIn.country,
        continent: checkIn.continent ?? '',
        crossedBorder: crossedNationalBorder(previous?.country, checkIn.country),
        crossedDateline: previous != null && crossesDateLine(previous.longitude, checkIn.longitude),
        uniqueCountries,
      });
      fixed += results.length;
    }
    previous = checkIn;
  }

  return fixed;
}
