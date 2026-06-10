import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useCompanion } from '@/hooks/useCompanion';
import { useAtomValue } from 'jotai';
import { isCheckingInAtom, lastCheckInAtom, checkInErrorAtom } from '@/stores/checkInStore';
import { companionAtom } from '@/stores/companionStore';
import { coinsAtom } from '@/stores/currencyStore';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { checkIn } = useCheckIn();
  useCompanion();
  const isCheckingIn = useAtomValue(isCheckingInAtom);
  const lastCheckIn = useAtomValue(lastCheckInAtom);
  const error = useAtomValue(checkInErrorAtom);
  const companion = useAtomValue(companionAtom);
  const coins = useAtomValue(coinsAtom);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('home.title')}</Text>
      <Text style={[styles.level, { color: colors.onSurfaceVariant }]}>{t('home.level', { level: companion?.level ?? 1 })}</Text>

      <View style={[styles.currencyRow, { borderColor: colors.outlineVariant }]}>
        <Text style={[styles.coins, { color: colors.primaryContainer }]}>🪙 {coins}</Text>
      </View>

      <View style={[styles.petCard, { backgroundColor: colors.surface, borderColor: colors.primaryContainer }]}>
        <Text style={styles.petEmoji}>{companion?.emoji ?? '🐉'}</Text>
        <Text style={[styles.petName, { color: colors.onSurface }]}>{companion?.name ?? 'Ryujin'}</Text>
        <Text style={[styles.petLevel, { color: colors.secondary }]}>
          LVL {companion?.level ?? 1} {companion?.species?.toUpperCase() ?? 'DRAGON'}
        </Text>
        <View style={styles.statsRow}>
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>STR {companion?.strength ?? 0}</Text>
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>AGI {companion?.agility ?? 0}</Text>
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>INT {companion?.intelligence ?? 0}</Text>
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>CHA {companion?.charisma ?? 0}</Text>
          <Text style={[styles.statText, { color: colors.onSurfaceVariant }]}>VIT {companion?.vitality ?? 0}</Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={checkIn}
        disabled={isCheckingIn}
        style={[styles.checkinBtn, { backgroundColor: colors.primaryContainer }]}
      >
        <Text style={[styles.checkinText, { color: colors.onPrimaryContainer }]}>
          {isCheckingIn ? '📍 ' + t('common.loading') : '📍 ' + t('home.checkin')}
        </Text>
      </TouchableOpacity>

      {lastCheckIn && (
        <Text style={[styles.result, { color: colors.secondary }]}>
          📍 {lastCheckIn.location.address ?? `${lastCheckIn.location.lat.toFixed(2)}, ${lastCheckIn.location.lng.toFixed(2)}`}
          {lastCheckIn.unlockedAchievements.length > 0 && `\n🏆 ${lastCheckIn.unlockedAchievements.length} achievement${lastCheckIn.unlockedAchievements.length > 1 ? 's' : ''} unlocked!`}
        </Text>
      )}
      {error && <Text style={[styles.error, { color: colors.error }]}>❌ {error}</Text>}

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>🚶 {t('home.movement')}</Text>
        <Text style={[styles.sectionText, { color: colors.onSurfaceVariant }]}>Walking: -- | Cycling: --</Text>
      </View>

      <View style={[styles.section, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>⏱️ {t('home.screenTime')}</Text>
        <Text style={[styles.sectionText, { color: colors.onSurfaceVariant }]}>--</Text>
      </View>
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
  petName: { fontSize: 20, fontWeight: '700' },
  petLevel: { fontSize: 12 },
  statsRow: { flexDirection: 'row', gap: 24, marginTop: 8 },
  statText: { fontSize: 12 },
  checkinBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  checkinText: { fontSize: 18, fontWeight: '700' },
  result: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  error: { fontSize: 13, textAlign: 'center' },
  section: { padding: 16, borderRadius: 12, borderWidth: 1, gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  sectionText: { fontSize: 13 },
});
