import React from 'react';
import { useAtomValue } from 'jotai';
import { themeAtom } from '@/stores/settingsStore';
import { darkColors } from './colors';
import { fonts, fontSizes } from './typography';
import { spacing, borderRadius } from './spacing';

interface ThemeContextValue {
  colors: typeof darkColors;
  fonts: typeof fonts;
  fontSizes: typeof fontSizes;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const mode = useAtomValue(themeAtom);
  // Phase 1: dark only, light deferred to Phase 2
  const colors = darkColors;
  const value = { colors, fonts, fontSizes, spacing, borderRadius };
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be inside ThemeProvider');
  return ctx;
}
