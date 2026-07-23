import { View, StyleSheet, ScrollView } from 'react-native';
import { AppText } from '@/components/AppText';
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
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
    >
      <AppText style={[styles.title, { color: colors.primaryContainer }]}>{t('companion.title')}</AppText>

      <CompanionCanvas emoji={companion.emoji} size={180} primaryColor={colors.primaryContainer} />

      <AppText style={[styles.name, { color: colors.onSurface }]}>{companion.name}</AppText>
      <AppText style={[styles.species, { color: colors.secondary }]}>
        {t('companion.levelFormat', { level: companion.level, species: companion.species.toUpperCase() })}
      </AppText>
      <AppText style={[styles.ready, { color: colors.onSurfaceVariant }]}>{t('companion.ready')}</AppText>

      <View style={[styles.xpCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <View style={styles.xpHeader}>
          <AppText style={[styles.xpLabel, { color: colors.onSurface }]}>XP</AppText>
          <AppText
            style={[styles.xpValue, { color: colors.onSurfaceVariant }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.85}
          >
            {t('companion.xpFormat', { current: companion.xp, max: xpRequired })}
          </AppText>
        </View>
        <View style={[styles.progressBar, { backgroundColor: colors.outlineVariant }]}>
          <View style={[styles.progressFill, { backgroundColor: colors.primaryContainer, width: `${xpPct}%` }]} />
        </View>
        <AppText style={[styles.evolution, { color: colors.secondary }]}>{t('companion.evolution')}</AppText>
      </View>

      <View style={[styles.statsCard, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <AppText style={[styles.statsTitle, { color: colors.onSurface }]}>{t('companion.coreAttributes')}</AppText>
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 12, alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 20 },
  name: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  species: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  ready: { fontSize: 13, textAlign: 'center', fontStyle: 'italic', lineHeight: 18 },
  xpCard: { width: '100%', padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  xpHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  xpLabel: { fontSize: 14, fontWeight: '700', flexShrink: 0 },
  xpValue: { fontSize: 12, lineHeight: 18, flexShrink: 1, textAlign: 'right' },
  progressBar: { height: 8, borderRadius: 4, overflow: 'hidden', width: '100%' },
  progressFill: { height: '100%', borderRadius: 4 },
  evolution: { fontSize: 11, textAlign: 'center', lineHeight: 16 },
  statsCard: { width: '100%', padding: 16, borderRadius: 12, borderWidth: 1, gap: 12, alignItems: 'center' },
  statsTitle: { fontSize: 16, fontWeight: '700', alignSelf: 'flex-start' },
});
