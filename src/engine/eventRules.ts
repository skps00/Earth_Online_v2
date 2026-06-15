import type { GameEvent } from '@/types/events';
import type { AchievementDefinitionRow } from '@/types/database';

export type RuleAction = 'unlock' | 'progress';

export interface Rule {
  action: RuleAction;
  check: (def: AchievementDefinitionRow, event: GameEvent, conditionJson: string | null) => boolean;
}

const ruleRegistry: Record<string, Rule> = {};

export function registerRule(eventType: string, rule: Rule): void {
  ruleRegistry[eventType] = rule;
}

export function getRuleForEvent(eventType: string): Rule | null {
  return ruleRegistry[eventType] ?? null;
}

// Register built-in rules
registerRule('checkin_completed', {
  action: 'unlock',
  check: (def, event, conditionJson) => {
    if (event.type !== 'checkin_completed') return false;
    if (conditionJson) {
      try {
        const condition = JSON.parse(conditionJson);
        if (condition.country && event.country !== condition.country) return false;
        if (condition.continent && event.continent !== condition.continent) return false;
      } catch (e) {
        console.error(`[Rule Error] Invalid condition_json for achievement ${def.id}:`, e);
        return false;
      }
    }
    return true;
  },
});

registerRule('checkin_count', {
  action: 'progress',
  check: (def, event) => {
    if (event.type !== 'checkin_count') return false;
    return event.uniqueLocations >= def.trigger_goal;
  },
});

registerRule('country_count', {
  action: 'progress',
  check: (def, event) => {
    if (event.type !== 'country_count') return false;
    return event.uniqueCountries >= def.trigger_goal;
  },
});

registerRule('continent_count', {
  action: 'progress',
  check: (def, event) => {
    if (event.type !== 'continent_count') return false;
    return event.uniqueContinents >= def.trigger_goal;
  },
});

registerRule('sunrise_sunset', {
  action: 'unlock',
  check: (def, event, conditionJson) => {
    if (event.type !== 'sunrise_sunset') return false;
    if (conditionJson) {
      try {
        const condition = JSON.parse(conditionJson);
        if (condition.phase && event.phase !== condition.phase) return false;
      } catch (e) {
        console.error(`[Rule Error] Invalid condition_json for achievement ${def.id}:`, e);
        return false;
      }
    }
    return true;
  },
});
