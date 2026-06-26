import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { Loader2, Shield, User, GraduationCap } from 'lucide-react';
import type { Database } from '@/lib/types/database';

type Profile = Database['public']['Tables']['profiles']['Row'];

export function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'instructor' | 'student') => {
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', userId);

    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } else {
      alert('Failed to update role');
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">User Management</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage user roles and access</p>
      </div>

      <div className="rounded-2xl border border-white/[0.06] bg-card/30 backdrop-blur-sm overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06] bg-black/20">
                  <th className="py-4 pl-6 pr-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">User</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                  <th className="py-4 px-4 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.06]">
                {users.map((u, i) => (
                  <motion.tr
                    key={u.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-4 pl-6 pr-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div className="font-medium text-foreground">{u.full_name || 'Unnamed'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">{u.email}</td>
                    <td className="py-4 px-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as any)}
                        className="bg-background border border-white/[0.1] rounded-lg px-3 py-1.5 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none"
                      >
                        <option value="student">Student</option>
                        <option value="instructor">Instructor</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="py-4 px-4 text-sm text-muted-foreground">
                      {new Date(u.created_at).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
