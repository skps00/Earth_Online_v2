import { useSetAtom } from 'jotai';
import { isCheckingInAtom, lastCheckInAtom, checkInErrorAtom } from '@/stores/checkInStore';
import { photoPromptAtom } from '@/stores/photoPromptStore';
import { performCheckIn } from '@/services/CheckInCoordinator';
import { Logger } from '@/utils/logger';

export function useCheckIn() {
  const setIsCheckingIn = useSetAtom(isCheckingInAtom);
  const setLastCheckIn = useSetAtom(lastCheckInAtom);
  const setError = useSetAtom(checkInErrorAtom);
  const setPhotoPrompt = useSetAtom(photoPromptAtom);

  const checkIn = async () => {
    setIsCheckingIn(true);
    setError(null);
    try {
      const result = await performCheckIn();
      setLastCheckIn(result);
      if (result.unlockedAchievements.length > 0) {
        setPhotoPrompt({
          achievementId: result.unlockedAchievements[0],
          achievementTitle: result.unlockedAchievements[0],
        });
      }
    } catch (e: any) {
      Logger.error('CheckIn', e.message, e);
      setError(e.code ?? 'UNKNOWN');
    } finally {
      setIsCheckingIn(false);
    }
  };

  return { checkIn };
}
