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
    let cancelled = false;

    (async () => {
      try {
        const data = await repo.get();
        if (cancelled) return;
        setCompanion(data);
        if (data) setCoins(data.coins);
        setLoading(false);
      } catch (e) {
        console.error('[useCompanion] error:', e);
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setCompanion, setCoins, setLoading]);
}
