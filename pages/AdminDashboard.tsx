import React, { useState } from 'react';
import { useApp } from '../store';
import { Button, Card, Input, Badge } from '../components/Common';
import { Users, Building2, BookOpen, LogOut, Plus, Shield, Sparkles, Loader2 } from 'lucide-react';
import { UserRole, User } from '../types';

const AdminDashboard: React.FC = () => {
  const { users, departments, subjects, logout, registerUser } = useApp();
  const [activeTab, setActiveTab] = useState<'users' | 'depts' | 'subjects'>('users');
  
  // Add User Form State
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState<Partial<User>>({ role: UserRole.STUDENT });
  const [isFetchingApi, setIsFetchingApi] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
      e.preventDefault();
      if(newUser.name && newUser.email) {
          registerUser({
              id: `user_${Date.now()}`,
              name: newUser.name,
              email: newUser.email,
              role: newUser.role || UserRole.STUDENT,
              department: newUser.department || 'CS'
          });
          setShowAddUser(false);
          setNewUser({ role: UserRole.STUDENT });
      }
  };

  const fetchRandomUser = async () => {
      setIsFetchingApi(true);
      try {
          // Free API: randomuser.me
          const res = await fetch('https://randomuser.me/api/');
          const data = await res.json();
          const user = data.results[0];
          setNewUser({
              name: `${user.name.first} ${user.name.last}`,
              email: user.email,
              role: UserRole.STUDENT,
              department: 'CS'
          });
      } catch (error) {
          console.error("Failed to fetch random user", error);
      } finally {
          setIsFetchingApi(false);
      }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1">
        <Card className="sticky top-24">
          <div className="flex flex-col gap-2">
             <button 
                onClick={() => setActiveTab('users')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
             >
                <Users size={18} />
                Manage Users
             </button>
             <button 
                onClick={() => setActiveTab('depts')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'depts' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
             >
                <Building2 size={18} />
                Departments
             </button>
             <button 
                onClick={() => setActiveTab('subjects')}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === 'subjects' ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50'}`}
             >
                <BookOpen size={18} />
                Subjects
             </button>
             
             <div className="h-px bg-slate-100 my-2"></div>
             
             <button onClick={logout} className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">
                <LogOut size={18} />
                Logout
             </button>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="lg:col-span-3">
         {activeTab === 'users' && (
             <div className="space-y-6">
                 <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-slate-800">Users Directory</h2>
                    <Button onClick={() => setShowAddUser(!showAddUser)}>
                        <Plus size={18} /> Add User
                    </Button>
                 </div>

                 {showAddUser && (
                     <Card className="bg-indigo-50 border-indigo-100">
                         <div className="flex justify-between items-center mb-4">
                            <h3 className="font-semibold">Register New User</h3>
                            <Button 
                                type="button" 
                                variant="secondary" 
                                onClick={fetchRandomUser} 
                                disabled={isFetchingApi}
                                className="text-xs py-1"
                            >
                                {isFetchingApi ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                {isFetchingApi ? 'Fetching...' : 'Auto-Fill (API)'}
                            </Button>
                         </div>
                         <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input 
                                placeholder="Full Name" 
                                value={newUser.name || ''} 
                                onChange={e => setNewUser({...newUser, name: e.target.value})} 
                            />
                            <Input 
                                placeholder="Email" 
                                value={newUser.email || ''} 
                                onChange={e => setNewUser({...newUser, email: e.target.value})} 
                            />
                            <select 
                                className="w-full px-4 py-2 rounded-lg border border-slate-300 outline-none"
                                value={newUser.role}
                                onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})}
                            >
                                <option value={UserRole.STUDENT}>Student</option>
                                <option value={UserRole.FACULTY}>Faculty</option>
                                <option value={UserRole.ADMIN}>Admin</option>
                            </select>
                            <div className="md:col-span-2">
                                <Button type="submit" className="w-full">Register</Button>
                            </div>
                         </form>
                     </Card>
                 )}

                 <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-4 font-semibold text-slate-700">Name</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Role</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Department</th>
                                <th className="px-6 py-4 font-semibold text-slate-700">Device Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-slate-900">{user.name}</div>
                                        <div className="text-slate-500 text-xs">{user.email}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Badge color={user.role === UserRole.ADMIN ? 'red' : user.role === UserRole.FACULTY ? 'blue' : 'green'}>
                                            {user.role}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">{user.department || '-'}</td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {user.deviceId ? <span className="text-green-600 flex items-center gap-1"><Shield size={12}/> Bound</span> : 'Unbound'}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                 </div>
             </div>
         )}

         {activeTab === 'depts' && (
             <Card title="Managed Departments">
                 <ul className="space-y-2">
                     {departments.map(d => (
                         <li key={d.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 flex justify-between items-center">
                             <span className="font-medium text-slate-800">{d.name}</span>
                             <span className="text-xs text-slate-500 uppercase">{d.id}</span>
                         </li>
                     ))}
                 </ul>
             </Card>
         )}
         
         {activeTab === 'subjects' && (
             <Card title="Course Catalog">
                 <div className="space-y-3">
                     {subjects.map(s => (
                         <div key={s.id} className="p-4 bg-white border border-slate-200 rounded-lg flex justify-between items-center">
                             <div>
                                 <div className="font-semibold text-slate-800">{s.name}</div>
                                 <div className="text-xs text-slate-500">{s.code} • {s.departmentId}</div>
                             </div>
                             <Button variant="secondary" className="text-xs py-1 px-3">Edit</Button>
                         </div>
                     ))}
                 </div>
             </Card>
         )}
      </div>
    </div>
  );
};

export default AdminDashboard;