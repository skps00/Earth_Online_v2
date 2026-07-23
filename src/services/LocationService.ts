import * as Location from 'expo-location';
import { continentFromCountry } from '@/utils/continentMapper';
import {
  assertGenuineLocation,
  assertGpsQuality,
  assertIpConsistentWithGps,
  assertTimezoneConsistentWithGps,
} from '@/utils/locationIntegrity';
import { getIpLocationHint } from '@/services/IpGeolocationService';
import { Logger } from '@/utils/logger';

export interface LocationResult {
  latitude: number;
  longitude: number;
  altitudeMeters: number | null;
  country: string | null;
  countryCode: string | null;
  continent: string | null;
  address: string | null;
}

const DEV_FALLBACK: LocationResult = {
  latitude: 25.033,
  longitude: 121.5654,
  altitudeMeters: null,
  country: 'Taiwan',
  countryCode: 'TW',
  continent: 'Asia',
  address: 'Taipei (Dev Mock)',
};

/** Fresh GPS fix — emulator without mock location can hang indefinitely without this. */
const GPS_TIMEOUT_MS = 8_000;
/** Prefer cached fix when recent (similar to Android Fused Location fast path). */
const FRESH_LAST_KNOWN_MS = 2 * 60 * 1000;
const STALE_LAST_KNOWN_MS = 30 * 60 * 1000;
const GEOCODE_TIMEOUT_MS = 5_000;

function normalizeAltitude(altitude: number | null | undefined): number | null {
  if (altitude == null || Number.isNaN(altitude)) return null;
  return Math.round(altitude);
}

async function withTimeout<T>(promise: Promise<T>, ms: number, errorCode: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorCode)), ms);
    }),
  ]);
}

async function reverseGeocode(latitude: number, longitude: number): Promise<Pick<LocationResult, 'country' | 'countryCode' | 'continent' | 'address'>> {
  try {
    const geocode = await withTimeout(
      Location.reverseGeocodeAsync({ latitude, longitude }),
      GEOCODE_TIMEOUT_MS,
      'GEOCODE_TIMEOUT',
    );
    const best = geocode[0];
    const country = best?.country ?? null;
    const countryCode = best?.isoCountryCode?.toUpperCase() ?? null;
    const continent = country ? continentFromCountry(country) : null;
    const address = best ? [best.city, best.street, best.name].filter(Boolean).join(', ') : null;
    return { country, countryCode, continent, address };
  } catch {
    return { country: null, countryCode: null, continent: null, address: null };
  }
}

function toResult(
  latitude: number,
  longitude: number,
  altitudeMeters: number | null,
  meta: Pick<LocationResult, 'country' | 'countryCode' | 'continent' | 'address'>,
): LocationResult {
  return { latitude, longitude, altitudeMeters, ...meta };
}

async function finalizePosition(
  latitude: number,
  longitude: number,
  altitudeMeters: number | null,
  meta: Pick<LocationResult, 'country' | 'countryCode' | 'continent' | 'address'>,
  source: string,
): Promise<LocationResult> {
  const ipHint = await getIpLocationHint();
  assertIpConsistentWithGps(
    { countryCode: meta.countryCode, latitude, longitude },
    ipHint,
  );
  assertTimezoneConsistentWithGps(longitude);
  Logger.info('Location', `Position (${source}): ${latitude.toFixed(4)}, ${longitude.toFixed(4)} alt=${altitudeMeters ?? 'n/a'}`);
  return toResult(latitude, longitude, altitudeMeters, meta);
}

function fromPosition(
  pos: Location.LocationObject,
  source: string,
): { latitude: number; longitude: number; altitudeMeters: number | null; source: string } {
  assertGenuineLocation(pos, source);
  assertGpsQuality(pos, source);
  return {
    latitude: pos.coords.latitude,
    longitude: pos.coords.longitude,
    altitudeMeters: normalizeAltitude(pos.coords.altitude),
    source,
  };
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

    const fresh = await Location.getLastKnownPositionAsync({ maxAge: FRESH_LAST_KNOWN_MS });
    if (fresh) {
      const { latitude, longitude, altitudeMeters, source } = fromPosition(fresh, 'lastKnownFresh');
      const meta = await reverseGeocode(latitude, longitude);
      return finalizePosition(latitude, longitude, altitudeMeters, meta, source);
    }

    let latitude: number;
    let longitude: number;
    let altitudeMeters: number | null = null;
    let source = 'current';

    try {
      const pos = await withTimeout(
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
        GPS_TIMEOUT_MS,
        'GPS_TIMEOUT',
      );
      ({ latitude, longitude, altitudeMeters, source } = fromPosition(pos, 'current'));
    } catch (error) {
      Logger.warn('Location', `getCurrentPosition failed, trying last known position: ${String(error)}`);

      const last = await Location.getLastKnownPositionAsync({ maxAge: STALE_LAST_KNOWN_MS });
      if (last) {
        ({ latitude, longitude, altitudeMeters, source } = fromPosition(last, 'lastKnownStale'));
      } else if (__DEV__) {
        Logger.warn('Location', 'Using dev mock coordinates (emulator / no GPS fix)');
        return DEV_FALLBACK;
      } else {
        const code = error instanceof Error && error.message === 'GPS_TIMEOUT' ? 'GPS_TIMEOUT' : 'GPS_UNAVAILABLE';
        throw new Error(code);
      }
    }

    const meta = await reverseGeocode(latitude, longitude);
    return finalizePosition(latitude, longitude, altitudeMeters, meta, source);
  }
}
