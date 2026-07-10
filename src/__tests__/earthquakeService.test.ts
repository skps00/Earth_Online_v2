import { haversineKm } from '@/utils/haversine';
import {
  findBestQualifyingEarthquake,
  parseUsgsFeatures,
  type EarthquakeFeature,
} from '@/services/EarthquakeService';

describe('haversineKm', () => {
  it('returns 0 for identical points', () => {
    expect(haversineKm(25.0, 121.5, 25.0, 121.5)).toBeCloseTo(0, 5);
  });

  it('computes Taipei–Kaohsiung distance roughly', () => {
    const km = haversineKm(25.033, 121.565, 22.627, 120.301);
    expect(km).toBeGreaterThan(280);
    expect(km).toBeLessThan(320);
  });
});

describe('parseUsgsFeatures', () => {
  it('skips features without magnitude', () => {
    const features = parseUsgsFeatures({
      features: [
        {
          id: 'eq1',
          properties: { mag: null, time: 1 },
          geometry: { coordinates: [121.5, 25.0, 10] },
        },
      ],
    });
    expect(features).toEqual([]);
  });

  it('parses valid features', () => {
    const features = parseUsgsFeatures({
      features: [
        {
          id: 'eq1',
          properties: { mag: 4.5, time: 123 },
          geometry: { coordinates: [121.5, 25.0, 10] },
        },
      ],
    });
    expect(features).toEqual([
      { id: 'eq1', magnitude: 4.5, latitude: 25.0, longitude: 121.5, timeMs: 123 },
    ]);
  });
});

describe('findBestQualifyingEarthquake', () => {
  const userLat = 25.0;
  const userLon = 121.5;

  const nearStrong: EarthquakeFeature = {
    id: 'near',
    magnitude: 5.2,
    latitude: 25.1,
    longitude: 121.6,
    timeMs: 1,
  };

  const farWeak: EarthquakeFeature = {
    id: 'far',
    magnitude: 3.5,
    latitude: 30.0,
    longitude: 130.0,
    timeMs: 2,
  };

  const nearWeak: EarthquakeFeature = {
    id: 'weak',
    magnitude: 3.9,
    latitude: 25.05,
    longitude: 121.55,
    timeMs: 3,
  };

  it('returns null when nothing qualifies', () => {
    expect(findBestQualifyingEarthquake(userLat, userLon, [farWeak, nearWeak])).toBeNull();
  });

  it('returns strongest earthquake within range', () => {
    const weaker: EarthquakeFeature = { ...nearStrong, id: 'weaker', magnitude: 4.8 };
    const match = findBestQualifyingEarthquake(userLat, userLon, [weaker, nearStrong, farWeak]);
    expect(match?.id).toBe('near');
    expect(match?.magnitude).toBe(5.2);
    expect(match?.distanceKm).toBeLessThan(200);
  });
});
