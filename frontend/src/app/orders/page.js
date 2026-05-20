'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Package, ChevronRight, Clock } from 'lucide-react';
import { orderAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Refunded: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders().then(({ data }) => { setOrders(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="page-container py-8">
          <h1 className="section-title mb-8">My Orders</h1>

          {loading ? (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}</div>
          ) : orders.length === 0 ? (
            <div className="text-center py-24">
              <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Time to start shopping!</p>
              <Link href="/shop" className="btn-primary">Browse Products</Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <motion.div key={order._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link href={`/orders/${order._id}`} className="card p-5 block hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center shrink-0">
                          <Package className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-3 flex-wrap">
                            <p className="font-bold text-gray-900 dark:text-white font-mono">{order.orderNumber}</p>
                            <span className={`badge text-xs ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{order.items.length} item(s)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">${order.totalPrice.toFixed(2)}</p>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
