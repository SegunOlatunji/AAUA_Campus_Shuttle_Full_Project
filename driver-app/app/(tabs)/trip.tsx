import { useState } from 'react';
import { Minus, Plus } from 'lucide-react-native';
import { Alert, Pressable, Text, View } from 'react-native';
import { Button } from '../../components/ui/Button';
import { useDriverAuth } from '../../hooks/useDriverAuth';
import { useShuttle } from '../../hooks/useShuttle';
import { useLocationBroadcast } from '../../hooks/useLocationBroadcast';
import { colors } from '../../constants/theme';

export default function TripScreen() {
  const { profile } = useDriverAuth();
  const { shuttle, route, startTrip, endTrip, updateSeats } = useShuttle();
  const [tripId, setTripId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const isOnline = profile?.status === 'online';
  const tripActive = shuttle?.tripStatus === 'in_progress';

  const { broadcasting, permissionDenied } = useLocationBroadcast(
    shuttle?.id ?? null,
    Boolean(tripActive)
  );

  const handleStart = async () => {
    if (!isOnline) {
      Alert.alert('Go online first', 'Switch on Online in the Dashboard tab before starting a trip.');
      return;
    }
    setSubmitting(true);
    try {
      const newTripId = await startTrip();
      setTripId(newTripId ?? null);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEnd = async () => {
    setSubmitting(true);
    try {
      await endTrip(tripId);
      setTripId(null);
    } finally {
      setSubmitting(false);
    }
  };

  const adjustSeats = (delta: number) => {
    if (!shuttle) return;
    updateSeats(shuttle.availableSeats + delta);
  };

  if (!shuttle) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-sm text-textSecondary">No shuttle assigned yet.</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface px-6 pt-16">
      <Text className="mb-1 text-lg font-medium text-textPrimary">{route?.name ?? 'Your route'}</Text>
      <Text className="mb-8 text-sm text-textSecondary">{shuttle.plateNumber}</Text>

      {tripActive && (
        <View className="mb-6 flex-row items-center gap-2 rounded-xl bg-primary/5 px-4 py-3">
          <View
            className="h-2 w-2 rounded-full"
            style={{ backgroundColor: broadcasting ? colors.success : colors.warning }}
          />
          <Text className="text-xs text-textSecondary">
            {permissionDenied
              ? 'Location permission needed to broadcast your position'
              : broadcasting
              ? 'Broadcasting your live location'
              : 'Connecting…'}
          </Text>
        </View>
      )}

      <View className="mb-8 items-center rounded-2xl border border-border bg-surfaceCard py-8">
        <Text className="text-xs text-textSecondary">Available seats</Text>
        <View className="mt-4 flex-row items-center gap-6">
          <Pressable
            onPress={() => adjustSeats(-1)}
            disabled={!tripActive}
            className="h-11 w-11 items-center justify-center rounded-full border border-border disabled:opacity-40"
          >
            <Minus color={colors.textPrimary} size={20} />
          </Pressable>
          <Text className="text-3xl font-medium text-textPrimary">
            {shuttle.availableSeats}/{shuttle.capacity}
          </Text>
          <Pressable
            onPress={() => adjustSeats(1)}
            disabled={!tripActive}
            className="h-11 w-11 items-center justify-center rounded-full border border-border disabled:opacity-40"
          >
            <Plus color={colors.textPrimary} size={20} />
          </Pressable>
        </View>
      </View>

      {tripActive ? (
        <Button label="End trip" variant="secondary" onPress={handleEnd} loading={submitting} />
      ) : (
        <Button label="Start trip" onPress={handleStart} loading={submitting} />
      )}
    </View>
  );
}
