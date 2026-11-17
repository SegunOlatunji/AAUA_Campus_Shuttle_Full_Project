import { Switch, Text, View } from 'react-native';
import { useDriverAuth } from '../../hooks/useDriverAuth';
import { useShuttle } from '../../hooks/useShuttle';
import { colors } from '../../constants/theme';

export default function DriverDashboardScreen() {
  const { profile } = useDriverAuth();
  const { shuttle, route, loading, setOnline } = useShuttle();

  const isOnline = profile?.status === 'online';

  return (
    <View className="flex-1 bg-surface px-6 pt-16">
      <Text className="mb-1 text-lg font-medium text-textPrimary">Hi, {profile?.fullName}</Text>
      <Text className="mb-8 text-sm text-textSecondary">{profile?.phone}</Text>

      {/* Deliberately the largest interactive element on this screen — see
          Phase 3 design rationale: a driver needs zero-ambiguity status at a glance. */}
      <View className="mb-6 flex-row items-center justify-between rounded-2xl border border-border bg-surfaceCard px-5 py-6">
        <View>
          <Text className="text-base font-medium text-textPrimary">
            {isOnline ? "You're online" : "You're offline"}
          </Text>
          <Text className="mt-1 text-xs text-textSecondary">
            {isOnline ? 'Students can see your shuttle as active' : 'Go online before starting a trip'}
          </Text>
        </View>
        <Switch
          value={isOnline}
          onValueChange={setOnline}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor="#FFFFFF"
        />
      </View>

      {loading && <Text className="text-sm text-textSecondary">Loading your shuttle…</Text>}

      {!loading && !shuttle && (
        <View className="rounded-2xl border border-border bg-surfaceCard p-5">
          <Text className="text-sm text-textSecondary">
            No shuttle is assigned to you yet. Contact transport administration.
          </Text>
        </View>
      )}

      {shuttle && (
        <View className="rounded-2xl border border-border bg-surfaceCard p-5">
          <Text className="text-xs text-textSecondary">Assigned shuttle</Text>
          <Text className="mt-1 text-base font-medium text-textPrimary">{shuttle.plateNumber}</Text>
          <Text className="mt-1 text-sm text-textSecondary">{route?.name ?? 'No route assigned'}</Text>
          <Text className="mt-3 text-xs text-textSecondary">
            {shuttle.availableSeats}/{shuttle.capacity} seats ·{' '}
            {shuttle.tripStatus === 'in_progress' ? 'Trip in progress' : 'Not on a trip'}
          </Text>
        </View>
      )}
    </View>
  );
}
