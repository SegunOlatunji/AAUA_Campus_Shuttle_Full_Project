import { useEffect, useState } from 'react';
import { get, onValue, push, ref, set, update } from 'firebase/database';
import { database } from '../lib/firebase';
import { useDriverAuth } from './useDriverAuth';
import type { RouteRecord } from '../lib/types/route';
import type { ShuttleRecord } from '../lib/types/shuttle';

export function useShuttle() {
  const { profile } = useDriverAuth();
  const [shuttle, setShuttle] = useState<ShuttleRecord | null>(null);
  const [route, setRoute] = useState<RouteRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const shuttleId = profile?.assignedShuttleId ?? null;

  useEffect(() => {
    if (!shuttleId) {
      setShuttle(null);
      setLoading(false);
      return;
    }

    const shuttleRef = ref(database, `shuttles/${shuttleId}`);
    const unsubscribe = onValue(shuttleRef, (snapshot) => {
      if (!snapshot.exists()) {
        setShuttle(null);
        setLoading(false);
        return;
      }
      setShuttle({ id: shuttleId, ...snapshot.val() });
      setLoading(false);
    });

    return () => unsubscribe();
  }, [shuttleId]);

  useEffect(() => {
    if (!shuttle?.assignedRouteId) {
      setRoute(null);
      return;
    }
    // Route data changes rarely, so a one-off fetch is enough here rather
    // than an always-on listener.
    get(ref(database, `routes/${shuttle.assignedRouteId}`)).then((snapshot) => {
      if (snapshot.exists()) {
        setRoute({ id: shuttle.assignedRouteId as string, ...snapshot.val() });
      }
    });
  }, [shuttle?.assignedRouteId]);

  const setOnline = async (online: boolean) => {
    if (!profile) return;
    await update(ref(database, `users/drivers/${profile.uid}`), {
      status: online ? 'online' : 'offline',
    });
  };

  const startTrip = async () => {
    if (!shuttleId || !shuttle || !profile) return;
    await update(ref(database, `shuttles/${shuttleId}`), { tripStatus: 'in_progress' });

    const tripRef = push(ref(database, 'trip_history'));
    await set(tripRef, {
      routeId: shuttle.assignedRouteId,
      shuttleId,
      driverId: profile.uid,
      startTime: Date.now(),
      endTime: null,
    });
    return tripRef.key;
  };

  const endTrip = async (tripId: string | null) => {
    if (!shuttleId) return;
    await update(ref(database, `shuttles/${shuttleId}`), {
      tripStatus: 'idle',
      currentLocation: null,
    });
    if (tripId) {
      await update(ref(database, `trip_history/${tripId}`), { endTime: Date.now() });
    }
  };

  const updateSeats = async (availableSeats: number) => {
    if (!shuttleId || !shuttle) return;
    const clamped = Math.max(0, Math.min(availableSeats, shuttle.capacity));
    await update(ref(database, `shuttles/${shuttleId}`), { availableSeats: clamped });
  };

  return { shuttle, route, loading, setOnline, startTrip, endTrip, updateSeats };
}
