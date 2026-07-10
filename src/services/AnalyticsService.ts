import { getDatabase } from '@/database/connection';
import { Logger } from '@/utils/logger';

export type AnalyticsEvent =
  | 'app_open'
  | 'checkin_success'
  | 'achievement_unlock'
  | 'manual_confirm'
  | 'quest_complete'
  | 'onboarding_complete'
  | 'share_card'
  | 'iap_purchase'
  | 'camera_memory_saved';

export async function trackEvent(
  name: AnalyticsEvent,
  params?: Record<string, string | number | boolean>
): Promise<void> {
  const paramsJson = params ? JSON.stringify(params) : null;
  Logger.info('Analytics', `${name} ${paramsJson ?? ''}`);

  try {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO analytics_events (event_name, params_json) VALUES (?, ?)`,
      [name, paramsJson]
    );
  } catch (e) {
    Logger.error('Analytics', 'Failed to persist event', e);
  }
}

export async function getRecentEvents(limit = 50): Promise<
  { event_name: string; params_json: string | null; created_at: string }[]
> {
  const db = await getDatabase();
  return db.getAllAsync(
    `SELECT event_name, params_json, created_at FROM analytics_events ORDER BY id DESC LIMIT ?`,
    [limit]
  );
}
