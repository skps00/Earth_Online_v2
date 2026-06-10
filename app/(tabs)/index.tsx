import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useCheckIn } from '@/hooks/useCheckIn';
import { useAtomValue } from 'jotai';
import { isCheckingInAtom, lastCheckInAtom, checkInErrorAtom } from '@/stores/checkInStore';

export default function HomeScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const { checkIn } = useCheckIn();
  const isCheckingIn = useAtomValue(isCheckingInAtom);
  const lastCheckIn = useAtomValue(lastCheckInAtom);
  const error = useAtomValue(checkInErrorAtom);

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.content}>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('home.title')}</Text>
      <Text style={[styles.level, { color: colors.onSurfaceVariant }]}>{t('home.level', { level: 24 })}</Text>

      <View style={[styles.currencyRow, { borderColor: colors.outlineVariant }]}>
        <Text style={[styles.coins, { color: colors.primaryContainer }]}>🪙 12,450</Text>
      </View>

      <View style={[styles.petCard, { backgroundColor: colors.surface, borderColor: colors.primaryContainer }]}>
        <Text style={styles.petEmoji}>🐉</Text>
        <Text style={[styles.petName, { color: colors.onSurface }]}>Ryujin</Text>
        <Text style={[styles.petLevel, { color: colors.secondary }]}>LVL 24 SPIRIT DRAGON</Text>
        <View style={styles.statsRow}>
          {['STR 12', 'AGI 15', 'INT 10'].map(s => (
            <Text key={s} style={[styles.statText, { color: colors.onSurfaceVariant }]}>{s}</Text>
          ))}
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
