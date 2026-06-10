import { getDatabase } from './connection';

export async function seedDatabase(): Promise<void> {
  const db = await getDatabase();

  // Default companion
  const existing = await db.getFirstAsync<{ id: number }>(`SELECT id FROM companion WHERE id = 1`);
  if (!existing) {
    await db.runAsync(
      `INSERT INTO companion (id, name, species, emoji, collection) VALUES (1, 'Ryujin', 'Dragon', '🐉', ?)`,
      [JSON.stringify(['Dragon'])]
    );
  }

  // Daily quests (stub — 3 quests)
  const questCount = await db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM daily_quests`);
  if (questCount && questCount.cnt === 0) {
    await db.runAsync(`INSERT INTO daily_quests (id, reward_xp, reward_coins, trigger_type, goal) VALUES ('early_bird', 10, 5, 'time', 1)`);
    await db.runAsync(`INSERT INTO daily_quests (id, reward_xp, reward_coins, trigger_type, goal) VALUES ('explorer_path', 20, 10, 'checkin', 3)`);
    await db.runAsync(`INSERT INTO daily_quests (id, reward_xp, reward_coins, trigger_type, goal) VALUES ('photo_hunter', 15, 5, 'photo', 5)`);

    // Daily quest translations (EN + zh-TW)
    const questTranslations = [
      ['daily_quest', 'early_bird', 'en', 'title', 'Early Bird'],
      ['daily_quest', 'early_bird', 'en', 'description', 'Check in before 6:00 AM'],
      ['daily_quest', 'early_bird', 'zh-TW', 'title', '早起鳥兒'],
      ['daily_quest', 'early_bird', 'zh-TW', 'description', '早上 6 點前打卡'],
      ['daily_quest', 'explorer_path', 'en', 'title', "Explorer's Path"],
      ['daily_quest', 'explorer_path', 'en', 'description', 'Visit 3 new locations today'],
      ['daily_quest', 'explorer_path', 'zh-TW', 'title', '探索者之路'],
      ['daily_quest', 'explorer_path', 'zh-TW', 'description', '今天拜訪 3 個新地點'],
      ['daily_quest', 'photo_hunter', 'en', 'title', 'Photo Hunter'],
      ['daily_quest', 'photo_hunter', 'en', 'description', 'Take 5 evidence photos'],
      ['daily_quest', 'photo_hunter', 'zh-TW', 'title', '拍照獵人'],
      ['daily_quest', 'photo_hunter', 'zh-TW', 'description', '拍攝 5 張證據照片'],
    ];
    for (const row of questTranslations) {
      await db.runAsync(`INSERT OR IGNORE INTO translations (entity_type, entity_id, lang, field, value) VALUES (?, ?, ?, ?, ?)`, row);
    }
  }
}
