import { AppState, type AppStateStatus } from 'react-native';
import { processEvent } from '@/engine/processEvent';
import { SettingsRepository } from '@/repositories/SettingsRepository';
import type { ScreenTimeResult } from '@/types/events';
import { Logger } from '@/utils/logger';

const settingsRepo = new SettingsRepository();

/** Local hours 02:00–04:59 — still using the device late at night. */
export function isAllnighterHour(hour: number): boolean {
  return hour >= 2 && hour < 5;
}

/** After 20:00, evaluate whether the user had zero app sessions today. */
export function shouldCheckNoPhone(hour: number): boolean {
  return hour >= 20;
}

export function shouldEmitNoPhone(hour: number, foregroundCountToday: number): boolean {
  return shouldCheckNoPhone(hour) && foregroundCountToday === 0;
}

export function todayKey(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

async function getDailyForegroundCount(): Promise<number> {
  const today = todayKey();
  const storedDate = await settingsRepo.get('screentime_date');
  if (storedDate !== today) {
    await settingsRepo.set('screentime_date', today);
    await settingsRepo.set('screentime_foreground', '0');
    return 0;
  }

  const raw = await settingsRepo.get('screentime_foreground');
  const count = raw ? parseInt(raw, 10) : 0;
  return Number.isNaN(count) ? 0 : count;
}

async function incrementForegroundCount(): Promise<number> {
  const next = (await getDailyForegroundCount()) + 1;
  await settingsRepo.set('screentime_foreground', String(next));
  return next;
}

async function emitOncePerDay(result: ScreenTimeResult): Promise<string[]> {
  const key = `screentime_emitted_${result}`;
  const today = todayKey();
  if ((await settingsRepo.get(key)) === today) return [];

  const unlocked = await processEvent({ type: 'screentime_checked', result });
  await settingsRepo.set(key, today);
  return unlocked;
}

/**
 * MVP screen-time detection scoped to this app until expo-screen-time native module.
 * - allnighter: app opened during 02:00–04:59
 * - no_phone: no app opens before 20:00 (digital detox proxy)
 */
export async function onAppForeground(): Promise<string[]> {
  await incrementForegroundCount();
  const hour = new Date().getHours();
  if (!isAllnighterHour(hour)) return [];
  return emitOncePerDay('allnighter');
}

export async function checkScreenTimeAndEmitEvents(): Promise<string[]> {
  const foregroundCount = await getDailyForegroundCount();
  const hour = new Date().getHours();
  if (!shouldEmitNoPhone(hour, foregroundCount)) return [];
  return emitOncePerDay('no_phone');
}

let appStateSubscription: { remove: () => void } | null = null;

export function initScreenTimeTracker(): void {
  if (appStateSubscription) return;

  const handle = (state: AppStateStatus) => {
    if (state !== 'active') return;
    void onAppForeground().catch(error => {
      Logger.error('ScreenTime', 'foreground handler failed', error);
    });
  };

  appStateSubscription = AppState.addEventListener('change', handle);

  if (AppState.currentState === 'active') {
    void onAppForeground().catch(error => {
      Logger.error('ScreenTime', 'initial foreground check failed', error);
    });
  }
}

export function disposeScreenTimeTracker(): void {
  appStateSubscription?.remove();
  appStateSubscription = null;
}
