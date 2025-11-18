import React, { useState } from 'react';
import { useApp } from '../store';
import { Button, Card, Badge } from '../components/Common';
import { Scan, MapPin, CheckCircle, XCircle, History, LogOut, Camera } from 'lucide-react';
import { Session } from '../types';

const StudentDashboard: React.FC = () => {
  const { currentUser, sessions, markAttendance, attendance, subjects, logout } = useApp();
  const [scanStep, setScanStep] = useState<'IDLE' | 'SCAN_LOC' | 'SCAN_DYN' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [statusMsg, setStatusMsg] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Filter sessions active right now
  const activeSessions = sessions.filter(s => s.isActive);

  const simulateScan = (type: 'LOC' | 'DYN') => {
      setStatusMsg("Accessing camera...");
      
      setTimeout(() => {
          if (type === 'LOC') {
              // Logic: Find the first active session and pretend we scanned its location QR
              const targetSession = activeSessions[0];
              if (!targetSession) {
                  setScanStep('ERROR');
                  setStatusMsg("No active sessions found nearby.");
                  return;
              }
              
              // Verify GPS (Simulated)
              navigator.geolocation.getCurrentPosition(
                  (pos) => {
                      // Calculate distance (Mocked: Always success for demo)
                      const dist = 0; // Assume perfect match
                      if (dist <= 50) { // 50m radius
                          setCurrentSessionId(targetSession.id);
                          setScanStep('SCAN_DYN');
                          setStatusMsg("Location Verified! Scan Dynamic QR now.");
                      } else {
                          setScanStep('ERROR');
                          setStatusMsg("Location mismatch. You are too far from the classroom.");
                      }
                  },
                  (err) => {
                      // Fallback for demo
                      setCurrentSessionId(targetSession.id);
                      setScanStep('SCAN_DYN');
                      setStatusMsg("GPS Simulated. Scan Dynamic QR now.");
                  }
              );

          } else if (type === 'DYN') {
              if (!currentSessionId) return;
              
              // Simulate scanning the dynamic token
              const session = sessions.find(s => s.id === currentSessionId);
              if (session && session.isActive) {
                  markAttendance(session.id, currentUser!.id);
                  setScanStep('SUCCESS');
                  setStatusMsg("Attendance Marked Successfully!");
              } else {
                  setScanStep('ERROR');
                  setStatusMsg("Session expired or invalid token.");
              }
          }
      }, 1500); // Fake scan delay
  };

  const resetScan = () => {
      setScanStep('IDLE');
      setStatusMsg('');
      setCurrentSessionId(null);
  };

  const myHistory = attendance.filter(a => a.studentId === currentUser?.id).sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="max-w-lg mx-auto pb-20">
       <div className="flex justify-between items-center mb-6">
           <div>
             <h1 className="text-xl font-bold text-slate-900">Hi, {currentUser?.name}</h1>
             <p className="text-xs text-slate-500">Computer Science • Sem 4</p>
           </div>
           <Button variant="secondary" onClick={logout} className="p-2 text-red-500 hover:bg-red-50 border-none">
               <LogOut size={20} />
           </Button>
       </div>

       {/* Scanner Area */}
       <Card className="mb-6 bg-slate-900 text-white border-none overflow-hidden relative min-h-[300px] flex flex-col items-center justify-center">
           {scanStep === 'IDLE' && (
               <div className="text-center">
                   <div className="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30 animate-pulse">
                       <Scan size={40} />
                   </div>
                   <h2 className="text-xl font-bold mb-2">Mark Attendance</h2>
                   <p className="text-slate-400 text-sm mb-6">Ensure you are inside the class</p>
                   <Button onClick={() => simulateScan('LOC')} className="bg-white text-indigo-900 hover:bg-indigo-50 w-full">
                       <Camera size={18} /> Scan Location QR
                   </Button>
               </div>
           )}

           {scanStep === 'SCAN_LOC' && (
               <div className="text-center">
                   <div className="text-indigo-400 mb-4 animate-spin">
                       <Scan size={48} />
                   </div>
                   <p>Verifying Location & GPS...</p>
               </div>
           )}

           {scanStep === 'SCAN_DYN' && (
               <div className="text-center w-full px-6">
                   <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                       <MapPin size={32} />
                   </div>
                   <h2 className="text-lg font-bold text-green-400 mb-2">Location Verified</h2>
                   <p className="text-slate-300 text-sm mb-6">Step 2: Scan the changing QR code on the projector.</p>
                   <Button onClick={() => simulateScan('DYN')} className="bg-white text-green-800 hover:bg-green-50 w-full">
                       <Camera size={18} /> Scan Dynamic Code
                   </Button>
               </div>
           )}

            {scanStep === 'SUCCESS' && (
               <div className="text-center">
                   <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                       <CheckCircle size={48} />
                   </div>
                   <h2 className="text-2xl font-bold text-white mb-2">Present!</h2>
                   <p className="text-green-200 mb-6">{statusMsg}</p>
                   <Button onClick={resetScan} variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                       Done
                   </Button>
               </div>
           )}

           {scanStep === 'ERROR' && (
               <div className="text-center">
                   <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                       <XCircle size={48} />
                   </div>
                   <h2 className="text-xl font-bold text-white mb-2">Failed</h2>
                   <p className="text-red-200 mb-6">{statusMsg}</p>
                   <Button onClick={resetScan} variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                       Try Again
                   </Button>
               </div>
           )}
       </Card>

       {/* Recent History */}
       <div className="mb-4 flex items-center gap-2 text-slate-800 font-semibold">
           <History size={18} /> Recent Activity
       </div>
       
       <div className="space-y-3">
           {myHistory.length === 0 ? (
               <div className="text-center text-slate-400 py-4 text-sm bg-white rounded-xl border border-slate-100">No records found</div>
           ) : (
               myHistory.map(record => {
                   const session = sessions.find(s => s.id === record.sessionId);
                   const subject = subjects.find(s => s.id === session?.subjectId);
                   return (
                       <div key={record.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-center">
                           <div>
                               <div className="font-bold text-slate-800">{subject?.name || 'Unknown Class'}</div>
                               <div className="text-xs text-slate-500">{new Date(record.timestamp).toLocaleDateString()} • {new Date(record.timestamp).toLocaleTimeString()}</div>
                           </div>
                           <Badge color="green">Present</Badge>
                       </div>
                   );
               })
           )}
       </div>
    </div>
  );
};

export default StudentDashboard;