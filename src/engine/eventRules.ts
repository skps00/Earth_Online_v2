import type { GameEvent } from '@/types/events';
import type { AchievementDefinitionRow } from '@/types/database';

type RuleCheck = (achievement: AchievementDefinitionRow, event: GameEvent) => boolean;

interface Rule {
  check: RuleCheck;
  action: 'unlock' | 'progress';
}

export function getRulesForEvent(event: GameEvent): Rule[] {
  const rules: Record<string, Rule[]> = {
    checkin_completed: [
      {
        action: 'unlock',
        check: (a, e) => {
          if (e.type !== 'checkin_completed') return false;
          return true;
        },
      },
    ],
    checkin_count: [
      {
        action: 'progress',
        check: (a, e) => {
          if (e.type !== 'checkin_count') return false;
          return e.uniqueLocations >= a.trigger_goal;
        },
      },
    ],
    country_count: [
      {
        action: 'progress',
        check: (a, e) => {
          if (e.type !== 'country_count') return false;
          return e.uniqueCountries >= a.trigger_goal;
        },
      },
    ],
    continent_count: [
      {
        action: 'progress',
        check: (a, e) => {
          if (e.type !== 'continent_count') return false;
          return e.uniqueContinents >= a.trigger_goal;
        },
      },
    ],
    sunrise_sunset: [
      {
        action: 'unlock',
        check: (a) => a.id.startsWith('explore_sun'),
      },
    ],
  };

  return rules[event.type] ?? [];
}
