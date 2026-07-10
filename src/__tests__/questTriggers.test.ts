import { getCheckInQuestTriggers } from '@/services/questTriggers';

describe('getCheckInQuestTriggers', () => {
  it('always includes checkin', () => {
    expect(getCheckInQuestTriggers(12)).toEqual(['checkin']);
  });

  it('includes time before 6 AM for early bird quest', () => {
    expect(getCheckInQuestTriggers(5)).toEqual(['checkin', 'time']);
    expect(getCheckInQuestTriggers(0)).toEqual(['checkin', 'time']);
  });

  it('does not include time at or after 6 AM', () => {
    expect(getCheckInQuestTriggers(6)).toEqual(['checkin']);
    expect(getCheckInQuestTriggers(23)).toEqual(['checkin']);
  });
});
