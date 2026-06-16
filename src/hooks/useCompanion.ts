import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { companionAtom, isCompanionLoadingAtom } from '@/stores/companionStore';
import { coinsAtom } from '@/stores/currencyStore';
import { CompanionRepository } from '@/repositories/CompanionRepository';

const repo = new CompanionRepository();

export function useCompanion() {
  const setCompanion = useSetAtom(companionAtom);
  const setLoading = useSetAtom(isCompanionLoadingAtom);
  const setCoins = useSetAtom(coinsAtom);

  useEffect(() => {
    (async () => {
      try {
        const data = await repo.get();
        console.log('[useCompanion] data:', JSON.stringify(data));
        setCompanion(data);
        if (data) setCoins(data.coins);
        setLoading(false);
      } catch (e) {
        console.error('[useCompanion] error:', e);
        setLoading(false);
      }
    })();
  }, []);
}
