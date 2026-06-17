import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { isSignedIn } from './GoogleAuthService';
import { syncToCloud } from './CloudSyncService';
import { Logger } from '@/utils/logger';

const TASK_NAME = 'background-sync';

TaskManager.defineTask(TASK_NAME, async () => {
  try {
    const signedIn = await isSignedIn();
    if (!signedIn) return BackgroundFetch.BackgroundFetchResult.NoData;

    await syncToCloud();
    Logger.info('BackgroundSync', 'Background sync completed');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (e) {
    Logger.error('BackgroundSync', 'Background sync failed', e);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerBackgroundSync(): Promise<void> {
  try {
    const status = await BackgroundFetch.getStatusAsync();
    if (status === BackgroundFetch.BackgroundFetchStatus.Available) {
      await BackgroundFetch.registerTaskAsync(TASK_NAME, {
        minimumInterval: 60 * 60 * 24, // 24 hours
        stopOnTerminate: false,
        startOnBoot: true,
      });
      Logger.info('BackgroundSync', 'Background sync registered');
    }
  } catch (e) {
    Logger.error('BackgroundSync', 'Failed to register background sync', e);
  }
}

export async function unregisterBackgroundSync(): Promise<void> {
  try {
    await BackgroundFetch.unregisterTaskAsync(TASK_NAME);
    Logger.info('BackgroundSync', 'Background sync unregistered');
  } catch (e) {
    Logger.error('BackgroundSync', 'Failed to unregister background sync', e);
  }
}
