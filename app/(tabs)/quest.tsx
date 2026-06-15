import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useAtomValue, useSetAtom } from 'jotai';
import { dailyQuestsAtom, isQuestLoadingAtom, questVersionAtom } from '@/stores/questStore';
import { langAtom } from '@/stores/settingsStore';
import { QuestRepository } from '@/repositories/QuestRepository';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const questRepo = new QuestRepository();

export default function QuestScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
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
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('quest.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t('quest.daily')}</Text>

      {quests.length === 0 ? (
        <EmptyState message={t('quest.empty')} />
      ) : (
        <FlatList
          data={quests}
          keyExtractor={q => q.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Text style={[styles.questTitle, { color: colors.onSurface }]}>{item.title}</Text>
              <Text style={[styles.questDesc, { color: colors.onSurfaceVariant }]}>{item.description}</Text>
              <ProgressBar progress={item.progress} max={item.goal} />
              <Text style={[styles.reward, { color: colors.secondary }]}>+{item.reward_xp} XP</Text>
              {!!item.is_completed && (
                <View style={[styles.completedBadge, { backgroundColor: colors.secondary + '30' }]}>
                  <Text style={[styles.completedText, { color: colors.secondary }]}>✓ {t('quest.completedBadge')}</Text>
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
  completedBadge: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: 4, alignSelf: 'flex-start' },
  completedText: { fontSize: 10, fontWeight: '700' },
});
