import { mapWeatherConditions } from '@/services/WeatherService';

describe('mapWeatherConditions', () => {
  it('maps Thunderstorm to storm and lightning', () => {
    expect(mapWeatherConditions('Thunderstorm', 22)).toEqual(['storm', 'lightning']);
  });

  it('maps rain', () => {
    expect(mapWeatherConditions('Rain', 18)).toEqual(['rain']);
  });

  it('maps extreme heat by temperature', () => {
    expect(mapWeatherConditions('Clear', 40)).toEqual(['extreme_heat']);
  });

  it('maps extreme cold by temperature', () => {
    expect(mapWeatherConditions('Clear', -8)).toEqual(['extreme_cold']);
  });

  it('does not treat clouds as rain', () => {
    expect(mapWeatherConditions('Clouds', 20)).toEqual([]);
  });

  it('combines thunderstorm with extreme heat', () => {
    expect(mapWeatherConditions('Thunderstorm', 39)).toEqual(['storm', 'lightning', 'extreme_heat']);
  });
});
