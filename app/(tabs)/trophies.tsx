import { View, Text, FlatList, StyleSheet } from 'react-native';
import { useEffect } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { activeCategoryAtom, achievementsAtom, isAchievementsLoadingAtom, unlockedIdsAtom } from '@/stores/achievementStore';
import { langAtom } from '@/stores/settingsStore';
import { AchievementRepository } from '@/repositories/AchievementRepository';
import { CATEGORIES } from '@/types/achievement';
import { CategoryChip } from '@/components/CategoryChip';
import { EmptyState } from '@/components/EmptyState';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

const achievementRepo = new AchievementRepository();

export default function TrophiesScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [category, setCategory] = useAtom(activeCategoryAtom);
  const achievements = useAtomValue(achievementsAtom);
  const isLoading = useAtomValue(isAchievementsLoadingAtom);
  const setAchievements = useSetAtom(achievementsAtom);
  const setUnlocked = useSetAtom(unlockedIdsAtom);
  const setLoading = useSetAtom(isAchievementsLoadingAtom);
  const lang = useAtomValue(langAtom);

  useEffect(() => {
    (async () => {
      const data = await achievementRepo.getAll(lang);
      setAchievements(data);
      const ids = await achievementRepo.getUnlockedIds();
      setUnlocked(ids);
      setLoading(false);
    })();
  }, [lang]);

  if (isLoading) return <LoadingSkeleton lines={6} />;

  const filtered = category === 'all' ? achievements : achievements.filter(a => a.category === category);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('trophies.title')}</Text>
      <Text style={[styles.progress, { color: colors.onSurfaceVariant }]}>
        {t('trophies.progress', { unlocked: 0, total: 0 })}
      </Text>

      <FlatList
        horizontal
        data={['all' as const, ...CATEGORIES]}
        keyExtractor={c => c}
        renderItem={({ item }) => (
          <CategoryChip category={item} active={item === category} onPress={() => setCategory(item)} />
        )}
        style={styles.chips}
        showsHorizontalScrollIndicator={false}
      />

      {filtered.length === 0 ? (
        <EmptyState message="No achievements seeded yet — framework ready" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={a => a.id}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
              <Text style={{ color: colors.onSurface }}>{item.title}</Text>
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
  progress: { fontSize: 12, textAlign: 'center', marginVertical: 8 },
  chips: { maxHeight: 44, marginBottom: 16 },
  card: { padding: 16, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
});
