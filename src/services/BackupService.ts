import * as FileSystem from 'expo-file-system/legacy';
import { getDatabase } from '@/database/connection';
import { Logger } from '@/utils/logger';
import { z } from 'zod';

const BACKUP_FILENAME = 'earth_online_backup.json';

const BackupSchema = z.object({
  version: z.number(),
  exportedAt: z.string(),
  checkIns: z.array(z.object({
    latitude: z.number(), longitude: z.number(),
    country: z.string().nullable(), continent: z.string().nullable(),
    address: z.string().nullable(), created_at: z.string(),
  })),
  achievements: z.array(z.object({
    achievement_id: z.string(), progress: z.number(),
    is_unlocked: z.number(), unlocked_at: z.string().nullable(),
  })),
  companion: z.object({
    name: z.string(), species: z.string(), emoji: z.string(),
    level: z.number(), xp: z.number(),
    strength: z.number(), agility: z.number(),
    intelligence: z.number(), charisma: z.number(), vitality: z.number(),
    coins: z.number(),
    collection: z.string(),
  }).nullable(),
});

export type BackupData = z.infer<typeof BackupSchema>;

export async function exportBackup(): Promise<string> {
  const data = await loadLocalBackup();
  const json = JSON.stringify(data, null, 2);
  const path = FileSystem.documentDirectory + BACKUP_FILENAME;
  await FileSystem.writeAsStringAsync(path, json);
  Logger.info('Backup', `Backup saved to ${path}`);
  return path;
}

export async function loadLocalBackup(): Promise<BackupData> {
  const db = await getDatabase();
  const checkIns = await db.getAllAsync(`SELECT * FROM check_ins WHERE user_id = 'local'`);
  const achievements = await db.getAllAsync(`SELECT * FROM user_achievements WHERE user_id = 'local'`);
  const companion = await db.getFirstAsync(`SELECT * FROM companion WHERE id = 1`);

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    checkIns: checkIns as any,
    achievements: achievements as any,
    companion: companion as any,
  };
}

export async function importBackup(jsonString: string): Promise<boolean> {
  const parsed = JSON.parse(jsonString);
  const data = BackupSchema.parse(parsed);
  await replaceAll(data);
  Logger.info('Backup', `Imported ${data.checkIns.length} check-ins, ${data.achievements.length} achievements`);
  return true;
}

export async function replaceAll(data: BackupData): Promise<void> {
  const db = await getDatabase();

  await db.runAsync(`DELETE FROM check_ins WHERE user_id = 'local'`);
  await db.runAsync(`DELETE FROM user_achievements WHERE user_id = 'local'`);
  await db.runAsync(`DELETE FROM companion`);

  for (const c of data.checkIns) {
    await db.runAsync(
      `INSERT INTO check_ins (user_id, latitude, longitude, country, continent, address, created_at) VALUES ('local', ?, ?, ?, ?, ?, ?)`,
      [c.latitude, c.longitude, c.country, c.continent, c.address, c.created_at]
    );
  }

  for (const a of data.achievements) {
    await db.runAsync(
      `INSERT INTO user_achievements (user_id, achievement_id, progress, is_unlocked, unlocked_at) VALUES ('local', ?, ?, ?, ?)`,
      [a.achievement_id, a.progress, a.is_unlocked, a.unlocked_at]
    );
  }

  if (data.companion) {
    await db.runAsync(
      `INSERT INTO companion (id, name, species, emoji, level, xp, strength, agility, intelligence, charisma, vitality, coins, collection) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.companion.name, data.companion.species, data.companion.emoji, data.companion.level, data.companion.xp, data.companion.strength, data.companion.agility, data.companion.intelligence, data.companion.charisma, data.companion.vitality, data.companion.coins, data.companion.collection]
    );
  }
}
