import type { LocationObject } from 'expo-location';
import type { IpLocationHint } from '@/services/IpGeolocationService';
import { haversineKm } from '@/utils/haversine';
import { Logger } from '@/utils/logger';

/** Commercial jet speed + buffer — impossible travel if exceeded. */
const MAX_TRAVEL_SPEED_KMH = 900;
const MIN_TELEPORT_DISTANCE_KM = 1;
/** Reject fixes worse than ~1 km when accuracy is reported. */
const MAX_ACCURACY_METERS = 1_000;
/** IP geolocation vs GPS — flag only extreme mismatches (same country border cases). */
const MAX_IP_GPS_DISTANCE_KM = 2_500;
/** Device TZ vs longitude/15 solar estimate — generous to avoid travel false positives. */
const MAX_TZ_OFFSET_DIFF_HOURS = 5;

export interface PreviousCheckIn {
  latitude: number;
  longitude: number;
  createdAt: string;
}

/**
 * Reject coordinates from mock-location apps (Android isFromMockProvider).
 * Skipped in __DEV__ so emulator / Studio mock location still works for testing.
 */
export function assertGenuineLocation(position: LocationObject, context: string): void {
  if (!position.mocked) return;

  Logger.warn('Location', `Mock GPS detected (${context})`);

  if (__DEV__) {
    Logger.warn('Location', 'DEV build: allowing mocked position for emulator testing');
    return;
  }

  throw new Error('GPS_MOCKED');
}

/**
 * Require a reasonably fresh, precise fix in production check-ins.
 */
export function assertGpsQuality(position: LocationObject, source: string): void {
  if (__DEV__) return;

  if (source === 'lastKnownStale') {
    Logger.warn('Location', 'Rejected stale cached GPS for check-in');
    throw new Error('GPS_STALE_LOCATION');
  }

  const accuracy = position.coords.accuracy;
  if (accuracy != null && accuracy > MAX_ACCURACY_METERS) {
    Logger.warn('Location', `GPS accuracy too low: ${accuracy}m`);
    throw new Error('GPS_ACCURACY_LOW');
  }
}

/**
 * Block teleporting between check-ins faster than commercial flight speed.
 */
export function assertNoImpossibleTravel(
  current: { latitude: number; longitude: number },
  previous: PreviousCheckIn | null,
): void {
  if (__DEV__ || !previous) return;

  const distanceKm = haversineKm(
    current.latitude,
    current.longitude,
    previous.latitude,
    previous.longitude,
  );
  if (distanceKm < MIN_TELEPORT_DISTANCE_KM) return;

  const elapsedMs = Date.now() - new Date(previous.createdAt).getTime();
  if (elapsedMs <= 0) return;

  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  const minHoursNeeded = distanceKm / MAX_TRAVEL_SPEED_KMH;

  if (elapsedHours < minHoursNeeded * 0.85) {
    Logger.warn(
      'Location',
      `Teleport suspected: ${distanceKm.toFixed(0)}km in ${(elapsedHours * 60).toFixed(1)}min`,
    );
    throw new Error('GPS_TELEPORT');
  }
}

/**
 * Soft anti-cheat: GPS country should match network IP country when both are known.
 */
export function assertIpConsistentWithGps(
  gps: { countryCode: string | null; latitude: number; longitude: number },
  ip: IpLocationHint | null,
): void {
  if (__DEV__ || !ip?.countryCode) return;

  const gpsCode = gps.countryCode?.toUpperCase() ?? null;
  if (!gpsCode) {
    Logger.info('Location', 'IP check skipped: GPS country code unknown');
    return;
  }

  const ipCode = ip.countryCode.toUpperCase();
  if (gpsCode !== ipCode) {
    Logger.warn('Location', `IP/GPS country mismatch: GPS=${gpsCode} IP=${ipCode}`);
    throw new Error('GPS_IP_MISMATCH');
  }

  if (ip.latitude != null && ip.longitude != null) {
    const ipDistanceKm = haversineKm(gps.latitude, gps.longitude, ip.latitude, ip.longitude);
    if (ipDistanceKm > MAX_IP_GPS_DISTANCE_KM) {
      Logger.warn('Location', `IP/GPS distance too far: ${ipDistanceKm.toFixed(0)}km`);
      throw new Error('GPS_IP_MISMATCH');
    }
  }
}

/** Coarse UTC offset from longitude (15° ≈ 1h). No IANA / geo-tz. */
export function solarUtcOffsetHours(longitude: number): number {
  return longitude / 15;
}

/** `Date.getTimezoneOffset()` minutes west of UTC → hours east of UTC. */
export function deviceUtcOffsetHours(timezoneOffsetMinutes = new Date().getTimezoneOffset()): number {
  return -timezoneOffsetMinutes / 60;
}

/** Smallest absolute hour distance on a 24h circle (date-line safe). */
export function utcOffsetDiffHours(a: number, b: number): number {
  let d = Math.abs(a - b) % 24;
  if (d > 12) d = 24 - d;
  return d;
}

/**
 * Hard-fail when device timezone is wildly inconsistent with GPS longitude.
 * Fail-open only if either value is non-finite; skipped in __DEV__.
 */
export function assertTimezoneConsistentWithGps(
  longitude: number,
  deviceOffsetHours: number = deviceUtcOffsetHours(),
): void {
  if (__DEV__) return;
  if (!Number.isFinite(longitude) || !Number.isFinite(deviceOffsetHours)) {
    Logger.info('Location', 'TZ check skipped: missing offset or longitude');
    return;
  }

  const solar = solarUtcOffsetHours(longitude);
  const diff = utcOffsetDiffHours(deviceOffsetHours, solar);
  if (diff > MAX_TZ_OFFSET_DIFF_HOURS) {
    Logger.warn(
      'Location',
      `TZ/GPS mismatch: device=${deviceOffsetHours.toFixed(1)}h solar≈${solar.toFixed(1)}h diff=${diff.toFixed(1)}h`,
    );
    throw new Error('GPS_TZ_MISMATCH');
  }
}
