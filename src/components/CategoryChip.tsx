import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { Category } from '@/types/achievement';
import { useTranslation } from '@/i18n';

interface Props { category: Category | 'all'; active: boolean; onPress: () => void; }

export function CategoryChip({ category, active, onPress }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const label = category === 'all' ? 'All' : t(`trophies.categories.${category.toLowerCase()}`);
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.chip, {
        backgroundColor: active ? colors.primaryContainer : colors.surfaceHigh,
        borderColor: active ? colors.primaryContainer : colors.outlineVariant,
      }]}>
      <Text style={[styles.text, { color: active ? colors.onPrimaryContainer : colors.onSurfaceVariant }]}>{label}</Text>
    </TouchableOpacity>
  );
}
const styles = StyleSheet.create({
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, marginRight: 8 },
  text: { fontSize: 13 },
});
