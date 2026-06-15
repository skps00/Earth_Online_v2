import { useState } from 'react';
import { useSetAtom } from 'jotai';
import { isCheckingInAtom, lastCheckInAtom, checkInErrorAtom } from '@/stores/checkInStore';
import { photoPromptAtom } from '@/stores/photoPromptStore';
import { questVersionAtom } from '@/stores/questStore';
import { companionAtom } from '@/stores/companionStore';
import { coinsAtom } from '@/stores/currencyStore';
import { performCheckIn } from '@/services/CheckInCoordinator';
import { CompanionRepository } from '@/repositories/CompanionRepository';
import { Logger } from '@/utils/logger';
import * as Location from 'expo-location';

const companionRepo = new CompanionRepository();

export function useCheckIn() {
  const setIsCheckingIn = useSetAtom(isCheckingInAtom);
  const setLastCheckIn = useSetAtom(lastCheckInAtom);
  const setError = useSetAtom(checkInErrorAtom);
  const setPhotoPrompt = useSetAtom(photoPromptAtom);
  const setQuestVersion = useSetAtom(questVersionAtom);
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
    } catch (e: any) {
      Logger.error('CheckIn', e.message, e);
      setError(e.code ?? e.message ?? 'UNKNOWN');
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
