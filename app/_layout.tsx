import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider as JotaiProvider } from 'jotai';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useCallback, useEffect, useState } from 'react';
import { Logger } from '@/utils/logger';
import { useSettings } from '@/hooks/useSettings';
import { useLocalizedCatalogSync } from '@/hooks/useLocalizedCatalogSync';
import { isSignedIn, isGoogleSigninNativeAvailable } from '@/services/GoogleAuthService';
import { LoginScreen } from '@/components/LoginScreen';
import { StartupScreen } from '@/components/StartupScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GlobalAchievementModals } from '@/components/GlobalAchievementModals';
import { GlobalQuestModals } from '@/components/GlobalQuestModals';
import { SettingsRepository } from '@/repositories/SettingsRepository';
import { runBlockingStartup, runDeferredStartup, type StartupProgress } from '@/services/AppStartupService';
import { unlockQueueAtom } from '@/stores/achievementStore';
import { useSetAtom } from 'jotai';

const settingsRepo = new SettingsRepository();

type AppPhase = 'startup' | 'login' | 'app';

const INITIAL_PROGRESS: StartupProgress = { progress: 0, labelKey: 'startup.init' };

function SettingsBootstrap({ children }: { children: React.ReactNode }) {
  useSettings();
  useLocalizedCatalogSync();
  return <>{children}</>;
}

function RootNavigator() {
  const router = useRouter();
  const segments = useSegments();
  const [routeReady, setRouteReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const value = await settingsRepo.get('onboarding_done');
      if (cancelled) return;

      const done = value === '1';
      const inOnboarding = segments[0] === 'onboarding';

      if (!done && !inOnboarding) {
        router.replace('/onboarding');
      }

      setRouteReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [segments, router]);

  if (!routeReady) return null;

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="camera" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="onboarding" options={{ presentation: 'modal', animation: 'fade' }} />
      </Stack>
      <GlobalAchievementModals />
      <GlobalQuestModals />
    </>
  );
}

function AppShell() {
  const [phase, setPhase] = useState<AppPhase>('startup');
  const [startupProgress, setStartupProgress] = useState<StartupProgress>(INITIAL_PROGRESS);
  const [startupError, setStartupError] = useState<string | null>(null);
  const [startupAttempt, setStartupAttempt] = useState(0);
  const setUnlockQueue = useSetAtom(unlockQueueAtom);

  const enterApp = useCallback(() => {
    runDeferredStartup(ids => {
      setUnlockQueue(prev => [...prev, ...ids.filter(id => !prev.includes(id))]);
    });
    setPhase('app');
  }, [setUnlockQueue]);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setStartupError(null);
      setStartupProgress(INITIAL_PROGRESS);

      try {
        await runBlockingStartup(state => {
          if (!cancelled) setStartupProgress(state);
        });
        if (cancelled) return;

        let signedIn = false;
        if (isGoogleSigninNativeAvailable()) {
          signedIn = await isSignedIn();
        }

        if (cancelled) return;

        if (signedIn) {
          enterApp();
        } else {
          setPhase('login');
        }
      } catch (error) {
        if (!cancelled) {
          Logger.error('Startup', 'Gate failed', error);
          setStartupError(error instanceof Error ? error.message : 'Startup failed');
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [startupAttempt, enterApp]);

  if (phase === 'startup') {
    return (
      <StartupScreen
        progress={startupProgress}
        error={startupError}
        onRetry={startupError ? () => setStartupAttempt(n => n + 1) : undefined}
      />
    );
  }

  if (phase === 'login') {
    return <LoginScreen onLogin={enterApp} onSkip={enterApp} />;
  }

  return (
    <SettingsBootstrap>
      <RootNavigator />
    </SettingsBootstrap>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <JotaiProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppShell />
          </ThemeProvider>
        </SafeAreaProvider>
      </JotaiProvider>
    </ErrorBoundary>
  );
}
