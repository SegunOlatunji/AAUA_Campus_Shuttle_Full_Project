export interface StudentRecord {
  uid: string;
  fullName: string;
  email: string;
  matricNumber: string;
  phone: string;
  createdAt: number;
  isActive: boolean; // defaults to true if absent — see useStudents
}
