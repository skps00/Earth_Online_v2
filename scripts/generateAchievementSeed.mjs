/**
 * Generates achievementSeedData.ts from v1.0 AchievementSeedData.kt
 * Run: node scripts/generateAchievementSeed.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { ACHIEVEMENT_EN } from './achievementEnTranslations.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kotlinPath = path.resolve(__dirname, '../../Earth_Online_v.1.0/app/src/main/java/com/earthonline/app/data/local/AchievementSeedData.kt');
const outPath = path.resolve(__dirname, '../src/database/achievementSeedData.ts');

const kotlin = fs.readFileSync(kotlinPath, 'utf8');

const entityRe = /AchievementDefinitionEntity\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"[^"]+",\s*TriggerType\.(\w+)\.value,\s*(\d+)L,\s*(true|false),\s*(\d+)(?:,\s*"([^"]*)")?/g;

/** v2 excludes achievements present in v1 kotlin but removed from the app. */
const EXCLUDED_IDS = new Set(['daily_umbrella']);

/** zh-TW title/description overrides (kotlin seed is reference only). */
const ZH_OVERRIDES = {
  daily_allnighter: { title: '不眠之夜' },
};

const AUTO_TRACK_EVENTS = {
  explore_7continents: { event: 'continent_count', condition: null },
  explore_50countries: { event: 'country_count', condition: null },
  explore_10countries: { event: 'country_count', condition: null },
  explore_5countries: { event: 'country_count', condition: null },
  explore_3continents: { event: 'continent_count', condition: null },
  explore_mountain: { event: 'altitude_checked', condition: { minMeters: 2500 } },
  explore_japan: { event: 'checkin_completed', condition: { country: 'Japan' } },
  explore_europe: { event: 'checkin_completed', condition: { continent: 'Europe' } },
  explore_africa: { event: 'checkin_completed', condition: { continent: 'Africa' } },
  explore_south_america: { event: 'checkin_completed', condition: { continent: 'South America' } },
  explore_antarctica: { event: 'checkin_completed', condition: { continent: 'Antarctica' } },
  explore_australia: { event: 'checkin_completed', condition: { country: 'Australia' } },
  explore_asia: { event: 'checkin_completed', condition: { continent: 'Asia' } },
  explore_north_america: { event: 'checkin_completed', condition: { continent: 'North America' } },
  explore_oceania: { event: 'checkin_completed', condition: { continent: 'Oceania' } },
  daily_earlybird: { event: 'time_specific', condition: { hourMax: 5 } },
  daily_allnighter: { event: 'screentime_checked', condition: { result: 'allnighter' } },
  daily_no_phone: { event: 'screentime_checked', condition: { result: 'no_phone' } },
  epic_earthquake: { event: 'earthquake_felt', condition: null },
  weather_storm: { event: 'weather_checked', condition: { condition: 'storm' } },
  weather_rain: { event: 'weather_checked', condition: { condition: 'rain' } },
  weather_extreme_heat: { event: 'weather_checked', condition: { condition: 'extreme_heat' } },
  weather_lightning: { event: 'weather_checked', condition: { condition: 'lightning' } },
  // Converted from MANUAL: WeatherService already emits snow on check-in.
  explore_snow: { event: 'weather_checked', condition: { condition: 'snow' } },
  // Converted from MANUAL: check-in transitions (prev check-in vs current).
  explore_border: { event: 'checkin_completed', condition: { crossedBorder: true } },
  explore_dateline: { event: 'checkin_completed', condition: { crossedDateline: true } },
  explore_first_abroad: { event: 'checkin_completed', condition: { minUniqueCountries: 2 } },
};

/** Explicit v2 six-category mapping (128 achievements). */
const CATEGORY_BY_ID = Object.fromEntries([
  // Natural (10)
  ...[
    'epic_eclipse', 'epic_northernlights', 'epic_milkyway', 'epic_earthquake',
    'epic_double_rainbow', 'epic_meteor', 'weather_storm', 'weather_rain',
    'weather_extreme_heat', 'weather_lightning',
  ].map((id) => [id, 'Natural']),
  // Milestone (5)
  ...[
    'epic_survive', 'epic_newborn', 'epic_first_date', 'epic_concert', 'explore_bucket_list',
  ].map((id) => [id, 'Milestone']),
  // Travel (60)
  ...[
    'checkin_1', 'checkin_3', 'checkin_5', 'checkin_10', 'checkin_25', 'checkin_50',
    'ocean_pacific', 'ocean_atlantic', 'ocean_indian', 'ocean_arctic', 'ocean_southern',
    'explore_7continents', 'explore_50countries', 'explore_10countries', 'explore_5countries',
    'explore_3continents', 'explore_dateline', 'explore_missed_flight', 'explore_island',
    'explore_mountain', 'explore_solo', 'explore_ocean', 'explore_first_abroad', 'explore_japan',
    'explore_europe', 'explore_africa', 'explore_south_america', 'explore_antarctica',
    'explore_australia', 'explore_asia', 'explore_north_america', 'explore_oceania',
    'explore_capital', 'explore_unesco', 'explore_temple', 'explore_night_market',
    'explore_hot_spring', 'explore_beach', 'explore_museum', 'explore_airport', 'explore_cruise',
    'explore_border', 'explore_canyon', 'explore_volcano', 'explore_lake', 'explore_tower',
    'explore_tokyo_tower', 'explore_great_wall', 'explore_venice', 'explore_snow',
    'explore_desert', 'explore_jungle', 'explore_underwater', 'explore_camping',
    'transport_license', 'transport_bike', 'transport_roadtrip', 'transport_no_accident',
    'transport_uber_100', 'transport_bike_100',
  ].map((id) => [id, 'Travel']),
  // Daily (24)
  ...[
    'daily_lottery', 'daily_social', 'daily_pets', 'daily_earlybird', 'daily_cook',
    'daily_binge', 'daily_allnighter', 'daily_read_10', 'daily_no_phone', 'daily_stranger',
    'daily_puzzle', 'daily_late', 'daily_spicy', 'daily_karaoke', 'daily_fall_down',
    'daily_look_up', 'daily_suntan', 'daily_chopsticks', 'daily_diy', 'daily_fix',
    'daily_plant', 'daily_tattoo', 'daily_photo_album', 'explore_sky_lantern',
  ].map((id) => [id, 'Daily']),
  // Health (13)
  ...[
    'health_marathon', 'health_blood', 'health_10k', 'health_no_sugar', 'health_meditate',
    'health_gym', 'health_pushup_50', 'health_weight_loss', 'health_sleep_8h', 'health_yoga',
    'health_vegan', 'health_plank_5min', 'daily_exercise_30',
  ].map((id) => [id, 'Health']),
  // Career (16)
  ...[
    'career_phd', 'career_graduate', 'career_house', 'career_first_job', 'career_365_ontime',
    'career_masters', 'career_bachelor', 'career_fired', 'career_promotion', 'career_startup',
    'career_raise', 'career_quit', 'career_meeting_hell', 'career_overtime_hell',
    'career_presentation', 'transport_first_car',
  ].map((id) => [id, 'Career']),
]);

if (Object.keys(CATEGORY_BY_ID).length !== 128) {
  throw new Error(`CATEGORY_BY_ID must have 128 keys, got ${Object.keys(CATEGORY_BY_ID).length}`);
}

function categoryFromId(id) {
  const category = CATEGORY_BY_ID[id];
  if (!category) throw new Error(`Missing category mapping for achievement: ${id}`);
  return category;
}

function rarityFromPoints(points) {
  if (points >= 1000) return 'Legendary';
  if (points >= 200) return 'Epic';
  if (points >= 50) return 'Rare';
  return 'Common';
}

function iconFromId(id) {
  const icons = {
    checkin: '📍', explore: '🗺️', ocean: '🌊', career: '💼', daily: '☀️',
    epic: '⭐', weather: '🌦️', health: '💪', transport: '🚗',
  };
  const prefix = id.split('_')[0];
  return icons[prefix] ?? '🏆';
}

function requireEn(id) {
  const en = ACHIEVEMENT_EN[id];
  if (!en) throw new Error(`Missing English translation for achievement: ${id}`);
  return en;
}

const achievements = [];
const triggers = [];
const translations = [];

let m;
while ((m = entityRe.exec(kotlin)) !== null) {
  const [, id, zhTitleRaw, zhDescRaw, triggerType, goalStr, hiddenStr, pointsStr, hint] = m;
  if (EXCLUDED_IDS.has(id)) continue;

  const zhOverride = ZH_OVERRIDES[id] ?? {};
  const zhTitle = zhOverride.title ?? zhTitleRaw;
  const zhDesc = zhOverride.description ?? zhDescRaw;
  const goal = parseInt(goalStr, 10);
  const isHidden = hiddenStr === 'true';
  const points = parseInt(pointsStr, 10);
  const category = categoryFromId(id);
  const rarity = rarityFromPoints(points);
  const icon = iconFromId(id);

  // AUTO_TRACK_EVENTS is source of truth (covers kotlin AUTO_TRACK + manual→auto conversions).
  const mapped = AUTO_TRACK_EVENTS[id];
  let v2TriggerType = 'manual';
  let eventType = 'manual_confirm';
  let condition = null;

  if (triggerType === 'LOCATION_CHECKIN_COUNT') {
    v2TriggerType = 'checkin_count';
    eventType = 'checkin_count';
  } else if (mapped) {
    v2TriggerType = 'auto_track';
    eventType = mapped.event;
    condition = mapped.condition;
  }

  achievements.push({
    id, category, prerequisite_id: null, rarity,
    trigger_type: v2TriggerType, trigger_goal: goal,
    reward_points: points, is_hidden: isHidden ? 1 : 0, prompt_photo: 0, icon,
  });

  triggers.push({ achievement_id: id, event_type: eventType, condition_json: condition ? JSON.stringify(condition) : null });

  const en = requireEn(id);
  translations.push(
    ['achievement', id, 'en', 'title', en.title],
    ['achievement', id, 'en', 'description', en.description],
    ['achievement', id, 'zh-TW', 'title', zhTitle],
    ['achievement', id, 'zh-TW', 'description', zhDesc],
  );
  if (hint) {
    translations.push(['achievement', id, 'zh-TW', 'hint', hint]);
    translations.push(['achievement', id, 'en', 'hint', en.hint ?? hint]);
  }
}

console.log(`Parsed ${achievements.length} achievements`);

const out = `// AUTO-GENERATED by scripts/generateAchievementSeed.mjs — do not edit manually
import type { Category } from '@/types/achievement';

export interface AchievementSeedRow {
  id: string;
  category: Category;
  prerequisite_id: string | null;
  rarity: string;
  trigger_type: string;
  trigger_goal: number;
  reward_points: number;
  is_hidden: number;
  prompt_photo: number;
  icon: string;
}

export interface TriggerSeedRow {
  achievement_id: string;
  event_type: string;
  condition_json: string | null;
}

export const ACHIEVEMENT_SEED: AchievementSeedRow[] = ${JSON.stringify(achievements, null, 2)};

export const TRIGGER_SEED: TriggerSeedRow[] = ${JSON.stringify(triggers, null, 2)};

export const ACHIEVEMENT_TRANSLATIONS: [string, string, string, string, string][] = ${JSON.stringify(translations, null, 2)};

export const ACHIEVEMENT_COUNT = ${achievements.length};
`;

fs.writeFileSync(outPath, out);
console.log(`Wrote ${outPath}`);
