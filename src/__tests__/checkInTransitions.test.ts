import { crossesDateLine, crossedNationalBorder } from '@/utils/checkInTransitions';
import { getRuleForEvent } from '@/engine/eventRules';
import type { AchievementDefinitionRow } from '@/types/database';

const def = (): AchievementDefinitionRow => ({
  id: 'test',
  category: 'Travel',
  prerequisite_id: null,
  rarity: 'Common',
  trigger_type: 'auto_track',
  trigger_goal: 1,
  reward_points: 10,
  is_hidden: 0,
  prompt_photo: 0,
  icon: '📍',
});

describe('checkInTransitions', () => {
  it('detects antimeridian crossings', () => {
    expect(crossesDateLine(170, -170)).toBe(true);
    expect(crossesDateLine(139, -118)).toBe(true);
    expect(crossesDateLine(121, 139)).toBe(false);
    expect(crossesDateLine(10, -10)).toBe(false);
  });

  it('detects national border changes', () => {
    expect(crossedNationalBorder('Taiwan', 'Japan')).toBe(true);
    expect(crossedNationalBorder('Japan', 'Japan')).toBe(false);
    expect(crossedNationalBorder(null, 'Japan')).toBe(false);
    expect(crossedNationalBorder('Taiwan', null)).toBe(false);
  });
});

describe('checkin_completed transition conditions', () => {
  const rule = getRuleForEvent('checkin_completed')!;

  it('requires crossedBorder when condition asks for it', () => {
    const condition = JSON.stringify({ crossedBorder: true });
    expect(
      rule.check(
        def(),
        { type: 'checkin_completed', country: 'Japan', continent: 'Asia', crossedBorder: true },
        condition,
      ),
    ).toBe(true);
    expect(
      rule.check(
        def(),
        { type: 'checkin_completed', country: 'Japan', continent: 'Asia', crossedBorder: false },
        condition,
      ),
    ).toBe(false);
  });

  it('requires crossedDateline when condition asks for it', () => {
    const condition = JSON.stringify({ crossedDateline: true });
    expect(
      rule.check(
        def(),
        { type: 'checkin_completed', country: 'USA', continent: 'North America', crossedDateline: true },
        condition,
      ),
    ).toBe(true);
    expect(
      rule.check(
        def(),
        { type: 'checkin_completed', country: 'USA', continent: 'North America' },
        condition,
      ),
    ).toBe(false);
  });

  it('requires minUniqueCountries', () => {
    const condition = JSON.stringify({ minUniqueCountries: 2 });
    expect(
      rule.check(
        def(),
        { type: 'checkin_completed', country: 'Japan', continent: 'Asia', uniqueCountries: 2 },
        condition,
      ),
    ).toBe(true);
    expect(
      rule.check(
        def(),
        { type: 'checkin_completed', country: 'Japan', continent: 'Asia', uniqueCountries: 1 },
        condition,
      ),
    ).toBe(false);
  });

  it('still filters by country without breaking on transition fields', () => {
    const condition = JSON.stringify({ country: 'Japan' });
    expect(
      rule.check(
        def(),
        {
          type: 'checkin_completed',
          country: 'Japan',
          continent: 'Asia',
          crossedBorder: true,
          uniqueCountries: 5,
        },
        condition,
      ),
    ).toBe(true);
  });
});
