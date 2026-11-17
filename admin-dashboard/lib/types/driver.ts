export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface DriverRecord {
  uid: string;
  phone: string;
  fullName: string;
  approvalStatus: ApprovalStatus;
  assignedShuttleId: string | null;
  status: 'online' | 'offline';
  createdAt: number;
}
