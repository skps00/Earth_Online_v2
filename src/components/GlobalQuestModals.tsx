import { useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { questCompleteQueueAtom } from '@/stores/questStore';
import { unlockQueueAtom, achievementCelebrationActiveAtom } from '@/stores/achievementStore';
import { langAtom } from '@/stores/settingsStore';
import { QuestRepository } from '@/repositories/QuestRepository';
import { QuestCompleteModal } from './QuestCompleteModal';
import type { QuestDisplay } from '@/repositories/QuestRepository';

const questRepo = new QuestRepository();

export function GlobalQuestModals() {
  const [queue, setQueue] = useAtom(questCompleteQueueAtom);
  const [currentQuest, setCurrentQuest] = useState<QuestDisplay | null>(null);
  const lang = useAtomValue(langAtom);
  const achievementQueue = useAtomValue(unlockQueueAtom);
  const achievementCelebrationActive = useAtomValue(achievementCelebrationActiveAtom);

  const canShowQuest = !achievementCelebrationActive && achievementQueue.length === 0;

  const langRef = useRef(lang);
  langRef.current = lang;

  useEffect(() => {
    if (currentQuest) {
      void questRepo.getById(currentQuest.id, lang).then((quest) => {
        if (quest) setCurrentQuest(quest);
      });
    }
  }, [lang, currentQuest?.id]);

  useEffect(() => {
    if (!currentQuest && queue.length > 0 && canShowQuest) {
      const [nextId, ...rest] = queue;
      setQueue(rest);
      void questRepo.getById(nextId, langRef.current).then((quest) => {
        setCurrentQuest(quest ?? null);
      });
    }
  }, [queue, currentQuest, canShowQuest, setQueue]);

  const dismiss = () => setCurrentQuest(null);

  return (
    <QuestCompleteModal quest={currentQuest} visible={!!currentQuest} onDismiss={dismiss} />
  );
}
