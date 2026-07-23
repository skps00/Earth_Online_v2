import { ACHIEVEMENT_COUNT, ACHIEVEMENT_SEED, TRIGGER_SEED } from '@/database/achievementSeedData';
import { CATEGORIES } from '@/types/achievement';

/** Manual→auto conversions that existing emit paths already support. */
const NEWLY_AUTOMATED_IDS = [
  'explore_snow',
  'explore_border',
  'explore_dateline',
  'explore_first_abroad',
] as const;

describe('achievementSeedData', () => {
  it('contains 128 achievements', () => {
    expect(ACHIEVEMENT_COUNT).toBe(128);
    expect(ACHIEVEMENT_SEED).toHaveLength(128);
  });

  it('has trigger map entry for every achievement', () => {
    const triggerIds = new Set(TRIGGER_SEED.map(t => t.achievement_id));
    for (const a of ACHIEVEMENT_SEED) {
      expect(triggerIds.has(a.id)).toBe(true);
    }
  });

  it('uses valid categories', () => {
    const valid = new Set(CATEGORIES);
    for (const a of ACHIEVEMENT_SEED) {
      expect(valid.has(a.category)).toBe(true);
    }
  });

  it('keeps newly automated achievements off manual_confirm', () => {
    const byId = Object.fromEntries(ACHIEVEMENT_SEED.map((a) => [a.id, a]));
    const triggersById = Object.fromEntries(TRIGGER_SEED.map((t) => [t.achievement_id, t]));

    for (const id of NEWLY_AUTOMATED_IDS) {
      expect(byId[id]?.trigger_type).toBe('auto_track');
      expect(triggersById[id]?.event_type).not.toBe('manual_confirm');
    }

    expect(triggersById.explore_snow).toEqual({
      achievement_id: 'explore_snow',
      event_type: 'weather_checked',
      condition_json: JSON.stringify({ condition: 'snow' }),
    });
    expect(triggersById.explore_border).toEqual({
      achievement_id: 'explore_border',
      event_type: 'checkin_completed',
      condition_json: JSON.stringify({ crossedBorder: true }),
    });
    expect(triggersById.explore_dateline).toEqual({
      achievement_id: 'explore_dateline',
      event_type: 'checkin_completed',
      condition_json: JSON.stringify({ crossedDateline: true }),
    });
    expect(triggersById.explore_first_abroad).toEqual({
      achievement_id: 'explore_first_abroad',
      event_type: 'checkin_completed',
      condition_json: JSON.stringify({ minUniqueCountries: 2 }),
    });
  });
});
