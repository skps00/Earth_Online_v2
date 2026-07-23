/** ~11 m grid — treats GPS jitter at the same spot as one location. */
export const LOCATION_DECIMALS = 4;

export function roundCoordinate(value: number): number {
  const factor = 10 ** LOCATION_DECIMALS;
  return Math.round(value * factor) / factor;
}

export function normalizeCoordinates(
  latitude: number,
  longitude: number,
): { latitude: number; longitude: number } {
  return {
    latitude: roundCoordinate(latitude),
    longitude: roundCoordinate(longitude),
  };
}
