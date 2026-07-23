import { getDatabase } from '@/database/connection';
import { localDateString } from '@/utils/localDate';
import { awardQuestRewardsForQuest } from './CompanionService';

export async function updateQuestProgress(triggerType: string, amount: number = 1): Promise<string[]> {
  const db = await getDatabase();
  const today = localDateString();
  const completedIds: string[] = [];

  const quests = await db.getAllAsync<{ id: string; goal: number; reward_xp: number; reward_coins: number }>(
    `SELECT id, goal, reward_xp, reward_coins FROM daily_quests WHERE trigger_type = ?`,
    [triggerType],
  );

  for (const quest of quests) {
    const existing = await db.getFirstAsync<{ progress: number; is_completed: number }>(
      `SELECT progress, is_completed FROM user_daily_quests WHERE user_id = 'local' AND quest_id = ? AND date = ?`,
      [quest.id, today],
    );

    if (existing?.is_completed === 1) continue;

    const newProgress = (existing?.progress ?? 0) + amount;
    const isCompleted = newProgress >= quest.goal ? 1 : 0;

    await db.runAsync(
      `INSERT INTO user_daily_quests (user_id, quest_id, progress, is_completed, date)
       VALUES ('local', ?, ?, ?, ?)
       ON CONFLICT(user_id, quest_id, date) DO UPDATE SET progress = ?, is_completed = ?`,
      [quest.id, newProgress, isCompleted, today, newProgress, isCompleted],
    );

    if (isCompleted === 1) {
      completedIds.push(quest.id);
      await awardQuestRewardsForQuest(quest.reward_xp, quest.reward_coins);
    }
  }

  return completedIds;
}
