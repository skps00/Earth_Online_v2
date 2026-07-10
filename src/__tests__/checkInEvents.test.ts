import { emitCheckInGameEvents } from '@/services/checkInEvents';
import { processEvent } from '@/engine/processEvent';

jest.mock('@/engine/processEvent', () => ({
  processEvent: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/services/SunriseService', () => ({
  checkSunEvent: jest.fn().mockReturnValue({ phase: null, localTime: null }),
}));

const mockedProcessEvent = processEvent as jest.MockedFunction<typeof processEvent>;

describe('emitCheckInGameEvents', () => {
  beforeEach(() => {
    mockedProcessEvent.mockClear();
    mockedProcessEvent.mockResolvedValue([]);
  });

  it('emits altitude_checked when altitude is available', async () => {
    await emitCheckInGameEvents({
      country: 'Japan',
      continent: 'Asia',
      latitude: 35.6,
      longitude: 138.2,
      altitudeMeters: 3776,
      uniqueLocations: 1,
      uniqueCountries: 1,
      uniqueContinents: 1,
      hour: 10,
      weekday: 3,
    });

    expect(mockedProcessEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'altitude_checked', meters: 3776 }),
    );
  });

  it('skips altitude_checked when altitude is null', async () => {
    await emitCheckInGameEvents({
      country: 'Taiwan',
      continent: 'Asia',
      latitude: 25.0,
      longitude: 121.5,
      altitudeMeters: null,
      uniqueLocations: 1,
      uniqueCountries: 1,
      uniqueContinents: 1,
      hour: 10,
      weekday: 3,
    });

    const altitudeCalls = mockedProcessEvent.mock.calls.filter(
      ([event]) => event.type === 'altitude_checked',
    );
    expect(altitudeCalls).toHaveLength(0);
  });

  it('emits time_specific on every check-in', async () => {
    await emitCheckInGameEvents({
      country: 'Taiwan',
      continent: 'Asia',
      latitude: 25.0,
      longitude: 121.5,
      altitudeMeters: null,
      uniqueLocations: 1,
      uniqueCountries: 1,
      uniqueContinents: 1,
      hour: 4,
      weekday: 1,
    });

    expect(mockedProcessEvent).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'time_specific', hour: 4, weekday: 1 }),
    );
  });
});
