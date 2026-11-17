import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../lib/firebase';
import type { NotificationRecord } from '../lib/types/notification';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(ref(database, 'notifications'), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<NotificationRecord, 'id'>> | null;
      const all = value ? Object.entries(value).map(([id, data]) => ({ id, ...data })) : [];
      // Students see broadcasts to "all", "students", and any route-specific
      // notice — there's no per-student route subscription yet, so
      // route-targeted notices are shown to everyone rather than hidden.
      const relevant = all.filter(
        (n) => n.target === 'all' || n.target === 'students' || typeof n.target === 'object'
      );
      relevant.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(relevant);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { notifications, loading };
}
