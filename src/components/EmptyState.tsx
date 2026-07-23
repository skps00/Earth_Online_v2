import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';

export function EmptyState({ message }: { message?: string }) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <AppText style={[styles.icon, { color: colors.outline }]}>📭</AppText>
      <AppText style={[styles.text, { color: colors.outline }]}>{message ?? t('common.empty')}</AppText>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  icon: { fontSize: 48, marginBottom: 12 },
  text: { fontSize: 16 },
});
