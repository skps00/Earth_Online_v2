import { getCheckInQuestTriggers } from '@/services/questTriggers';

describe('getCheckInQuestTriggers', () => {
  it('returns empty outside early-bird hours', () => {
    expect(getCheckInQuestTriggers(12)).toEqual([]);
    expect(getCheckInQuestTriggers(6)).toEqual([]);
    expect(getCheckInQuestTriggers(23)).toEqual([]);
  });

  it('includes time before 6 AM for early bird quest', () => {
    expect(getCheckInQuestTriggers(5)).toEqual(['time']);
    expect(getCheckInQuestTriggers(0)).toEqual(['time']);
  });
});
