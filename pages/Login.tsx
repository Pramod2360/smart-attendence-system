import React, { useState } from 'react';
import { UserRole } from '../types';
import { useApp } from '../store';
import { Button, Card, Input } from '../components/Common';
import { UserCircle, Shield, GraduationCap } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>(UserRole.STUDENT);
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic simulation defaults for demo purposes if empty
    const emailToUse = email || (
        selectedRole === UserRole.ADMIN ? 'admin@college.edu' :
        selectedRole === UserRole.FACULTY ? 'smith@college.edu' :
        'john@college.edu'
    );
    login(selectedRole, emailToUse);
  };

  return (
    <div className="max-w-md mx-auto mt-12">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-900">Welcome Back</h2>
        <p className="text-slate-500 mt-2">Select your role to access the portal</p>
      </div>

      <Card>
        <div className="grid grid-cols-3 gap-2 mb-8">
          <button 
            onClick={() => setSelectedRole(UserRole.ADMIN)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedRole === UserRole.ADMIN ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <Shield size={24} className="mb-2" />
            <span className="text-xs font-medium">Admin</span>
          </button>
          <button 
            onClick={() => setSelectedRole(UserRole.FACULTY)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedRole === UserRole.FACULTY ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <UserCircle size={24} className="mb-2" />
            <span className="text-xs font-medium">Faculty</span>
          </button>
          <button 
            onClick={() => setSelectedRole(UserRole.STUDENT)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${selectedRole === UserRole.STUDENT ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:bg-slate-50'}`}
          >
            <GraduationCap size={24} className="mb-2" />
            <span className="text-xs font-medium">Student</span>
          </button>
        </div>

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
        <p>Device Fingerprint Protection Active</p>
        <p>Secure GPS Validation Enabled</p>
      </div>
    </div>
  );
};

export default Login;