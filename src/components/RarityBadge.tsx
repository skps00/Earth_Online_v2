import { View, Text, StyleSheet } from 'react-native';
import { Rarity, rarityColors } from '@/types/achievement';

export function RarityBadge({ rarity }: { rarity: Rarity }) {
  const color = rarityColors(rarity);
  return (
    <View style={[styles.badge, { borderColor: color, backgroundColor: `${color}20` }]}>
      <Text style={[styles.text, { color }]}>{rarity.toUpperCase()}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1 },
  text: { fontSize: 10 },
});
