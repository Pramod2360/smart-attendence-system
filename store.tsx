import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole, Department, Subject, Session, AttendanceRecord, View } from './types';

// Mock Initial Data
const MOCK_ADMIN: User = { id: 'adm_1', name: 'System Admin', email: 'admin@college.edu', role: UserRole.ADMIN };
const MOCK_FACULTY: User = { id: 'fac_1', name: 'Dr. Smith', email: 'smith@college.edu', role: UserRole.FACULTY, department: 'CS' };
const MOCK_STUDENT: User = { id: 'stu_1', name: 'John Doe', email: 'john@college.edu', role: UserRole.STUDENT, department: 'CS', deviceId: 'device_123' };

interface AppState {
  currentUser: User | null;
  currentView: View;
  users: User[];
  departments: Department[];
  subjects: Subject[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  login: (role: UserRole, email: string) => boolean;
  logout: () => void;
  registerUser: (user: User) => void;
  createSession: (session: Session) => void;
  endSession: (sessionId: string) => void;
  updateSessionToken: (sessionId: string, token: string) => void;
  markAttendance: (sessionId: string, studentId: string) => void;
  navigateTo: (view: View) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  
  const [users, setUsers] = useState<User[]>([MOCK_ADMIN, MOCK_FACULTY, MOCK_STUDENT]);
  const [departments, setDepartments] = useState<Department[]>([
    { id: 'CS', name: 'Computer Science' },
    { id: 'ECE', name: 'Electronics' }
  ]);
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: 'sub_1', name: 'Data Structures', code: 'CS101', departmentId: 'CS' },
    { id: 'sub_2', name: 'Digital Logic', code: 'ECE101', departmentId: 'ECE' }
  ]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  // Load fingerprint
  useEffect(() => {
    const storedFingerprint = localStorage.getItem('device_fingerprint');
    if (!storedFingerprint) {
      localStorage.setItem('device_fingerprint', `dev_${Math.random().toString(36).substr(2, 9)}`);
    }
  }, []);

  const login = (role: UserRole, email: string) => {
    const user = users.find(u => u.email === email && u.role === role);
    if (user) {
      // Device Fingerprint Check for Students
      if (role === UserRole.STUDENT) {
        const currentDevice = localStorage.getItem('device_fingerprint');
        if (user.deviceId && user.deviceId !== currentDevice) {
          alert("Access Denied: Unrecognized Device. Please use your registered device.");
          return false;
        }
        // Bind device if first login (Simulated)
        if (!user.deviceId) {
           const updatedUser = { ...user, deviceId: currentDevice || 'unknown' };
           setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
           setCurrentUser(updatedUser);
           navigateTo(View.STUDENT_DASHBOARD);
           return true;
        }
      }
      
      setCurrentUser(user);
      switch(role) {
        case UserRole.ADMIN: navigateTo(View.ADMIN_DASHBOARD); break;
        case UserRole.FACULTY: navigateTo(View.FACULTY_DASHBOARD); break;
        case UserRole.STUDENT: navigateTo(View.STUDENT_DASHBOARD); break;
      }
      return true;
    }
    alert("User not found");
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    navigateTo(View.LOGIN);
  };

  const navigateTo = (view: View) => setCurrentView(view);

  const registerUser = (user: User) => {
    setUsers([...users, user]);
  };

  const createSession = (session: Session) => {
    setSessions([...sessions, session]);
  };

  const endSession = (sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isActive: false, endTime: Date.now() } : s));
  };

  const updateSessionToken = (sessionId: string, token: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, currentDynamicToken: token } : s));
  };

  const markAttendance = (sessionId: string, studentId: string) => {
    // Check if already marked
    if (attendance.some(a => a.sessionId === sessionId && a.studentId === studentId)) return;

    const record: AttendanceRecord = {
      id: `att_${Date.now()}`,
      sessionId,
      studentId,
      timestamp: Date.now(),
      status: 'PRESENT'
    };
    setAttendance([...attendance, record]);
  };

  return (
    <AppContext.Provider value={{
      currentUser, currentView, users, departments, subjects, sessions, attendance,
      login, logout, navigateTo, registerUser, createSession, endSession, updateSessionToken, markAttendance
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};