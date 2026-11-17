import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../lib/firebase';

const DEFAULT_AVG_MINUTES_PER_STOP = 2.5;

export function useAppSettings() {
  const [avgMinutesPerStop, setAvgMinutesPerStop] = useState(DEFAULT_AVG_MINUTES_PER_STOP);

  useEffect(() => {
    const unsubscribe = onValue(ref(database, 'settings/app/avgMinutesPerStop'), (snapshot) => {
      if (snapshot.exists()) {
        setAvgMinutesPerStop(snapshot.val() as number);
      }
    });
    return () => unsubscribe();
  }, []);

  return { avgMinutesPerStop };
}
