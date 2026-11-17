import { useRouter } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { StopPicker } from '../../components/ui/StopPicker';
import { BottomNav } from '../../components/layout/BottomNav';
import { useAuth } from '../../hooks/useAuth';
import { useRoutes } from '../../hooks/useRoutes';
import { getAllStopNames } from '../../lib/matching';

export default function DashboardScreen() {
  const { profile } = useAuth();
  const { routes, loading } = useRoutes();
  const router = useRouter();

  const [origin, setOrigin] = useState<string | null>(null);
  const [destination, setDestination] = useState<string | null>(null);

  const stopNames = getAllStopNames(routes);

  const handleFindShuttle = () => {
    if (!origin || !destination) return;
    router.push({
      pathname: '/(tabs)/results',
      params: { origin, destination },
    });
  };

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-6 pt-16">
        <Text className="mb-1 text-lg font-medium text-textPrimary">
          Hi, {profile?.fullName?.split(' ')[0] ?? 'there'}
        </Text>
        <Text className="mb-8 text-sm text-textSecondary">Where are you going?</Text>

        {loading && <Text className="mb-4 text-sm text-textSecondary">Loading routes…</Text>}

        {!loading && routes.length === 0 && (
          <View className="mb-6 rounded-xl border border-border bg-surfaceCard p-4">
            <Text className="text-sm text-textSecondary">
              No routes are set up yet. Check back once transport administration has published the
              campus routes.
            </Text>
          </View>
        )}

        {stopNames.length > 0 && (
          <>
            <StopPicker label="From" value={origin} options={stopNames} onSelect={setOrigin} />
            <StopPicker label="To" value={destination} options={stopNames} onSelect={setDestination} />

            <Button
              label="Find my shuttle"
              onPress={handleFindShuttle}
              disabled={!origin || !destination || origin === destination}
            />
            {origin && destination && origin === destination && (
              <Text className="mt-2 text-center text-xs text-danger">
                Choose two different stops.
              </Text>
            )}
          </>
        )}
      </ScrollView>
      <BottomNav />
    </View>
  );
}
