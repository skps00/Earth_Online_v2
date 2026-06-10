import { atom } from 'jotai';
import type { Category } from '@/types/achievement';
import type { AchievementDisplay } from '@/repositories/AchievementRepository';

export const achievementsAtom = atom<AchievementDisplay[]>([]);
export const unlockedIdsAtom = atom<Set<string>>(new Set());
export const activeCategoryAtom = atom<Category | 'all'>('all');
export const isAchievementsLoadingAtom = atom(true);
