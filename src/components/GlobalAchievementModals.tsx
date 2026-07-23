import { useCallback, useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import {
  unlockQueueAtom,
  selectedAchievementAtom,
  achievementVersionAtom,
  unlockedIdsAtom,
  achievementCelebrationActiveAtom,
} from '@/stores/achievementStore';
import { langAtom } from '@/stores/settingsStore';
import { companionAtom } from '@/stores/companionStore';
import { AchievementRepository } from '@/repositories/AchievementRepository';
import { AchievementUnlockModal } from './AchievementUnlockModal';
import { AchievementDetailModal } from './AchievementDetailModal';
import { trackEvent } from '@/services/AnalyticsService';
import type { AchievementDisplay } from '@/repositories/AchievementRepository';

const achievementRepo = new AchievementRepository();

export function GlobalAchievementModals() {
  const [queue, setQueue] = useAtom(unlockQueueAtom);
  const [selected, setSelected] = useAtom(selectedAchievementAtom);
  const [currentUnlock, setCurrentUnlock] = useState<AchievementDisplay | null>(null);
  const [isManual, setIsManual] = useState(false);
  const lang = useAtomValue(langAtom);
  const companion = useAtomValue(companionAtom);
  const setAchievementVersion = useSetAtom(achievementVersionAtom);
  const setUnlocked = useSetAtom(unlockedIdsAtom);
  const setCelebrationActive = useSetAtom(achievementCelebrationActiveAtom);

  const langRef = useRef(lang);
  langRef.current = lang;

  const popNext = useCallback(async () => {
    setQueue(prev => {
      if (prev.length === 0) return prev;
      const [nextId, ...rest] = prev;
      void (async () => {
        const ach = await achievementRepo.getById(nextId, lang);
        if (ach) {
          setCurrentUnlock(ach);
          setCelebrationActive(true);
          await trackEvent('achievement_unlock', { achievementId: nextId });
        } else if (rest.length > 0) {
          setQueue(rest);
        }
      })();
      return rest;
    });
  }, [lang, setQueue]);

  useEffect(() => {
    if (!currentUnlock && queue.length > 0) {
      const nextId = queue[0];
      setQueue(queue.slice(1));
      void (async () => {
        const ach = await achievementRepo.getById(nextId, langRef.current);
        if (ach) {
          setCurrentUnlock(ach);
          setCelebrationActive(true);
          await trackEvent('achievement_unlock', { achievementId: nextId });
        }
      })();
    }
  }, [queue, currentUnlock, setQueue, setCelebrationActive]);

  useEffect(() => {
    if (currentUnlock) {
      void achievementRepo.getById(currentUnlock.id, lang).then((ach) => {
        if (ach) setCurrentUnlock(ach);
      });
    }
  }, [lang, currentUnlock?.id]);

  useEffect(() => {
    if (!selected) {
      setIsManual(false);
      return;
    }
    void achievementRepo.getById(selected.id, lang).then((ach) => {
      if (ach) setSelected(ach);
    });
    achievementRepo.isManualAchievement(selected.id).then(setIsManual);
  }, [selected?.id, lang, setSelected]);

  const handleUnlocked = async (ids: string[]) => {
    setAchievementVersion(v => v + 1);
    const unlocked = await achievementRepo.getUnlockedIds();
    setUnlocked(unlocked);
    setQueue(prev => [...prev, ...ids.filter(id => !prev.includes(id) && !unlocked.has(id))]);
  };

  const dismissUnlock = () => {
    setCurrentUnlock(null);
    setCelebrationActive(false);
  };

  return (
    <>
      <AchievementUnlockModal
        achievement={currentUnlock}
        visible={!!currentUnlock}
        onDismiss={dismissUnlock}
        companionEmoji={companion?.emoji}
      />
      <AchievementDetailModal
        achievement={selected}
        visible={!!selected}
        isManual={isManual}
        onClose={() => setSelected(null)}
        onUnlocked={handleUnlocked}
      />
    </>
  );
}
