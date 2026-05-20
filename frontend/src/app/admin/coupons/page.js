'use client';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, X, Tag, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { couponAPI } from '@/lib/api';

const EMPTY = { code: '', description: '', discountType: 'percentage', discountValue: '', minOrderAmount: '', maxDiscount: '', usageLimit: '', userUsageLimit: 1, endDate: '', isActive: true };

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editCoupon, setEditCoupon] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const fetch = async () => {
    setLoading(true);
    try {
      const { data } = await couponAPI.getAll();
      setCoupons(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => { setEditCoupon(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (c) => {
    setEditCoupon(c);
    setForm({ ...c, endDate: c.endDate ? c.endDate.split('T')[0] : '', maxDiscount: c.maxDiscount || '', usageLimit: c.usageLimit || '' });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        discountValue: parseFloat(form.discountValue),
        minOrderAmount: parseFloat(form.minOrderAmount) || 0,
        maxDiscount: form.maxDiscount ? parseFloat(form.maxDiscount) : undefined,
        usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
        userUsageLimit: parseInt(form.userUsageLimit) || 1,
        endDate: form.endDate || undefined,
      };
      if (editCoupon) {
        await couponAPI.update(editCoupon._id, payload);
        toast.success('Coupon updated!');
      } else {
        await couponAPI.create(payload);
        toast.success('Coupon created!');
      }
      setModalOpen(false);
      fetch();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    try {
      await couponAPI.delete(id);
      toast.success('Coupon deleted');
      fetch();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Coupons</h1>
          <p className="text-sm text-gray-500">{coupons.length} coupons total</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Create Coupon
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading ? [...Array(3)].map((_, i) => <div key={i} className="skeleton h-36 rounded-2xl" />) :
          coupons.length === 0 ? (
            <div className="col-span-3 text-center py-16">
              <Tag className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p className="text-gray-500">No coupons yet</p>
            </div>
          ) : coupons.map((coupon, i) => (
            <motion.div key={coupon._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="font-mono font-bold text-lg text-primary-600">{coupon.code}</span>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`badge text-xs ${coupon.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                      {coupon.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">
                      {coupon.discountType === 'percentage' ? `${coupon.discountValue}% off` : `$${coupon.discountValue} off`}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={() => openEdit(coupon)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => handleDelete(coupon._id, coupon.code)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              {coupon.description && <p className="text-sm text-gray-500 mb-3">{coupon.description}</p>}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                <span>Min order: ${coupon.minOrderAmount}</span>
                <span>Used: {coupon.usedCount}{coupon.usageLimit ? `/${coupon.usageLimit}` : ''}</span>
                {coupon.endDate && <span className="col-span-2">Expires: {new Date(coupon.endDate).toLocaleDateString()}</span>}
              </div>
            </motion.div>
          ))
        }
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editCoupon ? 'Edit Coupon' : 'Create Coupon'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Coupon Code *</label>
                    <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="input font-mono" required placeholder="SAVE20" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input" placeholder="20% off for new customers" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discount Type *</label>
                    <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="input">
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Value *</label>
                    <input type="number" step="0.01" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="input" required placeholder={form.discountType === 'percentage' ? '20' : '50'} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Min Order Amount</label>
                    <input type="number" step="0.01" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} className="input" placeholder="0" />
                  </div>
                  {form.discountType === 'percentage' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Max Discount ($)</label>
                      <input type="number" step="0.01" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })} className="input" placeholder="Unlimited" />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Usage Limit</label>
                    <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="input" placeholder="Unlimited" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Per User Limit</label>
                    <input type="number" value={form.userUsageLimit} onChange={(e) => setForm({ ...form, userUsageLimit: e.target.value })} className="input" min="1" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Expiry Date</label>
                    <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="input" />
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary-600" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Active</span>
                </label>
                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                    {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : editCoupon ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
