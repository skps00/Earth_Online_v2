import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useCompanion } from '@/hooks/useCompanion';
import { useAtomValue } from 'jotai';
import { companionAtom, isCompanionLoadingAtom } from '@/stores/companionStore';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function CompanionScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  useCompanion();
  const companion = useAtomValue(companionAtom);
  const isLoading = useAtomValue(isCompanionLoadingAtom);

  if (isLoading || !companion) return <LoadingSkeleton lines={3} />;

  const bottomPadding = insets.bottom + 100;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: bottomPadding }]}>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('companion.title')}</Text>
      <Text style={styles.emoji}>{companion.emoji}</Text>
      <Text style={[styles.name, { color: colors.onSurface }]}>{companion.name}</Text>
      <Text style={[styles.species, { color: colors.secondary }]}>LVL {companion.level} {companion.species.toUpperCase()}</Text>

      <View style={[styles.comingSoonCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text style={[styles.comingSoonTitle, { color: colors.onSurface }]}>{t('common.petSystem')}</Text>
        <Text style={[styles.comingSoonText, { color: colors.outline }]}>{t('home.comingSoon')}</Text>
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 20 },
  emoji: { fontSize: 80, textAlign: 'center', marginVertical: 12 },
  name: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  species: { fontSize: 14, textAlign: 'center', marginBottom: 24 },
  comingSoonCard: { padding: 24, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 8 },
  comingSoonTitle: { fontSize: 18, fontWeight: '700' },
  comingSoonText: { fontSize: 14, fontStyle: 'italic' },
});
