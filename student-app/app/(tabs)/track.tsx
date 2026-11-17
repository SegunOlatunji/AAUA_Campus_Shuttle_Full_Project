import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useMemo, useRef } from 'react';
import { Pressable, Text, View } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { useShuttles } from '../../hooks/useShuttles';
import { useRoutes } from '../../hooks/useRoutes';
import { findNearestStopIndex } from '../../lib/matching';
import { markMatchRequestArrived } from '../../hooks/useMatchRequest';
import { colors } from '../../constants/theme';

// Akungba-Akoko, Ondo State — used only as a fallback map center before any
// stop coordinates exist. Replace once real campus coordinates are pinned.
const FALLBACK_REGION = {
  latitude: 7.4667,
  longitude: 5.7333,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

export default function TrackScreen() {
  const { shuttleId, requestId, origin } = useLocalSearchParams<{
    shuttleId: string;
    requestId?: string;
    origin?: string;
  }>();
  const router = useRouter();
  const { shuttles } = useShuttles();
  const { routes } = useRoutes();
  const arrivalLoggedRef = useRef(false);

  const shuttle = shuttles.find((s) => s.id === shuttleId);
  const route = routes.find((r) => r.id === shuttle?.assignedRouteId);

  const pinnedStops = useMemo(
    () => (route?.stops ?? []).filter((s) => s.lat !== null && s.lng !== null),
    [route]
  );

  const nearestStopName = useMemo(() => {
    if (!shuttle?.currentLocation || !route) return null;
    const index = findNearestStopIndex(route.stops, shuttle.currentLocation.lat, shuttle.currentLocation.lng);
    return index !== null ? route.stops[index].name : null;
  }, [shuttle?.currentLocation, route]);

  // Arrival detection for the Objective 3 wait-time metric (Addendum 2): once
  // the shuttle's nearest stop matches the student's origin, log it once.
  useEffect(() => {
    if (!requestId || arrivalLoggedRef.current) return;
    if (nearestStopName && origin && nearestStopName === origin) {
      arrivalLoggedRef.current = true;
      markMatchRequestArrived(requestId);
    }
  }, [nearestStopName, origin, requestId]);

  const region = shuttle?.currentLocation
    ? {
        latitude: shuttle.currentLocation.lat,
        longitude: shuttle.currentLocation.lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }
    : FALLBACK_REGION;

  if (!shuttle) {
    return (
      <View className="flex-1 items-center justify-center bg-surface px-6">
        <Text className="text-sm text-textSecondary">This shuttle is no longer available.</Text>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-sm text-primary">Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface">
      <MapView style={{ flex: 1 }} region={region}>
        {shuttle.currentLocation && (
          <Marker
            coordinate={{
              latitude: shuttle.currentLocation.lat,
              longitude: shuttle.currentLocation.lng,
            }}
            title={shuttle.plateNumber}
            description={route?.name}
            pinColor={colors.primary}
          />
        )}
        {pinnedStops.length > 1 && (
          <Polyline
            coordinates={pinnedStops.map((s) => ({ latitude: s.lat as number, longitude: s.lng as number }))}
            strokeColor={colors.primary}
            strokeWidth={3}
          />
        )}
      </MapView>

      <Pressable
        onPress={() => router.back()}
        className="absolute left-6 top-16 rounded-full bg-white px-4 py-2 shadow"
      >
        <Text className="text-sm text-primary">Back</Text>
      </Pressable>

      <View className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-surfaceCard p-6">
        <Text className="text-base font-medium text-textPrimary">{route?.name ?? 'Your shuttle'}</Text>
        <Text className="mt-1 text-sm text-textSecondary">{shuttle.plateNumber}</Text>

        <View className="mt-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xs text-textSecondary">Seats</Text>
            <Text className="text-sm font-medium text-textPrimary">
              {shuttle.availableSeats}/{shuttle.capacity}
            </Text>
          </View>
          <View>
            <Text className="text-xs text-textSecondary">Nearest stop</Text>
            <Text className="text-sm font-medium text-textPrimary">{nearestStopName ?? '—'}</Text>
          </View>
          <View>
            <Text className="text-xs text-textSecondary">Status</Text>
            <Text className="text-sm font-medium text-textPrimary">
              {shuttle.tripStatus === 'in_progress' ? 'On the move' : 'Trip ended'}
            </Text>
          </View>
        </View>

        {!shuttle.currentLocation && (
          <Text className="mt-4 text-xs text-textSecondary">
            Waiting for the driver's live location…
          </Text>
        )}
      </View>
    </View>
  );
}
