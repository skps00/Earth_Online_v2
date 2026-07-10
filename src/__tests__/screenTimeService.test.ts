import {
  isAllnighterHour,
  shouldCheckNoPhone,
  shouldEmitNoPhone,
  todayKey,
} from '@/services/ScreenTimeService';

describe('ScreenTimeService helpers', () => {
  describe('isAllnighterHour', () => {
    it('is true between 02:00 and 04:59', () => {
      expect(isAllnighterHour(2)).toBe(true);
      expect(isAllnighterHour(4)).toBe(true);
    });

    it('is false outside the allnighter window', () => {
      expect(isAllnighterHour(1)).toBe(false);
      expect(isAllnighterHour(5)).toBe(false);
      expect(isAllnighterHour(23)).toBe(false);
    });
  });

  describe('shouldCheckNoPhone', () => {
    it('starts checking from 20:00', () => {
      expect(shouldCheckNoPhone(19)).toBe(false);
      expect(shouldCheckNoPhone(20)).toBe(true);
      expect(shouldCheckNoPhone(23)).toBe(true);
    });
  });

  describe('shouldEmitNoPhone', () => {
    it('requires evening hour and zero foreground sessions', () => {
      expect(shouldEmitNoPhone(21, 0)).toBe(true);
      expect(shouldEmitNoPhone(21, 1)).toBe(false);
      expect(shouldEmitNoPhone(12, 0)).toBe(false);
    });
  });

  describe('todayKey', () => {
    it('formats local calendar date', () => {
      expect(todayKey(new Date(2026, 6, 9, 15, 30))).toBe('2026-07-09');
    });
  });
});
