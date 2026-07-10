import { ACHIEVEMENT_COUNT, ACHIEVEMENT_SEED, TRIGGER_SEED } from '@/database/achievementSeedData';

describe('achievementSeedData', () => {
  it('contains 129 achievements', () => {
    expect(ACHIEVEMENT_COUNT).toBe(129);
    expect(ACHIEVEMENT_SEED).toHaveLength(129);
  });

  it('has trigger map entry for every achievement', () => {
    const triggerIds = new Set(TRIGGER_SEED.map(t => t.achievement_id));
    for (const a of ACHIEVEMENT_SEED) {
      expect(triggerIds.has(a.id)).toBe(true);
    }
  });

  it('uses valid categories', () => {
    const valid = new Set(['Combat', 'Exploration', 'Collection', 'Social', 'Mastery']);
    for (const a of ACHIEVEMENT_SEED) {
      expect(valid.has(a.category)).toBe(true);
    }
  });
});
