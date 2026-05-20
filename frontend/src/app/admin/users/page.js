'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Trash2, Shield, User } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '@/lib/api';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (search) params.search = search;
      const { data } = await userAPI.getAll(params);
      setUsers(data.data);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, [page, search]);

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete user "${name}"? This cannot be undone.`)) return;
    try {
      await userAPI.delete(id);
      toast.success('User deleted');
      fetchUsers();
    } catch (e) { toast.error(e.response?.data?.message || 'Delete failed'); }
  };

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    try {
      await userAPI.update(user._id, { role: newRole });
      toast.success('Role updated');
      fetchUsers();
    } catch (e) { toast.error('Update failed'); }
  };

  const toggleActive = async (user) => {
    try {
      await userAPI.update(user._id, { isActive: !user.isActive });
      toast.success(`User ${user.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
    } catch (e) { toast.error('Update failed'); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="text-sm text-gray-500">{pagination.total} registered users</p>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-9 text-sm py-2" placeholder="Search by name or email..." />
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                {['User', 'Role', 'Joined', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(5)].map((_, j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}</tr>
                ))
              ) : users.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm shrink-0">
                        {user.name?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                      {user.role === 'admin' ? <><Shield className="w-3 h-3 inline mr-1" />Admin</> : <><User className="w-3 h-3 inline mr-1" />User</>}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => toggleActive(user)} className={`badge text-xs cursor-pointer hover:opacity-80 transition-opacity ${user.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleRole(user)} className="p-1.5 hover:bg-purple-50 dark:hover:bg-purple-900/20 text-purple-600 rounded-lg transition-colors" title="Toggle admin role">
                        <Shield className="w-4 h-4" />
                      </button>
                      {user.role !== 'admin' && (
                        <button onClick={() => handleDelete(user._id, user.name)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && users.length === 0 && (
            <div className="text-center py-16 text-gray-500">No users found</div>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">Page {page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
