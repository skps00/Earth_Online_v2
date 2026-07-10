import { processEvent } from '@/engine/processEvent';
import { checkSunEvent } from '@/services/SunriseService';

export interface CheckInEventInput {
  country: string | null;
  continent: string | null;
  latitude: number;
  longitude: number;
  altitudeMeters: number | null;
  uniqueLocations: number;
  uniqueCountries: number;
  uniqueContinents: number;
  hour: number;
  weekday: number;
}

/** Emit all achievement events tied to a check-in. */
export async function emitCheckInGameEvents(input: CheckInEventInput): Promise<string[]> {
  const unlocked: string[] = [];

  if (input.country) {
    unlocked.push(
      ...(await processEvent({
        type: 'checkin_completed',
        country: input.country,
        continent: input.continent ?? '',
      })),
    );
  }

  unlocked.push(...(await processEvent({ type: 'checkin_count', uniqueLocations: input.uniqueLocations })));
  unlocked.push(...(await processEvent({ type: 'country_count', uniqueCountries: input.uniqueCountries })));
  unlocked.push(...(await processEvent({ type: 'continent_count', uniqueContinents: input.uniqueContinents })));

  if (input.altitudeMeters != null && input.altitudeMeters >= 0) {
    unlocked.push(
      ...(await processEvent({ type: 'altitude_checked', meters: input.altitudeMeters })),
    );
  }

  unlocked.push(
    ...(await processEvent({ type: 'time_specific', hour: input.hour, weekday: input.weekday })),
  );

  const sun = checkSunEvent(input.latitude, input.longitude);
  if (sun.phase) {
    unlocked.push(
      ...(await processEvent({
        type: 'sunrise_sunset',
        phase: sun.phase,
        localTime: sun.localTime ?? '',
      })),
    );
  }

  return unlocked;
}
