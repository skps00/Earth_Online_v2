import { Text, TextProps, Platform, StyleSheet, TextStyle, StyleProp } from 'react-native';

const ANDROID_PROPS =
  Platform.OS === 'android'
    ? ({ allowFontScaling: false, textBreakStrategy: 'simple' } as const)
    : {};

const ANDROID_FONT: TextStyle | undefined =
  Platform.OS === 'android' ? { fontFamily: 'sans-serif' } : undefined;

function inferLineHeight(style: TextStyle | undefined): number | undefined {
  if (!style?.fontSize || style.lineHeight != null) return undefined;
  if (style.fontSize > 40) return undefined;
  const ratio = style.fontStyle === 'italic' ? 1.55 : 1.45;
  return Math.ceil(style.fontSize * ratio);
}

function mergeStyles(style: StyleProp<TextStyle>): TextStyle | undefined {
  const flat = StyleSheet.flatten(style);
  if (!flat) return ANDROID_FONT;
  const lineHeight = inferLineHeight(flat);
  return lineHeight != null ? { ...ANDROID_FONT, ...flat, lineHeight } : { ...ANDROID_FONT, ...flat };
}

/** Drop-in Text replacement with Android-safe line heights and wrapping. */
export function AppText({ style, ...props }: TextProps) {
  return <Text {...ANDROID_PROPS} style={mergeStyles(style)} {...props} />;
}
