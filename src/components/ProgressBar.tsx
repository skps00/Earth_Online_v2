import { View, StyleSheet } from 'react-native';
import { useTheme } from '@/theme/ThemeProvider';

interface Props { progress: number; max?: number; height?: number; }

export function ProgressBar({ progress, max = 100, height = 12 }: Props) {
  const { colors } = useTheme();
  const pct = Math.min(progress / max, 1);
  return (
    <View style={[styles.track, { backgroundColor: '#121225', height, borderRadius: height / 2 }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: colors.secondary, height, borderRadius: height / 2 }]} />
    </View>
  );
}
const styles = StyleSheet.create({ track: { overflow: 'hidden', width: '100%' }, fill: {} });
