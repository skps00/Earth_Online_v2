import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Circle, useClock } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

interface CompanionCanvasProps {
  emoji: string;
  size?: number;
  primaryColor?: string;
}

export function CompanionCanvas({ emoji, size = 160, primaryColor = '#FFD700' }: CompanionCanvasProps) {
  const clock = useClock();
  const glowRadius = useDerivedValue(() => size * 0.38 + Math.sin(clock.value / 500) * 6);
  const cx1 = useDerivedValue(() => size / 2 + Math.cos(clock.value / 800) * size * 0.32);
  const cy1 = useDerivedValue(() => size / 2 + Math.sin(clock.value / 800) * size * 0.18);
  const cx2 = useDerivedValue(() => size / 2 + Math.cos(clock.value / 600 + 2) * size * 0.28);
  const cy2 = useDerivedValue(() => size / 2 + Math.sin(clock.value / 600 + 2) * size * 0.22);
  const cx3 = useDerivedValue(() => size / 2 + Math.cos(clock.value / 700 + 4) * size * 0.3);
  const cy3 = useDerivedValue(() => size / 2 + Math.sin(clock.value / 700 + 4) * size * 0.16);

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        <Circle cx={size / 2} cy={size / 2} r={glowRadius} color={`${primaryColor}33`} />
        <Circle cx={cx1} cy={cy1} r={4} color={`${primaryColor}99`} />
        <Circle cx={cx2} cy={cy2} r={3} color={`${primaryColor}66`} />
        <Circle cx={cx3} cy={cy3} r={3} color={`${primaryColor}66`} />
      </Canvas>
      <Text style={[styles.emoji, { fontSize: size * 0.45 }]}>{emoji}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignItems: 'center', justifyContent: 'center' },
  emoji: { position: 'absolute', textAlign: 'center' },
});
