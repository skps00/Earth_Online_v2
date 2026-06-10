import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useAtomValue } from 'jotai';
import { themeAtom, langAtom, soundEnabledAtom } from '@/stores/settingsStore';
import { useSettings } from '@/hooks/useSettings';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const theme = useAtomValue(themeAtom);
  const lang = useAtomValue(langAtom);
  const sound = useAtomValue(soundEnabledAtom);
  const { persistTheme, persistLang, persistSound } = useSettings();

  const SettingRow = ({ label, onPress, value }: { label: string; onPress: () => void; value: string }) => (
    <TouchableOpacity onPress={onPress} style={[styles.row, { borderColor: colors.outlineVariant }]}>
      <Text style={[styles.label, { color: colors.onSurface }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.onSurfaceVariant }]}>{value}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('profile.title')}</Text>
      <SettingRow label={t('profile.theme')} value={theme === 'dark' ? t('profile.dark') : t('profile.light')} onPress={() => persistTheme(theme === 'dark' ? 'light' : 'dark')} />
      <SettingRow label={t('profile.language')} value={lang === 'en' ? 'English' : '繁體中文'} onPress={() => persistLang(lang === 'en' ? 'zh-TW' : 'en')} />
      <SettingRow label={t('profile.sound')} value={sound ? 'ON' : 'OFF'} onPress={() => persistSound(!sound)} />

      <View style={[styles.section, { borderColor: colors.outlineVariant }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('profile.backup')}</Text>
        <TouchableOpacity style={[styles.btn, { borderColor: colors.primaryContainer }]}>
          <Text style={[styles.btnText, { color: colors.primaryContainer }]}>{t('profile.backupExport')}</Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.section, { borderColor: colors.outlineVariant }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('profile.memories')}</Text>
        <Text style={[styles.empty, { color: colors.outline }]}>No memories yet</Text>
      </View>

      <TouchableOpacity style={[styles.dangerBtn, { borderColor: colors.error }]}>
        <Text style={[styles.dangerText, { color: colors.error }]}>{t('profile.clearData')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 20, marginBottom: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, alignItems: 'center' },
  label: { fontSize: 16 },
  value: { fontSize: 14 },
  section: { marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  empty: { fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  btn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  btnText: { fontSize: 14, fontWeight: '700' },
  dangerBtn: { marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  dangerText: { fontSize: 14, fontWeight: '700' },
});
