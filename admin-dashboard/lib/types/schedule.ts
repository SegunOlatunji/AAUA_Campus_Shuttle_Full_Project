export interface ScheduleRecord {
  id: string;
  routeId: string;
  shuttleId: string;
  driverId: string;
  departureTime: string; // "08:00"
  daysOfWeek: string[]; // ["Mon","Tue",...]
  isActive: boolean;
}

export const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;
