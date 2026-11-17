'use client';

import { useEffect, useState } from 'react';
import { onValue, ref, update } from 'firebase/database';
import { database } from '../lib/firebase';
import type { StudentRecord } from '../lib/types/student';

// Students self-register (Phase 2 decision) — this hook is for viewing and
// deactivating only, not creating. FR-19 ("manage students") is satisfied
// via deactivation rather than admin-created accounts.
export function useStudents() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(ref(database, 'users/students'), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<StudentRecord, 'uid' | 'isActive'> & { isActive?: boolean }> | null;
      const list = value
        ? Object.entries(value).map(([uid, data]) => ({
            uid,
            ...data,
            isActive: data.isActive ?? true,
          }))
        : [];
      list.sort((a, b) => b.createdAt - a.createdAt);
      setStudents(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const setActive = async (uid: string, isActive: boolean) => {
    await update(ref(database, `users/students/${uid}`), { isActive });
  };

  return { students, loading, setActive };
}
