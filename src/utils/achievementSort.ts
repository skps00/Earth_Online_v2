import type { AchievementDisplay } from '@/repositories/AchievementRepository';
import type { Rarity } from '@/types/achievement';

export type AchievementSortMode = 'recent' | 'difficulty';

const RARITY_RANK: Record<Rarity, number> = {
  Common: 0,
  Rare: 1,
  Epic: 2,
  Legendary: 3,
};

/** Lower = easier (Common, low goal, low points). */
export function difficultyScore(a: AchievementDisplay): number {
  const rarity = RARITY_RANK[a.rarity as Rarity] ?? 0;
  return rarity * 1_000_000 + a.trigger_goal * 1_000 + a.reward_points;
}

export function sortAchievements(
  items: AchievementDisplay[],
  mode: AchievementSortMode,
): AchievementDisplay[] {
  const sorted = [...items];

  if (mode === 'difficulty') {
    return sorted.sort((a, b) => difficultyScore(a) - difficultyScore(b));
  }

  // recent: unlocked newest first, then locked easy → hard
  return sorted.sort((a, b) => {
    const aUnlocked = Boolean(a.is_unlocked);
    const bUnlocked = Boolean(b.is_unlocked);

    if (aUnlocked !== bUnlocked) {
      return aUnlocked ? -1 : 1;
    }

    if (aUnlocked && bUnlocked) {
      const aTime = a.unlocked_at ?? '';
      const bTime = b.unlocked_at ?? '';
      return bTime.localeCompare(aTime);
    }

    return difficultyScore(a) - difficultyScore(b);
  });
}
