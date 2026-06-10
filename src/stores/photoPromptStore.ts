import { atom } from 'jotai';

export interface PhotoPrompt {
  achievementId: string;
  achievementTitle: string;
}

export const photoPromptAtom = atom<PhotoPrompt | null>(null);
