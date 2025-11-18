export enum UserRole {
  ADMIN = 'ADMIN',
  FACULTY = 'FACULTY',
  STUDENT = 'STUDENT',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  deviceId?: string; // For fingerprinting
}

export interface Department {
  id: string;
  name: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  departmentId: string;
}

export interface Session {
  id: string;
  facultyId: string;
  subjectId: string;
  startTime: number;
  endTime?: number; // Added for history tracking
  isActive: boolean;
  locationLat?: number;
  locationLng?: number;
  currentDynamicToken?: string; // The rotating token
}

export interface AttendanceRecord {
  id: string;
  sessionId: string;
  studentId: string;
  timestamp: number;
  status: 'PRESENT' | 'ABSENT';
}

// Navigation Types
export enum View {
  LOGIN = 'LOGIN',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD',
  FACULTY_DASHBOARD = 'FACULTY_DASHBOARD',
  STUDENT_DASHBOARD = 'STUDENT_DASHBOARD',
}