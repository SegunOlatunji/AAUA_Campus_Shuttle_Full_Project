// Mirrors users/students/{uid} in the Firebase Realtime Database schema (Phase 2).
export interface StudentProfile {
  uid: string;
  fullName: string;
  email: string;
  matricNumber: string;
  phone: string;
  createdAt: number;
  fcmToken?: string;
  isActive?: boolean; // absent is treated as true — see admin Students page
}
