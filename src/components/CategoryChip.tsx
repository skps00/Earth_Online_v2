import { Text, Platform } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Category } from '@/types/achievement';
import { useTranslation } from '@/i18n';

interface Props { category: Category | 'all'; active: boolean; onPress: () => void; }

export function CategoryChip({ category, active, onPress }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const label = category === 'all' ? t('trophies.categories.all') : t(`trophies.categories.${category.toLowerCase()}`);

  return (
    <Text
      onPress={onPress}
      textBreakStrategy="simple"
      allowFontScaling={false}
      style={{
        backgroundColor: active ? colors.primaryContainer : colors.surfaceHigh,
        borderColor: active ? colors.primaryContainer : colors.outlineVariant,
        borderWidth: 1,
        borderRadius: 8,
        color: active ? colors.onPrimaryContainer : colors.onSurfaceVariant,
        fontSize: 13,
        lineHeight: 20,
        fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
        paddingHorizontal: 16,
        paddingVertical: 6,
        marginRight: 8,
        flexShrink: 0,
      }}
    >
      {label}
    </Text>
  );
}
