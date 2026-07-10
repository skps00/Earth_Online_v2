import * as BackgroundTask from 'expo-background-task';
import * as TaskManager from 'expo-task-manager';
import { isSignedIn } from './GoogleAuthService';
import { syncToCloud } from './CloudSyncService';
import { checkWeatherAndEmitEvents } from './WeatherService';
import { checkEarthquakeAndEmitEvents } from './EarthquakeService';
import { checkScreenTimeAndEmitEvents } from './ScreenTimeService';
import { checkEnvironmentAchievements } from './EnvironmentAchievementService';
import { Logger } from '@/utils/logger';

const TASK_NAME = 'background-sync';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const envUnlocked = await checkEnvironmentAchievements();
    const weatherUnlocked = await checkWeatherAndEmitEvents();
    const earthquakeUnlocked = await checkEarthquakeAndEmitEvents();
    const screenTimeUnlocked = await checkScreenTimeAndEmitEvents();
    const total =
      envUnlocked.length +
      weatherUnlocked.length +
      earthquakeUnlocked.length +
      screenTimeUnlocked.length;
    if (total > 0) {
      Logger.info(
        'BackgroundSync',
        `Achievements: env=${envUnlocked.length} weather=${weatherUnlocked.length} eq=${earthquakeUnlocked.length} screen=${screenTimeUnlocked.length}`,
      );
    }

    const signedIn = await isSignedIn();
    if (signedIn) {
      await syncToCloud();
      Logger.info('BackgroundSync', 'Cloud sync completed');
    }

    return BackgroundTask.BackgroundTaskResult.Success;
  } catch (e) {
    Logger.error('BackgroundSync', 'Background task failed', e);
    return BackgroundTask.BackgroundTaskResult.Failed;
  }
});

export async function registerBackgroundSync(): Promise<void> {
  try {
    const status = await BackgroundTask.getStatusAsync();
    if (status === BackgroundTask.BackgroundTaskStatus.Available) {
      await BackgroundTask.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60 * 30,
      });
      Logger.info('BackgroundSync', 'Background sync registered (30 min)');
    }
  } catch (e) {
    Logger.error('BackgroundSync', 'Failed to register background sync', e);
  }
}

export async function unregisterBackgroundSync(): Promise<void> {
  try {
    await BackgroundTask.unregisterTaskAsync(TASK_NAME);
    Logger.info('BackgroundSync', 'Background sync unregistered');
  } catch (e) {
    Logger.error('BackgroundSync', 'Failed to unregister background sync', e);
  }
}
