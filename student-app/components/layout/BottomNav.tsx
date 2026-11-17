import { usePathname, useRouter } from 'expo-router';
import { Bell, LayoutDashboard, Route as RouteIcon, User } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { colors } from '../../constants/theme';

const TABS = [
  { href: '/(tabs)', label: 'Home', icon: LayoutDashboard },
  { href: '/(tabs)/routes', label: 'Routes', icon: RouteIcon },
  { href: '/(tabs)/notifications', label: 'Alerts', icon: Bell },
  { href: '/(tabs)/profile', label: 'Profile', icon: User },
] as const;

// A hand-rolled bar rather than expo-router's Tabs navigator: Results and
// Track are pushed on top of this flow and shouldn't show a tab bar, which
// is simpler to express by including this component only on the four
// screens that need it than by fighting Tabs' screen-visibility rules.
export function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <View className="flex-row justify-around border-t border-border bg-surfaceCard pb-6 pt-3">
      {TABS.map(({ href, label, icon: Icon }) => {
        const isActive =
          href === '/(tabs)' ? pathname === '/' || pathname === '/(tabs)' : pathname === href;
        return (
          <Pressable
            key={href}
            onPress={() => router.replace(href)}
            className="items-center"
            accessibilityRole="button"
            accessibilityLabel={label}
          >
            <Icon color={isActive ? colors.primary : colors.textSecondary} size={22} />
            <Text
              className="mt-1 text-[11px]"
              style={{ color: isActive ? colors.primary : colors.textSecondary }}
            >
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
