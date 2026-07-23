import { roundCoordinate, normalizeCoordinates, LOCATION_DECIMALS } from '@/utils/locationCoords';

describe('locationCoords', () => {
  it('rounds to 4 decimal places', () => {
    expect(roundCoordinate(62.2274123)).toBe(62.2274);
    expect(roundCoordinate(27.0562899)).toBe(27.0563);
  });

  it('normalizes latitude and longitude together', () => {
    expect(normalizeCoordinates(62.2274123, 27.0562899)).toEqual({
      latitude: 62.2274,
      longitude: 27.0563,
    });
  });

  it('treats jitter within precision as the same point', () => {
    const a = normalizeCoordinates(62.22741, 27.05631);
    const b = normalizeCoordinates(62.22739, 27.05629);
    expect(a).toEqual(b);
  });

  it('exports precision constant', () => {
    expect(LOCATION_DECIMALS).toBe(4);
  });
});
