'use client';

import { useEffect, useState } from 'react';
import { onValue, push, ref, set } from 'firebase/database';
import { database } from '../lib/firebase';
import type { NotificationRecord, NotificationTarget } from '../lib/types/notification';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(ref(database, 'notifications'), (snapshot) => {
      const value = snapshot.val() as Record<string, Omit<NotificationRecord, 'id'>> | null;
      const list = value ? Object.entries(value).map(([id, data]) => ({ id, ...data })) : [];
      list.sort((a, b) => b.createdAt - a.createdAt);
      setNotifications(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const send = async (title: string, message: string, target: NotificationTarget, createdBy: string) => {
    const newRef = push(ref(database, 'notifications'));
    await set(newRef, { title, message, target, createdBy, createdAt: Date.now() });
  };

  return { notifications, loading, send };
}
