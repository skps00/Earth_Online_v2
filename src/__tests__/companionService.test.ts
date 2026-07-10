import { xpRequiredForLevel, xpProgressPercent, CHECKIN_XP, ACHIEVEMENT_XP } from '@/services/CompanionService';

describe('CompanionService helpers', () => {
  it('scales XP requirement with level', () => {
    expect(xpRequiredForLevel(1)).toBe(100);
    expect(xpRequiredForLevel(5)).toBe(500);
    expect(xpRequiredForLevel(10)).toBe(1000);
  });

  it('computes XP progress percent capped at 100', () => {
    expect(xpProgressPercent(50, 1)).toBe(50);
    expect(xpProgressPercent(100, 1)).toBe(100);
    expect(xpProgressPercent(150, 1)).toBe(100);
    expect(xpProgressPercent(0, 1)).toBe(0);
  });

  it('handles zero level safely', () => {
    expect(xpProgressPercent(10, 0)).toBe(0);
  });

  it('defines reward constants', () => {
    expect(CHECKIN_XP).toBeGreaterThan(0);
    expect(ACHIEVEMENT_XP).toBeGreaterThan(CHECKIN_XP);
  });
});
