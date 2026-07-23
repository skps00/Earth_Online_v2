import {
  ACHIEVEMENT_COUNT,
  ACHIEVEMENT_SEED,
  ACHIEVEMENT_TRANSLATIONS,
} from '@/database/achievementSeedData';
import { CATEGORIES, type Category } from '@/types/achievement';

const CJK_RE = /[\u4e00-\u9fff]/;

const EXPECTED_CATEGORY_COUNTS: Record<Category, number> = {
  Natural: 10,
  Milestone: 5,
  Travel: 60,
  Daily: 24,
  Health: 13,
  Career: 16,
};

function translationsFor(id: string, lang: string, field: string): string | undefined {
  const row = ACHIEVEMENT_TRANSLATIONS.find(
    ([entityType, entityId, l, f]) =>
      entityType === 'achievement' && entityId === id && l === lang && f === field,
  );
  return row?.[4];
}

describe('achievement English translations', () => {
  it('has en title and description for every achievement', () => {
    for (const a of ACHIEVEMENT_SEED) {
      expect(translationsFor(a.id, 'en', 'title')).toBeTruthy();
      expect(translationsFor(a.id, 'en', 'description')).toBeTruthy();
      expect(translationsFor(a.id, 'zh-TW', 'title')).toBeTruthy();
      expect(translationsFor(a.id, 'zh-TW', 'description')).toBeTruthy();
    }
    expect(ACHIEVEMENT_SEED).toHaveLength(ACHIEVEMENT_COUNT);
  });

  it('keeps English strings free of CJK characters', () => {
    const bad: string[] = [];
    for (const [entityType, entityId, lang, field, value] of ACHIEVEMENT_TRANSLATIONS) {
      if (entityType !== 'achievement' || lang !== 'en') continue;
      if (CJK_RE.test(value)) bad.push(`${entityId}.${field}: ${value}`);
    }
    expect(bad).toEqual([]);
  });

  it('assigns every achievement to one of six categories with expected counts', () => {
    const counts = Object.fromEntries(CATEGORIES.map((c) => [c, 0])) as Record<Category, number>;
    for (const a of ACHIEVEMENT_SEED) {
      expect(CATEGORIES).toContain(a.category);
      counts[a.category as Category] += 1;
    }
    expect(counts).toEqual(EXPECTED_CATEGORY_COUNTS);
    expect(ACHIEVEMENT_SEED).toHaveLength(128);
  });

  it('maps cross-prefix achievements to the correct category', () => {
    const byId = Object.fromEntries(ACHIEVEMENT_SEED.map((a) => [a.id, a.category]));
    expect(byId.explore_bucket_list).toBe('Milestone');
    expect(byId.explore_sky_lantern).toBe('Daily');
    expect(byId.daily_exercise_30).toBe('Health');
    expect(byId.transport_first_car).toBe('Career');
    expect(byId.daily_tattoo).toBe('Daily');
    expect(byId.epic_eclipse).toBe('Natural');
    expect(byId.epic_survive).toBe('Milestone');
  });

  it('does not use id-style English titles', () => {
    const idStyle = ACHIEVEMENT_SEED.filter((a) => {
      const title = translationsFor(a.id, 'en', 'title') ?? '';
      const normalized = a.id.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return title === normalized;
    }).map((a) => a.id);
    expect(idStyle).toEqual([]);
  });
});
