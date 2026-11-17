'use client';

import { useEffect, useState } from 'react';
import { onValue, push, ref, remove, set, update } from 'firebase/database';
import { database } from '../lib/firebase';
import type { ShuttleRecord, ShuttleStatus } from '../lib/types/shuttle';

export interface ShuttleFormInput {
  plateNumber: string;
  capacity: number;
  assignedRouteId: string | null;
  assignedDriverId: string | null;
  status: ShuttleStatus;
}

export function useShuttles() {
  const [shuttles, setShuttles] = useState<ShuttleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const shuttlesRef = ref(database, 'shuttles');
    const unsubscribe = onValue(shuttlesRef, (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<ShuttleRecord, 'id'>> | null;
      const list = value
        ? Object.entries(value).map(([id, data]) => ({ id, ...data }))
        : [];
      list.sort((a, b) => a.plateNumber.localeCompare(b.plateNumber));
      setShuttles(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const createShuttle = async (input: ShuttleFormInput) => {
    const newRef = push(ref(database, 'shuttles'));
    await set(newRef, {
      plateNumber: input.plateNumber,
      capacity: input.capacity,
      availableSeats: input.capacity,
      assignedRouteId: input.assignedRouteId,
      assignedDriverId: input.assignedDriverId,
      status: input.status,
      tripStatus: 'idle',
      currentLocation: null,
    });
    return newRef.key;
  };

  const updateShuttle = async (id: string, input: ShuttleFormInput) => {
    await update(ref(database, `shuttles/${id}`), {
      plateNumber: input.plateNumber,
      capacity: input.capacity,
      assignedRouteId: input.assignedRouteId,
      assignedDriverId: input.assignedDriverId,
      status: input.status,
    });
  };

  const deleteShuttle = async (id: string) => {
    await remove(ref(database, `shuttles/${id}`));
  };

  return { shuttles, loading, createShuttle, updateShuttle, deleteShuttle };
}
