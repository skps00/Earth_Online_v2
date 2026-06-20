import { useState, useEffect } from 'react';
import { useSetAtom } from 'jotai';
import { syncStatusAtom, lastSyncAtom } from '@/stores/syncStore';
import { signIn, signOut, isSignedIn } from '@/services/GoogleAuthService';
import { syncToCloud } from '@/services/CloudSyncService';
import { Logger } from '@/utils/logger';

export function useCloudSync() {
  const setSyncStatus = useSetAtom(syncStatusAtom);
  const setLastSync = useSetAtom(lastSyncAtom);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const signedIn = await isSignedIn();
    setIsAuthenticated(signedIn);
    return signedIn;
  };

  const authenticate = async () => {
    try {
      await signIn();
      setIsAuthenticated(true);
      return true;
    } catch (e) {
      Logger.error('Auth', 'Sign-in failed', e);
      return false;
    }
  };

  const logout = async () => {
    await signOut();
    setIsAuthenticated(false);
  };

  const sync = async () => {
    setSyncStatus('syncing');
    try {
      const result = await syncToCloud();
      setSyncStatus('success');
      setLastSync(new Date().toISOString());
      return result;
    } catch (e) {
      Logger.error('Sync', 'Sync failed', e);
      setSyncStatus('error');
      throw e;
    }
  };

  return { isAuthenticated, checkAuth, authenticate, logout, sync };
}
