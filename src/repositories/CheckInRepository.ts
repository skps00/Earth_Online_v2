import { getDatabase } from '@/database/connection';
import type { CheckInRow } from '@/types/database';
import { normalizeCoordinates, LOCATION_DECIMALS } from '@/utils/locationCoords';
import { localDateString } from '@/utils/localDate';

const ROUND = LOCATION_DECIMALS;

export class CheckInRepository {
  async getLatest(): Promise<CheckInRow | null> {
    const db = await getDatabase();
    return db.getFirstAsync<CheckInRow>(
      `SELECT *, COALESCE(last_modified_at, created_at) as last_modified_at FROM check_ins
       WHERE user_id = 'local' ORDER BY created_at DESC LIMIT 1`,
    );
  }

  async save(lat: number, lng: number, country: string | null, continent: string | null, address: string | null): Promise<void> {
    const db = await getDatabase();
    const { latitude, longitude } = normalizeCoordinates(lat, lng);
    await db.runAsync(
      `INSERT INTO check_ins (latitude, longitude, country, continent, address) VALUES (?, ?, ?, ?, ?)`,
      [latitude, longitude, country, continent, address],
    );
  }

  /** True if this coordinate (rounded grid) was already checked in today. */
  async hasLocationToday(lat: number, lng: number): Promise<boolean> {
    const { latitude, longitude } = normalizeCoordinates(lat, lng);
    const db = await getDatabase();
    const today = localDateString();
    const row = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM check_ins
       WHERE user_id = 'local' AND date(created_at, 'localtime') = ?
         AND ROUND(latitude, ${ROUND}) = ? AND ROUND(longitude, ${ROUND}) = ?`,
      [today, latitude, longitude],
    );
    return (row?.cnt ?? 0) > 0;
  }

  /** True if this coordinate (rounded grid) exists anywhere in check-in history. */
  async hasLocationEver(lat: number, lng: number): Promise<boolean> {
    const { latitude, longitude } = normalizeCoordinates(lat, lng);
    const db = await getDatabase();
    const row = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM check_ins
       WHERE user_id = 'local'
         AND ROUND(latitude, ${ROUND}) = ? AND ROUND(longitude, ${ROUND}) = ?`,
      [latitude, longitude],
    );
    return (row?.cnt ?? 0) > 0;
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
    const today = localDateString();
    const result = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM check_ins WHERE user_id = 'local' AND date(created_at, 'localtime') = ?`,
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
      `SELECT COUNT(*) as cnt FROM (
         SELECT DISTINCT ROUND(latitude, ${ROUND}), ROUND(longitude, ${ROUND})
         FROM check_ins WHERE user_id = 'local'
       )`,
    );
    return result?.cnt ?? 0;
  }

  async countUniqueLocationsToday(): Promise<number> {
    const db = await getDatabase();
    const today = localDateString();
    const result = await db.getFirstAsync<{ cnt: number }>(
      `SELECT COUNT(*) as cnt FROM (
         SELECT DISTINCT latitude, longitude
         FROM check_ins WHERE user_id = 'local' AND date(created_at, 'localtime') = ?
       )`,
      [today],
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
