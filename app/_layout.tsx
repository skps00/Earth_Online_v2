import { Stack } from 'expo-router';
import { Provider as JotaiProvider } from 'jotai';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useEffect } from 'react';
import { seedDatabase } from '@/database/seed';
import { initCheckIn } from '@/services/CheckInCoordinator';
import { LocationService } from '@/services/LocationService';
import { CheckInRepository } from '@/repositories/CheckInRepository';
import { resetDailyQuests } from '@/services/DailyResetService';
import { reconcile } from '@/engine/reconcile';
import { Logger } from '@/utils/logger';

export default function RootLayout() {
  useEffect(() => {
    // Initialize DI for production
    initCheckIn({
      locationService: new LocationService(),
      checkInRepo: new CheckInRepository(),
    });

    seedDatabase().then(async () => {
      await resetDailyQuests();
      const fixed = await reconcile();
      if (fixed > 0) Logger.info('Startup', `Reconciled ${fixed} missed achievements`);
    });
  }, []);

  return (
    <JotaiProvider>
      <ThemeProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="camera" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
          <Stack.Screen name="onboarding" options={{ presentation: 'modal', animation: 'fade' }} />
        </Stack>
      </ThemeProvider>
    </JotaiProvider>
  );
}
