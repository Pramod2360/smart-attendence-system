import React from 'react';
import { AppProvider, useApp } from './store';
import { View } from './types';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import FacultyDashboard from './pages/FacultyDashboard';
import StudentDashboard from './pages/StudentDashboard';
import { Wifi, ShieldCheck } from 'lucide-react';

const MainContent: React.FC = () => {
  const { currentView } = useApp();

  switch (currentView) {
    case View.LOGIN: return <Login />;
    case View.ADMIN_DASHBOARD: return <AdminDashboard />;
    case View.FACULTY_DASHBOARD: return <FacultyDashboard />;
    case View.STUDENT_DASHBOARD: return <StudentDashboard />;
    default: return <Login />;
  }
};

const App: React.FC = () => {
  return (
    <AppProvider>
        <div className="min-h-screen bg-slate-50 flex flex-col">
           {/* Header */}
           <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
             <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
               <div className="flex items-center gap-2">
                 <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                   <Wifi size={24} />
                 </div>
                 <div>
                    <h1 className="text-xl font-bold text-slate-900 leading-none">SmartAttend</h1>
                    <p className="text-xs text-slate-500 font-medium">QR & GPS Secured</p>
                 </div>
               </div>
               <div className="flex items-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                  <ShieldCheck size={14} />
                  <span>System Operational</span>
               </div>
             </div>
           </header>

           <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
             <MainContent />
           </main>
        </div>
    </AppProvider>
  );
};

export default App;