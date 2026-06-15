import { Tabs } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/i18n';
import { Text } from 'react-native';

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '🏠', trophies: '🏆', quest: '📋', companion: '🐉', profile: '👤',
  };
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name] ?? '●'}</Text>;
}

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { t } = useTranslation();
  const tabHeight = 60 + Math.max(insets.bottom, 0);

  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.outlineVariant, paddingBottom: Math.max(insets.bottom, 4), height: tabHeight },
      tabBarActiveTintColor: colors.primaryContainer,
      tabBarInactiveTintColor: colors.outline,
      tabBarLabelStyle: { fontSize: 10 },
    }}>
      <Tabs.Screen name="index" options={{ tabBarLabel: t('common.tabHome'), tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} /> }} />
      <Tabs.Screen name="trophies" options={{ tabBarLabel: t('common.tabTrophies'), tabBarIcon: ({ focused }) => <TabIcon name="trophies" focused={focused} /> }} />
      <Tabs.Screen name="quest" options={{ tabBarLabel: t('common.tabQuest'), tabBarIcon: ({ focused }) => <TabIcon name="quest" focused={focused} /> }} />
      <Tabs.Screen name="companion" options={{ tabBarLabel: t('common.tabCompanion'), tabBarIcon: ({ focused }) => <TabIcon name="companion" focused={focused} /> }} />
      <Tabs.Screen name="profile" options={{ tabBarLabel: t('common.tabProfile'), tabBarIcon: ({ focused }) => <TabIcon name="profile" focused={focused} /> }} />
    </Tabs>
  );
}
