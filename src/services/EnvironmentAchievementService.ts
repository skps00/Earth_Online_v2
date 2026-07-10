import * as Battery from 'expo-battery';
import { processEvent } from '@/engine/processEvent';
import { Logger } from '@/utils/logger';

/** Emit time_specific, battery_low, charging_state events on app startup / background tick */
export async function checkEnvironmentAchievements(): Promise<string[]> {
  const unlocked: string[] = [];
  const now = new Date();
  const hour = now.getHours();
  const weekday = now.getDay();

  try {
    const timeResults = await processEvent({ type: 'time_specific', hour, weekday });
    unlocked.push(...timeResults);
  } catch (e) {
    Logger.error('Environment', 'time_specific failed', e);
  }

  try {
    const level = await Battery.getBatteryLevelAsync();
    const state = await Battery.getBatteryStateAsync();

    if (level <= 0.15) {
      const low = await processEvent({ type: 'battery_low' });
      unlocked.push(...low);
    }

    const charging = state === Battery.BatteryState.CHARGING || state === Battery.BatteryState.FULL;
    const chargeResults = await processEvent({ type: 'charging_state', isCharging: charging });
    unlocked.push(...chargeResults);
  } catch (e) {
    Logger.error('Environment', 'battery check failed', e);
  }

  return unlocked;
}
