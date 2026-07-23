import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { isCoinsEnabled } from '@/stores/currencyStore';
import type { QuestDisplay } from '@/repositories/QuestRepository';

const QUEST_ICONS: Record<string, string> = {
  early_bird: '🌅',
  explorer_path: '🗺️',
  photo_hunter: '📷',
};

interface Props {
  quest: QuestDisplay | null;
  visible: boolean;
  onDismiss: () => void;
}

export function QuestCompleteModal({ quest, visible, onDismiss }: Props) {
  const { colors } = useTheme();
  const { t } = useTranslation();

  if (!quest) return null;

  const icon = QUEST_ICONS[quest.id] ?? '🏅';

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
      <View style={styles.overlay}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.secondary }]}>
          <AppText style={styles.celebrate}>{t('quest.completeTitle')}</AppText>
          <AppText style={styles.icon}>{icon}</AppText>
          <AppText style={[styles.title, { color: colors.onSurface }]}>{quest.title}</AppText>
          <AppText style={[styles.desc, { color: colors.onSurfaceVariant }]}>{quest.description}</AppText>
          <View style={[styles.rewardRow, { backgroundColor: colors.secondaryContainer }]}>
            <AppText style={[styles.rewardText, { color: colors.onSecondary }]}>
              {isCoinsEnabled
                ? t('quest.completeReward', { xp: quest.reward_xp, coins: quest.reward_coins })
                : t('quest.completeRewardXp', { xp: quest.reward_xp })}
            </AppText>
          </View>
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
  icon: { fontSize: 64, marginVertical: 8 },
  title: { fontSize: 22, fontWeight: '700', textAlign: 'center', marginTop: 4 },
  desc: { fontSize: 13, textAlign: 'center', marginTop: 8, lineHeight: 18 },
  rewardRow: { marginTop: 16, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  rewardText: { fontSize: 15, fontWeight: '700', textAlign: 'center', lineHeight: 22 },
  continueBtn: { marginTop: 20, paddingVertical: 12, paddingHorizontal: 32, borderRadius: 10, width: '100%', alignItems: 'center' },
  btnText: { fontSize: 16, fontWeight: '700', lineHeight: 22 },
});
