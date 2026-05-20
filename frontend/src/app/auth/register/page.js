'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const { register, isLoading } = useAuthStore();
  const router = useRouter();

  const pwdChecks = {
    length: form.password.length >= 6,
    match: form.password === form.confirm && form.confirm.length > 0,
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pwdChecks.match) { toast.error('Passwords do not match'); return; }
    const result = await register({ name: form.name, email: form.email, password: form.password });
    if (result.success) {
      toast.success('Account created! Welcome to NexaStore 🎉');
      router.push('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-black">N</div>
            <span className="text-gray-900 dark:text-white">Nexa<span className="text-primary-600">Store</span></span>
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Create your account</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Join thousands of happy shoppers</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email address</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pr-12" placeholder="Min 6 characters" required />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-2 flex gap-3">
                  <span className={`flex items-center gap-1 text-xs ${pwdChecks.length ? 'text-green-600' : 'text-gray-400'}`}>
                    <CheckCircle className="w-3.5 h-3.5" /> 6+ characters
                  </span>
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm Password</label>
              <input type={showPass ? 'text' : 'password'} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className={`input ${form.confirm && !pwdChecks.match ? 'border-red-400 focus:ring-red-500' : ''}`} placeholder="Repeat your password" required />
              {form.confirm && !pwdChecks.match && <p className="text-red-500 text-xs mt-1">Passwords don't match</p>}
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
              {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Creating account...</span> : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">Sign in</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
