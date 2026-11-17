'use client';

import { useEffect, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { database } from '../lib/firebase';

interface TripRecord {
  routeId: string;
  shuttleId: string;
  driverId: string;
  startTime: number;
  endTime: number | null;
}

interface MatchRequestRecord {
  studentId: string;
  originStopId: string;
  destinationStopId: string;
  matchedShuttleId: string;
  estimatedMinutes: number;
  requestedAt: number;
  actualArrivalAt: number | null;
}

interface FeedbackRecord {
  studentId: string;
  tripId: string | null;
  rating: number;
  comment: string;
  createdAt: number;
}

export interface ReportMetrics {
  totalTrips: number;
  tripsToday: number;
  completedMatchRequests: number;
  averageActualWaitMinutes: number | null;
  averageEstimateErrorMinutes: number | null;
  averageFeedbackRating: number | null;
  feedbackCount: number;
  tripsByRoute: { routeId: string; count: number }[];
}

function isToday(timestamp: number): boolean {
  const date = new Date(timestamp);
  const now = new Date();
  return (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  );
}

export function useReports() {
  const [trips, setTrips] = useState<TripRecord[]>([]);
  const [matchRequests, setMatchRequests] = useState<MatchRequestRecord[]>([]);
  const [feedback, setFeedback] = useState<FeedbackRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubTrips = onValue(ref(database, 'trip_history'), (snapshot) => {
      const value = snapshot.val() as Record<string, TripRecord> | null;
      setTrips(value ? Object.values(value) : []);
    });
    const unsubMatches = onValue(ref(database, 'match_requests'), (snapshot) => {
      const value = snapshot.val() as Record<string, MatchRequestRecord> | null;
      setMatchRequests(value ? Object.values(value) : []);
    });
    const unsubFeedback = onValue(ref(database, 'feedback'), (snapshot) => {
      const value = snapshot.val() as Record<string, FeedbackRecord> | null;
      setFeedback(value ? Object.values(value) : []);
      setLoading(false);
    });

    return () => {
      unsubTrips();
      unsubMatches();
      unsubFeedback();
    };
  }, []);

  const completed = matchRequests.filter((m) => m.actualArrivalAt !== null);

  const averageActualWaitMinutes =
    completed.length > 0
      ? completed.reduce((sum, m) => sum + (m.actualArrivalAt! - m.requestedAt) / 60000, 0) /
        completed.length
      : null;

  const averageEstimateErrorMinutes =
    completed.length > 0
      ? completed.reduce((sum, m) => {
          const actualMinutes = (m.actualArrivalAt! - m.requestedAt) / 60000;
          return sum + Math.abs(actualMinutes - m.estimatedMinutes);
        }, 0) / completed.length
      : null;

  const averageFeedbackRating =
    feedback.length > 0 ? feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length : null;

  const routeCounts = new Map<string, number>();
  trips.forEach((trip) => {
    routeCounts.set(trip.routeId, (routeCounts.get(trip.routeId) ?? 0) + 1);
  });
  const tripsByRoute = Array.from(routeCounts.entries())
    .map(([routeId, count]) => ({ routeId, count }))
    .sort((a, b) => b.count - a.count);

  const metrics: ReportMetrics = {
    totalTrips: trips.length,
    tripsToday: trips.filter((t) => isToday(t.startTime)).length,
    completedMatchRequests: completed.length,
    averageActualWaitMinutes,
    averageEstimateErrorMinutes,
    averageFeedbackRating,
    feedbackCount: feedback.length,
    tripsByRoute,
  };

  return { metrics, loading };
}
