import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useCompanion } from '@/hooks/useCompanion';
import { useAtomValue } from 'jotai';
import { companionAtom, companionStatsAtom, isCompanionLoadingAtom } from '@/stores/companionStore';
import { ProgressBar } from '@/components/ProgressBar';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

export default function CompanionScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  useCompanion();
  const companion = useAtomValue(companionAtom);
  const stats = useAtomValue(companionStatsAtom);
  const isLoading = useAtomValue(isCompanionLoadingAtom);

  if (isLoading || !companion) return <LoadingSkeleton lines={5} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('companion.title')}</Text>
      <Text style={styles.emoji}>{companion.emoji}</Text>
      <Text style={[styles.name, { color: colors.onSurface }]}>{companion.name}</Text>
      <Text style={[styles.species, { color: colors.secondary }]}>LVL {companion.level} {companion.species.toUpperCase()}</Text>

      <View style={[styles.evoSection, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text style={[styles.evoTitle, { color: colors.onSurfaceVariant }]}>{t('companion.evolution')}</Text>
        <ProgressBar progress={companion.xp} max={companion.level * 100} />
        <Text style={[styles.xpText, { color: colors.secondary }]}>{companion.xp}/{companion.level * 100} XP</Text>
      </View>

      <View style={[styles.statsSection, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text style={[styles.statsTitle, { color: colors.onSurface }]}>Core Attributes</Text>
        {(['strength', 'agility', 'intelligence', 'vitality'] as const).map(stat => (
          <View key={stat} style={styles.statRow}>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t(`companion.${stat}`)}</Text>
            <ProgressBar progress={stats[stat]} max={100} height={8} />
            <Text style={[styles.statValue, { color: colors.onSurface }]}>{stats[stat]}/100</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 20 },
  emoji: { fontSize: 80, textAlign: 'center', marginVertical: 12 },
  name: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  species: { fontSize: 14, textAlign: 'center', marginBottom: 20 },
  evoSection: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 16, gap: 8 },
  evoTitle: { fontSize: 12 },
  xpText: { fontSize: 12, textAlign: 'right' },
  statsSection: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 12 },
  statsTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  statRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statLabel: { width: 80, fontSize: 12 },
  statValue: { width: 45, fontSize: 12, textAlign: 'right' },
});
