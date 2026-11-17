import { ScrollView, Text, View } from 'react-native';
import { useDriverSchedule } from '../../hooks/useDriverSchedule';
import { useShuttle } from '../../hooks/useShuttle';

export default function DriverScheduleScreen() {
  const { schedules, loading } = useDriverSchedule();
  const { route } = useShuttle();

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="px-6 pb-6 pt-16">
      <Text className="mb-8 text-lg font-medium text-textPrimary">Your schedule</Text>

      {loading && <Text className="text-sm text-textSecondary">Loading…</Text>}

      {!loading && schedules.length === 0 && (
        <Text className="text-sm text-textSecondary">
          No schedule slots assigned to you yet. Contact transport administration.
        </Text>
      )}

      {schedules.map((schedule) => (
        <View key={schedule.id} className="mb-3 rounded-2xl border border-border bg-surfaceCard p-4">
          <Text className="text-base font-medium text-textPrimary">{schedule.departureTime}</Text>
          <Text className="mt-1 text-sm text-textSecondary">{route?.name ?? 'Assigned route'}</Text>
          <Text className="mt-1 text-xs text-textSecondary">{schedule.daysOfWeek.join(', ')}</Text>
        </View>
      ))}
    </ScrollView>
  );
}
