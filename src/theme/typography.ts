export const fonts = {
  headline: 'SpaceGrotesk-Bold',
  body: 'Manrope-Regular',
  bodyItalic: 'Manrope-Italic',
  label: 'JetBrainsMono-Medium',
} as const;

export const fontSizes = {
  displayLg: 48,
  headlineLg: 32,
  headlineLgMobile: 24,
  titleMd: 20,
  bodyLg: 18,
  bodyMd: 16,
  labelSm: 12,
} as const;

export const fontWeights = {
  bold: '700' as const,
  semiBold: '600' as const,
  medium: '500' as const,
  regular: '400' as const,
};

export const lineHeights = {
  displayLg: 1.1,
  headlineLg: 1.2,
  titleMd: 1.4,
  bodyLg: 1.6,
  bodyMd: 1.6,
  labelSm: 1.0,
} as const;
