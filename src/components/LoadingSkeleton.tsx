import { View, StyleSheet, Animated } from 'react-native';
import { useEffect, useRef } from 'react';
import { useTheme } from '@/theme/ThemeProvider';

export function LoadingSkeleton({ lines = 5 }: { lines?: number }) {
  const { colors } = useTheme();
  const opacity = useRef(new Animated.Value(0.3)).current;
  useEffect(() => {
    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
      ])
    );
    anim.start();
    return () => anim.stop();
  }, []);
  return (
    <View style={styles.container}>
      {Array.from({ length: lines }).map((_, i) => (
        <Animated.View key={i} style={[styles.line, { opacity, backgroundColor: colors.surfaceHigh }]} />
      ))}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: 16 },
  line: { height: 16, borderRadius: 4, marginBottom: 12 },
});
