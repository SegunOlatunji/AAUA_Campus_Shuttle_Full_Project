import { push, ref, set, update } from 'firebase/database';
import { database } from '../lib/firebase';

interface CreateMatchRequestInput {
  studentId: string;
  originStopName: string;
  destinationStopName: string;
  matchedShuttleId: string;
  estimatedMinutes: number;
}

// Logs each match to match_requests (Addendum 2, Section 4) — this is what
// gives Objective 3 real, measurable data later: requestedAt vs
// actualArrivalAt is the true wait time, and estimatedMinutes vs the actual
// gap shows how accurate the matching engine's predictions are.
export async function createMatchRequest(input: CreateMatchRequestInput): Promise<string> {
  const requestRef = push(ref(database, 'match_requests'));
  await set(requestRef, {
    studentId: input.studentId,
    originStopId: input.originStopName,
    destinationStopId: input.destinationStopName,
    matchedShuttleId: input.matchedShuttleId,
    estimatedMinutes: input.estimatedMinutes,
    requestedAt: Date.now(),
    actualArrivalAt: null,
  });
  return requestRef.key as string;
}

export async function markMatchRequestArrived(requestId: string): Promise<void> {
  await update(ref(database, `match_requests/${requestId}`), {
    actualArrivalAt: Date.now(),
  });
}
