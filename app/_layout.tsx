import { Stack, useRouter, useSegments } from 'expo-router';
import { Provider as JotaiProvider } from 'jotai';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useEffect, useState } from 'react';
import { seedDatabase } from '@/database/seed';
import { initCheckIn } from '@/services/CheckInCoordinator';
import { LocationService } from '@/services/LocationService';
import { CheckInRepository } from '@/repositories/CheckInRepository';
import { resetDailyQuests } from '@/services/DailyResetService';
import { reconcile } from '@/engine/reconcile';
import { Logger } from '@/utils/logger';
import { useSettings } from '@/hooks/useSettings';
import { registerBackgroundSync } from '@/services/BackgroundSyncService';
import { isSignedIn } from '@/services/GoogleAuthService';
import { LoginScreen } from '@/components/LoginScreen';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { GlobalAchievementModals } from '@/components/GlobalAchievementModals';
import { SettingsRepository } from '@/repositories/SettingsRepository';
import { trackEvent } from '@/services/AnalyticsService';
import { checkEnvironmentAchievements } from '@/services/EnvironmentAchievementService';
import { checkScreenTimeAndEmitEvents, initScreenTimeTracker } from '@/services/ScreenTimeService';
import { checkEarthquakeAndEmitEvents } from '@/services/EarthquakeService';
import { initIAP } from '@/services/IAPService';
import { unlockQueueAtom } from '@/stores/achievementStore';
import { useSetAtom } from 'jotai';

const settingsRepo = new SettingsRepository();

function SettingsBootstrap({ children }: { children: React.ReactNode }) {
  useSettings();
  return <>{children}</>;
}

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [dbReady, setDbReady] = useState(false);
  const setUnlockQueue = useSetAtom(unlockQueueAtom);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        initCheckIn({
          locationService: new LocationService(),
          checkInRepo: new CheckInRepository(),
        });

        await seedDatabase();
        await resetDailyQuests();
        const fixed = await reconcile();
        if (fixed > 0) Logger.info('Startup', `Reconciled ${fixed} missed achievements`);

        initScreenTimeTracker();

        const envUnlocked = await checkEnvironmentAchievements();
        const screenTimeUnlocked = await checkScreenTimeAndEmitEvents();
        const earthquakeUnlocked = await checkEarthquakeAndEmitEvents();
        const startupUnlocked = [...envUnlocked, ...screenTimeUnlocked, ...earthquakeUnlocked];
        if (startupUnlocked.length > 0) {
          setUnlockQueue(prev => [...prev, ...startupUnlocked.filter(id => !prev.includes(id))]);
        }

        await registerBackgroundSync();
        await initIAP();
        await trackEvent('app_open');

        if (!cancelled) setDbReady(true);
      } catch (error) {
        Logger.error('Startup', 'Database initialization failed', error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [setUnlockQueue]);

  if (!dbReady) return null;

  return <SettingsBootstrap>{children}</SettingsBootstrap>;
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
    </>
  );
}

export default function RootLayout() {
  const [isAuth, setIsAuth] = useState<boolean | null>(null);

  useEffect(() => {
    isSignedIn().then(setIsAuth);
  }, []);

  if (isAuth === null) return null;

  if (!isAuth) {
    return (
      <ErrorBoundary>
        <JotaiProvider>
          <SafeAreaProvider>
            <ThemeProvider>
              <LoginScreen onLogin={() => setIsAuth(true)} onSkip={() => setIsAuth(true)} />
            </ThemeProvider>
          </SafeAreaProvider>
        </JotaiProvider>
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <JotaiProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <AppInitializer>
              <RootNavigator />
            </AppInitializer>
          </ThemeProvider>
        </SafeAreaProvider>
      </JotaiProvider>
    </ErrorBoundary>
  );
}
