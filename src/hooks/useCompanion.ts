import { useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { companionAtom, isCompanionLoadingAtom } from '@/stores/companionStore';
import { CompanionRepository } from '@/repositories/CompanionRepository';

const repo = new CompanionRepository();

export function useCompanion() {
  const setCompanion = useSetAtom(companionAtom);
  const setLoading = useSetAtom(isCompanionLoadingAtom);

  useEffect(() => {
    (async () => {
      const data = await repo.get();
      setCompanion(data);
      setLoading(false);
    })();
  }, []);
}
