import { View, TouchableOpacity, StyleSheet, Platform, ScrollView, Alert } from 'react-native';
import { AppText } from '@/components/AppText';
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
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === Location.PermissionStatus.GRANTED) {
      setStep(2);
      return;
    }
    Alert.alert(t('onboarding.locationTitle'), t('errors.GPS_DENIED'));
  };

  const current = STEPS[step];

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      {current === 'welcome' && (
        <>
          <AppText style={styles.emoji}>🌍</AppText>
          <AppText style={[styles.title, { color: colors.primaryContainer }]}>{t('onboarding.welcomeTitle')}</AppText>
          <AppText style={[styles.body, { color: colors.onSurfaceVariant }]}>{t('onboarding.welcomeBody')}</AppText>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primaryContainer }]} onPress={() => setStep(1)}>
            <AppText style={[styles.btnText, { color: colors.onPrimaryContainer }]}>{t('onboarding.next')}</AppText>
          </TouchableOpacity>
        </>
      )}

      {current === 'permissions' && (
        <>
          <AppText style={styles.emoji}>📍</AppText>
          <AppText style={[styles.title, { color: colors.primaryContainer }]}>{t('onboarding.locationTitle')}</AppText>
          <AppText style={[styles.body, { color: colors.onSurfaceVariant }]}>{t('onboarding.locationBody')}</AppText>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primaryContainer }]} onPress={requestLocation}>
            <AppText style={[styles.btnText, { color: colors.onPrimaryContainer }]}>{t('common.allow')}</AppText>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setStep(2)} style={styles.skip} accessibilityRole="button">
            <AppText
              style={[styles.skipText, { color: colors.outline }]}
              textBreakStrategy="simple"
              allowFontScaling={false}
            >
              {t('onboarding.skip')}
            </AppText>
          </TouchableOpacity>
        </>
      )}

      {current === 'ready' && (
        <>
          <AppText style={styles.emoji}>🏆</AppText>
          <AppText style={[styles.title, { color: colors.primaryContainer }]}>{t('onboarding.readyTitle')}</AppText>
          <AppText style={[styles.body, { color: colors.onSurfaceVariant }]}>{t('onboarding.readyBody')}</AppText>
          <TouchableOpacity style={[styles.btn, { backgroundColor: colors.primaryContainer }]} onPress={finish}>
            <AppText style={[styles.btnText, { color: colors.onPrimaryContainer }]}>{t('onboarding.start')}</AppText>
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32, paddingVertical: 48 },
  emoji: { fontSize: 72, marginBottom: 24 },
  title: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 16 },
  body: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  btn: { paddingVertical: 14, paddingHorizontal: 40, borderRadius: 12 },
  btnText: { fontSize: 16, fontWeight: '700' },
  skip: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 16, alignSelf: 'stretch', alignItems: 'center' },
  skipText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
  },
});
