import * as Location from 'expo-location';
import { processEvent } from '@/engine/processEvent';
import { SettingsRepository } from '@/repositories/SettingsRepository';
import { haversineKm } from '@/utils/haversine';
import { assertGenuineLocation } from '@/utils/locationIntegrity';
import { Logger } from '@/utils/logger';

const USGS_FEED =
  'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson';
const MIN_MAGNITUDE = 4;
const MAX_DISTANCE_KM = 200;

const settingsRepo = new SettingsRepository();

export interface EarthquakeFeature {
  id: string;
  magnitude: number;
  latitude: number;
  longitude: number;
  timeMs: number;
}

interface UsgsGeoJson {
  features?: {
    id: string;
    properties: { mag: number | null; time: number };
    geometry: { coordinates: [number, number, number] };
  }[];
}

export function parseUsgsFeatures(data: UsgsGeoJson): EarthquakeFeature[] {
  if (!data.features) return [];

  return data.features
    .map(feature => {
      const magnitude = feature.properties.mag;
      if (magnitude == null || Number.isNaN(magnitude)) return null;

      const [longitude, latitude] = feature.geometry.coordinates;
      return {
        id: feature.id,
        magnitude,
        latitude,
        longitude,
        timeMs: feature.properties.time,
      };
    })
    .filter((feature): feature is EarthquakeFeature => feature != null);
}

export function findBestQualifyingEarthquake(
  userLat: number,
  userLon: number,
  features: EarthquakeFeature[],
  options?: { minMagnitude?: number; maxDistanceKm?: number },
): { id: string; magnitude: number; distanceKm: number } | null {
  const minMagnitude = options?.minMagnitude ?? MIN_MAGNITUDE;
  const maxDistanceKm = options?.maxDistanceKm ?? MAX_DISTANCE_KM;

  let best: { id: string; magnitude: number; distanceKm: number } | null = null;

  for (const feature of features) {
    if (feature.magnitude < minMagnitude) continue;

    const distanceKm = haversineKm(userLat, userLon, feature.latitude, feature.longitude);
    if (distanceKm > maxDistanceKm) continue;

    if (!best || feature.magnitude > best.magnitude) {
      best = { id: feature.id, magnitude: feature.magnitude, distanceKm };
    }
  }

  return best;
}

async function wasEarthquakeProcessed(id: string): Promise<boolean> {
  const raw = await settingsRepo.get('earthquake_processed_ids');
  if (!raw) return false;
  try {
    const ids = JSON.parse(raw) as string[];
    return ids.includes(id);
  } catch {
    return false;
  }
}

async function markEarthquakeProcessed(id: string): Promise<void> {
  const raw = await settingsRepo.get('earthquake_processed_ids');
  let ids: string[] = [];
  try {
    ids = raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    ids = [];
  }

  if (!ids.includes(id)) {
    ids.push(id);
    if (ids.length > 50) ids = ids.slice(-50);
    await settingsRepo.set('earthquake_processed_ids', JSON.stringify(ids));
  }
}

export async function checkEarthquakeAndEmitEvents(
  coords?: { latitude: number; longitude: number },
): Promise<string[]> {
  let userLat: number;
  let userLon: number;

  if (coords) {
    userLat = coords.latitude;
    userLon = coords.longitude;
  } else {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return [];

    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      assertGenuineLocation(loc, 'earthquake');
      userLat = loc.coords.latitude;
      userLon = loc.coords.longitude;
    } catch (error) {
      Logger.warn('Earthquake', `Location unavailable: ${String(error)}`);
      return [];
    }
  }

  let data: UsgsGeoJson;
  try {
    const res = await fetch(USGS_FEED);
    if (!res.ok) {
      Logger.error('Earthquake', `USGS API error ${res.status}`);
      return [];
    }
    data = (await res.json()) as UsgsGeoJson;
  } catch (error) {
    Logger.error('Earthquake', 'USGS fetch failed', error);
    return [];
  }

  const features = parseUsgsFeatures(data);
  const match = findBestQualifyingEarthquake(userLat, userLon, features);
  if (!match) return [];

  if (await wasEarthquakeProcessed(match.id)) return [];

  const unlocked = await processEvent({
    type: 'earthquake_felt',
    magnitude: match.magnitude,
    distanceKm: match.distanceKm,
  });

  await markEarthquakeProcessed(match.id);
  if (unlocked.length > 0) {
    Logger.info('Earthquake', `Unlocked: ${unlocked.join(', ')} (M${match.magnitude}, ${Math.round(match.distanceKm)}km)`);
  }

  return unlocked;
}
