'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '@/lib/api';
import useAuthStore from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function AccountPage() {
  const { user, setAuth, token } = useAuthStore();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: user.name || '', email: user.email || '', phone: user.phone || '' }));
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (form.password && form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    try {
      const payload = { name: form.name, email: form.email, phone: form.phone };
      if (form.password) payload.password = form.password;
      const { data } = await authAPI.updateProfile(payload);
      setAuth(data.data, data.data.token || token);
      toast.success('Profile updated!');
      setForm((f) => ({ ...f, password: '', confirm: '' }));
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally { setSaving(false); }
  };

  const TABS = ['profile', 'security'];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20 bg-gray-50 dark:bg-gray-900/30">
        <div className="page-container py-8 max-w-3xl">
          <h1 className="section-title mb-8">Account Settings</h1>

          <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
            {TABS.map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${activeTab === tab ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {tab}
              </button>
            ))}
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <form onSubmit={handleSave} className="card p-6 lg:p-8 space-y-6">
              {activeTab === 'profile' && (
                <>
                  {/* Avatar */}
                  <div className="flex items-center gap-5">
                    <div className="w-20 h-20 bg-primary-100 dark:bg-primary-900/30 rounded-2xl flex items-center justify-center">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full rounded-2xl object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-primary-600">{user?.name?.[0]?.toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-lg">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.role === 'admin' ? '🔐 Administrator' : '👤 Customer'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input pl-10" required />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input pl-10" required />
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="input pl-10" placeholder="+1 (555) 000-0000" />
                      </div>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'security' && (
                <div className="space-y-5">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 text-sm text-blue-700 dark:text-blue-300">
                    Leave password fields blank to keep your current password.
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pl-10 pr-10" placeholder="Min 6 characters" />
                      <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type={showPass ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className="input pl-10" placeholder="Repeat new password" />
                    </div>
                    {form.password && form.confirm && form.password !== form.confirm && (
                      <p className="text-red-500 text-xs mt-1">Passwords don't match</p>
                    )}
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
                  {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Changes</>}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
