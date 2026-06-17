import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useCompanion } from '@/hooks/useCompanion';
import { useAtomValue } from 'jotai';
import { isCheckingInAtom, lastCheckInAtom, checkInErrorAtom } from '@/stores/checkInStore';
import { companionAtom } from '@/stores/companionStore';
import { coinsAtom } from '@/stores/currencyStore';
import { PermissionDialog } from '@/components/PermissionDialog';
import { CheckInRepository } from '@/repositories/CheckInRepository';

const checkInRepo = new CheckInRepository();

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { requestCheckIn, showPermission, handlePermissionAllow, handlePermissionDeny } = useCheckIn();
  useCompanion();
  const insets = useSafeAreaInsets();
  const isCheckingIn = useAtomValue(isCheckingInAtom);
  const lastCheckIn = useAtomValue(lastCheckInAtom);
  const error = useAtomValue(checkInErrorAtom);
  const companion = useAtomValue(companionAtom);
  const coins = useAtomValue(coinsAtom);
  const [stats, setStats] = useState({ locations: 0, countries: 0, continents: 0, totalCheckins: 0 });

  useEffect(() => {
    (async () => {
      const [locations, countries, continents, totalCheckins] = await Promise.all([
        checkInRepo.countUniqueLocations(),
        checkInRepo.countUniqueCountries(),
        checkInRepo.countUniqueContinents(),
        checkInRepo.countTotal(),
      ]);
      setStats({ locations, countries, continents, totalCheckins });
    })();
  }, [lastCheckIn]);

  const bottomPadding = insets.bottom + 100;

  useEffect(() => {
    console.log('[Home] companion:', JSON.stringify(companion));
    console.log('[Home] coins:', coins);
  }, [companion, coins]);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('home.title')}</Text>
      <Text style={[styles.level, { color: colors.onSurfaceVariant }]}>{t('home.level', { level: companion?.level ?? 1 })}</Text>

      <View style={[styles.currencyRow, { borderColor: colors.outlineVariant }]}>
        <Text style={{ fontSize: 18 }}>🪙 </Text>
        <Text style={{ fontSize: 18, color: colors.primaryContainer, fontWeight: 'bold' }}>{coins ?? 0}</Text>
      </View>

      <View style={[styles.petCard, { backgroundColor: colors.surface, borderColor: colors.primaryContainer }]}>
        <Text style={styles.petEmoji}>{companion?.emoji ?? '🐉'}</Text>
        <Text style={{ fontSize: 20, color: colors.onSurface, fontWeight: 'bold' }}>{companion?.name ?? 'Ryujin'}</Text>
        <Text style={{ fontSize: 12, color: colors.secondary, fontWeight: 'bold' }}>LVL {companion?.level ?? 1} {companion?.species?.toUpperCase() ?? 'DRAGON'}</Text>
        <Text style={[styles.comingSoonSmall, { color: colors.outline }]}>{t('home.comingSoon')}</Text>
      </View>

      <TouchableOpacity
        onPress={requestCheckIn}
        disabled={isCheckingIn}
        style={[styles.checkinBtn, { backgroundColor: colors.primaryContainer }]}
      >
        <Text style={[styles.checkinText, { color: colors.onPrimaryContainer }]}>
          {isCheckingIn ? '📍 ' + t('common.loading') : '📍 ' + t('home.checkin')}
        </Text>
      </TouchableOpacity>

      {lastCheckIn && (
        <Text style={[styles.result, { color: colors.secondary }]} numberOfLines={3}>
          📍 {lastCheckIn.location.address ?? `${lastCheckIn.location.lat.toFixed(2)}, ${lastCheckIn.location.lng.toFixed(2)}`}
          {lastCheckIn.unlockedAchievements.length > 0 && `\n🏆 ${lastCheckIn.unlockedAchievements.length === 1 ? t('home.achievementUnlocked', { count: lastCheckIn.unlockedAchievements.length }) : t('home.achievementsUnlocked', { count: lastCheckIn.unlockedAchievements.length })}`}
        </Text>
      )}
      {error && <Text style={[styles.error, { color: colors.error }]}>❌ {error}</Text>}

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>🌍 {t('home.adventureStats')}</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primaryContainer }]}>{stats.locations}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('home.locations')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primaryContainer }]}>{stats.countries}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('home.countries')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primaryContainer }]}>{stats.continents}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('home.continents')}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statNumber, { color: colors.primaryContainer }]}>{stats.totalCheckins}</Text>
            <Text style={[styles.statLabel, { color: colors.onSurfaceVariant }]}>{t('home.totalCheckins')}</Text>
          </View>
        </View>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>⏱️ {t('home.screenTime')}</Text>
        <View style={styles.comingSoonBadge}>
          <Text style={[styles.comingSoonText, { color: colors.outline }]}>{t('home.comingSoon')}</Text>
        </View>
      </View>

      <PermissionDialog
        visible={showPermission}
        title={t('home.locationPermissionTitle')}
        message={t('home.locationPermissionMessage')}
        onAllow={handlePermissionAllow}
        onDeny={handlePermissionDeny}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { padding: 16, gap: 16 },
  title: { fontSize: 32, fontWeight: '700', textAlign: 'center', marginTop: 20 },
  level: { fontSize: 14, textAlign: 'center' },
  currencyRow: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 8, borderBottomWidth: 1 },
  coins: { fontSize: 18 },
  petCard: { padding: 20, borderRadius: 12, borderWidth: 1, alignItems: 'center', gap: 8 },
  petEmoji: { fontSize: 64 },
  petName: { fontSize: 20 },
  petLevel: { fontSize: 12 },
  comingSoonSmall: { fontSize: 10, fontStyle: 'italic', marginTop: 4 },
  checkinBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  checkinText: { fontSize: 18, fontWeight: '700' },
  result: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  error: { fontSize: 13, textAlign: 'center' },
  section: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  sectionTitle: { fontSize: 16 },
  sectionText: { fontSize: 13 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 8 },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '700' },
  statLabel: { fontSize: 11, marginTop: 2 },
  comingSoonBadge: { paddingVertical: 8, alignItems: 'center' },
  comingSoonText: { fontSize: 12, fontStyle: 'italic' },
});
