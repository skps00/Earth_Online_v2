import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { CREATE_TABLES, SCHEMA_VERSION } from './schema';

let db: SQLite.SQLiteDatabase | null = null;
let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

const DB_NAME = 'earth_online_v2.db';

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  if (!dbPromise) {
    dbPromise = openDatabase();
  }

  try {
    return await dbPromise;
  } catch (error) {
    dbPromise = null;
    db = null;
    throw error;
  }
}

async function openDatabase(): Promise<SQLite.SQLiteDatabase> {
  await ensureSQLiteDirectory();
  const database = await SQLite.openDatabaseAsync(DB_NAME);
  await database.execAsync(`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;`);
  await runMigrations(database);
  db = database;
  return database;
}

/**
 * Some older app states can leave a file at /files/SQLite instead of a directory,
 * which makes expo-sqlite fail to create the database. Repair it before opening DB.
 */
async function ensureSQLiteDirectory(): Promise<void> {
  const base = FileSystem.documentDirectory;
  if (!base) return;

  const sqliteDir = `${base}SQLite`;
  const info = await FileSystem.getInfoAsync(sqliteDir);

  if (info.exists && !info.isDirectory) {
    await FileSystem.deleteAsync(sqliteDir, { idempotent: true });
  }

  await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });
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

  // Migration v3 → v4: analytics_events table for beta metrics (Firebase-ready)
  if (currentVersion < 4) {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        params_json TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      )
    `);
  }

  await database.runAsync(
    `INSERT OR REPLACE INTO app_settings (key, value) VALUES ('schema_version', ?)`,
    [String(SCHEMA_VERSION)]
  );
}
