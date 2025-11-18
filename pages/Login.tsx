import React, { useState } from 'react';
import { UserRole } from '../types';
import { useApp } from '../store';
import { Button, Card, Input } from '../components/Common';
import { UserCircle, Shield, GraduationCap, AlertCircle, Fingerprint } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Basic simulation defaults for demo purposes if empty
    const emailToUse = email || (
        selectedRole === UserRole.ADMIN ? 'admin@college.edu' :
        selectedRole === UserRole.FACULTY ? 'smith@college.edu' :
        'john@college.edu'
    );
    
    const result = login(selectedRole, emailToUse);
    if (!result.success && result.message) {
        setError(result.message);
    }
  };

  // Helper to simulate switching devices for testing purposes
  const simulateNewDevice = () => {
      localStorage.setItem('device_fingerprint', `dev_${Math.random().toString(36).substr(2, 9)}`);
      setError("Device Fingerprint Rotated! Try logging in again to test the security block.");
  };

  return (
    <div className="max-w-md mx-auto mt-12 pb-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
        <p className="text-slate-500 mt-2">Select your role to access the portal</p>
      </div>

      <Card>
        <div className="grid grid-cols-3 gap-2 mb-8">
          <button 
            onClick={() => { setSelectedRole(UserRole.ADMIN); setError(null); }}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedRole === UserRole.ADMIN ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <Shield size={24} className="mb-2" />
            <span className="text-xs font-medium">Admin</span>
          </button>
          <button 
            onClick={() => { setSelectedRole(UserRole.FACULTY); setError(null); }}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedRole === UserRole.FACULTY ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <UserCircle size={24} className="mb-2" />
            <span className="text-xs font-medium">Faculty</span>
          </button>
          <button 
            onClick={() => { setSelectedRole(UserRole.STUDENT); setError(null); }}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedRole === UserRole.STUDENT ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <GraduationCap size={24} className="mb-2" />
            <span className="text-xs font-medium">Student</span>
          </button>
        </div>

        {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm flex items-start gap-3">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{error}</span>
            </div>
        )}

        <form onSubmit={handleLogin}>
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="name@college.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <div className="bg-yellow-50 p-3 rounded-lg text-xs text-yellow-800 mb-4">
             <strong>Demo Hint:</strong> Leave blank to use default mock credentials for the selected role.
          </div>
          <Button type="submit" className="w-full py-3">
            Login to Dashboard
          </Button>
        </form>
      </Card>

      <div className="text-center mt-8 text-xs text-slate-400">
        <div className="flex items-center justify-center gap-2 mb-2">
            <Fingerprint size={14} />
            <span>Device Fingerprint Protection Active</span>
        </div>
        <p>Secure GPS Validation Enabled</p>
        
        {/* Debug Tool */}
        <button 
            onClick={simulateNewDevice}
            className="mt-6 text-indigo-400 underline hover:text-indigo-600 transition-colors opacity-60 hover:opacity-100"
        >
            [Debug] Simulate New Device Fingerprint
        </button>
      </div>
    </div>
  );
};

export default Login;