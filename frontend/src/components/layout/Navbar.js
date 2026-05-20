'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Heart, User, Menu, X, Moon, Sun, Search, ChevronDown, Package, LogOut, Settings, LayoutDashboard } from 'lucide-react';
import useAuthStore from '@/store/authStore';
import useCartStore from '@/store/cartStore';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Shop', href: '/shop' },
  { label: 'Electronics', href: '/shop?category=Electronics' },
  { label: 'Clothing', href: '/shop?category=Clothing' },
];

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, isLoggedIn, isAdmin } = useAuthStore();
  const cartCount = useCartStore((s) => s.getCount());
  const dropRef = useRef(null);

  useEffect(() => {
    const stored = localStorage.getItem('nexastore-theme');
    if (stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
      setDark(true);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setUserOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    localStorage.setItem('nexastore-theme', next ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', next);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    router.push('/');
  };

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'bg-white/90 dark:bg-gray-950/90 backdrop-blur-lg shadow-sm border-b border-gray-100 dark:border-gray-800' : 'bg-transparent'}`}>
        <div className="page-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center text-white text-sm font-black">N</div>
              <span className="text-gray-900 dark:text-white">Nexa<span className="text-primary-600">Store</span></span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-6">
              {NAV_LINKS.map(({ label, href }) => (
                <Link
                  key={href}
                  href={href}
                  className={`text-sm font-medium transition-colors hover:text-primary-600 ${pathname === href ? 'text-primary-600' : 'text-gray-600 dark:text-gray-300'}`}
                >
                  {label}
                </Link>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                <Search className="w-5 h-5" />
              </button>

              {/* Dark mode */}
              <button onClick={toggleDark} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Wishlist */}
              {isLoggedIn() && (
                <Link href="/wishlist" className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                  <Heart className="w-5 h-5" />
                </Link>
              )}

              {/* Cart */}
              <Link href="/cart" className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              {/* User menu */}
              <div className="relative hidden sm:block" ref={dropRef}>
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors"
                >
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-7 h-7 rounded-full object-cover" />
                  ) : (
                    <div className="w-7 h-7 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-primary-600" />
                    </div>
                  )}
                  {user && <span className="text-sm font-medium text-gray-700 dark:text-gray-200 max-w-20 truncate">{user.name.split(' ')[0]}</span>}
                  <ChevronDown className="w-3 h-3" />
                </button>

                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                    >
                      {isLoggedIn() ? (
                        <>
                          <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user?.name}</p>
                            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                          </div>
                          {isAdmin() && (
                            <Link href="/admin" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                              <LayoutDashboard className="w-4 h-4 text-primary-600" /> Admin Dashboard
                            </Link>
                          )}
                          <Link href="/account" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                            <Settings className="w-4 h-4" /> Account Settings
                          </Link>
                          <Link href="/orders" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                            <Package className="w-4 h-4" /> My Orders
                          </Link>
                          <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm text-red-600 border-t border-gray-100 dark:border-gray-800">
                            <LogOut className="w-4 h-4" /> Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link href="/auth/login" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                            <User className="w-4 h-4" /> Login
                          </Link>
                          <Link href="/auth/register" onClick={() => setUserOpen(false)} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm text-gray-700 dark:text-gray-300">
                            Sign Up
                          </Link>
                        </>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Mobile menu */}
              <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300">
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="lg:hidden bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-800 overflow-hidden"
            >
              <div className="page-container py-4 space-y-1">
                {NAV_LINKS.map(({ label, href }) => (
                  <Link key={href} href={href} onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium">
                    {label}
                  </Link>
                ))}
                {!isLoggedIn() ? (
                  <div className="flex gap-3 pt-2">
                    <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="flex-1 btn-secondary text-center text-sm py-2">Login</Link>
                    <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="flex-1 btn-primary text-center text-sm py-2">Sign Up</Link>
                  </div>
                ) : (
                  <>
                    <Link href="/orders" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">My Orders</Link>
                    <Link href="/account" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300">Account</Link>
                    {isAdmin() && <Link href="/admin" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 text-primary-600 font-medium">Admin Dashboard</Link>}
                    <button onClick={handleLogout} className="block w-full text-left px-4 py-3 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600">Logout</button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4"
            onClick={(e) => e.target === e.currentTarget && setSearchOpen(false)}
          >
            <motion.form
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              onSubmit={handleSearch}
              className="w-full max-w-2xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800"
            >
              <div className="flex items-center gap-3 px-4">
                <Search className="w-5 h-5 text-gray-400 shrink-0" />
                <input
                  autoFocus
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands, categories..."
                  className="flex-1 py-4 bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg"
                />
                <button type="button" onClick={() => setSearchOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-400">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="px-4 pb-3 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs text-gray-400 pt-3">Press Enter to search or <button type="button" onClick={() => setSearchOpen(false)} className="text-primary-600 hover:underline">cancel</button></p>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
