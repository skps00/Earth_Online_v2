import { getDatabase } from '@/database/connection';
import { loadLocalBackup, replaceAll, type BackupData } from './BackupService';
import { uploadToDrive, downloadFromDrive } from './DriveService';
import { Logger } from '@/utils/logger';

const SYNC_LOG_KEY = 'last_sync_at';
const DEBOUNCE_MINUTES = 30;
const MAX_CHECKINS_PER_DAY = 10;

export async function syncToCloud(): Promise<{ uploaded: number; downloaded: number }> {
  const db = await getDatabase();

  const lastSync = await getLastSyncTime();
  if (lastSync) {
    const elapsed = Date.now() - new Date(lastSync).getTime();
    if (elapsed < DEBOUNCE_MINUTES * 60 * 1000) {
      Logger.info('Sync', `Debounced (last sync ${Math.round(elapsed / 60000)}min ago)`);
      return { uploaded: 0, downloaded: 0 };
    }
  }

  const local = await loadLocalBackup();

  let remote: BackupData | null = null;
  const remoteJson = await downloadFromDrive();
  if (remoteJson) {
    try {
      remote = JSON.parse(remoteJson);
    } catch (e) {
      Logger.error('Sync', 'Failed to parse remote backup', e);
      remote = null;
    }
  }

  let uploaded = 0;
  let downloaded = 0;

  if (remote) {
    downloaded = 1;
    const merged = mergeBackups(local, remote);
    const json = JSON.stringify(merged, null, 2);
    await replaceAll(merged);
    await uploadToDrive(json);
    uploaded = 1;
  } else {
    const json = JSON.stringify(local, null, 2);
    await uploadToDrive(json);
    uploaded = 1;
  }

  await db.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`,
    [SYNC_LOG_KEY, new Date().toISOString()]
  );

  Logger.info('Sync', `Completed: uploaded=${uploaded}, downloaded=${downloaded}`);
  return { uploaded, downloaded };
}

function mergeBackups(local: BackupData, remote: BackupData): BackupData {
  const checkIns = mergeCheckIns(local.checkIns, remote.checkIns);
  const achievements = mergeAchievements(local.achievements, remote.achievements);
  const companion = mergeCompanion(local.companion, remote.companion);

  return {
    version: Math.max(local.version, remote.version),
    exportedAt: new Date().toISOString(),
    checkIns,
    achievements,
    companion,
  };
}

function mergeCheckIns(
  local: BackupData['checkIns'],
  remote: BackupData['checkIns']
): BackupData['checkIns'] {
  const seen = new Set<string>();
  const all: BackupData['checkIns'] = [];

  const key = (c: BackupData['checkIns'][number]) =>
    `${c.latitude.toFixed(4)}_${c.longitude.toFixed(4)}_${c.created_at}`;

  for (const c of [...remote, ...local]) {
    const k = key(c);
    if (!seen.has(k)) {
      seen.add(k);
      all.push(c);
    }
  }

  all.sort((a, b) => a.created_at.localeCompare(b.created_at));

  const today = new Date().toISOString().slice(0, 10);
  let todayCount = 0;
  const trimmed: BackupData['checkIns'] = [];

  for (let i = all.length - 1; i >= 0; i--) {
    const c = all[i];
    if (c.created_at.startsWith(today)) {
      if (todayCount < MAX_CHECKINS_PER_DAY) {
        trimmed.unshift(c);
        todayCount++;
      }
    } else {
      trimmed.unshift(c);
    }
  }

  if (all.length !== trimmed.length) {
    Logger.info('Sync', `Trimmed ${all.length - trimmed.length} check-ins exceeding daily limit`);
  }

  return trimmed;
}

function mergeAchievements(
  local: BackupData['achievements'],
  remote: BackupData['achievements']
): BackupData['achievements'] {
  const map = new Map<string, BackupData['achievements'][number]>();

  for (const a of local) {
    map.set(a.achievement_id, { ...a });
  }

  for (const r of remote) {
    const existing = map.get(r.achievement_id);
    if (!existing) {
      map.set(r.achievement_id, { ...r });
    } else {
      existing.progress = Math.max(existing.progress, r.progress);
      existing.is_unlocked = Math.max(existing.is_unlocked, r.is_unlocked);
      if (r.unlocked_at && !existing.unlocked_at) {
        existing.unlocked_at = r.unlocked_at;
      }
    }
  }

  return Array.from(map.values());
}

function mergeCompanion(
  local: BackupData['companion'],
  remote: BackupData['companion']
): BackupData['companion'] {
  if (!remote) return local;
  if (!local) return remote;

  return {
    ...remote,
    level: Math.max(local.level, remote.level),
    xp: Math.max(local.xp, remote.xp),
    coins: Math.max(local.coins, remote.coins),
    strength: Math.max(local.strength, remote.strength),
    agility: Math.max(local.agility, remote.agility),
    intelligence: Math.max(local.intelligence, remote.intelligence),
    charisma: Math.max(local.charisma, remote.charisma),
    vitality: Math.max(local.vitality, remote.vitality),
  };
}

async function getLastSyncTime(): Promise<string | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_settings WHERE key = ?`,
    [SYNC_LOG_KEY]
  );
  return row?.value ?? null;
}
