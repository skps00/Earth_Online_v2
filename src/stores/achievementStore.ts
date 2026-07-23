import { atom } from 'jotai';
import type { Category } from '@/types/achievement';
import { CATEGORIES } from '@/types/achievement';
import type { AchievementDisplay } from '@/repositories/AchievementRepository';

export const achievementsAtom = atom<AchievementDisplay[]>([]);
export const unlockedIdsAtom = atom<Set<string>>(new Set<string>());
export const activeCategoryAtom = atom<Category | 'all'>('all');

/** Reset legacy/invalid persisted category filters to "all". */
export function normalizeActiveCategory(category: Category | 'all'): Category | 'all' {
  return category === 'all' || CATEGORIES.includes(category) ? category : 'all';
}
export const isAchievementsLoadingAtom = atom(true);
export const achievementVersionAtom = atom(0);

/** Queue of achievement IDs to show in unlock celebration modal */
export const unlockQueueAtom = atom<string[]>([]);

/** True while achievement unlock celebration modal is visible */
export const achievementCelebrationActiveAtom = atom(false);

/** Selected achievement for detail / manual confirm modal */
export const selectedAchievementAtom = atom<AchievementDisplay | null>(null);
