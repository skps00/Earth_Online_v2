import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { CompanionCanvas } from './CompanionCanvas';
import { rarityColors } from '@/types/achievement';
import type { AchievementDisplay } from '@/repositories/AchievementRepository';
import { Share } from 'react-native';
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
          <Text style={styles.celebrate}>{t('trophies.unlockedTitle')}</Text>
          <CompanionCanvas emoji={achievement.icon ?? companionEmoji} size={120} primaryColor={rarityColor} />
          <Text style={[styles.title, { color: colors.onSurface }]}>{achievement.title}</Text>
          <Text style={[styles.rarity, { color: rarityColor }]}>{achievement.rarity}</Text>
          <Text style={[styles.desc, { color: colors.onSurfaceVariant }]}>{achievement.description}</Text>

          <TouchableOpacity style={[styles.shareBtn, { borderColor: colors.primaryContainer }]} onPress={handleShare}>
            <Text style={{ color: colors.primaryContainer, fontWeight: '700' }}>{t('common.share')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.continueBtn, { backgroundColor: colors.primaryContainer }]} onPress={onDismiss}>
            <Text style={{ color: colors.onPrimaryContainer, fontWeight: '700' }}>{t('common.ok')}</Text>
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
});
