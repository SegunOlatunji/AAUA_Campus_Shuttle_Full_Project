import { useLocalSearchParams, useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../../hooks/useAuth';
import { useRoutes } from '../../hooks/useRoutes';
import { useShuttles } from '../../hooks/useShuttles';
import { useAppSettings } from '../../hooks/useAppSettings';
import { createMatchRequest } from '../../hooks/useMatchRequest';
import { findMatches, type MatchCandidate } from '../../lib/matching';

function MatchCard({
  match,
  highlighted,
  onPress,
}: {
  match: MatchCandidate;
  highlighted: boolean;
  onPress: () => void;
}) {
  const seatsLabel =
    match.availableSeats === 0 ? 'Full' : `${match.availableSeats}/${match.capacity} seats`;

  return (
    <Pressable
      onPress={onPress}
      className={`mb-3 rounded-2xl border p-4 ${
        highlighted ? 'border-accent bg-primary' : 'border-border bg-surfaceCard'
      }`}
    >
      {highlighted && (
        <Text className="mb-1 text-xs font-medium text-accent">FASTEST MATCH</Text>
      )}
      <Text className={`text-base font-medium ${highlighted ? 'text-white' : 'text-textPrimary'}`}>
        {match.routeName}
      </Text>
      <Text className={`mt-1 text-xs ${highlighted ? 'text-white/70' : 'text-textSecondary'}`}>
        {match.plateNumber}
      </Text>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className={`text-sm ${highlighted ? 'text-white' : 'text-textPrimary'}`}>
          {Math.round(match.estimatedMinutes)} min away
        </Text>
        <Text
          className={`text-sm ${
            match.availableSeats === 0
              ? 'text-danger'
              : highlighted
              ? 'text-white'
              : 'text-textSecondary'
          }`}
        >
          {seatsLabel}
        </Text>
      </View>
    </Pressable>
  );
}

export default function ResultsScreen() {
  const { origin, destination } = useLocalSearchParams<{ origin: string; destination: string }>();
  const router = useRouter();
  const { profile } = useAuth();
  const { routes } = useRoutes();
  const { shuttles, loading } = useShuttles();
  const { avgMinutesPerStop } = useAppSettings();
  const [requesting, setRequesting] = useState(false);

  const matches = useMemo(
    () => findMatches(routes, shuttles, origin, destination, avgMinutesPerStop),
    [routes, shuttles, origin, destination, avgMinutesPerStop]
  );

  const handleSelect = async (match: MatchCandidate) => {
    if (!profile) return;
    setRequesting(true);
    try {
      const requestId = await createMatchRequest({
        studentId: profile.uid,
        originStopName: origin,
        destinationStopName: destination,
        matchedShuttleId: match.shuttleId,
        estimatedMinutes: match.estimatedMinutes,
      });
      router.push({
        pathname: '/(tabs)/track',
        params: { shuttleId: match.shuttleId, requestId, origin },
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-surface" contentContainerClassName="px-6 pb-10 pt-16">
      <Pressable onPress={() => router.back()} className="mb-4">
        <Text className="text-sm text-primary">Back</Text>
      </Pressable>

      <Text className="mb-1 text-lg font-medium text-textPrimary">
        {origin} to {destination}
      </Text>
      <Text className="mb-6 text-sm text-textSecondary">
        {matches.length > 0
          ? `${matches.length} shuttle${matches.length > 1 ? 's' : ''} available`
          : 'No active shuttles on this route right now'}
      </Text>

      {loading && <Text className="text-sm text-textSecondary">Checking live shuttles…</Text>}

      {!loading && matches.length === 0 && (
        <View className="rounded-2xl border border-border bg-surfaceCard p-5">
          <Text className="text-sm text-textSecondary">
            No shuttle is currently running this route. Check the schedule, or try again in a few
            minutes.
          </Text>
        </View>
      )}

      {matches.map((match, index) => (
        <MatchCard
          key={match.shuttleId}
          match={match}
          highlighted={index === 0}
          onPress={() => handleSelect(match)}
        />
      ))}

      {requesting && <Text className="mt-2 text-center text-xs text-textSecondary">Connecting…</Text>}
    </ScrollView>
  );
}
