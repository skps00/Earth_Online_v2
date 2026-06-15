import { TouchableOpacity, Text } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Category } from '@/types/achievement';
import { useTranslation } from '@/i18n';

interface Props { category: Category | 'all'; active: boolean; onPress: () => void; }

export function CategoryChip({ category, active, onPress }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const label = category === 'all' ? t('trophies.categories.all') : t(`trophies.categories.${category.toLowerCase()}`);

  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: active ? colors.primaryContainer : colors.surfaceHigh,
        borderColor: active ? colors.primaryContainer : colors.outlineVariant,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
      }}
    >
      <Text style={{
        color: active ? colors.onPrimaryContainer : colors.onSurfaceVariant,
        fontSize: 13,
        includeFontPadding: false,
      }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}
