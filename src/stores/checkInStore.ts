import { atom } from 'jotai';
import type { CheckInResult } from '@/services/CheckInCoordinator';

export const isCheckingInAtom = atom(false);
export const lastCheckInAtom = atom<CheckInResult | null>(null);
export const checkInErrorAtom = atom<string | null>(null);
