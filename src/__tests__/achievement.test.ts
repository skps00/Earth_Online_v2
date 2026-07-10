import { rarityFromPoints, rarityColors, CATEGORIES } from '@/types/achievement';

describe('achievement types', () => {
  it('maps low points to Common', () => {
    expect(rarityFromPoints(10)).toBe('Common');
    expect(rarityFromPoints(49)).toBe('Common');
  });

  it('maps mid points to Rare', () => {
    expect(rarityFromPoints(50)).toBe('Rare');
    expect(rarityFromPoints(199)).toBe('Rare');
  });

  it('maps high points to Epic', () => {
    expect(rarityFromPoints(200)).toBe('Epic');
    expect(rarityFromPoints(999)).toBe('Epic');
  });

  it('maps top points to Legendary', () => {
    expect(rarityFromPoints(1000)).toBe('Legendary');
    expect(rarityFromPoints(5000)).toBe('Legendary');
  });

  it('returns color for each rarity', () => {
    expect(rarityColors('Common')).toBeTruthy();
    expect(rarityColors('Rare')).toBeTruthy();
    expect(rarityColors('Epic')).toBeTruthy();
    expect(rarityColors('Legendary')).toBeTruthy();
  });

  it('defines five categories', () => {
    expect(CATEGORIES).toHaveLength(5);
    expect(CATEGORIES).toContain('Exploration');
  });
});
