// Mirrors users/drivers/{uid} in the Firebase Realtime Database schema
// (Addendum 1, Section 2 — phone-based auth with an approval gate).
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface DriverProfile {
  uid: string;
  phone: string;
  fullName: string;
  approvalStatus: ApprovalStatus;
  assignedShuttleId: string | null;
  status: 'online' | 'offline';
  createdAt: number;
}
