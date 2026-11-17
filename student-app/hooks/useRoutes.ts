import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../lib/firebase';
import type { RouteRecord } from '../lib/types/route';

export function useRoutes() {
  const [routes, setRoutes] = useState<RouteRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(ref(database, 'routes'), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<RouteRecord, 'id'>> | null;
      setRoutes(value ? Object.entries(value).map(([id, data]) => ({ id, ...data })) : []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { routes, loading };
}
