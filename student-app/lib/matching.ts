import type { RouteRecord, RouteStop } from './types/route';
import type { ShuttleRecord } from './types/shuttle';

export interface MatchCandidate {
  shuttleId: string;
  routeId: string;
  routeName: string;
  plateNumber: string;
  estimatedMinutes: number;
  availableSeats: number;
  capacity: number;
  nearestStopName: string | null;
}

const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
  return (deg * Math.PI) / 180;
}

// Straight-line distance — good enough to find the *nearest* stop, which is
// all this needs; it doesn't need to be accurate for absolute distances.
function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
}

/** Index of the stop nearest the shuttle's live GPS position, or null if the
 * shuttle has no location yet or no stops on this route have been pinned. */
export function findNearestStopIndex(
  stops: RouteStop[],
  shuttleLat: number,
  shuttleLng: number
): number | null {
  let nearestIndex: number | null = null;
  let nearestDistance = Infinity;

  stops.forEach((stop, index) => {
    if (stop.lat === null || stop.lng === null) return;
    const distance = haversineKm(shuttleLat, shuttleLng, stop.lat, stop.lng);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestIndex = index;
    }
  });

  return nearestIndex;
}

/**
 * Addendum 2 matching algorithm:
 * 1. Eligible routes contain both stops, with destination after origin.
 * 2. Eligible shuttles are actively on trip on one of those routes.
 * 3. ETA = stops remaining before reaching the origin stop x avgMinutesPerStop.
 * 4. Ranked ascending by ETA.
 */
export function findMatches(
  routes: RouteRecord[],
  shuttles: ShuttleRecord[],
  originStopName: string,
  destinationStopName: string,
  avgMinutesPerStop: number
): MatchCandidate[] {
  const eligibleRoutes = routes
    .map((route) => {
      const originIndex = route.stops.findIndex((s) => s.name === originStopName);
      const destinationIndex = route.stops.findIndex((s) => s.name === destinationStopName);
      if (originIndex === -1 || destinationIndex === -1 || destinationIndex <= originIndex) {
        return null;
      }
      return { route, originIndex };
    })
    .filter((r): r is { route: RouteRecord; originIndex: number } => r !== null);

  const candidates: MatchCandidate[] = [];

  for (const { route, originIndex } of eligibleRoutes) {
    const activeShuttles = shuttles.filter(
      (s) => s.tripStatus === 'in_progress' && s.assignedRouteId === route.id
    );

    for (const shuttle of activeShuttles) {
      let stopsRemaining: number;
      let nearestStopName: string | null = null;

      if (shuttle.currentLocation) {
        const nearestIndex = findNearestStopIndex(
          route.stops,
          shuttle.currentLocation.lat,
          shuttle.currentLocation.lng
        );
        if (nearestIndex !== null) {
          nearestStopName = route.stops[nearestIndex].name;
          // A shuttle already past the student's stop on this run isn't a
          // useful match — it won't come back around until the next loop,
          // which this simple model doesn't schedule for.
          if (nearestIndex > originIndex) continue;
          stopsRemaining = originIndex - nearestIndex;
        } else {
          // No pinned stops near the shuttle yet (coordinates not set) —
          // fall back to "somewhere on the route, unknown position".
          stopsRemaining = originIndex;
        }
      } else {
        // No live location yet (just started, or GPS not acquired) — use a
        // conservative full-route estimate rather than excluding it.
        stopsRemaining = originIndex;
      }

      candidates.push({
        shuttleId: shuttle.id,
        routeId: route.id,
        routeName: route.name,
        plateNumber: shuttle.plateNumber,
        estimatedMinutes: Math.max(stopsRemaining, 0) * avgMinutesPerStop,
        availableSeats: shuttle.availableSeats,
        capacity: shuttle.capacity,
        nearestStopName,
      });
    }
  }

  return candidates.sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
}

/** All unique stop names across every route, alphabetically — used to
 * populate the From/To pickers on the Dashboard. */
export function getAllStopNames(routes: RouteRecord[]): string[] {
  const names = new Set<string>();
  routes.forEach((route) => route.stops.forEach((stop) => names.add(stop.name)));
  return Array.from(names).sort((a, b) => a.localeCompare(b));
}
