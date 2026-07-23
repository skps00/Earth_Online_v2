import { Modal, View, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { AppText } from '@/components/AppText';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { rarityColors } from '@/types/achievement';
import type { AchievementDisplay } from '@/repositories/AchievementRepository';
import { AchievementRepository } from '@/repositories/AchievementRepository';
import { processEvent } from '@/engine/processEvent';
import { trackEvent } from '@/services/AnalyticsService';
import { ConfirmDialog } from './ConfirmDialog';

const achievementRepo = new AchievementRepository();

interface Props {
  achievement: AchievementDisplay | null;
  visible: boolean;
  onClose: () => void;
  onUnlocked: (ids: string[]) => void;
  isManual: boolean;
}

export function AchievementDetailModal({
  achievement,
  visible,
  onClose,
  onUnlocked,
  isManual,
}: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [confirming, setConfirming] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!achievement) return null;

  const rarityColor = rarityColors(achievement.rarity as Parameters<typeof rarityColors>[0]);
  const unlocked = Boolean(achievement.is_unlocked);
  const canManual = isManual && !unlocked;

  const handleConfirm = async () => {
    setShowConfirm(false);
    setConfirming(true);
    setError(null);
    try {
      const prereqOk = await achievementRepo.hasPrerequisiteUnlocked(achievement.id);
      if (!prereqOk) {
        setError(t('trophies.prerequisiteHint', { name: achievement.prerequisite_id ?? '' }));
        return;
      }
      const ids = await processEvent({ type: 'manual_confirm', achievementId: achievement.id });
      if (ids.length > 0) {
        await trackEvent('manual_confirm', { achievementId: achievement.id });
        onUnlocked(ids);
        onClose();
      } else {
        setError(t('trophies.confirmFailed'));
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : t('common.somethingWrong'));
    } finally {
      setConfirming(false);
    }
  };

  return (
    <>
      <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
        <View style={styles.overlay}>
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderColor: rarityColor,
                paddingBottom: 24 + Math.max(insets.bottom, 8),
              },
            ]}
          >
            <AppText style={styles.icon}>{achievement.icon ?? '🏆'}</AppText>
            <AppText style={[styles.title, { color: colors.onSurface }]}>{achievement.title}</AppText>
            <AppText style={[styles.rarity, { color: rarityColor }]}>{achievement.rarity}</AppText>
            <AppText style={[styles.desc, { color: colors.onSurfaceVariant }]}>{achievement.description}</AppText>

            {!unlocked && (
              <View style={styles.progressRow}>
                <View style={[styles.bar, { backgroundColor: colors.outlineVariant }]}>
                  <View
                    style={[
                      styles.fill,
                      {
                        width: `${Math.min((achievement.progress / achievement.trigger_goal) * 100, 100)}%`,
                        backgroundColor: rarityColor,
                      },
                    ]}
                  />
                </View>
                <AppText style={{ color: colors.onSurfaceVariant, fontSize: 12 }}>
                  {achievement.progress}/{achievement.trigger_goal}
                </AppText>
              </View>
            )}

            {error && <AppText style={[styles.error, { color: colors.error }]}>{error}</AppText>}

            {canManual && (
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: colors.primaryContainer }]}
                onPress={() => setShowConfirm(true)}
                disabled={confirming}
              >
                {confirming ? (
                  <ActivityIndicator color={colors.onPrimaryContainer} />
                ) : (
                  <AppText style={[styles.btnText, { color: colors.onPrimaryContainer }]}>
                    {t('trophies.confirmComplete')}
                  </AppText>
                )}
              </TouchableOpacity>
            )}

            {unlocked && (
              <AppText style={[styles.unlockedLabel, { color: '#50C878' }]}>{t('trophies.completed')}</AppText>
            )}

            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AppText style={[styles.closeText, { color: colors.onSurfaceVariant }]}>{t('common.close')}</AppText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={showConfirm}
        title={t('trophies.confirmTitle')}
        message={t('trophies.confirmMessage')}
        confirmLabel={t('trophies.confirmComplete')}
        cancelLabel={t('common.cancel')}
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirm(false)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24, borderTopWidth: 3 },
  icon: { fontSize: 48, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 8 },
  rarity: { fontSize: 12, fontWeight: '700', textAlign: 'center', marginTop: 4, textTransform: 'uppercase' },
  desc: { fontSize: 14, textAlign: 'center', marginTop: 12, lineHeight: 20 },
  progressRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 16 },
  bar: { flex: 1, height: 8, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', borderRadius: 4 },
  error: { fontSize: 13, textAlign: 'center', marginTop: 12 },
  btn: { marginTop: 20, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700' },
  unlockedLabel: { fontSize: 16, fontWeight: '700', textAlign: 'center', marginTop: 16 },
  closeBtn: { marginTop: 16, alignItems: 'center', paddingVertical: 8, paddingHorizontal: 16 },
  closeText: { fontSize: 14, lineHeight: 20 },
});
