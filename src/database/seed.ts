import { getDatabase } from './connection';
import {
  ACHIEVEMENT_SEED,
  TRIGGER_SEED,
  ACHIEVEMENT_TRANSLATIONS,
  ACHIEVEMENT_COUNT,
} from './achievementSeedData';

async function upsertTranslations(
  rows: ReadonlyArray<readonly [string, string, string, string, string]>,
): Promise<void> {
  const db = await getDatabase();
  for (const row of rows) {
    await db.runAsync(
      `INSERT INTO translations (entity_type, entity_id, lang, field, value)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(entity_type, entity_id, lang, field) DO UPDATE SET value = excluded.value`,
      [...row],
    );
  }
}

/** Remove achievements dropped from the seed pipeline (existing installs). */
const DELETED_ACHIEVEMENT_IDS = ['daily_umbrella'] as const;

async function removeDeletedAchievements(): Promise<void> {
  const db = await getDatabase();
  for (const id of DELETED_ACHIEVEMENT_IDS) {
    await db.runAsync(`DELETE FROM user_achievements WHERE achievement_id = ?`, [id]);
    await db.runAsync(`DELETE FROM trigger_map WHERE achievement_id = ?`, [id]);
    await db.runAsync(
      `DELETE FROM translations WHERE entity_type = 'achievement' AND entity_id = ?`,
      [id],
    );
    await db.runAsync(`DELETE FROM achievement_definitions WHERE id = ?`, [id]);
  }
}

/** Sync category column when seed mapping changes (six-category reorganization). */
async function syncAchievementCategories(): Promise<void> {
  const db = await getDatabase();
  for (const a of ACHIEVEMENT_SEED) {
    await db.runAsync(`UPDATE achievement_definitions SET category = ? WHERE id = ?`, [
      a.category,
      a.id,
    ]);
  }
}

/**
 * Sync trigger_type + trigger_map from seed so existing installs pick up
 * manual→auto conversions (INSERT OR IGNORE alone leaves stale manual_confirm).
 */
async function syncAchievementTriggers(): Promise<void> {
  const db = await getDatabase();
  for (const a of ACHIEVEMENT_SEED) {
    await db.runAsync(
      `UPDATE achievement_definitions SET trigger_type = ?, trigger_goal = ? WHERE id = ?`,
      [a.trigger_type, a.trigger_goal, a.id],
    );
  }
  for (const t of TRIGGER_SEED) {
    await db.runAsync(`DELETE FROM trigger_map WHERE achievement_id = ?`, [t.achievement_id]);
    await db.runAsync(
      `INSERT INTO trigger_map (achievement_id, event_type, condition_json) VALUES (?, ?, ?)`,
      [t.achievement_id, t.event_type, t.condition_json],
    );
  }
}

/** Idempotent backfill: adds missing achievements without wiping user progress. */
export async function backfillAchievements(): Promise<number> {
  const db = await getDatabase();
  const achCount = await db.getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM achievement_definitions`
  );
  const current = achCount?.cnt ?? 0;
  const adding = current < ACHIEVEMENT_COUNT;

  if (adding) {
    for (const a of ACHIEVEMENT_SEED) {
      await db.runAsync(
        `INSERT OR IGNORE INTO achievement_definitions (id, category, prerequisite_id, rarity, trigger_type, trigger_goal, reward_points, is_hidden, prompt_photo, icon) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          a.id,
          a.category,
          a.prerequisite_id,
          a.rarity,
          a.trigger_type,
          a.trigger_goal,
          a.reward_points,
          a.is_hidden,
          a.prompt_photo,
          a.icon,
        ]
      );
    }

    for (const t of TRIGGER_SEED) {
      await db.runAsync(
        `INSERT OR IGNORE INTO trigger_map (achievement_id, event_type, condition_json) VALUES (?, ?, ?)`,
        [t.achievement_id, t.event_type, t.condition_json]
      );
    }
  }

  await removeDeletedAchievements();
  await upsertTranslations(ACHIEVEMENT_TRANSLATIONS);
  await syncAchievementCategories();
  await syncAchievementTriggers();

  if (!adding) return 0;

  const after = await db.getFirstAsync<{ cnt: number }>(
    `SELECT COUNT(*) as cnt FROM achievement_definitions`
  );
  return (after?.cnt ?? 0) - current;
}

export async function seedDatabase(): Promise<void> {
  const db = await getDatabase();

  const existing = await db.getFirstAsync<{ id: number }>(`SELECT id FROM companion WHERE id = 1`);
  if (!existing) {
    await db.runAsync(
      `INSERT INTO companion (id, name, species, emoji, collection) VALUES (1, 'Ryujin', 'Dragon', '🐉', ?)`,
      [JSON.stringify(['Dragon'])]
    );
  }

  const questCount = await db.getFirstAsync<{ cnt: number }>(`SELECT COUNT(*) as cnt FROM daily_quests`);
  if (questCount && questCount.cnt === 0) {
    await db.runAsync(
      `INSERT INTO daily_quests (id, reward_xp, reward_coins, trigger_type, goal) VALUES ('early_bird', 10, 5, 'time', 1)`
    );
    await db.runAsync(
      `INSERT INTO daily_quests (id, reward_xp, reward_coins, trigger_type, goal) VALUES ('explorer_path', 20, 10, 'new_location', 3)`
    );
    await db.runAsync(
      `INSERT INTO daily_quests (id, reward_xp, reward_coins, trigger_type, goal) VALUES ('photo_hunter', 15, 5, 'photo', 5)`
    );

    const questTranslations = [
      ['daily_quest', 'early_bird', 'en', 'title', 'Early Bird'],
      ['daily_quest', 'early_bird', 'en', 'description', 'Check in before 6:00 AM'],
      ['daily_quest', 'early_bird', 'zh-TW', 'title', '早起鳥兒'],
      ['daily_quest', 'early_bird', 'zh-TW', 'description', '早上 6 點前打卡'],
      ['daily_quest', 'explorer_path', 'en', 'title', "Explorer's Path"],
      ['daily_quest', 'explorer_path', 'en', 'description', 'Check in at 3 places you have never visited before'],
      ['daily_quest', 'explorer_path', 'zh-TW', 'title', '探索者之路'],
      ['daily_quest', 'explorer_path', 'zh-TW', 'description', '打卡 3 個從未到過的地點'],
      ['daily_quest', 'photo_hunter', 'en', 'title', 'Photo Hunter'],
      ['daily_quest', 'photo_hunter', 'en', 'description', 'Take 5 evidence photos'],
      ['daily_quest', 'photo_hunter', 'zh-TW', 'title', '拍照獵人'],
      ['daily_quest', 'photo_hunter', 'zh-TW', 'description', '拍攝 5 張證據照片'],
    ];
    for (const row of questTranslations) {
      await db.runAsync(
        `INSERT OR IGNORE INTO translations (entity_type, entity_id, lang, field, value) VALUES (?, ?, ?, ?, ?)`,
        row
      );
    }
  }

  await db.runAsync(
    `UPDATE daily_quests SET trigger_type = 'new_location' WHERE id = 'explorer_path'`,
  );
  await db.runAsync(
    `UPDATE translations SET value = 'Check in at 3 places you have never visited before'
     WHERE entity_type = 'daily_quest' AND entity_id = 'explorer_path' AND lang = 'en' AND field = 'description'`,
  );
  await db.runAsync(
    `UPDATE translations SET value = '打卡 3 個從未到過的地點'
     WHERE entity_type = 'daily_quest' AND entity_id = 'explorer_path' AND lang = 'zh-TW' AND field = 'description'`,
  );

  await backfillAchievements();
}
