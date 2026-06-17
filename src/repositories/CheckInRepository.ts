import { getDatabase } from '@/database/connection';
import type { CheckInRow } from '@/types/database';

export class CheckInRepository {
  async save(lat: number, lng: number, country: string | null, continent: string | null, address: string | null): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO check_ins (latitude, longitude, country, continent, address) VALUES (?, ?, ?, ?, ?)`,
      [lat, lng, country, continent, address]
    );
  }

  async getAll(): Promise<CheckInRow[]> {
    const db = await getDatabase();
    return db.getAllAsync<CheckInRow>(
      `SELECT *, COALESCE(last_modified_at, created_at) as last_modified_at FROM check_ins
       WHERE user_id = 'local' ORDER BY created_at DESC`
    );
  }

  async getModifiedSince(timestamp: string): Promise<CheckInRow[]> {
    const db = await getDatabase();
    return db.getAllAsync<CheckInRow>(
      `SELECT *, COALESCE(last_modified_at, created_at) as last_modified_at FROM check_ins
       WHERE user_id = 'local' AND COALESCE(last_modified_at, created_at) > ?`,
      [timestamp]
    );
  }

  async countToday(): Promise<number> {
    const db = await getDatabase();
    const today = new Date().toISOString().slice(0, 10);
    const result = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM check_ins WHERE user_id = 'local' AND date(created_at) = ?`,
      [today]
    );
    return result?.cnt ?? 0;
  }

  async countTotal(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM check_ins WHERE user_id = 'local'`
    );
    return result?.cnt ?? 0;
  }

  async countUniqueLocations(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM (SELECT DISTINCT latitude, longitude FROM check_ins WHERE user_id = 'local')`
    );
    return result?.cnt ?? 0;
  }

  async countUniqueCountries(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(DISTINCT country) as cnt FROM check_ins WHERE user_id = 'local' AND country IS NOT NULL`
    );
    return result?.cnt ?? 0;
  }

  async countUniqueContinents(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(DISTINCT continent) as cnt FROM check_ins WHERE user_id = 'local' AND continent IS NOT NULL`
    );
    return result?.cnt ?? 0;
  }
}
