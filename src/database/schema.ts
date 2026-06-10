export const SCHEMA_VERSION = 2;

export const CREATE_TABLES = [
  `CREATE TABLE IF NOT EXISTS achievement_definitions (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL,
    prerequisite_id TEXT,
    rarity TEXT NOT NULL,
    trigger_type TEXT NOT NULL,
    trigger_goal INTEGER DEFAULT 1,
    reward_points INTEGER DEFAULT 0,
    is_hidden INTEGER DEFAULT 0,
    prompt_photo INTEGER DEFAULT 0,
    icon TEXT
  )`,

  `CREATE TABLE IF NOT EXISTS translations (
    entity_type TEXT NOT NULL,
    entity_id TEXT NOT NULL,
    lang TEXT NOT NULL,
    field TEXT NOT NULL,
    value TEXT NOT NULL,
    PRIMARY KEY (entity_type, entity_id, lang, field)
  )`,

  `CREATE INDEX IF NOT EXISTS idx_translations_lookup
    ON translations(entity_type, entity_id, lang)`,

  `CREATE TABLE IF NOT EXISTS user_achievements (
    user_id TEXT DEFAULT 'local',
    achievement_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    is_unlocked INTEGER DEFAULT 0,
    unlocked_at TEXT,
    PRIMARY KEY (user_id, achievement_id)
  )`,

  `CREATE TABLE IF NOT EXISTS check_ins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'local',
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    country TEXT,
    continent TEXT,
    address TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    last_modified_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS companion (
    id INTEGER PRIMARY KEY DEFAULT 1,
    name TEXT NOT NULL DEFAULT 'Ryujin',
    species TEXT NOT NULL DEFAULT 'Dragon',
    emoji TEXT DEFAULT '🐉',
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    strength INTEGER DEFAULT 10,
    agility INTEGER DEFAULT 10,
    intelligence INTEGER DEFAULT 10,
    charisma INTEGER DEFAULT 10,
    vitality INTEGER DEFAULT 10,
    collection TEXT DEFAULT '["Dragon"]'
  )`,

  `CREATE TABLE IF NOT EXISTS daily_quests (
    id TEXT PRIMARY KEY,
    reward_xp INTEGER DEFAULT 0,
    reward_coins INTEGER DEFAULT 0,
    trigger_type TEXT NOT NULL,
    goal INTEGER DEFAULT 1
  )`,

  `CREATE TABLE IF NOT EXISTS user_daily_quests (
    user_id TEXT DEFAULT 'local',
    quest_id TEXT NOT NULL,
    progress INTEGER DEFAULT 0,
    is_completed INTEGER DEFAULT 0,
    date TEXT NOT NULL,
    PRIMARY KEY (user_id, quest_id, date)
  )`,

  `CREATE TABLE IF NOT EXISTS memories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    achievement_id TEXT NOT NULL,
    user_id TEXT DEFAULT 'local',
    photo_path TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    country TEXT,
    city TEXT,
    weather TEXT,
    is_shared INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
  )`,

  `CREATE TABLE IF NOT EXISTS app_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS trigger_map (
    achievement_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    condition_json TEXT,
    PRIMARY KEY (achievement_id, event_type)
  )`,
];
