import { useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { langAtom } from '@/stores/settingsStore';
import {
  achievementsAtom,
  activeCategoryAtom,
  normalizeActiveCategory,
  selectedAchievementAtom,
} from '@/stores/achievementStore';
import { dailyQuestsAtom } from '@/stores/questStore';
import { AchievementRepository } from '@/repositories/AchievementRepository';
import { QuestRepository } from '@/repositories/QuestRepository';

const achievementRepo = new AchievementRepository();
const questRepo = new QuestRepository();

/** Refetch achievement/quest display names whenever language changes. */
export function useLocalizedCatalogSync() {
  const lang = useAtomValue(langAtom);
  const setAchievements = useSetAtom(achievementsAtom);
  const setQuests = useSetAtom(dailyQuestsAtom);
  const setSelected = useSetAtom(selectedAchievementAtom);
  const setActiveCategory = useSetAtom(activeCategoryAtom);

  useEffect(() => {
    setActiveCategory((prev) => normalizeActiveCategory(prev));
  }, [setActiveCategory]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [achievements, quests] = await Promise.all([
        achievementRepo.getAll(lang),
        questRepo.getToday(lang),
      ]);
      if (cancelled) return;

      setAchievements(achievements);
      setQuests(quests);

      setSelected((prev) => {
        if (!prev) return null;
        return achievements.find((a) => a.id === prev.id) ?? prev;
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [lang, setAchievements, setQuests, setSelected]);
}
