import React, { useState } from 'react';
import { useApp } from '../store';
import { Button, Card, Badge } from '../components/Common';
import { Scan, MapPin, CheckCircle, XCircle, History, LogOut, Camera, ShieldAlert } from 'lucide-react';
import { Session } from '../types';

const StudentDashboard: React.FC = () => {
  const { currentUser, sessions, markAttendance, attendance, subjects, logout } = useApp();
  const [scanStep, setScanStep] = useState<'IDLE' | 'SCAN_LOC' | 'SCAN_DYN' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [statusMsg, setStatusMsg] = useState('');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);

  // Filter sessions active right now
  const activeSessions = sessions.filter(s => s.isActive);

  const simulateScan = (type: 'LOC' | 'DYN') => {
      setStatusMsg(type === 'LOC' ? "Scanning Location Code..." : "Scanning Dynamic Token...");
      
      setTimeout(() => {
          if (type === 'LOC') {
              // Logic: Find the first active session and pretend we scanned its location QR
              const targetSession = activeSessions[0];
              if (!targetSession) {
                  setScanStep('ERROR');
                  setStatusMsg("No active class sessions found. Please wait for faculty to start.");
                  return;
              }
              
              // Verify GPS (Simulated)
              if (!navigator.geolocation) {
                   setScanStep('ERROR');
                   setStatusMsg("GPS required but not supported.");
                   return;
              }

              navigator.geolocation.getCurrentPosition(
                  (pos) => {
                      // In a real app, we calculate haversine distance between pos.coords and targetSession.locationLat
                      // For this demo, we assume success if Geolocation API works
                      setCurrentSessionId(targetSession.id);
                      setScanStep('SCAN_DYN');
                      setStatusMsg("Location Verified! Scan the changing QR code now.");
                  },
                  (err) => {
                      // Fallback for demo if User Denies GPS or is on non-secure origin
                      console.warn("GPS Failed", err);
                      setCurrentSessionId(targetSession.id);
                      setScanStep('SCAN_DYN');
                      setStatusMsg("GPS Check Skipped (Demo Mode). Scan Dynamic QR now.");
                  }
              );

          } else if (type === 'DYN') {
              if (!currentSessionId) return;
              
              const session = sessions.find(s => s.id === currentSessionId);
              
              if (session && session.isActive && session.currentDynamicToken) {
                  // Simulate reading the ACTUAL current token from the "Projector"
                  // This is the critical security step: The student's device "reads" the token that is currently valid
                  const scannedToken = session.currentDynamicToken; 

                  const result = markAttendance(session.id, currentUser!.id, scannedToken);
                  
                  if (result.success) {
                      setScanStep('SUCCESS');
                      setStatusMsg(result.message);
                  } else {
                      setScanStep('ERROR');
                      setStatusMsg(result.message);
                  }
              } else {
                  setScanStep('ERROR');
                  setStatusMsg("Session expired or invalid.");
              }
          }
      }, 2000); // 2 second scan delay for realism
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
       <Card className="mb-6 bg-slate-900 text-white border-none overflow-hidden relative min-h-[360px] flex flex-col items-center justify-center shadow-2xl">
           
           {/* Background Viewfinder Effect */}
           {(scanStep === 'IDLE' || scanStep === 'SCAN_LOC' || scanStep === 'SCAN_DYN') && (
               <div className="absolute inset-0 opacity-20 pointer-events-none">
                   <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-white rounded-tl-xl"></div>
                   <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-white rounded-tr-xl"></div>
                   <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-white rounded-bl-xl"></div>
                   <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-white rounded-br-xl"></div>
               </div>
           )}

           {/* Laser Animation during Scanning */}
           {(statusMsg.includes("Scanning")) && (
               <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="w-full h-1 bg-red-500/80 shadow-[0_0_15px_rgba(239,68,68,0.8)] animate-scan-laser absolute top-0"></div>
               </div>
           )}

           <div className="relative z-10 w-full px-6">
                {scanStep === 'IDLE' && (
                    <div className="text-center animate-fade-in">
                        <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm ring-1 ring-white/20">
                            <Scan size={48} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Scan Attendance</h2>
                        <p className="text-slate-400 text-sm mb-8 px-4">Ensure you are seated inside the classroom before scanning.</p>
                        <Button onClick={() => simulateScan('LOC')} className="bg-indigo-600 text-white hover:bg-indigo-500 w-full py-4 text-lg font-semibold shadow-lg shadow-indigo-500/30 border-none">
                            <Camera size={20} /> Start Scan
                        </Button>
                    </div>
                )}

                {scanStep === 'SCAN_LOC' && (
                    <div className="text-center">
                        <div className="text-indigo-400 mb-4 animate-pulse">
                            <MapPin size={56} />
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Verifying Location...</h3>
                        <p className="text-sm text-slate-400">Checking GPS Coordinates</p>
                    </div>
                )}

                {scanStep === 'SCAN_DYN' && (
                    <div className="text-center w-full">
                        <div className="w-20 h-20 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-6 border border-green-500/50">
                            <CheckCircle size={40} />
                        </div>
                        <h2 className="text-xl font-bold text-white mb-2">Location Verified</h2>
                        <p className="text-slate-300 text-sm mb-8">Step 2: Point camera at the projector screen.</p>
                        <Button onClick={() => simulateScan('DYN')} className="bg-white text-slate-900 hover:bg-slate-200 w-full py-4 text-lg font-bold">
                            <Scan size={20} /> Scan Dynamic Token
                        </Button>
                    </div>
                )}

                {scanStep === 'SUCCESS' && (
                    <div className="text-center animate-scale-in">
                        <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/50">
                            <CheckCircle size={64} className="text-white" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mb-3">Present!</h2>
                        <p className="text-green-200 mb-8 font-medium">{statusMsg}</p>
                        <Button onClick={resetScan} variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 w-full py-3">
                            Done
                        </Button>
                    </div>
                )}

                {scanStep === 'ERROR' && (
                    <div className="text-center animate-shake">
                        <div className="w-24 h-24 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-red-500/50">
                            <XCircle size={64} className="text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Validation Failed</h2>
                        <p className="text-red-100 mb-8 px-4">{statusMsg}</p>
                        <Button onClick={resetScan} variant="secondary" className="bg-white/10 text-white border-white/20 hover:bg-white/20 w-full py-3">
                            Try Again
                        </Button>
                    </div>
                )}
           </div>
       </Card>

       {/* Recent History */}
       <div className="mb-4 flex items-center gap-2 text-slate-800 font-semibold">
           <History size={18} /> Recent Activity
       </div>
       
       <div className="space-y-3">
           {myHistory.length === 0 ? (
               <div className="text-center text-slate-400 py-8 text-sm bg-white rounded-xl border border-slate-100">
                   No records found
               </div>
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