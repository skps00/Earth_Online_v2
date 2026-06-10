import { getDatabase } from '@/database/connection';

export async function updateQuestProgress(triggerType: string, amount: number = 1): Promise<string[]> {
  const db = await getDatabase();
  const today = new Date().toISOString().slice(0, 10);
  const completedIds: string[] = [];

  const quests = await db.getAllAsync<{ id: string; goal: number }>(
    `SELECT id, goal FROM daily_quests WHERE trigger_type = ?`, [triggerType]
  );

  for (const quest of quests) {
    const existing = await db.getFirstAsync<{ progress: number; is_completed: number }>(
      `SELECT progress, is_completed FROM user_daily_quests WHERE user_id = 'local' AND quest_id = ? AND date = ?`,
      [quest.id, today]
    );

    if (existing?.is_completed) continue;

    const newProgress = (existing?.progress ?? 0) + amount;

    await db.runAsync(
      `INSERT INTO user_daily_quests (user_id, quest_id, progress, is_completed, date)
       VALUES ('local', ?, ?, ?, ?)
       ON CONFLICT(user_id, quest_id, date) DO UPDATE SET progress = ?`,
      [quest.id, newProgress, newProgress >= quest.goal ? 1 : 0, today, newProgress]
    );

    if (newProgress >= quest.goal) {
      completedIds.push(quest.id);
    }
  }

  return completedIds;
}
