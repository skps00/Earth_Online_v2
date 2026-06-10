import { atom } from 'jotai';

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export const syncStatusAtom = atom<SyncStatus>('idle');
export const lastSyncAtom = atom<string | null>(null);
