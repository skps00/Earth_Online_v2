import type { GameEvent } from '@/types/events';
import { AchievementRepository } from '@/repositories/AchievementRepository';
import { getDatabase } from '@/database/connection';
import { getRulesForEvent } from './eventRules';

const achievementRepo = new AchievementRepository();

export async function processEvent(event: GameEvent): Promise<string[]> {
  const db = await getDatabase();
  const unlockedIds: string[] = [];

  const rules = getRulesForEvent(event);
  if (rules.length === 0) return unlockedIds;

  const definitions = await db.getAllAsync<import('@/types/database').AchievementDefinitionRow>(
    `SELECT * FROM achievement_definitions`
  );

  const unlocked = await achievementRepo.getUnlockedIds();

  for (const def of definitions) {
    if (unlocked.has(def.id)) continue;

    const prereqMet = await achievementRepo.hasPrerequisiteUnlocked(def.id);
    if (!prereqMet) continue;

    for (const rule of rules) {
      if (!rule.check(def, event)) continue;

      if (rule.action === 'unlock') {
        await achievementRepo.unlockAchievement(def.id);
        unlockedIds.push(def.id);
      } else if (rule.action === 'progress') {
        const newProgress = await achievementRepo.incrementProgress(def.id, 1);
        if (newProgress >= def.trigger_goal) {
          await achievementRepo.unlockAchievement(def.id);
          unlockedIds.push(def.id);
        }
      }
      break;
    }
  }

  return unlockedIds;
}
