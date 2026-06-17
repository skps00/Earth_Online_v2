import { getDatabase } from '@/database/connection';
import { exportBackup, importBackup } from './BackupService';
import { uploadToDrive, downloadFromDrive } from './DriveService';
import { Logger } from '@/utils/logger';
import * as FileSystem from 'expo-file-system/legacy';

const SYNC_LOG_KEY = 'last_sync_at';
const DEBOUNCE_MINUTES = 30;

export async function syncToCloud(): Promise<{ uploaded: number; downloaded: number }> {
  const db = await getDatabase();

  // Check debounce
  const lastSync = await getLastSyncTime();
  if (lastSync) {
    const elapsed = Date.now() - new Date(lastSync).getTime();
    if (elapsed < DEBOUNCE_MINUTES * 60 * 1000) {
      Logger.info('Sync', `Debounced (last sync ${Math.round(elapsed / 60000)}min ago)`);
      return { uploaded: 0, downloaded: 0 };
    }
  }

  // Download remote data
  let downloaded = 0;
  const remoteJson = await downloadFromDrive();
  if (remoteJson) {
    try {
      await importBackup(remoteJson);
      downloaded = 1;
      Logger.info('Sync', 'Remote data merged');
    } catch (e) {
      Logger.error('Sync', 'Failed to merge remote data', e);
    }
  }

  // Upload local data
  const localPath = await exportBackup();
  const localJson = await FileSystem.readAsStringAsync(localPath);
  await uploadToDrive(localJson);

  // Record sync time
  await db.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
    [SYNC_LOG_KEY, new Date().toISOString()]
  );

  Logger.info('Sync', `Completed: uploaded=${1}, downloaded=${downloaded}`);
  return { uploaded: 1, downloaded };
}

async function getLastSyncTime(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_settings WHERE key = ?`,
    [SYNC_LOG_KEY]
  );
  return row?.value ?? null;
}
