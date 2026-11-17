'use client';

import { useEffect, useState } from 'react';
import { onValue, push, ref, remove, set, update } from 'firebase/database';
import { database } from '../lib/firebase';
import type { ScheduleRecord } from '../lib/types/schedule';

export interface ScheduleFormInput {
  routeId: string;
  shuttleId: string;
  driverId: string;
  departureTime: string;
  daysOfWeek: string[];
  isActive: boolean;
}

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

  const createSchedule = async (input: ScheduleFormInput) => {
    const newRef = push(ref(database, 'schedules'));
    await set(newRef, input);
  };

  const updateSchedule = async (id: string, input: ScheduleFormInput) => {
    await update(ref(database, `schedules/${id}`), input);
  };

  const deleteSchedule = async (id: string) => {
    await remove(ref(database, `schedules/${id}`));
  };

  return { schedules, loading, createSchedule, updateSchedule, deleteSchedule };
}
