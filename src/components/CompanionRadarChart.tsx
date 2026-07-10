import { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Canvas, Path, Skia } from '@shopify/react-native-skia';
import type { CompanionStats } from '@/types/companion';

export const COMPANION_STAT_KEYS = ['strength', 'agility', 'intelligence', 'charisma', 'vitality'] as const;
export type CompanionStatKey = (typeof COMPANION_STAT_KEYS)[number];

const STAT_COUNT = COMPANION_STAT_KEYS.length;
export const COMPANION_STAT_MAX = 100;

function polarPoint(cx: number, cy: number, radius: number, index: number, ratio: number) {
  const angle = -Math.PI / 2 + (2 * Math.PI * index) / STAT_COUNT;
  const r = radius * Math.min(1, Math.max(0, ratio));
  return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
}

function makePolygonPath(cx: number, cy: number, radius: number, ratios: number[]) {
  const path = Skia.Path.Make();
  ratios.forEach((ratio, index) => {
    const { x, y } = polarPoint(cx, cy, radius, index, ratio);
    if (index === 0) path.moveTo(x, y);
    else path.lineTo(x, y);
  });
  path.close();
  return path;
}

interface CompanionRadarChartProps {
  stats: CompanionStats;
  size?: number;
  primaryColor: string;
  gridColor: string;
  labelColor: string;
  labels: Record<CompanionStatKey, string>;
}

export function CompanionRadarChart({
  stats,
  size = 240,
  primaryColor,
  gridColor,
  labelColor,
  labels,
}: CompanionRadarChartProps) {
  const padding = 32;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - padding;

  const ratios = COMPANION_STAT_KEYS.map((key) => stats[key] / COMPANION_STAT_MAX);

  const gridPaths = useMemo(
    () => [0.25, 0.5, 0.75, 1].map((scale) => makePolygonPath(cx, cy, radius, Array(STAT_COUNT).fill(scale))),
    [cx, cy, radius],
  );

  const axisPaths = useMemo(() => {
    return COMPANION_STAT_KEYS.map((_, index) => {
      const path = Skia.Path.Make();
      const end = polarPoint(cx, cy, radius, index, 1);
      path.moveTo(cx, cy);
      path.lineTo(end.x, end.y);
      return path;
    });
  }, [cx, cy, radius]);

  const dataPath = useMemo(
    () => makePolygonPath(cx, cy, radius, ratios),
    [cx, cy, radius, stats.strength, stats.agility, stats.intelligence, stats.charisma, stats.vitality],
  );

  const labelPositions = COMPANION_STAT_KEYS.map((key, index) => {
    const pos = polarPoint(cx, cy, radius + 22, index, 1);
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / STAT_COUNT;
    const cos = Math.cos(angle);
    return {
      key,
      x: pos.x,
      y: pos.y,
      label: labels[key],
      value: stats[key],
      align: cos > 0.15 ? 'left' : cos < -0.15 ? 'right' : 'center',
    } as const;
  });

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Canvas style={{ width: size, height: size }}>
        {axisPaths.map((path, index) => (
          <Path key={`axis-${index}`} path={path} color={gridColor} style="stroke" strokeWidth={1} />
        ))}
        {gridPaths.map((path, index) => (
          <Path key={`grid-${index}`} path={path} color={gridColor} style="stroke" strokeWidth={1} opacity={0.5} />
        ))}
        <Path path={dataPath} color={`${primaryColor}55`} style="fill" />
        <Path path={dataPath} color={primaryColor} style="stroke" strokeWidth={2} />
      </Canvas>

      {labelPositions.map(({ key, x, y, label, value, align }) => (
        <View
          key={key}
          style={[
            styles.label,
            align === 'left' && styles.labelLeft,
            align === 'right' && styles.labelRight,
            align === 'center' && styles.labelCenter,
            { left: x, top: y },
          ]}
        >
          <Text style={[styles.labelText, { color: labelColor, textAlign: align }]}>{label}</Text>
          <Text style={[styles.valueText, { color: primaryColor, textAlign: align }]}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'center', position: 'relative' },
  label: { position: 'absolute', width: 52 },
  labelLeft: { transform: [{ translateX: 0 }, { translateY: -16 }] },
  labelRight: { transform: [{ translateX: -52 }, { translateY: -16 }] },
  labelCenter: { transform: [{ translateX: -26 }, { translateY: -16 }] },
  labelText: { fontSize: 11, fontWeight: '600' },
  valueText: { fontSize: 16, fontWeight: '700' },
});
