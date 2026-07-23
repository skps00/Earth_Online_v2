/**
 * Check-in transition helpers for auto travel achievements.
 */

/** True when the short great-circle arc between longitudes crosses the antimeridian (±180°). */
export function crossesDateLine(lonPrev: number, lonNext: number): boolean {
  if (!Number.isFinite(lonPrev) || !Number.isFinite(lonNext)) return false;
  return Math.abs(lonNext - lonPrev) > 180;
}

/** True when both countries are known and changed. */
export function crossedNationalBorder(
  prevCountry: string | null | undefined,
  nextCountry: string | null | undefined,
): boolean {
  if (!prevCountry || !nextCountry) return false;
  return prevCountry !== nextCountry;
}
