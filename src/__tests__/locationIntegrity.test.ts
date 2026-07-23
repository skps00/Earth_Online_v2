describe('assertGenuineLocation', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('allows genuine positions in production', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertGenuineLocation } = require('@/utils/locationIntegrity');
    expect(() =>
      assertGenuineLocation(
        { coords: { latitude: 25, longitude: 121, altitude: null, accuracy: 10, altitudeAccuracy: null, heading: null, speed: null }, timestamp: 0 },
        'test',
      ),
    ).not.toThrow();
  });

  it('rejects mocked positions in production', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertGenuineLocation } = require('@/utils/locationIntegrity');
    expect(() =>
      assertGenuineLocation(
        {
          coords: { latitude: 25, longitude: 121, altitude: null, accuracy: 10, altitudeAccuracy: null, heading: null, speed: null },
          timestamp: 0,
          mocked: true,
        },
        'test',
      ),
    ).toThrow('GPS_MOCKED');
  });

  it('allows mocked positions in dev builds', () => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    const { assertGenuineLocation } = require('@/utils/locationIntegrity');
    expect(() =>
      assertGenuineLocation(
        {
          coords: { latitude: 25, longitude: 121, altitude: null, accuracy: 10, altitudeAccuracy: null, heading: null, speed: null },
          timestamp: 0,
          mocked: true,
        },
        'test',
      ),
    ).not.toThrow();
  });
});

describe('assertGpsQuality', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;
  const coords = { latitude: 25, longitude: 121, altitude: null, accuracy: 10, altitudeAccuracy: null, heading: null, speed: null };

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('rejects stale cached fixes in production', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertGpsQuality } = require('@/utils/locationIntegrity');
    expect(() => assertGpsQuality({ coords, timestamp: 0 }, 'lastKnownStale')).toThrow('GPS_STALE_LOCATION');
  });

  it('rejects very low accuracy in production', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertGpsQuality } = require('@/utils/locationIntegrity');
    expect(() =>
      assertGpsQuality({ coords: { ...coords, accuracy: 5000 }, timestamp: 0 }, 'current'),
    ).toThrow('GPS_ACCURACY_LOW');
  });
});

describe('assertNoImpossibleTravel', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('allows realistic travel speed', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertNoImpossibleTravel } = require('@/utils/locationIntegrity');
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(() =>
      assertNoImpossibleTravel(
        { latitude: 25.1, longitude: 121.6 },
        { latitude: 25.0, longitude: 121.5, createdAt: fiveMinutesAgo },
      ),
    ).not.toThrow();
  });

  it('rejects teleport-scale movement', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertNoImpossibleTravel } = require('@/utils/locationIntegrity');
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();
    expect(() =>
      assertNoImpossibleTravel(
        { latitude: 35.6, longitude: 139.7 },
        { latitude: 25.0, longitude: 121.5, createdAt: oneMinuteAgo },
      ),
    ).toThrow('GPS_TELEPORT');
  });
});

describe('assertIpConsistentWithGps', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('allows matching country codes in production', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertIpConsistentWithGps } = require('@/utils/locationIntegrity');
    expect(() =>
      assertIpConsistentWithGps(
        { countryCode: 'TW', latitude: 25, longitude: 121 },
        { countryCode: 'TW', latitude: 24, longitude: 121 },
      ),
    ).not.toThrow();
  });

  it('rejects mismatched country codes in production', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertIpConsistentWithGps } = require('@/utils/locationIntegrity');
    expect(() =>
      assertIpConsistentWithGps(
        { countryCode: 'JP', latitude: 35.6, longitude: 139.7 },
        { countryCode: 'TW', latitude: 25, longitude: 121 },
      ),
    ).toThrow('GPS_IP_MISMATCH');
  });

  it('rejects extreme IP/GPS distance even when country matches', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertIpConsistentWithGps } = require('@/utils/locationIntegrity');
    expect(() =>
      assertIpConsistentWithGps(
        { countryCode: 'US', latitude: 40.7, longitude: -74.0 },
        { countryCode: 'US', latitude: 21.3, longitude: -157.8 },
      ),
    ).toThrow('GPS_IP_MISMATCH');
  });

  it('fails open when IP hint is missing', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertIpConsistentWithGps } = require('@/utils/locationIntegrity');
    expect(() =>
      assertIpConsistentWithGps({ countryCode: 'JP', latitude: 35.6, longitude: 139.7 }, null),
    ).not.toThrow();
  });
});

describe('utcOffsetDiffHours / assertTimezoneConsistentWithGps', () => {
  const originalDev = (global as { __DEV__?: boolean }).__DEV__;

  afterEach(() => {
    (global as { __DEV__?: boolean }).__DEV__ = originalDev;
  });

  it('treats date-line opposite offsets as near (wrap)', () => {
    const { utcOffsetDiffHours } = require('@/utils/locationIntegrity');
    expect(utcOffsetDiffHours(12, -12)).toBeCloseTo(0);
    expect(utcOffsetDiffHours(11, -11)).toBeCloseTo(2);
  });

  it('allows matching device TZ and GPS longitude in production', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertTimezoneConsistentWithGps } = require('@/utils/locationIntegrity');
    // Taipei ~121.5° → solar ≈ +8.1h; device UTC+8
    expect(() => assertTimezoneConsistentWithGps(121.5, 8)).not.toThrow();
  });

  it('rejects big TZ vs GPS mismatch in production', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertTimezoneConsistentWithGps } = require('@/utils/locationIntegrity');
    // NYC longitude with Taiwan device TZ
    expect(() => assertTimezoneConsistentWithGps(-74, 8)).toThrow('GPS_TZ_MISMATCH');
  });

  it('allows near date-line when both sides agree', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertTimezoneConsistentWithGps } = require('@/utils/locationIntegrity');
    // ~179°E → solar ≈ +11.9h; device UTC+12
    expect(() => assertTimezoneConsistentWithGps(179, 12)).not.toThrow();
    // ~-179°W → solar ≈ -11.9h; device UTC-12 (wrap-near to +12 solar still ok)
    expect(() => assertTimezoneConsistentWithGps(-179, -12)).not.toThrow();
  });

  it('fails open on non-finite inputs', () => {
    (global as { __DEV__?: boolean }).__DEV__ = false;
    const { assertTimezoneConsistentWithGps } = require('@/utils/locationIntegrity');
    expect(() => assertTimezoneConsistentWithGps(Number.NaN, 8)).not.toThrow();
    expect(() => assertTimezoneConsistentWithGps(121, Number.NaN)).not.toThrow();
  });

  it('skips in __DEV__', () => {
    (global as { __DEV__?: boolean }).__DEV__ = true;
    const { assertTimezoneConsistentWithGps } = require('@/utils/locationIntegrity');
    expect(() => assertTimezoneConsistentWithGps(-74, 8)).not.toThrow();
  });
});
