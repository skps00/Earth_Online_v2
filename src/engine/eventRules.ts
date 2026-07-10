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

registerRule('manual_confirm', {
  action: 'unlock',
  check: (def, event) => {
    if (event.type !== 'manual_confirm') return false;
    return event.achievementId === def.id;
  },
});

registerRule('weather_checked', {
  action: 'unlock',
  check: (def, event, conditionJson) => {
    if (event.type !== 'weather_checked') return false;
    if (conditionJson) {
      try {
        const condition = JSON.parse(conditionJson);
        if (condition.condition && event.condition !== condition.condition) return false;
      } catch (e) {
        console.error(`[Rule Error] Invalid condition_json for achievement ${def.id}:`, e);
        return false;
      }
    }
    return true;
  },
});

registerRule('earthquake_felt', {
  action: 'unlock',
  check: (def, event) => {
    if (event.type !== 'earthquake_felt') return false;
    return event.magnitude >= 4 && event.distanceKm <= 200;
  },
});

registerRule('screentime_checked', {
  action: 'unlock',
  check: (def, event, conditionJson) => {
    if (event.type !== 'screentime_checked') return false;
    if (conditionJson) {
      try {
        const condition = JSON.parse(conditionJson);
        if (condition.result && event.result !== condition.result) return false;
      } catch (e) {
        console.error(`[Rule Error] Invalid condition_json for achievement ${def.id}:`, e);
        return false;
      }
    }
    return true;
  },
});

registerRule('time_specific', {
  action: 'unlock',
  check: (def, event, conditionJson) => {
    if (event.type !== 'time_specific') return false;
    if (conditionJson) {
      try {
        const condition = JSON.parse(conditionJson);
        if (condition.hourMax !== undefined && event.hour > condition.hourMax) return false;
        if (condition.hourMin !== undefined && event.hour < condition.hourMin) return false;
      } catch (e) {
        console.error(`[Rule Error] Invalid condition_json for achievement ${def.id}:`, e);
        return false;
      }
    }
    return true;
  },
});

registerRule('altitude_checked', {
  action: 'unlock',
  check: (def, event, conditionJson) => {
    if (event.type !== 'altitude_checked') return false;
    if (conditionJson) {
      try {
        const condition = JSON.parse(conditionJson);
        if (condition.minMeters !== undefined && event.meters < condition.minMeters) return false;
      } catch (e) {
        console.error(`[Rule Error] Invalid condition_json for achievement ${def.id}:`, e);
        return false;
      }
    }
    return true;
  },
});

registerRule('activity_updated', {
  action: 'progress',
  check: (def, event) => {
    if (event.type !== 'activity_updated') return false;
    return event.minutes >= def.trigger_goal;
  },
});

registerRule('steps_daily', {
  action: 'progress',
  check: (def, event) => {
    if (event.type !== 'steps_daily') return false;
    return event.count >= def.trigger_goal;
  },
});

registerRule('battery_low', {
  action: 'unlock',
  check: (_def, event) => event.type === 'battery_low',
});

registerRule('charging_state', {
  action: 'unlock',
  check: (def, event, conditionJson) => {
    if (event.type !== 'charging_state') return false;
    if (conditionJson) {
      try {
        const condition = JSON.parse(conditionJson);
        if (typeof condition.isCharging === 'boolean' && event.isCharging !== condition.isCharging) {
          return false;
        }
      } catch {
        return false;
      }
    }
    return true;
  },
});
