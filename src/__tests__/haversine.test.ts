import { haversineDistance } from '@/utils/haversine';

describe('haversineDistance', () => {
  it('returns zero for same point', () => {
    expect(haversineDistance(25.0, 121.5, 25.0, 121.5)).toBeCloseTo(0, 5);
  });

  it('computes Tokyo to Osaka roughly 400km', () => {
    const km = haversineDistance(35.6762, 139.6503, 34.6937, 135.5023);
    expect(km).toBeGreaterThan(350);
    expect(km).toBeLessThan(450);
  });

  it('is symmetric', () => {
    const ab = haversineDistance(0, 0, 10, 10);
    const ba = haversineDistance(10, 10, 0, 0);
    expect(ab).toBeCloseTo(ba, 5);
  });

  it('handles antipodal-ish distances', () => {
    const km = haversineDistance(0, 0, 0, 180);
    expect(km).toBeGreaterThan(19000);
    expect(km).toBeLessThan(21000);
  });

  it('handles negative coordinates', () => {
    const km = haversineDistance(-33.8688, 151.2093, -37.8136, 144.9631);
    expect(km).toBeGreaterThan(700);
  });
});
