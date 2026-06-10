export type Category = 'Combat' | 'Exploration' | 'Collection' | 'Social' | 'Mastery';

export type Rarity = 'Common' | 'Rare' | 'Epic' | 'Legendary';

export type TriggerType = 'checkin_count' | 'manual' | 'auto_track';

export const CATEGORIES: Category[] = ['Combat', 'Exploration', 'Collection', 'Social', 'Mastery'];

export function rarityFromPoints(points: number): Rarity {
  if (points >= 1000) return 'Legendary';
  if (points >= 200) return 'Epic';
  if (points >= 50) return 'Rare';
  return 'Common';
}

export function rarityColors(rarity: Rarity): string {
  const map: Record<Rarity, string> = {
    Common: '#888888', Rare: '#4169E1', Epic: '#800080', Legendary: '#FFD700',
  };
  return map[rarity];
}
