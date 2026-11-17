export interface ScheduleRecord {
  id: string;
  routeId: string;
  shuttleId: string;
  driverId: string;
  departureTime: string;
  daysOfWeek: string[];
  isActive: boolean;
}
