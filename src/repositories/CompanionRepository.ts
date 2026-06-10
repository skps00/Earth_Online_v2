import { getDatabase } from '@/database/connection';
import type { Companion, Species } from '@/types/companion';

export class CompanionRepository {
  async get(): Promise<Companion | null> {
    const db = await getDatabase();
    return db.getFirstAsync<Companion>(`SELECT * FROM companion WHERE id = 1`);
  }

  async updateName(name: string): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE companion SET name = ? WHERE id = 1`, [name]);
  }

  async updateStats(stats: Partial<Companion>): Promise<void> {
    const db = await getDatabase();
    const fields = Object.keys(stats).filter(k => k !== 'id').map(k => `${k} = ?`).join(', ');
    const values = Object.values(stats);
    await db.runAsync(`UPDATE companion SET ${fields} WHERE id = 1`, values);
  }

  async addXp(amount: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE companion SET xp = xp + ? WHERE id = 1`, [amount]);
  }

  async levelUp(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(`UPDATE companion SET level = level + 1, xp = 0 WHERE id = 1`);
  }

  async addToCollection(species: Species): Promise<void> {
    const db = await getDatabase();
    const current = await db.getFirstAsync<{ collection: string }>(`SELECT collection FROM companion WHERE id = 1`);
    if (!current) return;
    const collection: Species[] = JSON.parse(current.collection);
    if (!collection.includes(species)) {
      collection.push(species);
      await db.runAsync(`UPDATE companion SET collection = ? WHERE id = 1`, [JSON.stringify(collection)]);
    }
  }
}
