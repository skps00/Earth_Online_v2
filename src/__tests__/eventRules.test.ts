import { getRuleForEvent } from '@/engine/eventRules';
import type { AchievementDefinitionRow } from '@/types/database';

const def = (overrides: Partial<AchievementDefinitionRow> = {}): AchievementDefinitionRow => ({
  id: 'test_ach',
  category: 'Travel',
  prerequisite_id: null,
  rarity: 'Common',
  trigger_type: 'checkin_count',
  trigger_goal: 5,
  reward_points: 10,
  is_hidden: 0,
  prompt_photo: 0,
  icon: '📍',
  ...overrides,
});

describe('eventRules', () => {
  it('unlocks checkin_completed without condition', () => {
    const rule = getRuleForEvent('checkin_completed')!;
    expect(rule.action).toBe('unlock');
    expect(rule.check(def(), { type: 'checkin_completed', country: 'Japan', continent: 'Asia' }, null)).toBe(true);
  });

  it('filters checkin_completed by country condition', () => {
    const rule = getRuleForEvent('checkin_completed')!;
    const condition = JSON.stringify({ country: 'Japan' });
    expect(rule.check(def(), { type: 'checkin_completed', country: 'Japan', continent: 'Asia' }, condition)).toBe(true);
    expect(rule.check(def(), { type: 'checkin_completed', country: 'France', continent: 'Europe' }, condition)).toBe(false);
  });

  it('progresses checkin_count when threshold met', () => {
    const rule = getRuleForEvent('checkin_count')!;
    expect(rule.check(def({ trigger_goal: 5 }), { type: 'checkin_count', uniqueLocations: 5 }, null)).toBe(true);
    expect(rule.check(def({ trigger_goal: 5 }), { type: 'checkin_count', uniqueLocations: 3 }, null)).toBe(false);
  });

  it('progresses country_count', () => {
    const rule = getRuleForEvent('country_count')!;
    expect(rule.check(def({ trigger_goal: 3 }), { type: 'country_count', uniqueCountries: 3 }, null)).toBe(true);
  });

  it('unlocks sunrise_sunset with phase filter', () => {
    const rule = getRuleForEvent('sunrise_sunset')!;
    const condition = JSON.stringify({ phase: 'sunrise' });
    expect(rule.check(def(), { type: 'sunrise_sunset', phase: 'sunrise', localTime: '06:00' }, condition)).toBe(true);
    expect(rule.check(def(), { type: 'sunrise_sunset', phase: 'sunset', localTime: '18:00' }, condition)).toBe(false);
  });

  it('unlocks manual_confirm for matching achievement id', () => {
    const rule = getRuleForEvent('manual_confirm')!;
    expect(rule.check(def({ id: 'explore_beach' }), { type: 'manual_confirm', achievementId: 'explore_beach' }, null)).toBe(true);
    expect(rule.check(def({ id: 'explore_beach' }), { type: 'manual_confirm', achievementId: 'other' }, null)).toBe(false);
  });

  it('unlocks weather_checked with condition', () => {
    const rule = getRuleForEvent('weather_checked')!;
    const condition = JSON.stringify({ condition: 'rain' });
    expect(rule.check(def(), { type: 'weather_checked', condition: 'rain' }, condition)).toBe(true);
    expect(rule.check(def(), { type: 'weather_checked', condition: 'storm' }, condition)).toBe(false);
  });

  it('unlocks earthquake_felt within range', () => {
    const rule = getRuleForEvent('earthquake_felt')!;
    expect(rule.check(def(), { type: 'earthquake_felt', magnitude: 5, distanceKm: 100 }, null)).toBe(true);
    expect(rule.check(def(), { type: 'earthquake_felt', magnitude: 3, distanceKm: 50 }, null)).toBe(false);
    expect(rule.check(def(), { type: 'earthquake_felt', magnitude: 5, distanceKm: 300 }, null)).toBe(false);
  });

  it('unlocks screentime_checked result', () => {
    const rule = getRuleForEvent('screentime_checked')!;
    const condition = JSON.stringify({ result: 'allnighter' });
    expect(rule.check(def(), { type: 'screentime_checked', result: 'allnighter' }, condition)).toBe(true);
  });

  it('unlocks time_specific before hourMax', () => {
    const rule = getRuleForEvent('time_specific')!;
    const condition = JSON.stringify({ hourMax: 5 });
    expect(rule.check(def(), { type: 'time_specific', hour: 4, weekday: 1 }, condition)).toBe(true);
    expect(rule.check(def(), { type: 'time_specific', hour: 6, weekday: 1 }, condition)).toBe(false);
  });

  it('unlocks altitude_checked above minMeters', () => {
    const rule = getRuleForEvent('altitude_checked')!;
    const condition = JSON.stringify({ minMeters: 2500 });
    expect(rule.check(def(), { type: 'altitude_checked', meters: 3000 }, condition)).toBe(true);
    expect(rule.check(def(), { type: 'altitude_checked', meters: 1000 }, condition)).toBe(false);
  });

  it('returns null for unknown event types', () => {
    expect(getRuleForEvent('unknown_event')).toBeNull();
  });
});
