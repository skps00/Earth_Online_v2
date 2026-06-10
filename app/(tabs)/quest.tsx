import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useAtomValue, useSetAtom } from 'jotai';
import { dailyQuestsAtom, isQuestLoadingAtom } from '@/stores/questStore';
import { langAtom } from '@/stores/settingsStore';
import { QuestRepository } from '@/repositories/QuestRepository';
import { ProgressBar } from '@/components/ProgressBar';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const questRepo = new QuestRepository();

export default function QuestScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const quests = useAtomValue(dailyQuestsAtom);
  const isLoading = useAtomValue(isQuestLoadingAtom);
  const setQuests = useSetAtom(dailyQuestsAtom);
  const setLoading = useSetAtom(isQuestLoadingAtom);
  const lang = useAtomValue(langAtom);

  useEffect(() => {
    (async () => {
      const data = await questRepo.getToday(lang);
      setQuests(data);
      setLoading(false);
    })();
  }, [lang]);

  if (isLoading) return <LoadingSkeleton lines={4} />;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('quest.title')}</Text>
      <Text style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>{t('quest.daily')}</Text>

      {quests.length === 0 ? (
        <EmptyState message="Daily quests will appear here" />
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
});
