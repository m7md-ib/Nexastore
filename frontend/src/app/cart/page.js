'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowRight, X } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { couponAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, coupon, applyCoupon, removeCoupon, getSubtotal, getDiscount, getTax, getShipping, getTotal } = useCartStore();
  const { isLoggedIn } = useAuthStore();
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const handleCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    try {
      const { data } = await couponAPI.validate({ code: couponCode, orderAmount: getSubtotal() });
      applyCoupon(data.data);
      setCouponCode('');
      toast.success(`Coupon applied! You save $${data.data.discount.toFixed(2)}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Invalid coupon');
    } finally { setCouponLoading(false); }
  };

  if (items.length === 0) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col items-center justify-center pt-20 px-4 text-center">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-sm">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything yet. Start shopping!</p>
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2">
            <ShoppingBag className="w-5 h-5" /> Browse Products
          </Link>
        </motion.div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="page-container py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="section-title">Shopping Cart</h1>
            <button onClick={() => { clearCart(); toast.success('Cart cleared'); }} className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1.5">
              <Trash2 className="w-4 h-4" /> Clear Cart
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Items */}
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => {
                  const price = item.discountedPrice ?? item.price;
                  return (
                    <motion.div
                      key={item._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="card p-5 flex gap-5"
                    >
                      <div className="relative w-24 h-24 shrink-0 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-800">
                        {item.images?.[0]?.url ? (
                          <Image src={item.images[0].url} alt={item.name} fill className="object-cover" />
                        ) : <div className="flex items-center justify-center h-full text-3xl">📦</div>}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            {item.brand && <p className="text-xs text-primary-600 font-medium mb-0.5">{item.brand}</p>}
                            <Link href={`/product/${item._id}`} className="font-semibold text-gray-900 dark:text-white hover:text-primary-600 line-clamp-2 text-sm">{item.name}</Link>
                            <p className="text-sm text-gray-500 mt-1">${price.toFixed(2)} each</p>
                          </div>
                          <button onClick={() => removeItem(item._id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 rounded-lg transition-colors shrink-0">
                            <X className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                            <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 transition-colors">
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-4 py-1.5 font-semibold text-sm text-gray-900 dark:text-white">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item._id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="px-3 py-1.5 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 transition-colors disabled:opacity-40">
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <span className="font-bold text-gray-900 dark:text-white">${(price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              {/* Coupon */}
              {isLoggedIn() && (
                <div className="card p-5">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Tag className="w-4 h-4 text-primary-600" /> Promo Code
                  </h3>
                  {coupon ? (
                    <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3">
                      <div>
                        <p className="font-mono font-bold text-green-700 dark:text-green-400 text-sm">{coupon.code}</p>
                        <p className="text-xs text-green-600 dark:text-green-500">-${coupon.discount.toFixed(2)} saved</p>
                      </div>
                      <button onClick={removeCoupon} className="text-green-600 hover:text-red-500 p-1"><X className="w-4 h-4" /></button>
                    </div>
                  ) : (
                    <form onSubmit={handleCoupon} className="flex gap-2">
                      <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} className="input text-sm py-2 flex-1" placeholder="COUPON CODE" />
                      <button type="submit" disabled={couponLoading} className="btn-primary text-sm px-4 py-2 whitespace-nowrap">Apply</button>
                    </form>
                  )}
                </div>
              )}

              {/* Order Summary */}
              <div className="card p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-5">Order Summary</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                    <span>${getSubtotal().toFixed(2)}</span>
                  </div>
                  {getDiscount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span>-${getDiscount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Shipping</span>
                    <span>{getShipping() === 0 ? <span className="text-green-600">Free</span> : `$${getShipping().toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Tax (8%)</span>
                    <span>${getTax().toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-lg text-gray-900 dark:text-white">
                    <span>Total</span>
                    <span>${getTotal().toFixed(2)}</span>
                  </div>
                </div>

                {getShipping() > 0 && (
                  <p className="text-xs text-gray-500 mt-3">Add ${(100 - getSubtotal()).toFixed(2)} more for free shipping</p>
                )}

                <Link href={isLoggedIn() ? '/checkout' : '/auth/login'} className="btn-primary w-full flex items-center justify-center gap-2 mt-5">
                  {isLoggedIn() ? <><span>Proceed to Checkout</span><ArrowRight className="w-4 h-4" /></> : 'Login to Checkout'}
                </Link>

                <Link href="/shop" className="block text-center text-sm text-primary-600 hover:text-primary-700 mt-4">
                  ← Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
