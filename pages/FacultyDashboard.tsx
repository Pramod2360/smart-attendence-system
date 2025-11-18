import React, { useState, useEffect } from 'react';
import { useApp } from '../store';
import { Button, Card, Badge } from '../components/Common';
import { QRCodeCanvas } from 'qrcode.react';
import { Play, Square, Users, Clock, MapPin, RefreshCw, LogOut, Calendar } from 'lucide-react';
import { Session } from '../types';

const FacultyDashboard: React.FC = () => {
  const { currentUser, subjects, sessions, attendance, createSession, endSession, updateSessionToken, logout } = useApp();
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.id);
  
  // Live Data
  const activeSession = sessions.find(s => s.id === activeSessionId);
  const sessionAttendance = activeSession ? attendance.filter(a => a.sessionId === activeSession.id) : [];
  
  // History Data
  const pastSessions = sessions
    .filter(s => s.facultyId === currentUser?.id && !s.isActive)
    .sort((a, b) => b.startTime - a.startTime);
  
  // Dynamic QR Rotation Logic
  useEffect(() => {
      let interval: ReturnType<typeof setInterval>;
      // Only run if session is active
      if (activeSessionId && activeSession?.isActive) {
          interval = window.setInterval(() => {
              // Token Format: prefix + timestamp + random_string
              const newToken = `dyn_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
              updateSessionToken(activeSessionId, newToken);
          }, 4000); // Rotate every 4 seconds
      }
      return () => {
        if (interval) clearInterval(interval);
      };
  }, [activeSessionId, activeSession?.isActive, updateSessionToken]);

  const handleStartSession = () => {
      // Simulate getting GPS
      navigator.geolocation.getCurrentPosition((pos) => {
          const newSession: Session = {
              id: `sess_${Date.now()}`,
              facultyId: currentUser!.id,
              subjectId: selectedSubject,
              startTime: Date.now(),
              isActive: true,
              locationLat: pos.coords.latitude,
              locationLng: pos.coords.longitude,
              currentDynamicToken: `dyn_${Date.now()}_init` // Initial token
          };
          createSession(newSession);
          setActiveSessionId(newSession.id);
      }, (err) => {
          alert("Location access needed to start session. Using mock location.");
          // Fallback for demo if denied
          const newSession: Session = {
              id: `sess_${Date.now()}`,
              facultyId: currentUser!.id,
              subjectId: selectedSubject,
              startTime: Date.now(),
              isActive: true,
              locationLat: 37.7749, // Mock SF
              locationLng: -122.4194,
              currentDynamicToken: `dyn_${Date.now()}_init`
          };
          createSession(newSession);
          setActiveSessionId(newSession.id);
      });
  };

  const handleStopSession = () => {
      if(activeSessionId) {
          endSession(activeSessionId);
          setActiveSessionId(null);
      }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
       <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Faculty Dashboard</h1>
            <p className="text-slate-500">Manage your classes and attendance</p>
          </div>
          <Button variant="secondary" onClick={logout} className="text-red-600 border-red-100 hover:bg-red-50">
             <LogOut size={18} /> Logout
          </Button>
       </div>

       {!activeSessionId ? (
           <Card title="Start New Attendance Session">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div>
                       <label className="block text-sm font-medium text-slate-600 mb-2">Select Subject</label>
                       <select 
                           className="w-full px-4 py-3 rounded-lg border border-slate-300 outline-none focus:border-indigo-500"
                           value={selectedSubject}
                           onChange={e => setSelectedSubject(e.target.value)}
                       >
                           {subjects.map(s => (
                               <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                           ))}
                       </select>
                   </div>
                   <div className="flex items-end">
                       <Button onClick={handleStartSession} className="w-full py-3 text-lg">
                           <Play size={20} /> Start Live Session
                       </Button>
                   </div>
               </div>
           </Card>
       ) : (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
               {/* QR Controls */}
               <div className="lg:col-span-2 space-y-6">
                   <Card className="bg-indigo-900 text-white border-none relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-20">
                            <MapPin size={120} />
                        </div>
                        <div className="relative z-10">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold mb-1">Live Session Active</h2>
                                    <p className="text-indigo-200 text-sm mb-4">
                                        Subject: {subjects.find(s => s.id === activeSession?.subjectId)?.name}
                                    </p>
                                </div>
                                <Badge color="green">LIVE</Badge>
                            </div>

                            <div className="flex flex-col md:flex-row gap-8 mt-6 items-center justify-center">
                                {/* Location QR */}
                                <div className="text-center">
                                    <div className="bg-white p-3 rounded-xl mb-2">
                                        <QRCodeCanvas 
                                            value={JSON.stringify({
                                                type: 'LOC', 
                                                lat: activeSession?.locationLat, 
                                                lng: activeSession?.locationLng
                                            })} 
                                            size={160} 
                                        />
                                    </div>
                                    <p className="text-xs font-medium text-indigo-200">1. Scan Location QR</p>
                                </div>

                                {/* Dynamic QR */}
                                <div className="text-center">
                                    <div className="bg-white p-3 rounded-xl mb-2 relative">
                                        <QRCodeCanvas value={activeSession?.currentDynamicToken || ''} size={160} />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            <div className="w-full h-0.5 bg-red-500/50 animate-pulse absolute top-1/2"></div>
                                        </div>
                                    </div>
                                    <p className="text-xs font-medium text-indigo-200 flex items-center justify-center gap-1">
                                        <RefreshCw size={12} className="animate-spin" /> 
                                        2. Dynamic Token (4s)
                                    </p>
                                </div>
                            </div>
                        </div>
                   </Card>

                   <Button variant="danger" onClick={handleStopSession} className="w-full py-4">
                       <Square size={20} fill="currentColor" /> Stop Session & Save
                   </Button>
               </div>

               {/* Live List */}
               <div className="lg:col-span-1">
                   <Card className="h-full flex flex-col">
                       <div className="flex items-center justify-between mb-4">
                           <h3 className="font-bold text-slate-800 flex items-center gap-2">
                               <Users size={20} /> Attendees
                           </h3>
                           <Badge color="blue">{sessionAttendance.length} Present</Badge>
                       </div>
                       <div className="flex-grow overflow-y-auto max-h-[500px] space-y-2">
                           {sessionAttendance.length === 0 ? (
                               <div className="text-center text-slate-400 py-10 text-sm">
                                   Waiting for students to scan...
                               </div>
                           ) : (
                               sessionAttendance.map(record => (
                                   <div key={record.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center animate-fade-in-down">
                                       <div>
                                            <div className="font-medium text-slate-800">
                                                {/* In real app, lookup student name */}
                                                Student #{record.studentId.split('_')[1]}
                                            </div>
                                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                                <Clock size={10} /> {new Date(record.timestamp).toLocaleTimeString()}
                                            </div>
                                       </div>
                                       <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                   </div>
                               ))
                           )}
                       </div>
                   </Card>
               </div>
           </div>
       )}

       {/* History Section */}
       <div className="mt-12">
           <div className="flex items-center gap-2 mb-6">
               <Calendar className="text-slate-400" size={24} />
               <h2 className="text-xl font-bold text-slate-900">Recent Sessions History</h2>
           </div>
           
           <div className="space-y-4">
               {pastSessions.length === 0 ? (
                   <div className="p-8 text-center bg-white rounded-xl border border-slate-200 text-slate-400">
                       No past sessions recorded yet. Start a session to build history.
                   </div>
               ) : (
                   pastSessions.map(session => {
                       const subject = subjects.find(s => s.id === session.subjectId);
                       const attendeeCount = attendance.filter(a => a.sessionId === session.id).length;
                       const durationMins = session.endTime 
                           ? Math.round((session.endTime - session.startTime) / 60000) 
                           : 0;

                       return (
                           <div key={session.id} className="bg-white p-6 rounded-xl border border-slate-200 flex flex-col sm:flex-row justify-between items-center hover:shadow-md transition-shadow gap-4">
                               <div className="flex items-center gap-4 w-full sm:w-auto">
                                   <div className="h-12 w-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold text-lg shrink-0">
                                       {subject?.code.substring(0, 2)}
                                   </div>
                                   <div>
                                       <h4 className="font-bold text-slate-900 text-lg">{subject?.name}</h4>
                                       <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                                           <span className="flex items-center gap-1">
                                               <Calendar size={14} /> {new Date(session.startTime).toLocaleDateString()}
                                           </span>
                                           <span className="hidden sm:inline">•</span>
                                           <span className="flex items-center gap-1">
                                               <Clock size={14} /> {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                           </span>
                                           {durationMins > 0 && (
                                               <>
                                                   <span className="hidden sm:inline">•</span>
                                                   <span className="font-medium text-indigo-600">{durationMins} mins</span>
                                               </>
                                           )}
                                       </div>
                                   </div>
                               </div>
                               
                               <div className="flex items-center justify-between w-full sm:w-auto gap-8 border-t sm:border-t-0 border-slate-100 pt-4 sm:pt-0">
                                   <div className="text-left sm:text-right">
                                       <div className="text-xs text-slate-500 uppercase font-semibold tracking-wider">Attendees</div>
                                       <div className="font-bold text-slate-800 text-2xl">{attendeeCount}</div>
                                   </div>
                                   <div>
                                        <Badge color="gray">Completed</Badge>
                                   </div>
                               </div>
                           </div>
                       );
                   })
               )}
           </div>
       </div>
    </div>
  );
};

export default FacultyDashboard;