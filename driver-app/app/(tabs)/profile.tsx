import { ScrollView, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { useDriverAuth } from '../../hooks/useDriverAuth';
import { useShuttle } from '../../hooks/useShuttle';

export default function DriverProfileScreen() {
  const { profile, logout } = useDriverAuth();
  const { shuttle } = useShuttle();

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="px-6 pb-6 pt-16">
      <Text className="mb-6 text-lg font-medium text-textPrimary">Profile</Text>

      <View className="mb-6 rounded-2xl border border-border bg-surfaceCard p-5">
        <Text className="text-base font-medium text-textPrimary">{profile?.fullName}</Text>
        <Text className="mt-1 text-sm text-textSecondary">{profile?.phone}</Text>
        {shuttle && (
          <Text className="mt-1 text-sm text-textSecondary">Assigned shuttle: {shuttle.plateNumber}</Text>
        )}
      </View>

      <Button label="Log out" onPress={logout} variant="secondary" />
    </ScrollView>
  );
}
