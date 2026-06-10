import { atom } from 'jotai';
import type { Companion, CompanionStats } from '@/types/companion';

export const companionAtom = atom<Companion | null>(null);
export const companionStatsAtom = atom<CompanionStats>((get) => {
  const c = get(companionAtom);
  return c
    ? { strength: c.strength, agility: c.agility, intelligence: c.intelligence, charisma: c.charisma, vitality: c.vitality }
    : { strength: 0, agility: 0, intelligence: 0, charisma: 0, vitality: 0 };
});
export const isCompanionLoadingAtom = atom(true);
