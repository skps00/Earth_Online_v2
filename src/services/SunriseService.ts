import { getTimes } from 'suncalc';

export interface SunResult {
  phase: 'sunrise' | 'sunset' | null;
  localTime: string | null;
}

export function checkSunEvent(lat: number, lng: number): SunResult {
  const now = new Date();
  const times = getTimes(now, lat, lng);
  const THRESHOLD = 30 * 60 * 1000; // 30 minutes

  if (Math.abs(now.getTime() - times.sunrise.getTime()) <= THRESHOLD) {
    return { phase: 'sunrise', localTime: times.sunrise.toLocaleTimeString() };
  }
  if (Math.abs(now.getTime() - times.sunset.getTime()) <= THRESHOLD) {
    return { phase: 'sunset', localTime: times.sunset.toLocaleTimeString() };
  }
  return { phase: null, localTime: null };
}
