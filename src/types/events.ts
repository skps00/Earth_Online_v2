export type WeatherCondition = 'rain' | 'storm' | 'lightning' | 'extreme_heat' | 'extreme_cold' | 'snow' | 'fog' | 'hurricane';
export type ActivityKind = 'walking' | 'running' | 'cycling' | 'driving' | 'swimming';
export type SunPhase = 'sunrise' | 'sunset' | 'solar_noon' | 'golden_hour';
export type ScreenTimeResult = 'earlybird' | 'allnighter' | 'no_phone';

export type GameEvent =
  | {
      type: 'checkin_completed';
      country: string;
      continent: string;
      city?: string;
      /** Previous check-in was in a different country. */
      crossedBorder?: boolean;
      /** Short arc from previous longitude crossed ±180°. */
      crossedDateline?: boolean;
      uniqueCountries?: number;
    }
  | { type: 'checkin_count'; uniqueLocations: number }
  | { type: 'country_count'; uniqueCountries: number }
  | { type: 'continent_count'; uniqueContinents: number }
  | { type: 'weather_checked'; condition: WeatherCondition }
  | { type: 'earthquake_felt'; magnitude: number; distanceKm: number }
  | { type: 'activity_updated'; kind: ActivityKind; minutes: number }
  | { type: 'screentime_checked'; result: ScreenTimeResult }
  | { type: 'altitude_checked'; meters: number }
  | { type: 'steps_daily'; count: number }
  | { type: 'sunrise_sunset'; phase: SunPhase; localTime: string }
  | { type: 'time_specific'; hour: number; weekday: number }
  | { type: 'quest_completed'; questId: string }
  | { type: 'companion_event'; event: 'level_up' | 'evolve' | 'rename' }
  | { type: 'manual_confirm'; achievementId: string }
  | { type: 'battery_low' }
  | { type: 'charging_state'; isCharging: boolean }
  ;
