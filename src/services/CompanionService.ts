import { CompanionRepository } from '@/repositories/CompanionRepository';
import type { Companion } from '@/types/companion';
import { Logger } from '@/utils/logger';

const repo = new CompanionRepository();

export const CHECKIN_XP = 10;
export const CHECKIN_COINS = 5;
export const QUEST_XP = 15;
export const ACHIEVEMENT_XP = 25;

export function xpRequiredForLevel(level: number): number {
  return level * 100;
}

export function xpProgressPercent(xp: number, level: number): number {
  const required = xpRequiredForLevel(level);
  if (required <= 0) return 0;
  return Math.min(100, Math.round((xp / required) * 100));
}

export async function getCompanion(): Promise<Companion | null> {
  return repo.get();
}

export async function awardCheckInRewards(): Promise<{ leveledUp: boolean; companion: Companion | null }> {
  return grantXp(CHECKIN_XP, CHECKIN_COINS);
}

export async function awardQuestRewards(): Promise<{ leveledUp: boolean; companion: Companion | null }> {
  return grantXp(QUEST_XP, 10);
}

export async function awardAchievementRewards(count: number): Promise<{ leveledUp: boolean; companion: Companion | null }> {
  if (count <= 0) return { leveledUp: false, companion: await repo.get() };
  return grantXp(ACHIEVEMENT_XP * count, 20 * count);
}

async function grantXp(xpAmount: number, coinAmount: number): Promise<{ leveledUp: boolean; companion: Companion | null }> {
  const current = await repo.get();
  if (!current) return { leveledUp: false, companion: null };

  await repo.addXp(xpAmount);
  if (coinAmount > 0) await repo.addCoins(coinAmount);

  let leveledUp = false;
  let updated = await repo.get();
  if (!updated) return { leveledUp: false, companion: null };

  while (updated.xp >= xpRequiredForLevel(updated.level)) {
    await repo.levelUp();
    leveledUp = true;
    updated = await repo.get();
    if (!updated) break;
    Logger.info('Companion', `Level up! Now level ${updated.level}`);
  }

  return { leveledUp, companion: updated };
}

export async function renameCompanion(name: string): Promise<void> {
  await repo.updateName(name.trim());
}
