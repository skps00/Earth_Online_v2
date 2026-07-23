import { Modal, View, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { CompanionCanvas } from './CompanionCanvas';
import { rarityColors } from '@/types/achievement';
import type { AchievementDisplay } from '@/repositories/AchievementRepository';
import { trackEvent } from '@/services/AnalyticsService';

interface Props {
  achievement: AchievementDisplay | null;
  visible: boolean;
  onDismiss: () => void;
  companionEmoji?: string;
}

export function AchievementUnlockModal({ achievement, visible, onDismiss, companionEmoji = '🐉' }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!achievement) return null;

  const rarityColor = rarityColors(achievement.rarity as Parameters<typeof rarityColors>[0]);

  const handleShare = async () => {
    const message = t('trophies.shareMessage', {
      title: achievement.title,
      rarity: achievement.rarity,
    });
    await Share.share({ message });
    await trackEvent('share_card', { achievementId: achievement.id });
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: rarityColor }]}>
          <AppText style={styles.celebrate}>{t('trophies.unlockedTitle')}</AppText>
          <CompanionCanvas emoji={achievement.icon ?? companionEmoji} size={120} primaryColor={rarityColor} />
          <AppText style={[styles.title, { color: colors.onSurface }]}>{achievement.title}</AppText>
          <AppText style={[styles.rarity, { color: rarityColor }]}>{achievement.rarity}</AppText>
          <AppText style={[styles.desc, { color: colors.onSurfaceVariant }]}>{achievement.description}</AppText>

          <TouchableOpacity style={[styles.shareBtn, { borderColor: colors.primaryContainer }]} onPress={handleShare}>
            <AppText style={[styles.btnText, { color: colors.primaryContainer }]}>{t('common.share')}</AppText>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.continueBtn, { backgroundColor: colors.primaryContainer }]} onPress={onDismiss}>
            <AppText style={[styles.btnText, { color: colors.onPrimaryContainer }]}>{t('common.ok')}</AppText>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  card: { width: '100%', maxWidth: 340, borderRadius: 20, borderWidth: 2, padding: 24, alignItems: 'center' },
  celebrate: { fontSize: 14, fontWeight: '700', color: '#FFD700', marginBottom: 8, letterSpacing: 2 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 12 },
  rarity: { fontSize: 12, fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  desc: { fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  shareBtn: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10, borderWidth: 1, width: '100%', alignItems: 'center' },
  continueBtn: { marginTop: 10, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10, width: '100%', alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
});
