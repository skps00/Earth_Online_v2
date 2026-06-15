import { getDatabase } from '@/database/connection';
import type { TriggerMapRow } from '@/types/database';

export async function getTriggersForEvent(eventType: string): Promise<TriggerMapRow[]> {
  const db = await getDatabase();
  return db.getAllAsync<TriggerMapRow>(
    `SELECT achievement_id, event_type, condition_json FROM trigger_map WHERE event_type = ?`,
    [eventType]
  );
}
