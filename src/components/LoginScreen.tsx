import { View, TouchableOpacity, StyleSheet, ActivityIndicator, Platform, ScrollView } from 'react-native';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { signIn, isGoogleSigninNativeAvailable, GOOGLE_SIGNIN_UNAVAILABLE } from '@/services/GoogleAuthService';
import { useState } from 'react';
import { Logger } from '@/utils/logger';

interface Props {
  onLogin: () => void;
  onSkip: () => void;
}

export function LoginScreen({ onLogin, onSkip }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const googleAvailable = isGoogleSigninNativeAvailable();

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn();
      onLogin();
    } catch (e: unknown) {
      Logger.error('Login', 'Login failed', e);
      const message = e instanceof Error ? e.message : t('common.somethingWrong');
      setError(message === GOOGLE_SIGNIN_UNAVAILABLE ? t('auth.googleUnavailableError') : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[styles.container, { backgroundColor: colors.background }]}
      keyboardShouldPersistTaps="handled"
    >
      <AppText style={styles.emoji}>🌍</AppText>
      <AppText style={[styles.title, { color: colors.primaryContainer }]}>{t('common.appName')}</AppText>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <AppText style={[styles.cardTitle, { color: colors.onSurface }]}>☁️ {t('auth.cloudSync')}</AppText>
        <AppText style={[styles.cardText, { color: colors.onSurfaceVariant }]}>{t('auth.cloudSyncIntro')}</AppText>
        <AppText style={[styles.bullet, { color: colors.onSurfaceVariant }]}>• {t('auth.cloudSyncBackup')}</AppText>
        <AppText style={[styles.bullet, { color: colors.onSurfaceVariant }]}>• {t('auth.cloudSyncDevices')}</AppText>
        <AppText style={[styles.bullet, { color: colors.onSurfaceVariant }]}>• {t('auth.cloudSyncProgress')}</AppText>
      </View>

      {!googleAvailable && (
        <AppText style={[styles.hint, { color: colors.onSurfaceVariant }]}>{t('auth.googleDevClientHint')}</AppText>
      )}

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading || !googleAvailable}
        style={[styles.btn, { backgroundColor: googleAvailable ? colors.primaryContainer : colors.outlineVariant }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimaryContainer} />
        ) : (
          <AppText style={[styles.btnText, { color: colors.onPrimaryContainer }]}>{t('auth.signInGoogle')}</AppText>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={onSkip} style={styles.skipBtn} accessibilityRole="button">
        <AppText
          style={[styles.skipText, { color: colors.outline }]}
          textBreakStrategy="simple"
          allowFontScaling={false}
        >
          {t('onboarding.skip')}
        </AppText>
      </TouchableOpacity>

      {error && <AppText style={[styles.error, { color: colors.error }]}>{error}</AppText>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 32, paddingVertical: 48 },
  emoji: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 24, textAlign: 'center' },
  card: { width: '100%', padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 32 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardText: { fontSize: 14, marginBottom: 8 },
  bullet: { fontSize: 13, marginLeft: 8, marginBottom: 4 },
  btn: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, minWidth: 240, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: '700' },
  skipBtn: { marginTop: 16, paddingVertical: 12, paddingHorizontal: 16, alignSelf: 'stretch', alignItems: 'center' },
  skipText: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined,
  },
  hint: { fontSize: 12, textAlign: 'center', marginBottom: 16, lineHeight: 18 },
  error: { fontSize: 13, marginTop: 16, textAlign: 'center' },
});
