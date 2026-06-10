import type { Category, Rarity, TriggerType } from './achievement';
import type { Companion, Species } from './companion';

export interface AchievementDefinitionRow {
  id: string;
  category: Category;
  prerequisite_id: string | null;
  rarity: Rarity;
  trigger_type: TriggerType;
  trigger_goal: number;
  reward_points: number;
  is_hidden: number;
  prompt_photo: number;
  icon: string | null;
}

export interface TranslationRow {
  entity_type: string;
  entity_id: string;
  lang: string;
  field: string;
  value: string;
}

export interface UserAchievementRow {
  user_id: string;
  achievement_id: string;
  progress: number;
  is_unlocked: number;
  unlocked_at: string | null;
}

export interface CheckInRow {
  id: number;
  user_id: string;
  latitude: number;
  longitude: number;
  country: string | null;
  continent: string | null;
  address: string | null;
  created_at: string;
  last_modified_at: string;
}

export type CompanionRow = Companion;

export interface DailyQuestRow {
  id: string;
  reward_xp: number;
  reward_coins: number;
  trigger_type: string;
  goal: number;
}

export interface UserDailyQuestRow {
  user_id: string;
  quest_id: string;
  progress: number;
  is_completed: number;
  date: string;
}

export interface MemoryRow {
  id: number;
  achievement_id: string;
  user_id: string;
  photo_path: string;
  latitude: number | null;
  longitude: number | null;
  country: string | null;
  city: string | null;
  weather: string | null;
  is_shared: number;
  created_at: string;
}

export interface AppSettingRow {
  key: string;
  value: string;
}
