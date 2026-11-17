import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { ref, update } from 'firebase/database';
import { database } from '../lib/firebase';

/**
 * While `active` is true, watches the device's position and writes it to
 * shuttles/{shuttleId}/currentLocation on each meaningful movement. Stops
 * cleanly when `active` becomes false or the component unmounts, so a
 * driver forgetting to end a trip doesn't leave a stale location broadcasting
 * forever (endTrip in useShuttle also explicitly clears currentLocation).
 */
export function useLocationBroadcast(shuttleId: string | null, active: boolean) {
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [broadcasting, setBroadcasting] = useState(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function start() {
      if (!active || !shuttleId) return;

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        if (!cancelled) setPermissionDenied(true);
        return;
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 4000,
          distanceInterval: 15, // meters — avoids flooding RTDB with tiny jitter updates
        },
        (position) => {
          update(ref(database, `shuttles/${shuttleId}/currentLocation`), {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            updatedAt: Date.now(),
          });
        }
      );

      if (cancelled) {
        subscription.remove();
        return;
      }

      subscriptionRef.current = subscription;
      setBroadcasting(true);
    }

    start();

    return () => {
      cancelled = true;
      subscriptionRef.current?.remove();
      subscriptionRef.current = null;
      setBroadcasting(false);
    };
  }, [active, shuttleId]);

  return { broadcasting, permissionDenied };
}
