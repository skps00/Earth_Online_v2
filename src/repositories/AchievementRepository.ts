import { getDatabase } from '@/database/connection';
import { Language } from '@/stores/settingsStore';
import type { Category } from '@/types/achievement';

export interface AchievementDisplay {
  id: string;
  category: Category;
  title: string;
  description: string;
  rarity: string;
  trigger_type: string;
  trigger_goal: number;
  reward_points: number;
  is_hidden: boolean;
  prompt_photo: boolean;
  prerequisite_id: string | null;
  icon: string | null;
  progress: number;
  is_unlocked: boolean;
  unlocked_at: string | null;
}

export class AchievementRepository {
  async getAll(lang: Language): Promise<AchievementDisplay[]> {
    const db = await getDatabase();
    return db.getAllAsync<AchievementDisplay>(
      `SELECT a.*, tt.value as title, td.value as description,
              COALESCE(u.progress, 0) as progress,
              COALESCE(u.is_unlocked, 0) as is_unlocked,
              u.unlocked_at
       FROM achievement_definitions a
       LEFT JOIN translations tt ON a.id = tt.entity_id AND tt.entity_type = 'achievement' AND tt.lang = ? AND tt.field = 'title'
       LEFT JOIN translations td ON a.id = td.entity_id AND td.entity_type = 'achievement' AND td.lang = ? AND td.field = 'description'
       LEFT JOIN user_achievements u ON a.id = u.achievement_id AND u.user_id = 'local'
       ORDER BY a.category, a.rarity DESC`,
      [lang, lang]
    );
  }

  async getByCategory(category: Category, lang: Language): Promise<AchievementDisplay[]> {
    const db = await getDatabase();
    return db.getAllAsync<AchievementDisplay>(
      `SELECT a.*, tt.value as title, td.value as description,
              COALESCE(u.progress, 0) as progress,
              COALESCE(u.is_unlocked, 0) as is_unlocked,
              u.unlocked_at
       FROM achievement_definitions a
       LEFT JOIN translations tt ON a.id = tt.entity_id AND tt.entity_type = 'achievement' AND tt.lang = ? AND tt.field = 'title'
       LEFT JOIN translations td ON a.id = td.entity_id AND td.entity_type = 'achievement' AND td.lang = ? AND td.field = 'description'
       LEFT JOIN user_achievements u ON a.id = u.achievement_id AND u.user_id = 'local'
       WHERE a.category = ?
       ORDER BY a.rarity DESC`,
      [lang, lang, category]
    );
  }

  async getUnlockedIds(): Promise<Set<string>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ achievement_id: string }>(
      `SELECT achievement_id FROM user_achievements WHERE user_id = 'local' AND is_unlocked = 1`
    );
    return new Set(rows.map(r => r.achievement_id));
  }

  async unlockAchievement(achievementId: string, userId: string = 'local'): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO user_achievements (user_id, achievement_id, progress, is_unlocked, unlocked_at)
       VALUES (?, ?, 1, 1, datetime('now'))
       ON CONFLICT(user_id, achievement_id) DO UPDATE SET is_unlocked = 1, unlocked_at = datetime('now')`,
      [userId, achievementId]
    );
  }

  async incrementProgress(achievementId: string, amount: number, userId: string = 'local'): Promise<number> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO user_achievements (user_id, achievement_id, progress, is_unlocked, unlocked_at)
       VALUES (?, ?, ?, 0, NULL)
       ON CONFLICT(user_id, achievement_id) DO UPDATE SET progress = progress + ?`,
      [userId, achievementId, amount, amount]
    );
    const result = await db.getFirstAsync<{ progress: number }>(
      `SELECT progress FROM user_achievements WHERE user_id = ? AND achievement_id = ?`,
      [userId, achievementId]
    );
    return result?.progress ?? 0;
  }

  async setProgress(achievementId: string, progress: number, userId: string = 'local'): Promise<number> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO user_achievements (user_id, achievement_id, progress, is_unlocked, unlocked_at)
       VALUES (?, ?, ?, 0, NULL)
       ON CONFLICT(user_id, achievement_id) DO UPDATE SET progress = MAX(progress, ?)`,
      [userId, achievementId, progress, progress]
    );
    const result = await db.getFirstAsync<{ progress: number }>(
      `SELECT progress FROM user_achievements WHERE user_id = ? AND achievement_id = ?`,
      [userId, achievementId]
    );
    return result?.progress ?? 0;
  }

  async getTotalUnlockedCount(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM user_achievements WHERE user_id = 'local' AND is_unlocked = 1`
    );
    return result?.cnt ?? 0;
  }

  async hasPrerequisiteUnlocked(achievementId: string): Promise<boolean> {
    const db = await getDatabase();
    const prereq = await db.getFirstAsync<{ prerequisite_id: string | null }>(
      `SELECT prerequisite_id FROM achievement_definitions WHERE id = ?`, [achievementId]
    );
    if (!prereq || !prereq.prerequisite_id) return true;
    const unlocked = await db.getFirstAsync<{ is_unlocked: number }>(
      `SELECT is_unlocked FROM user_achievements WHERE user_id = 'local' AND achievement_id = ?`,
      [prereq.prerequisite_id]
    );
    return unlocked ? unlocked.is_unlocked === 1 : false;
  }

  async isManualAchievement(achievementId: string): Promise<boolean> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ trigger_type: string }>(
      `SELECT trigger_type FROM achievement_definitions WHERE id = ?`,
      [achievementId]
    );
    if (row?.trigger_type === 'manual') return true;
    const trigger = await db.getFirstAsync<{ event_type: string }>(
      `SELECT event_type FROM trigger_map WHERE achievement_id = ? AND event_type = 'manual_confirm' LIMIT 1`,
      [achievementId]
    );
    return !!trigger;
  }

  async getById(id: string, lang: Language): Promise<AchievementDisplay | null> {
    const db = await getDatabase();
    return db.getFirstAsync<AchievementDisplay>(
      `SELECT a.*, tt.value as title, td.value as description,
              COALESCE(u.progress, 0) as progress,
              COALESCE(u.is_unlocked, 0) as is_unlocked,
              u.unlocked_at
       FROM achievement_definitions a
       LEFT JOIN translations tt ON a.id = tt.entity_id AND tt.entity_type = 'achievement' AND tt.lang = ? AND tt.field = 'title'
       LEFT JOIN translations td ON a.id = td.entity_id AND td.entity_type = 'achievement' AND td.lang = ? AND td.field = 'description'
       LEFT JOIN user_achievements u ON a.id = u.achievement_id AND u.user_id = 'local'
       WHERE a.id = ?`,
      [lang, lang, id]
    );
  }
}
