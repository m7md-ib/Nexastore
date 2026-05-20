'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShoppingBag } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '@/store/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form);
    if (result.success) {
      toast.success('Welcome back!');
      router.push('/');
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-100 dark:from-gray-950 dark:to-gray-900 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-2xl">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-white font-black">N</div>
            <span className="text-gray-900 dark:text-white">Nexa<span className="text-primary-600">Store</span></span>
          </Link>
        </div>

        <div className="card p-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Welcome back</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email address</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input" placeholder="you@example.com" required autoComplete="email" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="input pr-12" placeholder="Your password" required autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={isLoading} className="btn-primary w-full py-3.5 text-base">
              {isLoading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Signing in...</span> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Don't have an account?{' '}
              <Link href="/auth/register" className="text-primary-600 hover:text-primary-700 font-semibold">Sign up free</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl text-xs text-gray-500 dark:text-gray-400 space-y-1">
            <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Demo Credentials:</p>
            <p>👤 User: user@nexastore.com / User@123456</p>
            <p>🔐 Admin: admin@nexastore.com / Admin@123456</p>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          By signing in, you agree to our <Link href="#" className="underline">Terms</Link> and <Link href="#" className="underline">Privacy Policy</Link>
        </p>
      </motion.div>
    </div>
  );
}
