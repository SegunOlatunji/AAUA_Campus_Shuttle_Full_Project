'use client';

import { useEffect, useState } from 'react';
import { get, onValue, push, ref, remove, set, update } from 'firebase/database';
import { database } from '../lib/firebase';
import type { RouteRecord, RouteStop } from '../lib/types/route';
import { AAUA_SEED_ROUTES } from '../lib/seedData/aauaRoutes';

export function useRoutes() {
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const routesRef = ref(database, 'routes');
    const unsubscribe = onValue(routesRef, (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<RouteRecord, 'id'>> | null;
      const list = value
        ? Object.entries(value).map(([id, data]) => ({ id, ...data }))
        : [];
      list.sort((a, b) => a.name.localeCompare(b.name));
      setRoutes(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const seedAauaRoutes = async () => {
    // Only fills in routes that don't already exist — safe to click again
    // after editing individual routes without clobbering those edits.
    const existingSnapshot = await get(ref(database, 'routes'));
    const existingIds = existingSnapshot.exists() ? Object.keys(existingSnapshot.val()) : [];

    const writes: Promise<void>[] = [];
    for (const [id, data] of Object.entries(AAUA_SEED_ROUTES)) {
      if (!existingIds.includes(id)) {
        writes.push(set(ref(database, `routes/${id}`), data));
      }
    }
    await Promise.all(writes);
  };

  const saveRoute = async (id: string | null, name: string, stopNames: string[]) => {
    const stops: RouteStop[] = stopNames
      .map((raw) => raw.trim())
      .filter(Boolean)
      .map((stopName, index) => ({ order: index + 1, name: stopName, lat: null, lng: null }));

    if (id) {
      await update(ref(database, `routes/${id}`), { name, stops });
    } else {
      const newRef = push(ref(database, 'routes'));
      await set(newRef, { name, direction: 'outbound', stops });
    }
  };

  const deleteRoute = async (id: string) => {
    await remove(ref(database, `routes/${id}`));
  };

  const saveStopCoordinates = async (routeId: string, stops: RouteStop[]) => {
    await update(ref(database, `routes/${routeId}`), { stops });
  };

  return { routes, loading, seedAauaRoutes, saveRoute, deleteRoute, saveStopCoordinates };
}
