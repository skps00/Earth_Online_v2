import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useAtomValue, useSetAtom } from 'jotai';
import { themeAtom, langAtom, soundEnabledAtom } from '@/stores/settingsStore';
import { useSettings } from '@/hooks/useSettings';
import { exportBackup } from '@/services/BackupService';
import { getDatabase } from '@/database/connection';
import { seedDatabase } from '@/database/seed';
import { achievementsAtom, unlockedIdsAtom } from '@/stores/achievementStore';
import { companionAtom } from '@/stores/companionStore';
import { checkInErrorAtom, lastCheckInAtom } from '@/stores/checkInStore';
import { dailyQuestsAtom } from '@/stores/questStore';
import { coinsAtom } from '@/stores/currencyStore';

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useAtomValue(themeAtom);
  const lang = useAtomValue(langAtom);
  const sound = useAtomValue(soundEnabledAtom);
  const { persistTheme, persistLang, persistSound } = useSettings();
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const setAchievements = useSetAtom(achievementsAtom);
  const setUnlocked = useSetAtom(unlockedIdsAtom);
  const setCompanion = useSetAtom(companionAtom);
  const setLastCheckIn = useSetAtom(lastCheckInAtom);
  const setCheckInError = useSetAtom(checkInErrorAtom);
  const setQuests = useSetAtom(dailyQuestsAtom);
  const setCoins = useSetAtom(coinsAtom);
  const bottomPadding = insets.bottom + 100;

  const handleClearData = () => {
    Alert.alert(
      t('profile.clearData'),
      t('profile.deleteConfirmMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.deleteAll'), style: 'destructive',
          onPress: async () => {
            const db = await getDatabase();
            await db.execAsync(`DELETE FROM check_ins`);
            await db.execAsync(`DELETE FROM user_achievements`);
            await db.execAsync(`DELETE FROM user_daily_quests`);
            await db.execAsync(`DELETE FROM memories`);
            await db.execAsync(`DELETE FROM companion`);
            setAchievements([]);
            setUnlocked(new Set());
            setCompanion(null);
            setLastCheckIn(null);
            setCheckInError(null);
            setQuests([]);
            setCoins(0);
            await seedDatabase();
          },
        },
      ],
    );
  };

  const SettingRow = ({ label, onPress, value }: { label: string; onPress: () => void; value: string }) => (
    <TouchableOpacity onPress={onPress} style={[styles.row, { borderColor: colors.outlineVariant }]}>
      <Text style={[styles.label, { color: colors.onSurface }]} allowFontScaling={false} textBreakStrategy="simple">{label}</Text>
      <Text style={[styles.value, { color: colors.onSurfaceVariant }]} allowFontScaling={false} textBreakStrategy="simple">{value}</Text>
    </TouchableOpacity>
  );

  const [langDropdownVisible, setLangDropdownVisible] = useState(false);
  const langOptions = [
    { code: 'en' as const, label: 'English' },
    { code: 'zh-TW' as const, label: '繁體中文' },
  ];

  return (
    <>
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: bottomPadding }}>
      <Text style={[styles.title, { color: colors.primaryContainer }]}>{t('profile.title')}</Text>
      <SettingRow label={t('profile.theme')} value={theme === 'dark' ? t('profile.dark') : t('profile.light')} onPress={() => persistTheme(theme === 'dark' ? 'light' : 'dark')} />
      <SettingRow label={t('profile.language')} value={lang === 'en' ? 'English' : '繁體中文'} onPress={() => setLangDropdownVisible(true)} />
      <SettingRow label={t('profile.sound')} value={sound ? t('common.on') : t('common.off')} onPress={() => persistSound(!sound)} />

      <View style={[styles.section, { borderColor: colors.outlineVariant }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('profile.backup')}</Text>
        <TouchableOpacity
          onPress={async () => {
            try {
              const path = await exportBackup();
              setBackupMessage(t('common.backupSaved', { path }));
            } catch (e) {
              setBackupMessage(t('common.backupFailed'));
            }
          }}
          style={[styles.btn, { borderColor: colors.primaryContainer }]}
        >
          <Text style={[styles.btnText, { color: colors.primaryContainer }]}>{t('profile.backupExport')}</Text>
        </TouchableOpacity>
        {backupMessage && (
          <Text style={[styles.backupMsg, { color: colors.secondary }]}>{backupMessage}</Text>
        )}
      </View>

      <View style={[styles.section, { borderColor: colors.outlineVariant }]}>
        <Text style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('profile.memories')}</Text>
        <Text style={[styles.empty, { color: colors.outline }]}>{t('profile.noMemories')}</Text>
      </View>

      <TouchableOpacity onPress={handleClearData} style={[styles.dangerBtn, { borderColor: colors.error }]}>
        <Text style={[styles.dangerText, { color: colors.error }]}>{t('profile.clearData')}</Text>
      </TouchableOpacity>
    </ScrollView>

    <Modal visible={langDropdownVisible} transparent animationType="fade" onRequestClose={() => setLangDropdownVisible(false)}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setLangDropdownVisible(false)}>
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <Text style={[styles.dropdownTitle, { color: colors.onSurface }]}>{t('profile.language')}</Text>
          {langOptions.map(opt => (
            <TouchableOpacity
              key={opt.code}
              onPress={() => { persistLang(opt.code); setLangDropdownVisible(false); }}
              style={[styles.dropdownItem, { borderBottomColor: colors.outlineVariant, backgroundColor: lang === opt.code ? colors.primaryContainer + '20' : 'transparent' }]}
            >
              <Text style={[styles.dropdownText, { color: lang === opt.code ? colors.primaryContainer : colors.onSurface }]} allowFontScaling={false} textBreakStrategy="simple">{opt.label}</Text>
              {lang === opt.code && <Text style={[styles.dropdownCheck, { color: colors.primaryContainer }]}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
    </>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 24, fontWeight: '700', textAlign: 'center', marginTop: 20, marginBottom: 24 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, paddingHorizontal: 12 },
  label: { fontSize: 16, lineHeight: 22, flex: 1, flexShrink: 0 },
  value: { fontSize: 14, lineHeight: 20, flexShrink: 0, minWidth: 80, textAlign: 'right' },
  section: { marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1, gap: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700' },
  empty: { fontSize: 13, textAlign: 'center', paddingVertical: 12 },
  btn: { paddingVertical: 12, paddingHorizontal: 24, borderRadius: 8, borderWidth: 1, alignItems: 'center' },
  btnText: { fontSize: 14, fontWeight: '700' },
  backupMsg: { fontSize: 12, textAlign: 'center' },
  dangerBtn: { marginTop: 24, padding: 16, borderRadius: 12, borderWidth: 1, alignItems: 'center' },
  dangerText: { fontSize: 14, fontWeight: '700' },
  modalBackdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  dropdown: { width: '80%', borderRadius: 12, borderWidth: 1, padding: 16 },
  dropdownTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  dropdownItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 12, borderBottomWidth: 1 },
  dropdownText: { fontSize: 16, lineHeight: 22, flexShrink: 0 },
  dropdownCheck: { fontSize: 18, fontWeight: '700' },
});
