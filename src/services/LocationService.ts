import * as Location from 'expo-location';
import { continentFromCountry } from '@/utils/continentMapper';
import { Logger } from '@/utils/logger';

export interface LocationResult {
  latitude: number;
  longitude: number;
  country: string | null;
  continent: string | null;
  address: string | null;
}

export class LocationService {
  async getCurrentPosition(): Promise<LocationResult> {
    Logger.info('Location', 'Requesting position...');
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Logger.warn('Location', 'Permission denied');
      throw new Error('GPS_DENIED');
    }

    const pos = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      timeInterval: 15000,
    });

    const { latitude, longitude } = pos.coords;
    const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
    const best = geocode[0];
    const country = best?.country ?? null;
    const continent = country ? continentFromCountry(country) : null;
    const address = best ? [best.city, best.street, best.name].filter(Boolean).join(', ') : null;

    Logger.info('Location', `Position: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
    return { latitude, longitude, country, continent, address };
  }
}
