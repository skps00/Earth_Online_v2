import { getDatabase } from '@/database/connection';
import { Language } from '@/stores/settingsStore';
import { localDateString } from '@/utils/localDate';

export interface QuestDisplay {
  id: string;
  title: string;
  description: string;
  reward_xp: number;
  reward_coins: number;
  goal: number;
  progress: number;
  is_completed: boolean;
}

export class QuestRepository {
  async getToday(lang: Language): Promise<QuestDisplay[]> {
    const db = await getDatabase();
    const today = localDateString();
    return db.getAllAsync<QuestDisplay>(
      `SELECT dq.*, tt.value as title, td.value as description,
              COALESCE(udq.progress, 0) as progress,
              COALESCE(udq.is_completed, 0) as is_completed
       FROM daily_quests dq
       LEFT JOIN translations tt ON dq.id = tt.entity_id AND tt.entity_type = 'daily_quest' AND tt.lang = ? AND tt.field = 'title'
       LEFT JOIN translations td ON dq.id = td.entity_id AND td.entity_type = 'daily_quest' AND td.lang = ? AND td.field = 'description'
       LEFT JOIN user_daily_quests udq ON dq.id = udq.quest_id AND udq.date = ? AND udq.user_id = 'local'`,
      [lang, lang, today],
    );
  }

  async getById(questId: string, lang: Language): Promise<QuestDisplay | null> {
    const db = await getDatabase();
    const today = localDateString();
    return db.getFirstAsync<QuestDisplay>(
      `SELECT dq.*, tt.value as title, td.value as description,
              COALESCE(udq.progress, 0) as progress,
              COALESCE(udq.is_completed, 0) as is_completed
       FROM daily_quests dq
       LEFT JOIN translations tt ON dq.id = tt.entity_id AND tt.entity_type = 'daily_quest' AND tt.lang = ? AND tt.field = 'title'
       LEFT JOIN translations td ON dq.id = td.entity_id AND td.entity_type = 'daily_quest' AND td.lang = ? AND td.field = 'description'
       LEFT JOIN user_daily_quests udq ON dq.id = udq.quest_id AND udq.date = ? AND udq.user_id = 'local'
       WHERE dq.id = ?`,
      [lang, lang, today, questId],
    );
  }

  async incrementProgress(questId: string): Promise<void> {
    const db = await getDatabase();
    const today = localDateString();
    await db.runAsync(
      `INSERT INTO user_daily_quests (user_id, quest_id, progress, is_completed, date)
       VALUES ('local', ?, 1, 0, ?)
       ON CONFLICT(user_id, quest_id, date) DO UPDATE SET progress = progress + 1`,
      [questId, today]
    );
  }

  async completeQuest(questId: string): Promise<void> {
    const db = await getDatabase();
    const today = localDateString();
    await db.runAsync(
      `INSERT INTO user_daily_quests (user_id, quest_id, progress, is_completed, date)
       VALUES ('local', ?, 1, 1, ?)
       ON CONFLICT(user_id, quest_id, date) DO UPDATE SET is_completed = 1`,
      [questId, today]
    );
  }
}
