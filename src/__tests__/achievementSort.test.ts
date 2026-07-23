import { sortAchievements, difficultyScore } from '@/utils/achievementSort';
import type { AchievementDisplay } from '@/repositories/AchievementRepository';

function mockAchievement(overrides: Partial<AchievementDisplay> & Pick<AchievementDisplay, 'id'>): AchievementDisplay {
  return {
    category: 'Travel',
    title: overrides.id,
    description: '',
    rarity: 'Common',
    trigger_type: 'auto_track',
    trigger_goal: 1,
    reward_points: 10,
    is_hidden: false,
    prompt_photo: false,
    prerequisite_id: null,
    icon: null,
    progress: 0,
    is_unlocked: false,
    unlocked_at: null,
    ...overrides,
  };
}

describe('difficultyScore', () => {
  it('ranks Common below Legendary', () => {
    const easy = mockAchievement({ id: 'a', rarity: 'Common', trigger_goal: 1, reward_points: 10 });
    const hard = mockAchievement({ id: 'b', rarity: 'Legendary', trigger_goal: 100, reward_points: 1000 });
    expect(difficultyScore(easy)).toBeLessThan(difficultyScore(hard));
  });
});

describe('sortAchievements', () => {
  it('sorts by difficulty easy to hard', () => {
    const items = [
      mockAchievement({ id: 'hard', rarity: 'Epic', trigger_goal: 50, reward_points: 300 }),
      mockAchievement({ id: 'easy', rarity: 'Common', trigger_goal: 1, reward_points: 10 }),
    ];
    expect(sortAchievements(items, 'difficulty').map(a => a.id)).toEqual(['easy', 'hard']);
  });

  it('puts recent unlocks on top', () => {
    const items = [
      mockAchievement({ id: 'old', is_unlocked: true, unlocked_at: '2026-01-01T00:00:00' }),
      mockAchievement({ id: 'new', is_unlocked: true, unlocked_at: '2026-07-01T00:00:00' }),
      mockAchievement({ id: 'locked', is_unlocked: false }),
    ];
    expect(sortAchievements(items, 'recent').map(a => a.id)).toEqual(['new', 'old', 'locked']);
  });

  it('sorts locked items easy to hard after unlocked', () => {
    const items = [
      mockAchievement({ id: 'locked-hard', rarity: 'Rare', trigger_goal: 20 }),
      mockAchievement({ id: 'unlocked', is_unlocked: true, unlocked_at: '2026-07-01' }),
      mockAchievement({ id: 'locked-easy', rarity: 'Common', trigger_goal: 1 }),
    ];
    expect(sortAchievements(items, 'recent').map(a => a.id)).toEqual(['unlocked', 'locked-easy', 'locked-hard']);
  });
});
