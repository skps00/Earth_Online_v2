import { Stack } from 'expo-router';
import { Provider as JotaiProvider } from 'jotai';
import { ThemeProvider } from '@/theme/ThemeProvider';
import { useEffect } from 'react';
import { seedDatabase } from '@/database/seed';

export default function RootLayout() {
  useEffect(() => {
    seedDatabase();
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
