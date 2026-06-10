import { getDatabase } from '@/database/connection';
import type { MemoryRow } from '@/types/database';

export class MemoriesRepository {
  async save(achievementId: string, photoPath: string, lat?: number, lng?: number, country?: string, city?: string, weather?: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO memories (achievement_id, photo_path, latitude, longitude, country, city, weather)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [achievementId, photoPath, lat ?? null, lng ?? null, country ?? null, city ?? null, weather ?? null]
    );
  }

  async getAll(): Promise<MemoryRow[]> {
    const db = await getDatabase();
    return db.getAllAsync<MemoryRow>(`SELECT * FROM memories WHERE user_id = 'local' ORDER BY created_at DESC`);
  }

  async markShared(id: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE memories SET is_shared = 1 WHERE id = ?`, [id]);
  }
}
