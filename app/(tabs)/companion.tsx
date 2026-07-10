import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useCompanion } from '@/hooks/useCompanion';
import { useAtomValue } from 'jotai';
import { companionAtom, isCompanionLoadingAtom } from '@/stores/companionStore';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';
import { CompanionCanvas } from '@/components/CompanionCanvas';
import { CompanionRadarChart, COMPANION_STAT_KEYS, type CompanionStatKey } from '@/components/CompanionRadarChart';
import { xpProgressPercent, xpRequiredForLevel } from '@/services/CompanionService';

const STAT_I18N: Record<CompanionStatKey, string> = {
  strength: 'strengthShort',
  agility: 'agilityShort',
  intelligence: 'intelligenceShort',
  charisma: 'charismaShort',
  vitality: 'vitalityShort',
};

export default function CompanionScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  useCompanion();
  const companion = useAtomValue(companionAtom);
  const isLoading = useAtomValue(isCompanionLoadingAtom);

  if (isLoading || !companion) return <LoadingSkeleton lines={3} />;

  const bottomPadding = insets.bottom + 100;
  const xpRequired = xpRequiredForLevel(companion.level);
  const xpPct = xpProgressPercent(companion.xp, companion.level);

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: bottomPadding }]}>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('companion.title')}</Text>

      <CompanionCanvas emoji={companion.emoji} size={180} primaryColor={colors.primaryContainer} />

      <Text style={[styles.name, { color: colors.onSurface }]}>{companion.name}</Text>
      <Text style={[styles.species, { color: colors.secondary }]}>
        {t('companion.levelFormat', { level: companion.level, species: companion.species.toUpperCase() })}
      </Text>
      <Text style={[styles.ready, { color: colors.onSurfaceVariant }]}>{t('companion.ready')}</Text>

      <View style={[styles.xpCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <View style={styles.xpHeader}>
          <Text style={[styles.xpLabel, { color: colors.onSurface }]}>XP</Text>
          <Text style={[styles.xpValue, { color: colors.onSurfaceVariant }]}>{companion.xp} / {xpRequired}</Text>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.outlineVariant }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primaryContainer, width: `${xpPct}%` }]} />
        </View>
        <Text style={[styles.evolution, { color: colors.secondary }]}>{t('companion.evolution')}</Text>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text style={[styles.statsTitle, { color: colors.onSurface }]}>{t('companion.coreAttributes')}</Text>
        <CompanionRadarChart
          stats={{
            strength: companion.strength,
            agility: companion.agility,
            intelligence: companion.intelligence,
            charisma: companion.charisma,
            vitality: companion.vitality,
          }}
          primaryColor={colors.primaryContainer}
          gridColor={colors.outlineVariant}
          labelColor={colors.onSurfaceVariant}
          labels={Object.fromEntries(
            COMPANION_STAT_KEYS.map((key) => [key, t(`companion.${STAT_I18N[key]}`)]),
          ) as Record<CompanionStatKey, string>}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, gap: 12, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 20 },
  name: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  species: { fontSize: 14, textAlign: 'center' },
  ready: { fontSize: 13, textAlign: 'center', fontStyle: 'italic' },
  xpCard: { width: '100%', padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  xpHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  xpLabel: { fontSize: 14, fontWeight: '700' },
  xpValue: { fontSize: 12 },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  evolution: { fontSize: 11, textAlign: 'center' },
  statsCard: { width: '100%', padding: 16, borderRadius: 12, borderWidth: 1, gap: 12, alignItems: 'center' },
  statsTitle: { fontSize: 16, fontWeight: '700', alignSelf: 'flex-start' },
});
