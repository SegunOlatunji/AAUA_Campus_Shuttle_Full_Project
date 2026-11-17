export type NotificationTarget = 'all' | 'students' | 'drivers' | { routeId: string };

export interface NotificationRecord {
  id: string;
  title: string;
  message: string;
  target: NotificationTarget;
  createdBy: string;
  createdAt: number;
}
