import * as Location from 'expo-location';
import { continentFromCountry } from '@/utils/continentMapper';
import { Logger } from '@/utils/logger';

export interface LocationResult {
  latitude: number;
  longitude: number;
  altitudeMeters: number | null;
  country: string | null;
  continent: string | null;
  address: string | null;
}

const DEV_FALLBACK: LocationResult = {
  latitude: 25.033,
  longitude: 121.5654,
  altitudeMeters: null,
  country: 'Taiwan',
  continent: 'Asia',
  address: 'Taipei (Dev Mock)',
};

function normalizeAltitude(altitude: number | null | undefined): number | null {
  if (altitude == null || Number.isNaN(altitude)) return null;
  return Math.round(altitude);
}

async function reverseGeocode(latitude: number, longitude: number): Promise<Pick<LocationResult, 'country' | 'continent' | 'address'>> {
  try {
    const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
    const best = geocode[0];
    const country = best?.country ?? null;
    const continent = country ? continentFromCountry(country) : null;
    const address = best ? [best.city, best.street, best.name].filter(Boolean).join(', ') : null;
    return { country, continent, address };
  } catch {
    return { country: null, continent: null, address: null };
  }
}

function toResult(
  latitude: number,
  longitude: number,
  altitudeMeters: number | null,
  meta: Pick<LocationResult, 'country' | 'continent' | 'address'>,
): LocationResult {
  return { latitude, longitude, altitudeMeters, ...meta };
}

export class LocationService {
  async getCurrentPosition(): Promise<LocationResult> {
    Logger.info('Location', 'Requesting position...');

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Logger.warn('Location', 'Permission denied');
      throw new Error('GPS_DENIED');
    }

    const servicesEnabled = await Location.hasServicesEnabledAsync();
    if (!servicesEnabled) {
      Logger.warn('Location', 'Location services disabled');
      throw new Error('GPS_DISABLED');
    }

    let latitude: number;
    let longitude: number;
    let altitudeMeters: number | null = null;
    let source = 'current';

    try {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      latitude = pos.coords.latitude;
      longitude = pos.coords.longitude;
      altitudeMeters = normalizeAltitude(pos.coords.altitude);
    } catch (error) {
      Logger.warn('Location', `getCurrentPosition failed, trying last known position: ${String(error)}`);

      const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 });
      if (last) {
        latitude = last.coords.latitude;
        longitude = last.coords.longitude;
        altitudeMeters = normalizeAltitude(last.coords.altitude);
        source = 'lastKnown';
      } else if (__DEV__) {
        Logger.warn('Location', 'Using dev mock coordinates (emulator / no GPS fix)');
        return DEV_FALLBACK;
      } else {
        throw new Error('GPS_UNAVAILABLE');
      }
    }

    const meta = await reverseGeocode(latitude, longitude);
    Logger.info('Location', `Position (${source}): ${latitude.toFixed(4)}, ${longitude.toFixed(4)} alt=${altitudeMeters ?? 'n/a'}`);
    return toResult(latitude, longitude, altitudeMeters, meta);
  }
}
