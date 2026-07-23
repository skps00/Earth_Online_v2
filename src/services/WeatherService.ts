import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { processEvent } from '@/engine/processEvent';
import type { WeatherCondition } from '@/types/events';
import { assertGenuineLocation } from '@/utils/locationIntegrity';
import { Logger } from '@/utils/logger';
const API_KEY =
  (Constants.expoConfig?.extra?.OPENWEATHERMAP_API_KEY as string | undefined) ?? '';

interface OWMResponse {
  weather?: { main: string }[];
  main?: { temp: number };
}

/** Map OpenWeather main + temperature to one or more achievement weather conditions. */
export function mapWeatherConditions(main: string, tempC: number): WeatherCondition[] {
  const m = main.toLowerCase();
  const conditions: WeatherCondition[] = [];

  if (m.includes('thunder') || m.includes('storm')) {
    conditions.push('storm', 'lightning');
  }
  if (m.includes('rain') || m.includes('drizzle')) {
    conditions.push('rain');
  }
  if (m.includes('snow')) {
    conditions.push('snow');
  }
  if (m.includes('fog') || m.includes('mist') || m.includes('haze')) {
    conditions.push('fog');
  }
  if (tempC >= 38) {
    conditions.push('extreme_heat');
  }
  if (tempC <= -5) {
    conditions.push('extreme_cold');
  }

  return [...new Set(conditions)];
}

export async function checkWeatherAndEmitEvents(
  coords?: { latitude: number; longitude: number },
): Promise<string[]> {
  if (!API_KEY) {
    Logger.info('Weather', 'OPENWEATHERMAP_API_KEY not configured');
    return [];
  }

  let latitude: number;
  let longitude: number;

  if (coords) {
    latitude = coords.latitude;
    longitude = coords.longitude;
  } else {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status !== 'granted') return [];

    try {
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low });
      assertGenuineLocation(loc, 'weather');
      latitude = loc.coords.latitude;
      longitude = loc.coords.longitude;
    } catch (error) {
      Logger.warn('Weather', `Location unavailable: ${String(error)}`);
      return [];
    }
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`;

  const res = await fetch(url);
  if (!res.ok) {
    Logger.error('Weather', `API error ${res.status}`);
    return [];
  }

  const data = (await res.json()) as OWMResponse;
  const main = data.weather?.[0]?.main ?? '';
  const temp = data.main?.temp ?? 20;
  const conditions = mapWeatherConditions(main, temp);
  if (conditions.length === 0) return [];

  const unlocked: string[] = [];
  for (const condition of conditions) {
    unlocked.push(...(await processEvent({ type: 'weather_checked', condition })));
  }
  return unlocked;
}
