'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { DollarSign, ShoppingBag, Users, Package, TrendingUp, TrendingDown, ArrowUpRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { analyticsAPI } from '@/lib/api';

const COLORS = ['#3b82f6', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'];

function StatCard({ title, value, growth, icon: Icon, color, prefix = '', suffix = '' }) {
  const isPositive = parseFloat(growth) >= 0;
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        {growth !== undefined && (
          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isPositive ? 'text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400' : 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400'}`}>
            {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {Math.abs(growth)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}</p>
      <p className="text-sm text-gray-500">{title}</p>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3 shadow-lg text-sm">
      <p className="font-semibold text-gray-900 dark:text-white mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="text-xs">{p.name}: {p.name.toLowerCase().includes('revenue') || p.name.toLowerCase().includes('$') ? '$' : ''}{typeof p.value === 'number' ? p.value.toFixed(p.name.includes('revenue') ? 0 : 0) : p.value}</p>
      ))}
    </div>
  );
};

export default function AdminDashboardPage() {
  const [summary, setSummary] = useState(null);
  const [salesData, setSalesData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [orderStatus, setOrderStatus] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      analyticsAPI.getSummary(),
      analyticsAPI.getSales(),
      analyticsAPI.getBestSellers(),
      analyticsAPI.getUserGrowth(),
      analyticsAPI.getOrderStatus(),
    ]).then(([s, sales, bs, ug, os]) => {
      setSummary(s.data.data);
      setSalesData(sales.data.data);
      setBestSellers(bs.data.data.slice(0, 5));
      setUserGrowth(ug.data.data);
      setOrderStatus(os.data.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(2)].map((_, i) => <div key={i} className="skeleton h-72 rounded-2xl" />)}
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back! Here's what's happening.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={summary?.totalRevenue?.toFixed(0) || 0} growth={null} icon={DollarSign} color="bg-primary-600" prefix="$" />
        <StatCard title="Total Orders" value={summary?.totalOrders || 0} growth={summary?.orderGrowth} icon={ShoppingBag} color="bg-accent-500" />
        <StatCard title="Total Users" value={summary?.totalUsers || 0} growth={null} icon={Users} color="bg-emerald-500" />
        <StatCard title="Products" value={summary?.totalProducts || 0} growth={null} icon={Package} color="bg-amber-500" />
      </div>

      {/* Quick stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'This Month Revenue', value: `$${(summary?.monthRevenue || 0).toFixed(0)}`, icon: '💰' },
          { label: 'Month Orders', value: summary?.monthOrders || 0, icon: '📦' },
          { label: 'New Users (Month)', value: summary?.monthUsers || 0, icon: '👥' },
          { label: 'Low Stock Items', value: summary?.lowStockProducts || 0, icon: '⚠️', alert: (summary?.lowStockProducts || 0) > 0 },
        ].map(({ label, value, icon, alert }) => (
          <div key={label} className={`card p-4 ${alert ? 'border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10' : ''}`}>
            <span className="text-2xl mb-2 block">{icon}</span>
            <p className={`text-xl font-bold ${alert ? 'text-amber-600' : 'text-gray-900 dark:text-white'}`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Chart */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">Revenue Overview</h2>
              <p className="text-xs text-gray-500">Last 12 months</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={salesData}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#3b82f6" strokeWidth={2.5} fill="url(#colorRevenue)" dot={false} activeDot={{ r: 5, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Order Status Pie */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-6">Order Status</h2>
          {orderStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={orderStatus} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="count" nameKey="_id">
                  {orderStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [v, n]} />
                <Legend formatter={(v) => <span className="text-xs text-gray-600 dark:text-gray-400">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth */}
        <div className="card p-6">
          <h2 className="font-bold text-gray-900 dark:text-white mb-6">User Growth</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={userGrowth}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="users" name="New Users" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Best Sellers */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-gray-900 dark:text-white">Best Sellers</h2>
            <Link href="/admin/products" className="text-xs text-primary-600 hover:underline flex items-center gap-1">View all <ArrowUpRight className="w-3 h-3" /></Link>
          </div>
          <div className="space-y-3">
            {bestSellers.length === 0 ? (
              <p className="text-gray-400 text-sm text-center py-8">No sales data yet</p>
            ) : bestSellers.map((p, i) => (
              <div key={p._id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-gray-400 w-4">{i + 1}</span>
                <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800 shrink-0">
                  {p.images?.[0]?.url && <Image src={p.images[0].url} alt={p.name} fill className="object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.soldCount} sold</p>
                </div>
                <p className="text-sm font-bold text-gray-900 dark:text-white shrink-0">${p.price.toFixed(0)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Add Product', href: '/admin/products?new=1', icon: '➕', color: 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 hover:bg-primary-100' },
          { label: 'View Orders', href: '/admin/orders', icon: '📦', color: 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 hover:bg-amber-100' },
          { label: 'Manage Users', href: '/admin/users', icon: '👥', color: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 hover:bg-green-100' },
          { label: 'Create Coupon', href: '/admin/coupons', icon: '🏷️', color: 'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 hover:bg-purple-100' },
        ].map(({ label, href, icon, color }) => (
          <Link key={href} href={href} className={`card p-5 text-center hover:shadow-md transition-all ${color}`}>
            <span className="text-3xl mb-2 block">{icon}</span>
            <p className="text-sm font-semibold">{label}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
