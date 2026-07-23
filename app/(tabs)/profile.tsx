import { View, TouchableOpacity, StyleSheet, ScrollView, Alert, Modal, Platform } from 'react-native';
import { AppText } from '@/components/AppText';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { useAtomValue, useSetAtom } from 'jotai';
import { themeAtom, langAtom, soundEnabledAtom } from '@/stores/settingsStore';
import { useSettings } from '@/hooks/useSettings';
import { exportBackup, importBackup, importBackupFromLocalFile } from '@/services/BackupService';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { AchievementRepository } from '@/repositories/AchievementRepository';
import { CompanionRepository } from '@/repositories/CompanionRepository';
import { QuestRepository } from '@/repositories/QuestRepository';
import { useCloudSync } from '@/hooks/useCloudSync';
import { IAP_PRODUCTS, isIAPEnabled, purchaseProduct } from '@/services/IAPService';
import { openPrivacyPolicy } from '@/utils/legalLinks';
import { syncStatusAtom } from '@/stores/syncStore';
import { getDatabase } from '@/database/connection';
import { seedDatabase } from '@/database/seed';
import { achievementsAtom, unlockedIdsAtom, achievementVersionAtom } from '@/stores/achievementStore';
import { companionAtom } from '@/stores/companionStore';
import { checkInErrorAtom, lastCheckInAtom } from '@/stores/checkInStore';
import { dailyQuestsAtom, questVersionAtom } from '@/stores/questStore';
import { coinsAtom } from '@/stores/currencyStore';

const achievementRepo = new AchievementRepository();
const companionRepo = new CompanionRepository();
const questRepo = new QuestRepository();

export default function ProfileScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const theme = useAtomValue(themeAtom);
  const lang = useAtomValue(langAtom);
  const sound = useAtomValue(soundEnabledAtom);
  const { persistTheme, persistLang, persistSound } = useSettings();
  const { isAuthenticated, userEmail, authenticate, logout, sync, googleSigninAvailable } = useCloudSync();
  const syncStatus = useAtomValue(syncStatusAtom);
  const [backupMessage, setBackupMessage] = useState<string | null>(null);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [iapMessage, setIapMessage] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const setAchievements = useSetAtom(achievementsAtom);
  const setUnlocked = useSetAtom(unlockedIdsAtom);
  const setCompanion = useSetAtom(companionAtom);
  const setLastCheckIn = useSetAtom(lastCheckInAtom);
  const setCheckInError = useSetAtom(checkInErrorAtom);
  const setQuests = useSetAtom(dailyQuestsAtom);
  const setCoins = useSetAtom(coinsAtom);
  const setAchievementVersion = useSetAtom(achievementVersionAtom);
  const setQuestVersion = useSetAtom(questVersionAtom);
  const bottomPadding = insets.bottom + 100;

  const reloadAfterBackupImport = async () => {
    const [achievements, unlockedIds, companion, quests] = await Promise.all([
      achievementRepo.getAll(lang),
      achievementRepo.getUnlockedIds(),
      companionRepo.get(),
      questRepo.getToday(lang),
    ]);
    setAchievements(achievements);
    setUnlocked(unlockedIds);
    setCompanion(companion);
    setCoins(companion?.coins ?? 0);
    setQuests(quests);
    setLastCheckIn(null);
    setCheckInError(null);
    setAchievementVersion(v => v + 1);
    setQuestVersion(v => v + 1);
    await seedDatabase();
  };

  const handleImportBackup = () => {
    Alert.alert(
      t('profile.backupImport'),
      t('profile.backupImportConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('profile.backupImport'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('profile.backupImport'),
              t('profile.backupImportSource'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                {
                  text: t('profile.backupImportPickFile'),
                  onPress: async () => {
                    try {
                      const result = await DocumentPicker.getDocumentAsync({
                        type: 'application/json',
                        copyToCacheDirectory: true,
                      });
                      if (result.canceled || !result.assets?.[0]?.uri) return;
                      const json = await FileSystem.readAsStringAsync(result.assets[0].uri);
                      await importBackup(json);
                      await reloadAfterBackupImport();
                      setBackupMessage(t('profile.backupImportSuccess'));
                    } catch {
                      setBackupMessage(t('profile.backupImportFailed'));
                    }
                  },
                },
                {
                  text: t('profile.backupImportLocal'),
                  onPress: async () => {
                    try {
                      await importBackupFromLocalFile();
                      await reloadAfterBackupImport();
                      setBackupMessage(t('profile.backupImportSuccess'));
                    } catch (e) {
                      const msg = e instanceof Error && e.message === 'BACKUP_NOT_FOUND'
                        ? t('profile.backupImportNotFound')
                        : t('profile.backupImportFailed');
                      setBackupMessage(msg);
                    }
                  },
                },
              ],
            );
          },
        },
      ],
    );
  };

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
            await db.execAsync(`DELETE FROM analytics_events`);
            await db.execAsync(`DELETE FROM app_settings`);
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
      <AppText style={[styles.label, { color: colors.onSurface }]} allowFontScaling={false} textBreakStrategy="simple">{label}</AppText>
      <AppText style={[styles.value, { color: colors.onSurfaceVariant }]} allowFontScaling={false} textBreakStrategy="simple">{value}</AppText>
    </TouchableOpacity>
  );

  const [langDropdownVisible, setLangDropdownVisible] = useState(false);
  const langOptions = [
    { code: 'en' as const, label: t('profile.english') },
    { code: 'zh-TW' as const, label: t('profile.chinese') },
  ];

  const handleGoogleSignIn = () => {
    if (!googleSigninAvailable) {
      Alert.alert(t('profile.googleAccount'), t('auth.googleDevClientHint'));
      return;
    }
    void (async () => {
      setAuthBusy(true);
      const ok = await authenticate();
      setAuthBusy(false);
      if (!ok) {
        Alert.alert(t('profile.googleAccount'), t('profile.googleSignInFailed'));
      }
    })();
  };

  const handleGoogleSignOut = () => {
    Alert.alert(
      t('profile.googleSignOutTitle'),
      t('profile.googleSignOutMessage'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('auth.signOut'),
          style: 'destructive',
          onPress: async () => {
            setAuthBusy(true);
            await logout();
            setSyncMessage(null);
            setAuthBusy(false);
          },
        },
      ],
    );
  };

  return (
    <>
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={{ paddingBottom: bottomPadding }}>
      <AppText style={[styles.title, { color: colors.primaryContainer }]}>{t('profile.title')}</AppText>
      <SettingRow label={t('profile.theme')} value={theme === 'dark' ? t('profile.dark') : t('profile.light')} onPress={() => persistTheme(theme === 'dark' ? 'light' : 'dark')} />
      <SettingRow label={t('profile.language')} value={lang === 'en' ? t('profile.english') : t('profile.chinese')} onPress={() => setLangDropdownVisible(true)} />
      <SettingRow label={t('profile.sound')} value={sound ? t('common.on') : t('common.off')} onPress={() => persistSound(!sound)} />
      <TouchableOpacity
        onPress={async () => {
          const opened = await openPrivacyPolicy();
          if (!opened) Alert.alert(t('profile.privacy'), t('profile.privacyUnavailable'));
        }}
        style={[styles.row, { borderColor: colors.outlineVariant }]}
      >
        <AppText style={[styles.label, { color: colors.onSurface }]} allowFontScaling={false} textBreakStrategy="simple">{t('profile.privacy')}</AppText>
        <AppText style={[styles.value, { color: colors.primaryContainer }]} allowFontScaling={false} textBreakStrategy="simple">→</AppText>
      </TouchableOpacity>

      <View style={[styles.section, { borderColor: colors.outlineVariant }]}>
        <AppText style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('profile.backup')}</AppText>
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
          <AppText style={[styles.btnText, { color: colors.primaryContainer }]}>{t('profile.backupExport')}</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleImportBackup}
          style={[styles.btn, { borderColor: colors.outlineVariant, marginTop: 8 }]}
        >
          <AppText style={[styles.btnText, { color: colors.onSurface }]}>{t('profile.backupImport')}</AppText>
        </TouchableOpacity>
        {backupMessage && (
          <AppText style={[styles.backupMsg, { color: '#50C878' }]}>{backupMessage}</AppText>
        )}
      </View>

      <View style={[styles.section, { borderColor: colors.outlineVariant }]}>
        <AppText style={[styles.sectionTitle, { color: colors.onSurface }]}>☁️ {t('auth.cloudSync')}</AppText>
        {!googleSigninAvailable && (
          <AppText style={{ fontSize: 12, color: colors.onSurfaceVariant, lineHeight: 18 }}>
            {t('auth.googleDevClientHint')}
          </AppText>
        )}
        <View style={[styles.accountRow, { borderColor: colors.outlineVariant }]}>
          <AppText style={{ fontSize: 13, color: colors.onSurfaceVariant }}>{t('profile.googleAccount')}</AppText>
          <AppText
            style={{ fontSize: 13, color: isAuthenticated ? colors.secondary : colors.onSurfaceVariant, flex: 1, textAlign: 'right' }}
            numberOfLines={1}
          >
            {authBusy
              ? t('auth.syncing')
              : isAuthenticated
                ? (userEmail ?? t('profile.googleSignedIn'))
                : t('profile.googleNotSignedIn')}
          </AppText>
        </View>
        {isAuthenticated ? (
          <>
            <TouchableOpacity
              onPress={async () => {
                try {
                  setSyncMessage(t('auth.syncing'));
                  const result = await sync();
                  setSyncMessage(t('auth.syncComplete', { uploaded: result.uploaded, downloaded: result.downloaded }));
                } catch {
                  setSyncMessage(t('auth.syncFailed'));
                }
              }}
              disabled={authBusy || syncStatus === 'syncing'}
              style={[styles.btn, { borderColor: colors.primaryContainer }]}
            >
              <AppText style={[styles.btnText, { color: colors.primaryContainer }]}>
                {syncStatus === 'syncing' ? t('auth.syncing') : t('auth.syncNow')}
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleGoogleSignOut}
              disabled={authBusy}
              style={[styles.btn, { borderColor: colors.outlineVariant }]}
            >
              <AppText style={[styles.btnText, { color: colors.onSurfaceVariant }]}>{t('auth.signOut')}</AppText>
            </TouchableOpacity>
          </>
        ) : (
          <TouchableOpacity
            onPress={handleGoogleSignIn}
            disabled={authBusy || !googleSigninAvailable}
            style={[styles.btn, { borderColor: colors.primaryContainer, opacity: googleSigninAvailable ? 1 : 0.5 }]}
          >
            <AppText style={[styles.btnText, { color: colors.primaryContainer }]}>
              {authBusy ? t('auth.syncing') : t('auth.signInGoogle')}
            </AppText>
          </TouchableOpacity>
        )}
        {syncMessage && (
          <AppText style={[styles.backupMsg, { color: '#50C878' }]}>{syncMessage}</AppText>
        )}
      </View>

      {isIAPEnabled && (
      <View style={[styles.section, { borderColor: colors.outlineVariant }]}>
        <AppText style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('profile.shop')}</AppText>
        <AppText style={[styles.empty, { color: colors.outline }]}>{t('profile.shopHint')}</AppText>
        <TouchableOpacity
          onPress={async () => {
            const r = await purchaseProduct(IAP_PRODUCTS.COIN_PACK_SMALL);
            setIapMessage(r.success ? t('profile.purchaseSuccess') : t('profile.purchasePending'));
          }}
          style={[styles.btn, { borderColor: colors.primaryContainer }]}
        >
          <AppText style={[styles.btnText, { color: colors.primaryContainer }]}>{t('profile.buyCoins')}</AppText>
        </TouchableOpacity>
        {iapMessage && <AppText style={[styles.backupMsg, { color: colors.secondary }]}>{iapMessage}</AppText>}
      </View>
      )}

      <View style={[styles.section, { borderColor: colors.outlineVariant }]}>
        <AppText style={[styles.sectionTitle, { color: colors.onSurface }]}>{t('profile.memories')}</AppText>
        <AppText style={[styles.empty, { color: colors.outline }]}>{t('profile.noMemories')}</AppText>
      </View>

      <TouchableOpacity onPress={handleClearData} style={[styles.dangerBtn, { borderColor: colors.error }]}>
        <AppText style={[styles.dangerText, { color: colors.error }]}>{t('profile.clearData')}</AppText>
      </TouchableOpacity>
    </ScrollView>

    <Modal visible={langDropdownVisible} transparent animationType="fade" onRequestClose={() => setLangDropdownVisible(false)}>
      <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={() => setLangDropdownVisible(false)}>
        <View style={[styles.dropdown, { backgroundColor: colors.surface, borderColor: colors.outlineVariant }]}>
          <AppText style={[styles.dropdownTitle, { color: colors.onSurface }]}>{t('profile.language')}</AppText>
          {langOptions.map(opt => (
            <TouchableOpacity
              key={opt.code}
              onPress={() => { persistLang(opt.code); setLangDropdownVisible(false); }}
              style={[styles.dropdownItem, { borderBottomColor: colors.outlineVariant, backgroundColor: lang === opt.code ? colors.primaryContainer + '20' : 'transparent' }]}
            >
              <AppText style={[styles.dropdownText, { color: lang === opt.code ? colors.primaryContainer : colors.onSurface }]} allowFontScaling={false} textBreakStrategy="simple">{opt.label}</AppText>
              {lang === opt.code && <AppText style={[styles.dropdownCheck, { color: colors.primaryContainer }]}>✓</AppText>}
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
  label: { fontSize: 16, lineHeight: 22, flex: 1, flexShrink: 0, fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined },
  value: { fontSize: 14, lineHeight: 20, flexShrink: 0, minWidth: 80, textAlign: 'right', fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined },
  accountRow: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 8, borderBottomWidth: 1, marginBottom: 4 },
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
  dropdownText: { fontSize: 16, lineHeight: 22, flexShrink: 0, fontFamily: Platform.OS === 'android' ? 'sans-serif' : undefined },
  dropdownCheck: { fontSize: 18, fontWeight: '700' },
});
