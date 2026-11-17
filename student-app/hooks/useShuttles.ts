import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../lib/firebase';
import type { ShuttleRecord } from '../lib/types/shuttle';

export function useShuttles() {
  const [shuttles, setShuttles] = useState<ShuttleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(ref(database, 'shuttles'), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<ShuttleRecord, 'id'>> | null;
      setShuttles(value ? Object.entries(value).map(([id, data]) => ({ id, ...data })) : []);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { shuttles, loading };
}
