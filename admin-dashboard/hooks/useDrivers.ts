'use client';

import { useEffect, useState } from 'react';
import { onValue, ref, update } from 'firebase/database';
import { database } from '../lib/firebase';
import type { DriverRecord } from '../lib/types/driver';

export function useDrivers() {
  const [drivers, setDrivers] = useState<DriverRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const driversRef = ref(database, 'users/drivers');
    const unsubscribe = onValue(driversRef, (snapshot) => {
      const value = snapshot.val() as Record<string, DriverRecord> | null;
      const list = value ? Object.values(value) : [];
      // Newest first — the approval queue cares most about recent signups.
      list.sort((a, b) => b.createdAt - a.createdAt);
      setDrivers(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const approveDriver = async (uid: string, assignedShuttleId: string) => {
    await update(ref(database, `users/drivers/${uid}`), {
      approvalStatus: 'approved',
      assignedShuttleId,
    });
  };

  const rejectDriver = async (uid: string) => {
    await update(ref(database, `users/drivers/${uid}`), {
      approvalStatus: 'rejected',
      assignedShuttleId: null,
    });
  };

  return { drivers, loading, approveDriver, rejectDriver };
}
