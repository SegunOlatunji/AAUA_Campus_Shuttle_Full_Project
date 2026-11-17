import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { BottomNav } from '../../components/layout/BottomNav';
import { useRoutes } from '../../hooks/useRoutes';
import { useSchedules } from '../../hooks/useSchedules';

export default function RoutesScreen() {
  const { routes, loading: routesLoading } = useRoutes();
  const { schedules, loading: schedulesLoading } = useSchedules();
  const [expandedRouteId, setExpandedRouteId] = useState<string | null>(null);

  return (
    <View className="flex-1 bg-surface">
      <ScrollView contentContainerClassName="px-6 pb-6 pt-16">
        <Text className="mb-1 text-lg font-medium text-textPrimary">Routes & schedules</Text>
        <Text className="mb-8 text-sm text-textSecondary">
          Browse without picking a specific destination first.
        </Text>

        {routesLoading && <Text className="text-sm text-textSecondary">Loading routes…</Text>}

        {routes.map((route) => {
          const isExpanded = expandedRouteId === route.id;
          const routeSchedules = schedules.filter((s) => s.routeId === route.id && s.isActive);

          return (
            <View
              key={route.id}
              className="mb-3 rounded-2xl border border-border bg-surfaceCard p-4"
            >
              <Text
                className="text-base font-medium text-textPrimary"
                onPress={() => setExpandedRouteId(isExpanded ? null : route.id)}
              >
                {route.name}
              </Text>
              <Text className="mt-1 text-xs text-textSecondary">{route.stops.length} stops</Text>

              {!schedulesLoading && routeSchedules.length > 0 && (
                <View className="mt-3 flex-row flex-wrap gap-2">
                  {routeSchedules.map((s) => (
                    <View key={s.id} className="rounded-full bg-primary/10 px-3 py-1">
                      <Text className="text-xs text-primary">{s.departureTime}</Text>
                    </View>
                  ))}
                </View>
              )}

              {isExpanded && (
                <View className="mt-4 border-t border-border pt-3">
                  {route.stops.map((stop) => (
                    <Text key={stop.order} className="py-1 text-sm text-textSecondary">
                      {stop.order}. {stop.name}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>
      <BottomNav />
    </View>
  );
}
