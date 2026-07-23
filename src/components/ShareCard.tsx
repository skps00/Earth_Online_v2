import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';
import { useTranslation } from '@/i18n';
import { CompanionCanvas } from './CompanionCanvas';
import { rarityColors } from '@/types/achievement';
import type { AchievementDisplay } from '@/repositories/AchievementRepository';

/** 1080×1080 share card layout (scaled for preview; export via Share API text in MVP) */
interface ShareCardProps {
  achievement: AchievementDisplay;
  companionEmoji?: string;
  scale?: number;
}

export function ShareCard({ achievement, companionEmoji = '🐉', scale = 0.3 }: ShareCardProps) {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const size = 1080 * scale;
  const rarityColor = rarityColors(achievement.rarity as Parameters<typeof rarityColors>[0]);
  const date = new Date().toLocaleDateString();

  return (
    <View style={[styles.outer, { width: size, height: size, backgroundColor: colors.background }]}>
      <View style={[styles.inner, { borderColor: rarityColor }]}>
        <Text style={[styles.brand, { color: colors.primaryContainer }]}>{t('common.appName')}</Text>
        <CompanionCanvas emoji={achievement.icon ?? companionEmoji} size={size * 0.35} primaryColor={rarityColor} />
        <Text style={[styles.title, { color: colors.onSurface, fontSize: size * 0.05 }]}>{achievement.title}</Text>
        <Text style={[styles.rarity, { color: rarityColor, fontSize: size * 0.028 }]}>{achievement.rarity}</Text>
        <Text style={[styles.date, { color: colors.onSurfaceVariant, fontSize: size * 0.022 }]}>
          {t('trophies.unlockedOn', { date })}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: { overflow: 'hidden', borderRadius: 8 },
  inner: { flex: 1, alignItems: 'center', justifyContent: 'center', borderWidth: 4, margin: 8, borderRadius: 12, padding: 16 },
  brand: { fontSize: 14, fontWeight: '700', letterSpacing: 2, marginBottom: 8 },
  title: { fontWeight: '700', textAlign: 'center', marginTop: 12 },
  rarity: { fontWeight: '700', marginTop: 4, textTransform: 'uppercase' },
  date: { marginTop: 8 },
});
