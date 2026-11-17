export type ShuttleStatus = 'active' | 'inactive' | 'maintenance';
export type TripStatus = 'idle' | 'in_progress';

export interface ShuttleRecord {
  id: string;
  plateNumber: string;
  capacity: number;
  availableSeats: number;
  assignedDriverId: string | null;
  assignedRouteId: string | null;
  status: ShuttleStatus;
  tripStatus: TripStatus;
  currentLocation?: { lat: number; lng: number; updatedAt: number } | null;
}
