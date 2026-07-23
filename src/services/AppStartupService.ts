import { seedDatabase } from '@/database/seed';
import { reconcile } from '@/engine/reconcile';
import { initCheckIn } from '@/services/CheckInCoordinator';
import { LocationService } from '@/services/LocationService';
import { CheckInRepository } from '@/repositories/CheckInRepository';
import { resetDailyQuests } from '@/services/DailyResetService';
import { registerBackgroundSync } from '@/services/BackgroundSyncService';
import { checkEnvironmentAchievements } from '@/services/EnvironmentAchievementService';
import { checkScreenTimeAndEmitEvents, initScreenTimeTracker } from '@/services/ScreenTimeService';
import { checkEarthquakeAndEmitEvents } from '@/services/EarthquakeService';
import { initIAP } from '@/services/IAPService';
import { trackEvent } from '@/services/AnalyticsService';
import { Logger } from '@/utils/logger';

export interface StartupProgress {
  progress: number;
  labelKey: string;
}

let blockingStartupPromise: Promise<void> | null = null;
let deferredStarted = false;

/** Blocking startup — must finish before login / welcome screens. */
export function runBlockingStartup(onProgress?: (state: StartupProgress) => void): Promise<void> {
  if (blockingStartupPromise) return blockingStartupPromise;

  blockingStartupPromise = (async () => {
    onProgress?.({ progress: 0.08, labelKey: 'startup.init' });

    initCheckIn({
      locationService: new LocationService(),
      checkInRepo: new CheckInRepository(),
    });

    onProgress?.({ progress: 0.25, labelKey: 'startup.database' });
    await seedDatabase();

    onProgress?.({ progress: 0.55, labelKey: 'startup.quests' });
    await resetDailyQuests();

    onProgress?.({ progress: 0.78, labelKey: 'startup.sync' });
    const fixed = await reconcile();
    if (fixed > 0) Logger.info('Startup', `Reconciled ${fixed} missed achievements`);

    onProgress?.({ progress: 1, labelKey: 'startup.ready' });
  })().catch(error => {
    blockingStartupPromise = null;
    Logger.error('Startup', 'Blocking startup failed', error);
    throw error;
  });

  return blockingStartupPromise;
}

/** @deprecated Use runBlockingStartup */
export function ensureCriticalStartup(): Promise<void> {
  return runBlockingStartup();
}

/** Network/sensor checks — after home or post-login. */
export function runDeferredStartup(onAchievementUnlocked: (ids: string[]) => void): void {
  if (deferredStarted) return;
  deferredStarted = true;

  void (async () => {
    try {
      initScreenTimeTracker();

      const envUnlocked = await checkEnvironmentAchievements();
      const screenTimeUnlocked = await checkScreenTimeAndEmitEvents();
      const earthquakeUnlocked = await checkEarthquakeAndEmitEvents();
      const startupUnlocked = [...envUnlocked, ...screenTimeUnlocked, ...earthquakeUnlocked];
      if (startupUnlocked.length > 0) {
        onAchievementUnlocked(startupUnlocked);
      }

      await registerBackgroundSync();
      await initIAP();
      await trackEvent('app_open');
    } catch (error) {
      Logger.error('Startup', 'Deferred startup failed', error);
    }
  })();
}
