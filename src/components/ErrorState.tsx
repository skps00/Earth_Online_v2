import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';

interface Props { message?: string; onRetry?: () => void; }

export function ErrorState({ message, onRetry }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  return (
    <View style={styles.container}>
      <Text style={{ fontSize: 48, marginBottom: 12 }}>⚠️</Text>
      <Text style={[styles.text, { color: colors.error }]}>{message ?? t('errors.NETWORK_OFFLINE')}</Text>
      {onRetry && (
        <TouchableOpacity onPress={onRetry} style={[styles.btn, { borderColor: colors.secondary }]}>
          <Text style={[styles.btnText, { color: colors.secondary }]}>{t('common.retry')}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  text: { fontSize: 14, textAlign: 'center', marginBottom: 16 },
  btn: { paddingHorizontal: 24, paddingVertical: 10, borderWidth: 1, borderRadius: 8 },
  btnText: { fontSize: 14, fontWeight: '700' },
});
