'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CreditCard, Truck, CheckCircle, Lock, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import { orderAPI } from '@/lib/api';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const STEPS = ['Shipping', 'Payment', 'Review'];

export default function CheckoutPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState({ street: '', city: '', state: '', postalCode: '', country: 'US' });
  const [payMethod, setPayMethod] = useState('cod');

  const router = useRouter();
  const { items, coupon, getSubtotal, getDiscount, getTax, getShipping, getTotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  if (items.length === 0) {
    if (typeof window !== 'undefined') router.push('/cart');
    return null;
  }

  const handlePlaceOrder = async () => {
    setLoading(true);
    try {
      const payload = {
        items: items.map((i) => ({ product: i._id, quantity: i.quantity })),
        shippingAddress: address,
        paymentMethod: payMethod,
        couponCode: coupon?.code,
        paymentResult: payMethod !== 'cod' ? {
          id: `mock_${Date.now()}`,
          status: 'COMPLETED',
          updateTime: new Date().toISOString(),
          emailAddress: user?.email,
        } : undefined,
      };

      const { data } = await orderAPI.create(payload);
      clearCart();
      toast.success('Order placed successfully! 🎉');
      router.push(`/orders/${data.data._id}`);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20 bg-gray-50 dark:bg-gray-900/30">
        <div className="page-container py-8">
          {/* Steps */}
          <div className="flex items-center justify-center mb-10">
            {STEPS.map((s, i) => (
              <div key={s} className="flex items-center">
                <div className={`flex items-center gap-2 ${i <= step ? 'text-primary-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${i < step ? 'bg-primary-600 border-primary-600 text-white' : i === step ? 'border-primary-600 text-primary-600' : 'border-gray-300 dark:border-gray-600 text-gray-400'}`}>
                    {i < step ? <CheckCircle className="w-4 h-4" /> : i + 1}
                  </div>
                  <span className="text-sm font-medium hidden sm:block">{s}</span>
                </div>
                {i < STEPS.length - 1 && <div className={`w-16 sm:w-24 h-0.5 mx-3 transition-colors ${i < step ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`} />}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="card p-6 lg:p-8">

                {/* Step 0: Shipping */}
                {step === 0 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                        <Truck className="w-5 h-5 text-primary-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Shipping Address</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Street Address</label>
                        <input value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} className="input" placeholder="123 Main Street, Apt 4B" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
                        <input value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} className="input" placeholder="New York" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State</label>
                        <input value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} className="input" placeholder="NY" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Postal Code</label>
                        <input value={address.postalCode} onChange={(e) => setAddress({ ...address, postalCode: e.target.value })} className="input" placeholder="10001" required />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Country</label>
                        <select value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} className="input">
                          {['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'JP', 'Other'].map((c) => <option key={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (!address.street || !address.city || !address.state || !address.postalCode) {
                          toast.error('Please fill all address fields'); return;
                        }
                        setStep(1);
                      }}
                      className="btn-primary mt-6 flex items-center gap-2"
                    >
                      Continue to Payment <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Step 1: Payment */}
                {step === 1 && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-xl flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-primary-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Payment Method</h2>
                    </div>

                    <div className="space-y-3">
                      {[
                        { value: 'stripe', label: 'Credit / Debit Card', desc: 'Visa, Mastercard, Amex', icon: '💳' },
                        { value: 'paypal', label: 'PayPal', desc: 'Fast and secure', icon: '🅿️' },
                        { value: 'cod', label: 'Cash on Delivery', desc: 'Pay when you receive', icon: '💵' },
                      ].map(({ value, label, desc, icon }) => (
                        <label key={value} className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${payMethod === value ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'}`}>
                          <input type="radio" name="payment" value={value} checked={payMethod === value} onChange={() => setPayMethod(value)} className="accent-primary-600" />
                          <span className="text-2xl">{icon}</span>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{label}</p>
                            <p className="text-gray-500 text-xs">{desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>

                    {payMethod === 'stripe' && (
                      <div className="mt-5 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center gap-2">
                          <Lock className="w-4 h-4" />
                          Demo mode: No real charges. Use card 4242 4242 4242 4242.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3 mt-6">
                      <button onClick={() => setStep(0)} className="btn-secondary">Back</button>
                      <button onClick={() => setStep(2)} className="btn-primary flex items-center gap-2">
                        Review Order <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Review */}
                {step === 2 && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Review Your Order</h2>

                    <div className="space-y-3 mb-6">
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Shipping to</p>
                        <p className="text-sm text-gray-900 dark:text-white">{address.street}, {address.city}, {address.state} {address.postalCode}, {address.country}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Payment</p>
                        <p className="text-sm text-gray-900 dark:text-white capitalize">{payMethod === 'cod' ? 'Cash on Delivery' : payMethod === 'stripe' ? 'Credit Card' : 'PayPal'}</p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-6">
                      {items.map((item) => (
                        <div key={item._id} className="flex items-center gap-3">
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                            {item.images?.[0]?.url && <Image src={item.images[0].url} alt={item.name} fill className="object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{item.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">${((item.discountedPrice ?? item.price) * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-3">
                      <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
                      <button onClick={handlePlaceOrder} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
                        {loading ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Placing order...</> : <><Lock className="w-4 h-4" /> Place Order (${getTotal().toFixed(2)})</>}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Summary */}
            <div className="card p-6 h-fit sticky top-24">
              <h3 className="font-bold text-gray-900 dark:text-white mb-5">Order Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Subtotal</span><span>${getSubtotal().toFixed(2)}</span></div>
                {getDiscount() > 0 && <div className="flex justify-between text-green-600"><span>Coupon</span><span>-${getDiscount().toFixed(2)}</span></div>}
                <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Shipping</span><span>{getShipping() === 0 ? 'Free' : `$${getShipping().toFixed(2)}`}</span></div>
                <div className="flex justify-between text-gray-600 dark:text-gray-400"><span>Tax</span><span>${getTax().toFixed(2)}</span></div>
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex justify-between font-bold text-base text-gray-900 dark:text-white">
                  <span>Total</span><span>${getTotal().toFixed(2)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Secured by 256-bit SSL encryption</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
