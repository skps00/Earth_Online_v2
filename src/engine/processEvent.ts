import type { GameEvent } from '@/types/events';
import type { AchievementDefinitionRow } from '@/types/database';
import { AchievementRepository } from '@/repositories/AchievementRepository';
import { getDatabase } from '@/database/connection';
import { getTriggersForEvent } from './triggerMap';
import { getRuleForEvent } from './eventRules';

const achievementRepo = new AchievementRepository();

function getProgressValue(event: GameEvent): number {
  switch (event.type) {
    case 'checkin_count': return event.uniqueLocations;
    case 'country_count': return event.uniqueCountries;
    case 'continent_count': return event.uniqueContinents;
    case 'steps_daily': return event.count;
    case 'activity_updated': return event.minutes;
    default: return 1;
  }
}

export async function processEvent(event: GameEvent): Promise<string[]> {
  const db = await getDatabase();
  const unlockedIds: string[] = [];

  const triggers = await getTriggersForEvent(event.type);
  if (triggers.length === 0) return unlockedIds;

  const rule = getRuleForEvent(event.type);
  if (!rule) return unlockedIds;

  const unlocked = await achievementRepo.getUnlockedIds();

  for (const trigger of triggers) {
    if (unlocked.has(trigger.achievement_id)) continue;

    const def = await db.getFirstAsync<AchievementDefinitionRow>(
      `SELECT * FROM achievement_definitions WHERE id = ?`,
      [trigger.achievement_id]
    );
    if (!def) continue;

    const prereqMet = await achievementRepo.hasPrerequisiteUnlocked(def.id);
    if (!prereqMet) continue;

    if (!rule.check(def, event, trigger.condition_json)) continue;

    if (rule.action === 'unlock') {
      await achievementRepo.unlockAchievement(def.id);
      unlockedIds.push(def.id);
    } else if (rule.action === 'progress') {
      const value = getProgressValue(event);
      const newProgress = await achievementRepo.setProgress(def.id, value);
      if (newProgress >= def.trigger_goal) {
        await achievementRepo.unlockAchievement(def.id);
        unlockedIds.push(def.id);
      }
    }
  }

  return unlockedIds;
}
