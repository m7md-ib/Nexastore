'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, ChevronDown, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '@/lib/api';

const STATUSES = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'];
const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Shipped: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  Delivered: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  Cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  Refunded: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filterStatus) params.status = filterStatus;
      const { data } = await orderAPI.getAll(params);
      setOrders(data.data);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOrders(); }, [page, filterStatus]);

  const openOrder = (order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setStatusNote('');
    setTrackingNumber(order.trackingNumber || '');
  };

  const handleUpdateStatus = async () => {
    if (!newStatus) return;
    setUpdating(true);
    try {
      const { data } = await orderAPI.updateStatus(selectedOrder._id, { status: newStatus, note: statusNote, trackingNumber });
      setSelectedOrder(data.data);
      setOrders((prev) => prev.map((o) => o._id === data.data._id ? data.data : o));
      toast.success('Order status updated!');
      setStatusNote('');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Update failed');
    } finally { setUpdating(false); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-sm text-gray-500">{pagination.total} total orders</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-wrap gap-3">
        <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1); }} className="input text-sm py-2 w-auto">
          <option value="">All Statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        {filterStatus && (
          <button onClick={() => setFilterStatus('')} className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="w-4 h-4" /> Clear filter
          </button>
        )}
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                {['Order #', 'Customer', 'Date', 'Items', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>{[...Array(7)].map((_, j) => <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded" /></td>)}</tr>
                ))
              ) : orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4 font-mono font-bold text-primary-600">{order.orderNumber}</td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">{order.user?.name || 'N/A'}</p>
                    <p className="text-xs text-gray-500">{order.user?.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-500 whitespace-nowrap">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{order.items.length} item(s)</td>
                  <td className="px-5 py-4 font-bold text-gray-900 dark:text-white">${order.totalPrice.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${STATUS_COLORS[order.status] || ''}`}>{order.status}</span>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => openOrder(order)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && orders.length === 0 && (
            <div className="text-center py-16 text-gray-500">No orders found</div>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40">Prev</button>
              <button onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.pages} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white font-mono">{selectedOrder.orderNumber}</h2>
                  <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString()}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 space-y-6">
                {/* Customer */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 grid grid-cols-2 gap-3 text-sm">
                  <div><p className="text-gray-500 text-xs mb-0.5">Customer</p><p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.user?.name}</p></div>
                  <div><p className="text-gray-500 text-xs mb-0.5">Email</p><p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.user?.email}</p></div>
                  <div><p className="text-gray-500 text-xs mb-0.5">Payment</p><p className="font-semibold text-gray-900 dark:text-white capitalize">{selectedOrder.paymentMethod}</p></div>
                  <div><p className="text-gray-500 text-xs mb-0.5">Shipping</p><p className="font-semibold text-gray-900 dark:text-white">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.country}</p></div>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Items</h3>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item) => (
                      <div key={item._id} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800">
                        <div>
                          <p className="font-medium text-sm text-gray-900 dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                        </div>
                        <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                      </div>
                    ))}
                    <div className="flex justify-between font-bold pt-1">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">${selectedOrder.totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Update Status */}
                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 space-y-3">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm">Update Status</h3>
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="input text-sm py-2">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="input text-sm py-2" placeholder="Tracking number (optional)" />
                  <input value={statusNote} onChange={(e) => setStatusNote(e.target.value)} className="input text-sm py-2" placeholder="Add a note (optional)" />
                  <button onClick={handleUpdateStatus} disabled={updating || newStatus === selectedOrder.status} className="btn-primary text-sm w-full flex items-center justify-center gap-2">
                    {updating ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Updating...</> : 'Update Status'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
