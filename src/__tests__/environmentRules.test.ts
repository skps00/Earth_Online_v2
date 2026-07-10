import { getRuleForEvent } from '@/engine/eventRules';

describe('battery and charging rules', () => {
  it('registers battery_low rule', () => {
    const rule = getRuleForEvent('battery_low');
    expect(rule).not.toBeNull();
    expect(rule?.action).toBe('unlock');
  });

  it('registers charging_state rule', () => {
    const rule = getRuleForEvent('charging_state');
    expect(rule).not.toBeNull();
    expect(rule?.action).toBe('unlock');
  });
});
