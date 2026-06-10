import { getDatabase } from '@/database/connection';
import type { GameEvent } from '@/types/events';

export async function getAchievementsForEvent(eventType: GameEvent['type']): Promise<string[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ achievement_id: string }>(
    `SELECT achievement_id FROM trigger_map WHERE event_type = ?`, [eventType]
  );
  return rows.map(r => r.achievement_id);
}
