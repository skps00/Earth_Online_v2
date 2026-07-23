import { getDatabase } from '@/database/connection';
import { localDateString } from '@/utils/localDate';
import { Logger } from '@/utils/logger';

export async function resetDailyQuests(): Promise<void> {
  const db = await getDatabase();
  const today = localDateString();

  const lastReset = await db.getFirstAsync<{ value: string }>(
    `SELECT value FROM app_settings WHERE key = 'last_daily_reset'`
  );

  if (lastReset?.value === today) return;

  Logger.info('DailyReset', `Resetting daily quests for ${today}`);
  await db.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('last_daily_reset', ?)`, [today]
  );
}
