export type TripStatus = 'idle' | 'in_progress';

export interface ShuttleLocation {
  lat: number;
  lng: number;
  updatedAt: number;
}

export interface ShuttleRecord {
  id: string;
  plateNumber: string;
  capacity: number;
  availableSeats: number;
  assignedDriverId: string | null;
  assignedRouteId: string | null;
  status: 'active' | 'inactive' | 'maintenance';
  tripStatus: TripStatus;
  currentLocation: ShuttleLocation | null;
}
