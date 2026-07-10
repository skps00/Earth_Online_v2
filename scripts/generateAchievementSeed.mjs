/**
 * Generates achievementSeedData.ts from v1.0 AchievementSeedData.kt
 * Run: node scripts/generateAchievementSeed.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kotlinPath = path.resolve(__dirname, '../../Earth_Online_v.1.0/app/src/main/java/com/earthonline/app/data/local/AchievementSeedData.kt');
const outPath = path.resolve(__dirname, '../src/database/achievementSeedData.ts');

const kotlin = fs.readFileSync(kotlinPath, 'utf8');

const entityRe = /AchievementDefinitionEntity\("([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*"[^"]+",\s*TriggerType\.(\w+)\.value,\s*(\d+)L,\s*(true|false),\s*(\d+)(?:,\s*"([^"]*)")?/g;

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
};

function categoryFromId(id) {
  if (id.startsWith('ocean_')) return 'Collection';
  if (id.startsWith('career_') || id.startsWith('health_')) return 'Mastery';
  if (id.startsWith('daily_')) return 'Social';
  if (id.startsWith('epic_') || id.startsWith('weather_')) return 'Combat';
  if (id.startsWith('transport_')) return 'Exploration';
  return 'Exploration';
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

function enTitle(id, zhTitle) {
  return id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function enDescription(id, zhDesc, goal) {
  if (id.startsWith('checkin_')) return `Check in at ${goal} different location${goal > 1 ? 's' : ''}`;
  if (id.includes('countries')) return `Visit ${goal} different countries`;
  if (id.includes('continents')) return `Visit ${goal} different continents`;
  return zhDesc;
}

const achievements = [];
const triggers = [];
const translations = [];

let m;
while ((m = entityRe.exec(kotlin)) !== null) {
  const [, id, zhTitle, zhDesc, triggerType, goalStr, hiddenStr, pointsStr, hint] = m;
  const goal = parseInt(goalStr, 10);
  const isHidden = hiddenStr === 'true';
  const points = parseInt(pointsStr, 10);
  const category = categoryFromId(id);
  const rarity = rarityFromPoints(points);
  const icon = iconFromId(id);

  let v2TriggerType = 'manual';
  if (triggerType === 'LOCATION_CHECKIN_COUNT') v2TriggerType = 'checkin_count';
  else if (triggerType === 'AUTO_TRACK') v2TriggerType = 'auto_track';
  else v2TriggerType = 'manual';

  achievements.push({
    id, category, prerequisite_id: null, rarity,
    trigger_type: v2TriggerType, trigger_goal: goal,
    reward_points: points, is_hidden: isHidden ? 1 : 0, prompt_photo: 0, icon,
  });

  let eventType = 'manual_confirm';
  let condition = null;

  if (triggerType === 'LOCATION_CHECKIN_COUNT') {
    eventType = 'checkin_count';
  } else if (triggerType === 'AUTO_TRACK') {
    const mapped = AUTO_TRACK_EVENTS[id];
    if (mapped) {
      eventType = mapped.event;
      condition = mapped.condition;
    } else {
      eventType = 'manual_confirm';
    }
  }

  triggers.push({ achievement_id: id, event_type: eventType, condition_json: condition ? JSON.stringify(condition) : null });

  translations.push(
    ['achievement', id, 'en', 'title', enTitle(id, zhTitle)],
    ['achievement', id, 'en', 'description', enDescription(id, zhDesc, goal)],
    ['achievement', id, 'zh-TW', 'title', zhTitle],
    ['achievement', id, 'zh-TW', 'description', zhDesc],
  );
  if (hint) {
    translations.push(['achievement', id, 'zh-TW', 'hint', hint]);
    translations.push(['achievement', id, 'en', 'hint', hint]);
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
