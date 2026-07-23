import { atom } from 'jotai';
import type { QuestDisplay } from '@/repositories/QuestRepository';

export const dailyQuestsAtom = atom<QuestDisplay[]>([]);
export const isQuestLoadingAtom = atom(true);
export const questVersionAtom = atom(0);
export const questCompleteQueueAtom = atom<string[]>([]);
