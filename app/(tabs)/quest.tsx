import { View, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/AppText';
import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useAtomValue, useSetAtom } from 'jotai';
import { dailyQuestsAtom, isQuestLoadingAtom, questVersionAtom } from '@/stores/questStore';
import { langAtom } from '@/stores/settingsStore';
import { QuestRepository } from '@/repositories/QuestRepository';
import { isCoinsEnabled } from '@/stores/currencyStore';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const questRepo = new QuestRepository();

export default function QuestScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const quests = useAtomValue(dailyQuestsAtom);
  const isLoading = useAtomValue(isQuestLoadingAtom);
  const setQuests = useSetAtom(dailyQuestsAtom);
  const setLoading = useSetAtom(isQuestLoadingAtom);
  const lang = useAtomValue(langAtom);
  const questVersion = useAtomValue(questVersionAtom);

  const bottomPadding = insets.bottom + 100;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await questRepo.getToday(lang);
        if (!cancelled) {
          setQuests(data);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) {
          setQuests([]);
          setLoading(false);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [lang, questVersion]);

  if (isLoading) return <LoadingSkeleton lines={4} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingBottom: bottomPadding }]}>
      <AppText style={[styles.title, { color: colors.primaryContainer }]}>{t('quest.title')}</AppText>
      <AppText style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t('quest.daily')}</AppText>

      {quests.length === 0 ? (
        <EmptyState message={t('quest.empty')} />
      ) : (
        <FlatList
          data={quests}
          keyExtractor={q => q.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <AppText style={[styles.questTitle, { color: colors.onSurface }]}>{item.title}</AppText>
              <AppText style={[styles.questDesc, { color: colors.onSurfaceVariant }]}>{item.description}</AppText>
              <ProgressBar progress={item.progress} max={item.goal} />
              <AppText style={[styles.reward, { color: colors.secondary }]}>
                {isCoinsEnabled
                  ? t('quest.rewardXpCoins', { xp: item.reward_xp, coins: item.reward_coins })
                  : t('quest.rewardXp', { xp: item.reward_xp })}
              </AppText>
              {item.id === 'photo_hunter' && !item.is_completed && (
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: colors.primaryContainer }]}
                  onPress={() => router.push('/camera')}
                >
                  <AppText style={[styles.actionBtnText, { color: colors.onPrimaryContainer }]}>
                    📷 {t('quest.takePhoto')}
                  </AppText>
                </TouchableOpacity>
              )}
              {!!item.is_completed && (
                <View style={[styles.completedBadge, { backgroundColor: colors.secondary + '30' }]}>
                  <AppText style={[styles.completedText, { color: colors.secondary }]}>✓ {t('quest.completedBadge')}</AppText>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 20 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 12, gap: 8 },
  questTitle: { fontSize: 16, fontWeight: '700' },
  questDesc: { fontSize: 13 },
  reward: { fontSize: 12 },
  actionBtn: { marginTop: 4, paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8, alignSelf: 'flex-start' },
  actionBtnText: { fontSize: 13, fontWeight: '700' },
  completedBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, alignSelf: 'flex-start' },
  completedText: { fontSize: 10, fontWeight: '700' },
});
