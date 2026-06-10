import { Tabs } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { Text } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '🏠', trophies: '🏆', quest: '📋', companion: '🐉', profile: '👤',
  };
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name] ?? '●'}</Text>;
}

export default function TabLayout() {
  const { colors } = useTheme();
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant, paddingBottom: 4, height: 60 },
      tabBarActiveTintColor: colors.primaryContainer,
      tabBarInactiveTintColor: colors.outline,
      tabBarLabelStyle: { fontSize: 10, fontFamily: 'monospace' },
    }}>
      <Tabs.Screen name="index" options={{ tabBarLabel: 'Home', tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} /> }} />
      <Tabs.Screen name="trophies" options={{ tabBarLabel: 'Trophies', tabBarIcon: ({ focused }) => <TabIcon name="trophies" focused={focused} /> }} />
      <Tabs.Screen name="quest" options={{ tabBarLabel: 'Quest', tabBarIcon: ({ focused }) => <TabIcon name="quest" focused={focused} /> }} />
      <Tabs.Screen name="companion" options={{ tabBarLabel: 'Companion', tabBarIcon: ({ focused }) => <TabIcon name="companion" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: 'Profile', tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} /> }} />
    </Tabs>
  );
}
