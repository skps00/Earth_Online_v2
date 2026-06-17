import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { signIn } from '@/services/GoogleAuthService';
import { useState } from 'react';
import { Logger } from '@/utils/logger';

interface Props {
  onLogin: () => void;
  onSkip: () => void;
}

export function LoginScreen({ onLogin, onSkip }: Props) {
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signIn();
      onLogin();
    } catch (e: any) {
      Logger.error('Login', 'Login failed', e);
      setError(e.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={styles.emoji}>🌍</Text>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>地球 Online</Text>

      <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
        <Text style={[styles.cardTitle, { color: colors.onSurface }]}>☁️ Cloud Sync</Text>
        <Text style={[styles.cardText, { color: colors.onSurfaceVariant }]}>
          Sign in with Google to:
        </Text>
        <Text style={[styles.bullet, { color: colors.onSurfaceVariant }]}>
          • Back up your data to Google Drive
        </Text>
        <Text style={[styles.bullet, { color: colors.onSurfaceVariant }]}>
          • Sync across multiple devices
        </Text>
        <Text style={[styles.bullet, { color: colors.onSurfaceVariant }]}>
          • Never lose your progress
        </Text>
      </View>

      <TouchableOpacity
        onPress={handleLogin}
        disabled={loading}
        style={[styles.btn, { backgroundColor: colors.primaryContainer }]}
      >
        {loading ? (
          <ActivityIndicator color={colors.onPrimaryContainer} />
        ) : (
          <Text style={[styles.btnText, { color: colors.onPrimaryContainer }]}>Sign in with Google</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        onPress={onSkip}
        style={[styles.skipBtn]}
      >
        <Text style={[styles.skipText, { color: colors.outline }]}>Skip for now</Text>
      </TouchableOpacity>

      {error && <Text style={[styles.error, { color: colors.error }]}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 80, marginBottom: 16 },
  title: { fontSize: 32, fontWeight: '700', marginBottom: 24 },
  card: { width: '100%', padding: 20, borderRadius: 12, borderWidth: 1, marginBottom: 32 },
  cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  cardText: { fontSize: 14, marginBottom: 8 },
  bullet: { fontSize: 13, marginLeft: 8, marginBottom: 4 },
  btn: { paddingVertical: 16, paddingHorizontal: 32, borderRadius: 12, minWidth: 240, alignItems: 'center' },
  btnText: { fontSize: 18, fontWeight: '700' },
  skipBtn: { marginTop: 16, paddingVertical: 12 },
  skipText: { fontSize: 14 },
  error: { fontSize: 13, marginTop: 16, textAlign: 'center' },
});
