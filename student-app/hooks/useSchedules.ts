import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../lib/firebase';
import type { ScheduleRecord } from '../lib/types/schedule';

export function useSchedules() {
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(ref(database, 'schedules'), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<ScheduleRecord, 'id'>> | null;
      const list = value ? Object.entries(value).map(([id, data]) => ({ id, ...data })) : [];
      list.sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      setSchedules(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return { schedules, loading };
}
