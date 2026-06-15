import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES, SCHEMA_VERSION } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('earth_online_v2.db');
  await db.execAsync(`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;`);
  await runMigrations(db);
  return db;
}

async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  let currentVersion = 0;
  try {
    const result = await database.getFirstAsync<{ value: string }>(
      `SELECT value FROM app_settings WHERE key = 'schema_version'`
    );
    currentVersion = result ? parseInt(result.value, 10) : 0;
  } catch {
    // app_settings table does not exist yet — first run
    currentVersion = 0;
  }

  if (currentVersion >= SCHEMA_VERSION) return;

  for (const sql of CREATE_TABLES) {
    await database.execAsync(sql);
  }

  // Migration v1 → v2: add charisma column
  if (currentVersion < 2) {
    try { await database.execAsync(`ALTER TABLE companion ADD COLUMN charisma INTEGER DEFAULT 10`); } catch { /* column may already exist */ }
  }

  // Migration v2 → v3: add coins column
  if (currentVersion < 3) {
    try { await database.execAsync(`ALTER TABLE companion ADD COLUMN coins INTEGER DEFAULT 100`); } catch { /* column may already exist */ }
    try { await database.execAsync(`UPDATE companion SET coins = 100 WHERE coins IS NULL`); } catch { /* no rows yet */ }
  }

  await database.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('schema_version', ?)`,
    [String(SCHEMA_VERSION)]
  );
}
