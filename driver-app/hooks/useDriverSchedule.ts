import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../lib/firebase';
import { useDriverAuth } from './useDriverAuth';
import type { ScheduleRecord } from '../lib/types/schedule';

export function useDriverSchedule() {
  const { profile } = useDriverAuth();
  const [schedules, setSchedules] = useState<ScheduleRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) {
      setSchedules([]);
      setLoading(false);
      return;
    }

    const unsubscribe = onValue(ref(database, 'schedules'), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<ScheduleRecord, 'id'>> | null;
      const all = value ? Object.entries(value).map(([id, data]) => ({ id, ...data })) : [];
      const mine = all
        .filter((s) => s.driverId === profile.uid && s.isActive)
        .sort((a, b) => a.departureTime.localeCompare(b.departureTime));
      setSchedules(mine);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  return { schedules, loading };
}
