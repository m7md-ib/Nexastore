'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, LogOut, Menu, X,
  ChevronRight, Bell, Moon, Sun
} from 'lucide-react';
import useAuthStore from '@/store/authStore';

const NAV = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Users', href: '/admin/users', icon: Users },
  { label: 'Coupons', href: '/admin/coupons', icon: Tag },
];

export default function AdminLayout({ children }) {
  const { user, logout, isAdmin } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('nexastore-theme');
    if (stored === 'dark') { document.documentElement.classList.add('dark'); setDark(true); }
  }, []);

  useEffect(() => {
    if (!isAdmin()) router.replace('/auth/login');
  }, [user]);

  if (!isAdmin()) return null;

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('nexastore-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const handleLogout = () => { logout(); router.push('/'); };

  const Sidebar = () => (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-800">
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white font-black text-sm">N</div>
        <span className="font-bold text-gray-900 dark:text-white">Nexa<span className="text-primary-600">Admin</span></span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${active ? 'bg-primary-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'}`}
            >
              <Icon className={`w-5 h-5 shrink-0 ${active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
              {label}
              {active && <ChevronRight className="w-4 h-4 ml-auto" />}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl mb-2">
          <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm shrink-0">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
          <LogOut className="w-4 h-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 fixed top-0 left-0 h-full z-30">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
            <motion.aside initial={{ x: -256 }} animate={{ x: 0 }} exit={{ x: -256 }} transition={{ type: 'tween', duration: 0.25 }} className="fixed left-0 top-0 h-full w-64 z-50 lg:hidden">
              <Sidebar />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Topbar */}
        <header className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-20 px-4 sm:px-6 h-16 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <button onClick={toggleDark} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400">
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <Link href="/" className="text-sm text-primary-600 hover:underline font-medium">View Store →</Link>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
