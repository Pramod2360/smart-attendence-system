import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useMemo } from 'react';
import { User, UserRole, Department, Subject, Session, AttendanceRecord, View } from './types';

// Mock Initial Data
const MOCK_ADMIN: User = { id: 'adm_1', name: 'System Admin', email: 'admin@college.edu', role: UserRole.ADMIN, mfaEnabled: true };
const MOCK_FACULTY: User = { id: 'fac_1', name: 'Dr. Smith', email: 'smith@college.edu', role: UserRole.FACULTY, department: 'CS' };
const MOCK_STUDENT: User = { id: 'stu_1', name: 'John Doe', email: 'john@college.edu', role: UserRole.STUDENT, department: 'CS' };

export interface LoginResult {
  success: boolean;
  message?: string;
  mfaRequired?: boolean;
}

export interface AttendanceResult {
    success: boolean;
    message: string;
}

interface AppState {
  currentUser: User | null;
  currentView: View;
  users: User[];
  departments: Department[];
  subjects: Subject[];
  sessions: Session[];
  attendance: AttendanceRecord[];
  publicIp: string; // Added for API integration
  login: (role: UserRole, email: string) => LoginResult;
  verifyMfa: (code: string) => LoginResult;
  logout: () => void;
  registerUser: (user: User) => void;
  createSession: (session: Session) => void;
  endSession: (sessionId: string) => void;
  updateSessionToken: (sessionId: string, token: string) => void;
  markAttendance: (sessionId: string, studentId: string, scannedToken: string) => AttendanceResult;
  navigateTo: (view: View) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pendingUser, setPendingUser] = useState<User | null>(null); // For MFA flow
  const [currentView, setCurrentView] = useState<View>(View.LOGIN);
  const [publicIp, setPublicIp] = useState<string>('Detecting...');
  
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

  // Load fingerprint and Fetch IP (Free API)
  useEffect(() => {
    const storedFingerprint = localStorage.getItem('device_fingerprint');
    if (!storedFingerprint) {
      localStorage.setItem('device_fingerprint', `dev_${Math.random().toString(36).substr(2, 9)}`);
    }

    // Integration: IPify API
    fetch('https://api.ipify.org?format=json')
      .then(res => res.json())
      .then(data => setPublicIp(data.ip))
      .catch(err => {
        console.error("IP API Error:", err);
        setPublicIp('Offline / Restricted');
      });
  }, []);

  const navigateTo = useCallback((view: View) => setCurrentView(view), []);

  const registerUser = useCallback((user: User) => {
    setUsers(prev => [...prev, user]);
  }, []);

  const createSession = useCallback((session: Session) => {
    setSessions(prev => [...prev, session]);
  }, []);

  const endSession = useCallback((sessionId: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, isActive: false, endTime: Date.now() } : s));
  }, []);

  const updateSessionToken = useCallback((sessionId: string, token: string) => {
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, currentDynamicToken: token } : s));
  }, []);

  const markAttendance = useCallback((sessionId: string, studentId: string, scannedToken: string): AttendanceResult => {
    // 1. Find Session
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return { success: false, message: "Session not found." };
    
    // 2. Check Active
    if (!session.isActive) return { success: false, message: "Session has ended." };

    // 3. SECURITY CHECK: Validate Token
    if (session.currentDynamicToken !== scannedToken) {
        return { success: false, message: "Invalid or Expired QR Code. Please scan the current code." };
    }

    let alreadyMarked = false;
    setAttendance(prev => {
        // Check if already marked to prevent duplicates
        if (prev.some(a => a.sessionId === sessionId && a.studentId === studentId)) {
            alreadyMarked = true;
            return prev;
        }
        
        const record: AttendanceRecord = {
          id: `att_${Date.now()}`,
          sessionId,
          studentId,
          timestamp: Date.now(),
          status: 'PRESENT'
        };
        return [...prev, record];
    });

    if (alreadyMarked) return { success: false, message: "Attendance already marked for this session." };

    return { success: true, message: "Attendance marked successfully!" };
  }, [sessions]);

  // Helper to finalize login (after MFA or if MFA not required)
  const processLoginSuccess = useCallback((user: User): LoginResult => {
      // Device Fingerprint Check for Students
      if (user.role === UserRole.STUDENT) {
        const currentDevice = localStorage.getItem('device_fingerprint');
        
        // Case 1: User is already bound to a device
        if (user.deviceId) {
            if (user.deviceId !== currentDevice) {
                return { 
                    success: false, 
                    message: "Access Denied: This account is bound to a different device. To prevent proxy attendance, please use your registered device." 
                };
            }
        } 
        // Case 2: First time login - bind device
        else {
           const updatedUser = { ...user, deviceId: currentDevice || 'unknown' };
           setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
           user = updatedUser;
           // Don't return yet, need to set state and navigate
        }
      }
      
      setCurrentUser(user);
      setPendingUser(null);
      
      switch(user.role) {
        case UserRole.ADMIN: navigateTo(View.ADMIN_DASHBOARD); break;
        case UserRole.FACULTY: navigateTo(View.FACULTY_DASHBOARD); break;
        case UserRole.STUDENT: navigateTo(View.STUDENT_DASHBOARD); break;
      }
      
      // Specific success message for student binding
      if (user.role === UserRole.STUDENT && !user.deviceId) {
          return { success: true, message: "Device registered successfully." };
      }
      return { success: true };
  }, [users, navigateTo]);

  const login = useCallback((role: UserRole, email: string): LoginResult => {
    const user = users.find(u => u.email === email && u.role === role);
    if (user) {
      if (user.mfaEnabled) {
          setPendingUser(user);
          return { success: true, mfaRequired: true };
      }
      return processLoginSuccess(user);
    }
    return { success: false, message: "User not found. Please check your role and email." };
  }, [users, processLoginSuccess]);

  const verifyMfa = useCallback((code: string): LoginResult => {
      if (!pendingUser) return { success: false, message: "Session timed out. Please login again." };
      
      // Mock Validation - In real app, verify against secret
      if (code === "123456") {
          return processLoginSuccess(pendingUser);
      }
      
      return { success: false, message: "Invalid authentication code." };
  }, [pendingUser, processLoginSuccess]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    setPendingUser(null);
    navigateTo(View.LOGIN);
  }, [navigateTo]);

  const value = useMemo(() => ({
      currentUser, currentView, users, departments, subjects, sessions, attendance, publicIp,
      login, verifyMfa, logout, navigateTo, registerUser, createSession, endSession, updateSessionToken, markAttendance
  }), [currentUser, currentView, users, departments, subjects, sessions, attendance, publicIp, login, verifyMfa, logout, navigateTo, registerUser, createSession, endSession, updateSessionToken, markAttendance]);

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};