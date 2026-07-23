import { normalizeCoordinates } from '@/utils/locationCoords';

/**
 * Pure logic mirror of CheckInCoordinator new-location gating.
 * Quest progress uses isNewLocation (ever), not isNewLocationToday.
 */
export function shouldCountNewLocation(
  coords: { lat: number; lng: number },
  history: Array<{ lat: number; lng: number }>,
): boolean {
  const { latitude, longitude } = normalizeCoordinates(coords.lat, coords.lng);
  return !history.some((h) => {
    const n = normalizeCoordinates(h.lat, h.lng);
    return n.latitude === latitude && n.longitude === longitude;
  });
}

describe('new location logic', () => {
  const home = { lat: 25.0338, lng: 121.5645 };
  const jitter = { lat: 25.03381, lng: 121.56449 };

  it('counts first visit at a coordinate grid', () => {
    expect(shouldCountNewLocation(home, [])).toBe(true);
  });

  it('does not count when same grid was visited on a previous day', () => {
    expect(shouldCountNewLocation(home, [home])).toBe(false);
  });

  it('does not count GPS jitter at the same spot', () => {
    expect(shouldCountNewLocation(jitter, [home])).toBe(false);
  });

  it('counts a genuinely different coordinate grid', () => {
    const other = { lat: 25.0341, lng: 121.565 };
    expect(shouldCountNewLocation(other, [home])).toBe(true);
  });

  it('does not count repeat check-in same day at same spot', () => {
    expect(shouldCountNewLocation(home, [home, home])).toBe(false);
  });
});
