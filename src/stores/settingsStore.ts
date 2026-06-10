import { atom } from 'jotai';

export type ThemeMode = 'dark' | 'light';
export type Language = 'en' | 'zh-TW';

export const themeAtom = atom<ThemeMode>('dark');
export const langAtom = atom<Language>('en');
export const soundEnabledAtom = atom<boolean>(true);
export const activityTrackingAtom = atom<boolean>(false);
export const permissionReminderAtom = atom<boolean>(true);
