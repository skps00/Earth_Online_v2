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

  // Achievement definitions
  const achCount = await db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM achievement_definitions`);
  if (achCount && achCount.cnt === 0) {
    const achievements = [
      ['checkin_first', 'Exploration', null, 'Common', 'checkin_count', 1, 10, 0, 0, '📍'],
      ['checkin_5', 'Exploration', null, 'Common', 'checkin_count', 5, 25, 0, 0, '📍'],
      ['checkin_10', 'Exploration', 'checkin_5', 'Rare', 'checkin_count', 10, 50, 0, 0, '🗺️'],
      ['checkin_25', 'Exploration', 'checkin_10', 'Epic', 'checkin_count', 25, 100, 0, 0, '🧭'],
      ['checkin_50', 'Exploration', 'checkin_25', 'Legendary', 'checkin_count', 50, 500, 0, 0, '🌍'],
      ['country_1', 'Exploration', null, 'Common', 'country_count', 1, 20, 0, 0, '✈️'],
      ['country_3', 'Exploration', 'country_1', 'Rare', 'country_count', 3, 75, 0, 0, '🛫'],
      ['country_5', 'Exploration', 'country_3', 'Epic', 'country_count', 5, 200, 0, 0, '🌎'],
      ['continent_1', 'Exploration', null, 'Rare', 'continent_count', 1, 50, 0, 0, '🌐'],
      ['continent_2', 'Exploration', 'continent_1', 'Epic', 'continent_count', 2, 150, 0, 0, '🌏'],
      ['continent_3', 'Exploration', 'continent_2', 'Legendary', 'continent_count', 3, 500, 0, 0, '🌌'],
      ['sunrise_1', 'Exploration', null, 'Rare', 'auto_track', 1, 30, 0, 0, '🌅'],
    ];

    for (const a of achievements) {
      await db.runAsync(
        `INSERT INTO achievement_definitions (id, category, prerequisite_id, rarity, trigger_type, trigger_goal, reward_points, is_hidden, prompt_photo, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        a
      );
    }

    // Trigger map entries
    const triggers = [
      ['checkin_first', 'checkin_count', null],
      ['checkin_5', 'checkin_count', null],
      ['checkin_10', 'checkin_count', null],
      ['checkin_25', 'checkin_count', null],
      ['checkin_50', 'checkin_count', null],
      ['country_1', 'country_count', null],
      ['country_3', 'country_count', null],
      ['country_5', 'country_count', null],
      ['continent_1', 'continent_count', null],
      ['continent_2', 'continent_count', null],
      ['continent_3', 'continent_count', null],
      ['sunrise_1', 'sunrise_sunset', '{"phase":"sunrise"}'],
    ];

    for (const t of triggers) {
      await db.runAsync(
        `INSERT INTO trigger_map (achievement_id, event_type, condition_json) VALUES (?, ?, ?)`,
        t
      );
    }

    // Achievement translations (EN + zh-TW)
    const achTranslations = [
      ['achievement', 'checkin_first', 'en', 'title', 'First Steps'],
      ['achievement', 'checkin_first', 'en', 'description', 'Complete your first check-in'],
      ['achievement', 'checkin_first', 'zh-TW', 'title', '初次踏足'],
      ['achievement', 'checkin_first', 'zh-TW', 'description', '完成第一次打卡'],
      ['achievement', 'checkin_5', 'en', 'title', 'Explorer'],
      ['achievement', 'checkin_5', 'en', 'description', 'Check in at 5 different locations'],
      ['achievement', 'checkin_5', 'zh-TW', 'title', '探索者'],
      ['achievement', 'checkin_5', 'zh-TW', 'description', '在 5 個不同地點打卡'],
      ['achievement', 'checkin_10', 'en', 'title', 'Adventurer'],
      ['achievement', 'checkin_10', 'en', 'description', 'Check in at 10 different locations'],
      ['achievement', 'checkin_10', 'zh-TW', 'title', '冒險家'],
      ['achievement', 'checkin_10', 'zh-TW', 'description', '在 10 個不同地點打卡'],
      ['achievement', 'checkin_25', 'en', 'title', 'Globe Trotter'],
      ['achievement', 'checkin_25', 'en', 'description', 'Check in at 25 different locations'],
      ['achievement', 'checkin_25', 'zh-TW', 'title', '環遊世界者'],
      ['achievement', 'checkin_25', 'zh-TW', 'description', '在 25 個不同地點打卡'],
      ['achievement', 'checkin_50', 'en', 'title', 'Legendary Explorer'],
      ['achievement', 'checkin_50', 'en', 'description', 'Check in at 50 different locations'],
      ['achievement', 'checkin_50', 'zh-TW', 'title', '傳說探險家'],
      ['achievement', 'checkin_50', 'zh-TW', 'description', '在 50 個不同地點打卡'],
      ['achievement', 'country_1', 'en', 'title', 'Passport Ready'],
      ['achievement', 'country_1', 'en', 'description', 'Visit your first country'],
      ['achievement', 'country_1', 'zh-TW', 'title', '護照就緒'],
      ['achievement', 'country_1', 'zh-TW', 'description', '造訪第一個國家'],
      ['achievement', 'country_3', 'en', 'title', 'World Traveler'],
      ['achievement', 'country_3', 'en', 'description', 'Visit 3 different countries'],
      ['achievement', 'country_3', 'zh-TW', 'title', '世界旅人'],
      ['achievement', 'country_3', 'zh-TW', 'description', '造訪 3 個不同國家'],
      ['achievement', 'country_5', 'en', 'title', 'Continental Hopper'],
      ['achievement', 'country_5', 'en', 'description', 'Visit 5 different countries'],
      ['achievement', 'country_5', 'zh-TW', 'title', '跨洲旅人'],
      ['achievement', 'country_5', 'zh-TW', 'description', '造訪 5 個不同國家'],
      ['achievement', 'continent_1', 'en', 'title', 'New Horizons'],
      ['achievement', 'continent_1', 'en', 'description', 'Set foot on your first continent'],
      ['achievement', 'continent_1', 'zh-TW', 'title', '新地平線'],
      ['achievement', 'continent_1', 'zh-TW', 'description', '踏上第一個洲'],
      ['achievement', 'continent_2', 'en', 'title', 'Cross-Continental'],
      ['achievement', 'continent_2', 'en', 'description', 'Visit 2 different continents'],
      ['achievement', 'continent_2', 'zh-TW', 'title', '跨洲探險'],
      ['achievement', 'continent_2', 'zh-TW', 'description', '造訪 2 個不同洲'],
      ['achievement', 'continent_3', 'en', 'title', 'Global Conqueror'],
      ['achievement', 'continent_3', 'en', 'description', 'Visit 3 different continents'],
      ['achievement', 'continent_3', 'zh-TW', 'title', '征服全球'],
      ['achievement', 'continent_3', 'zh-TW', 'description', '造訪 3 個不同洲'],
      ['achievement', 'sunrise_1', 'en', 'title', 'Early Bird'],
      ['achievement', 'sunrise_1', 'en', 'description', 'Check in during sunrise'],
      ['achievement', 'sunrise_1', 'zh-TW', 'title', '早起鳥兒'],
      ['achievement', 'sunrise_1', 'zh-TW', 'description', '在日出時打卡'],
    ];

    for (const row of achTranslations) {
      await db.runAsync(
        `INSERT OR IGNORE INTO translations (entity_type, entity_id, lang, field, value) VALUES (?, ?, ?, ?, ?)`,
        row
      );
    }
  }
}
