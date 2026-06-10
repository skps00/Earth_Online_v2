import { getDatabase } from '@/database/connection';

export class SettingsRepository {
  async get(key: string): Promise<string | null> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = ?`, [key]
    );
    return result?.value ?? null;
  }

  async set(key: string, value: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT OR REPLACE INTO app_settings (key, value) VALUES (?, ?)`, [key, value]
    );
  }
}
