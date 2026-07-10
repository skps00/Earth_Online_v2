import { View, Text, FlatList, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  activeCategoryAtom,
  achievementsAtom,
  isAchievementsLoadingAtom,
  unlockedIdsAtom,
  achievementVersionAtom,
  selectedAchievementAtom,
} from '@/stores/achievementStore';
import { langAtom } from '@/stores/settingsStore';
import { AchievementRepository } from '@/repositories/AchievementRepository';
import { CATEGORIES, rarityColors } from '@/types/achievement';
import { CategoryChip } from '@/components/CategoryChip';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const achievementRepo = new AchievementRepository();

export default function TrophiesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [category, setCategory] = useAtom(activeCategoryAtom);
  const achievements = useAtomValue(achievementsAtom);
  const isLoading = useAtomValue(isAchievementsLoadingAtom);
  const setAchievements = useSetAtom(achievementsAtom);
  const setUnlocked = useSetAtom(unlockedIdsAtom);
  const unlockedIds = useAtomValue(unlockedIdsAtom);
  const setLoading = useSetAtom(isAchievementsLoadingAtom);
  const setSelected = useSetAtom(selectedAchievementAtom);
  const lang = useAtomValue(langAtom);
  const achievementVersion = useAtomValue(achievementVersionAtom);

  const bottomPadding = insets.bottom + 100;

  useEffect(() => {
    (async () => {
      const data = await achievementRepo.getAll(lang);
      setAchievements(data);
      const ids = await achievementRepo.getUnlockedIds();
      setUnlocked(ids);
      setLoading(false);
    })();
  }, [lang, achievementVersion]);

  if (isLoading) return <LoadingSkeleton lines={6} />;

  const filtered = category === 'all' ? achievements : achievements.filter(a => a.category === category);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      {/* Tier 1: Fixed Header */}
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('trophies.title')}</Text>
        <Text style={[styles.progress, { color: colors.onSurfaceVariant }]}>
          {t('trophies.progress', { unlocked: unlockedIds.size, total: achievements.length })}
        </Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContent}
        >
          {['all' as const, ...CATEGORIES].map(cat => (
            <CategoryChip
              key={cat}
              category={cat}
              active={cat === category}
              onPress={() => setCategory(cat)}
            />
          ))}
        </ScrollView>
      </View>

      {/* Tier 2: Scrollable List */}
      {filtered.length === 0 ? (
        <EmptyState message={t('trophies.empty')} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={a => a.id}
          style={{ flex: 1 }}
          contentContainerStyle={{ paddingBottom: bottomPadding }}
          renderItem={({ item }) => {
            const unlocked = item.is_unlocked;
            const rarityColor = rarityColors(item.rarity as any);
            const borderColor = unlocked ? rarityColor : colors.outlineVariant;
            return (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setSelected(item)}
              >
              <View style={[styles.card, { backgroundColor: colors.surface, borderColor }]}>
                <View style={styles.cardHeader}>
                  {item.icon ? <Text style={styles.cardIcon}>{item.icon}</Text> : null}
                  <View style={styles.cardInfo}>
                    <Text style={[styles.cardTitle, { color: unlocked ? colors.onSurface : colors.onSurfaceVariant }]}>
                      {item.title}
                    </Text>
                    <Text style={[styles.cardDesc, { color: colors.onSurfaceVariant }]}>{item.description}</Text>
                  </View>
                  {unlocked ? (
                    <View style={[styles.unlockBadge, { backgroundColor: '#50C87830' }]}>
                      <Text style={[styles.unlockText, { color: '#50C878' }]}>✓</Text>
                    </View>
                  ) : null}
                </View>
                {!unlocked ? (
                  <View style={styles.progressRow}>
                    <View style={styles.progressBar}>
                      <View style={[styles.progressFill, { width: `${Math.min((item.progress / item.trigger_goal) * 100, 100)}%`, backgroundColor: rarityColor }]} />
                    </View>
                    <Text style={[styles.progressText, { color: colors.onSurfaceVariant }]}>{item.progress}/{item.trigger_goal}</Text>
                  </View>
                ) : null}
              </View>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { paddingBottom: 12 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 20 },
  progress: { fontSize: 12, textAlign: 'center', marginVertical: 8 },
  chipsContent: { paddingVertical: 4 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  cardIcon: { fontSize: 32, marginRight: 12 },
  cardInfo: { flex: 1 },
  cardTitle: { fontSize: 16, fontWeight: '700' },
  cardDesc: { fontSize: 12, marginTop: 2 },
  unlockBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  unlockText: { fontSize: 14, fontWeight: '700' },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  progressBar: { flex: 1, height: 8, borderRadius: 4, backgroundColor: '#121225', overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressText: { fontSize: 12, width: 60, textAlign: 'right' },
});
