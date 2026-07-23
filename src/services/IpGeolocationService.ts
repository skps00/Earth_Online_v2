import { Logger } from '@/utils/logger';

export interface IpLocationHint {
  countryCode: string | null;
  latitude: number | null;
  longitude: number | null;
}

const IP_GEO_URL = 'https://ipapi.co/json/';
const IP_TIMEOUT_MS = 4_000;

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error('IP_GEO_TIMEOUT')), ms);
    }),
  ]);
}

/**
 * Rough network location from public IP (city/country level only).
 * Skipped in __DEV__. Returns null on failure — callers should fail open.
 */
export async function getIpLocationHint(): Promise<IpLocationHint | null> {
  if (__DEV__) return null;

  try {
    const res = await withTimeout(fetch(IP_GEO_URL), IP_TIMEOUT_MS);
    if (!res.ok) {
      Logger.warn('IpGeo', `HTTP ${res.status}`);
      return null;
    }

    const data = (await res.json()) as {
      country_code?: string;
      latitude?: number;
      longitude?: number;
      error?: boolean;
    };

    if (data.error) {
      Logger.warn('IpGeo', 'Provider returned error');
      return null;
    }

    return {
      countryCode: data.country_code?.toUpperCase() ?? null,
      latitude: typeof data.latitude === 'number' ? data.latitude : null,
      longitude: typeof data.longitude === 'number' ? data.longitude : null,
    };
  } catch (error) {
    Logger.warn('IpGeo', `Lookup failed: ${String(error)}`);
    return null;
  }
}
