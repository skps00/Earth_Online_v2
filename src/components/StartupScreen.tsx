import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import type { StartupProgress } from '@/services/AppStartupService';

interface Props {
  progress: StartupProgress;
  error?: string | null;
  onRetry?: () => void;
}

export function StartupScreen({ progress, error, onRetry }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const pct = Math.round(Math.min(Math.max(progress.progress, 0), 1) * 100);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <AppText style={styles.emoji}>🌍</AppText>
      <AppText style={[styles.title, { color: colors.primaryContainer }]}>{t('startup.title')}</AppText>
      <AppText style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
        {error ? t('startup.failed') : t(progress.labelKey)}
      </AppText>

      <View style={[styles.track, { backgroundColor: colors.outlineVariant }]}>
        <View
          style={[
            styles.fill,
            { backgroundColor: colors.primaryContainer, width: `${pct}%` },
          ]}
        />
      </View>
      <AppText style={[styles.percent, { color: colors.onSurfaceVariant }]}>{pct}%</AppText>

      {error && onRetry && (
        <TouchableOpacity
          style={[styles.retryBtn, { backgroundColor: colors.primaryContainer }]}
          onPress={onRetry}
        >
          <AppText style={[styles.retryText, { color: colors.onPrimaryContainer }]}>{t('common.tryAgain')}</AppText>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 72, marginBottom: 16 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 14, textAlign: 'center', marginBottom: 28, minHeight: 20 },
  track: { width: '100%', maxWidth: 280, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  percent: { fontSize: 12, marginTop: 8 },
  retryBtn: { marginTop: 24, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 10 },
  retryText: { fontSize: 16, fontWeight: '700' },
});
