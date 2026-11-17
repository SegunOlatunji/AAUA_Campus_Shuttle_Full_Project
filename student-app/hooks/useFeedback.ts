import { push, ref, set } from 'firebase/database';
import { database } from '../lib/firebase';

export async function submitFeedback(studentId: string, rating: number, comment: string): Promise<void> {
  const newRef = push(ref(database, 'feedback'));
  await set(newRef, {
    studentId,
    tripId: null,
    rating,
    comment: comment.trim(),
    createdAt: Date.now(),
  });
}
