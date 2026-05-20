'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Package, Truck, CheckCircle, Clock, ArrowLeft, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { orderAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const TIMELINE = ['Pending', 'Processing', 'Shipped', 'Delivered'];
const STATUS_ICONS = { Pending: Clock, Processing: Package, Shipped: Truck, Delivered: CheckCircle, Cancelled: XCircle };

export default function OrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    orderAPI.getById(id).then(({ data }) => { setOrder(data.data); setLoading(false); }).catch(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Cancel this order?')) return;
    setCancelling(true);
    try {
      const { data } = await orderAPI.cancel(id);
      setOrder(data.data);
      toast.success('Order cancelled');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Cannot cancel order');
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 pt-20 page-container py-8"><div className="skeleton h-96 rounded-2xl" /></div>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen flex flex-col"><Navbar />
      <div className="flex-1 flex items-center justify-center pt-20"><p className="text-gray-500">Order not found.</p></div>
    </div>
  );

  const statusIndex = TIMELINE.indexOf(order.status);
  const StatusIcon = STATUS_ICONS[order.status] || Package;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="page-container py-8">
          <div className="flex items-center gap-3 mb-8">
            <Link href="/orders" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl text-gray-600 dark:text-gray-400 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white font-mono">{order.orderNumber}</h1>
              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Status Timeline */}
              {order.status !== 'Cancelled' && (
                <div className="card p-6">
                  <h2 className="font-bold text-gray-900 dark:text-white mb-6">Order Status</h2>
                  <div className="flex items-center justify-between">
                    {TIMELINE.map((s, i) => {
                      const Icon = STATUS_ICONS[s];
                      const active = i <= statusIndex;
                      const current = i === statusIndex;
                      return (
                        <div key={s} className="flex-1 flex flex-col items-center gap-2">
                          <div className={`relative w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${active ? 'bg-primary-600 border-primary-600' : 'border-gray-200 dark:border-gray-700'} ${current ? 'ring-4 ring-primary-100 dark:ring-primary-900/50' : ''}`}>
                            <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-300 dark:text-gray-600'}`} />
                          </div>
                          <span className={`text-xs font-medium text-center ${active ? 'text-primary-600' : 'text-gray-400'}`}>{s}</span>
                          {i < TIMELINE.length - 1 && (
                            <div className="absolute hidden sm:block" style={{ width: `calc(100% / ${TIMELINE.length} - 3rem)`, height: '2px', top: '1.25rem', left: '50%', transform: 'translateX(50%)' }}>
                              <div className={`h-full ${i < statusIndex ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'} transition-all`} />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {order.trackingNumber && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                      📦 Tracking: <span className="font-mono font-semibold">{order.trackingNumber}</span>
                    </p>
                  )}
                </div>
              )}

              {order.status === 'Cancelled' && (
                <div className="card p-6 border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-900/10">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <div>
                      <h2 className="font-bold text-red-700 dark:text-red-400">Order Cancelled</h2>
                      <p className="text-sm text-red-600 dark:text-red-500">This order has been cancelled.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Items */}
              <div className="card p-6">
                <h2 className="font-bold text-gray-900 dark:text-white mb-5">Items Ordered</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800 shrink-0">
                        {item.image ? <Image src={item.image} alt={item.name} fill className="object-cover" /> : <div className="flex items-center justify-center h-full text-2xl">📦</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">{item.name}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} × ${item.price.toFixed(2)}</p>
                      </div>
                      <p className="font-bold text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status History */}
              {order.statusHistory?.length > 0 && (
                <div className="card p-6">
                  <h2 className="font-bold text-gray-900 dark:text-white mb-5">Status History</h2>
                  <div className="space-y-3">
                    {[...order.statusHistory].reverse().map((h, i) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-primary-600 rounded-full mt-1.5 shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{h.status}</p>
                          {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                          <p className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="space-y-5">
              <div className="card p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4">Price Breakdown</h3>
                <div className="space-y-2.5 text-sm">
                  {[['Subtotal', `$${order.subtotal.toFixed(2)}`], order.discountAmount > 0 && ['Discount', `-$${order.discountAmount.toFixed(2)}`], ['Shipping', order.shippingPrice === 0 ? 'Free' : `$${order.shippingPrice.toFixed(2)}`], ['Tax', `$${order.taxPrice.toFixed(2)}`]].filter(Boolean).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-gray-600 dark:text-gray-400">
                      <span>{k}</span><span className={order.discountAmount > 0 && k === 'Discount' ? 'text-green-600' : ''}>{v}</span>
                    </div>
                  ))}
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-2.5 flex justify-between font-bold text-base text-gray-900 dark:text-white">
                    <span>Total</span><span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Shipping Address</h3>
                <address className="text-sm text-gray-600 dark:text-gray-400 not-italic leading-relaxed">
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
                  {order.shippingAddress.country}
                </address>
              </div>

              <div className="card p-6">
                <h3 className="font-bold text-gray-900 dark:text-white mb-3">Payment</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 capitalize">{order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod}</p>
                <p className={`text-sm font-semibold mt-1 ${order.isPaid ? 'text-green-600' : 'text-yellow-600'}`}>{order.isPaid ? '✓ Paid' : 'Pending Payment'}</p>
              </div>

              {['Pending', 'Processing'].includes(order.status) && (
                <button onClick={handleCancel} disabled={cancelling} className="w-full py-3 rounded-xl border-2 border-red-200 dark:border-red-900 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold text-sm transition-colors disabled:opacity-50">
                  {cancelling ? 'Cancelling...' : 'Cancel Order'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
