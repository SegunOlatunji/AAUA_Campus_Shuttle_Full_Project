import { ScrollView, Text, View } from 'react-native';
import { BottomNav } from '../../components/layout/BottomNav';
import { useNotifications } from '../../hooks/useNotifications';

export default function NotificationsScreen() {
  const { notifications, loading } = useNotifications();

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-6 pt-16">
        <Text className="mb-8 text-lg font-medium text-textPrimary">Notifications</Text>

        {loading && <Text className="text-sm text-textSecondary">Loading…</Text>}

        {!loading && notifications.length === 0 && (
          <Text className="text-sm text-textSecondary">No announcements yet.</Text>
        )}

        {notifications.map((n) => (
          <View key={n.id} className="mb-3 rounded-2xl border border-border bg-surfaceCard p-4">
            <Text className="text-sm font-medium text-textPrimary">{n.title}</Text>
            <Text className="mt-1 text-sm text-textSecondary">{n.message}</Text>
            <Text className="mt-2 text-xs text-textSecondary/70">
              {new Date(n.createdAt).toLocaleString()}
            </Text>
          </View>
        ))}
      </ScrollView>
      <BottomNav />
    </View>
  );
}
