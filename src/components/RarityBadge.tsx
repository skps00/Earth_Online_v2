import { View, StyleSheet } from 'react-native';
import { AppText } from '@/components/AppText';
import { Rarity, rarityColors } from '@/types/achievement';

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const color = rarityColors(rarity);
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}20` }]}>
      <AppText style={[styles.text, { color }]}>{rarity.toUpperCase()}</AppText>
    </View>
  );
}
const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  text: { fontSize: 10 },
});
