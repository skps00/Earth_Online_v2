import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { isCheckingInAtom, lastCheckInAtom, checkInErrorAtom } from '@/stores/checkInStore';
import { photoPromptAtom } from '@/stores/photoPromptStore';
import { questVersionAtom } from '@/stores/questStore';
import { achievementVersionAtom, unlockQueueAtom } from '@/stores/achievementStore';
import { companionAtom } from '@/stores/companionStore';
import { coinsAtom } from '@/stores/currencyStore';
import { performCheckIn } from '@/services/CheckInCoordinator';
import { CompanionRepository } from '@/repositories/CompanionRepository';
import { Logger } from '@/utils/logger';
import { trackEvent } from '@/services/AnalyticsService';
import * as Location from 'expo-location';

const companionRepo = new CompanionRepository();

function mapCheckInError(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);
  if (message === 'GPS_DENIED' || message === 'GPS_DISABLED' || message === 'GPS_UNAVAILABLE' || message === 'GPS_TIMEOUT' || message === 'DAILY_LIMIT_REACHED') {
    return message;
  }
  if (message.toLowerCase().includes('permission')) return 'GPS_DENIED';
  if (message.toLowerCase().includes('unavailable') || message.toLowerCase().includes('disabled')) return 'GPS_UNAVAILABLE';
  if (message.toLowerCase().includes('timeout')) return 'GPS_TIMEOUT';
  return 'GPS_UNAVAILABLE';
}

export function useCheckIn() {
  const setIsCheckingIn = useSetAtom(isCheckingInAtom);
  const setLastCheckIn = useSetAtom(lastCheckInAtom);
  const setError = useSetAtom(checkInErrorAtom);
  const setPhotoPrompt = useSetAtom(photoPromptAtom);
  const setQuestVersion = useSetAtom(questVersionAtom);
  const setAchievementVersion = useSetAtom(achievementVersionAtom);
  const setUnlockQueue = useSetAtom(unlockQueueAtom);
  const setCompanion = useSetAtom(companionAtom);
  const setCoins = useSetAtom(coinsAtom);
  const [showPermission, setShowPermission] = useState(false);

  const requestCheckIn = async () => {
    const { status } = await Location.getForegroundPermissionsAsync();
    if (status === 'granted') {
      await doCheckIn();
    } else {
      setShowPermission(true);
    }
  };

  const reloadCompanion = async () => {
    const c = await companionRepo.get();
    if (c) {
      setCompanion(c);
      setCoins(c.coins);
    }
  };

  const doCheckIn = async () => {
    setIsCheckingIn(true);
    setError(null);
    try {
      const result = await performCheckIn();
      setLastCheckIn(result);
      await reloadCompanion();
      setQuestVersion(v => v + 1);
      setAchievementVersion(v => v + 1);
      if (result.unlockedAchievements.length > 0) {
        setUnlockQueue(prev => [...prev, ...result.unlockedAchievements.filter(id => !prev.includes(id))]);
      }
      if (result.completedQuests.length > 0) {
        for (const q of result.completedQuests) {
          await trackEvent('quest_complete', { questId: q });
        }
      }
      await trackEvent('checkin_success', { count: result.unlockedAchievements.length });
    } catch (e: unknown) {
      const code = mapCheckInError(e);
      Logger.error('CheckIn', code, e);
      setError(code);
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handlePermissionAllow = async () => {
    setShowPermission(false);
    await doCheckIn();
  };

  const handlePermissionDeny = () => {
    setShowPermission(false);
    setError('GPS_DENIED');
  };

  return {
    requestCheckIn,
    showPermission,
    handlePermissionAllow,
    handlePermissionDeny,
  };
}
