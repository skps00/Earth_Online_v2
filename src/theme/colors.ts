export const darkColors = {
  background: '#161308',
  surface: '#231f14',
  surfaceBright: '#3d392c',
  surfaceHigh: '#2e2a1e',
  surfaceHighest: '#393528',
  onSurface: '#eae2cf',
  onSurfaceVariant: '#d0c6ab',

  primary: '#fff6df',
  primaryContainer: '#ffd700',
  onPrimary: '#3a3000',
  onPrimaryContainer: '#705e00',

  secondary: '#66dd8b',
  secondaryContainer: '#25a55a',
  onSecondary: '#003919',

  tertiary: '#defcff',
  tertiaryContainer: '#00f1ff',

  error: '#ffb4ab',
  errorContainer: '#93000a',
  onError: '#690005',

  outline: '#999077',
  outlineVariant: '#4d4732',

  // Rarity colors
  rarityCommon: '#888888',
  rarityRare: '#4169E1',
  rarityEpic: '#800080',
  rarityLegendary: '#FFD700',
  rarityLegendaryGlow: 'rgba(255,215,0,0.3)',

  // Semantic
  xpFill: '#50C878',
  coinGold: '#FFD700',
  locked: '#555555',
} as const;

export type ColorTokens = typeof darkColors;
