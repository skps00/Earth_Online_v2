import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { SettingsRepository } from '@/repositories/SettingsRepository';
import { trackEvent } from '@/services/AnalyticsService';
import * as Location from 'expo-location';

const settingsRepo = new SettingsRepository();

const STEPS = ['welcome', 'permissions', 'ready'] as const;

export default function OnboardingScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const [step, setStep] = useState(0);

  const finish = async () => {
    await settingsRepo.set('onboarding_done', '1');
    await trackEvent('onboarding_complete');
    router.replace('/(tabs)' as const);
  };

  const requestLocation = async () => {
    await Location.requestForegroundPermissionsAsync();
    setStep(2);
  };

  const current = STEPS[step];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {current === 'welcome' && (
        <>
          <Text style={styles.emoji}>🌍</Text>
          <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('onboarding.welcomeTitle')}</Text>
          <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>{t('onboarding.welcomeBody')}</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primaryContainer }]} onPress={() => setStep(1)}>
            <Text style={[styles.btnText, { color: colors.onPrimaryContainer }]}>{t('onboarding.next')}</Text>
          </TouchableOpacity>
        </>
      )}

      {current === 'permissions' && (
        <>
          <Text style={styles.emoji}>📍</Text>
          <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('onboarding.locationTitle')}</Text>
          <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>{t('onboarding.locationBody')}</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primaryContainer }]} onPress={requestLocation}>
            <Text style={[styles.btnText, { color: colors.onPrimaryContainer }]}>{t('common.allow')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.skip}>
            <Text style={{ color: colors.outline }}>{t('onboarding.skip')}</Text>
          </TouchableOpacity>
        </>
      )}

      {current === 'ready' && (
        <>
          <Text style={styles.emoji}>🏆</Text>
          <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('onboarding.readyTitle')}</Text>
          <Text style={[styles.body, { color: colors.onSurfaceVariant }]}>{t('onboarding.readyBody')}</Text>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primaryContainer }]} onPress={finish}>
            <Text style={[styles.btnText, { color: colors.onPrimaryContainer }]}>{t('onboarding.start')}</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 72, marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  body: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  btn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  btnText: { fontSize: 16, fontWeight: '700' },
  skip: { marginTop: 16, padding: 8 },
});
