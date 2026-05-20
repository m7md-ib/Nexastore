'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Upload, Star, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI, uploadAPI } from '@/lib/api';

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive', 'Food', 'Other'];
const EMPTY_FORM = { name: '', description: '', shortDescription: '', price: '', comparePrice: '', category: 'Electronics', brand: '', stock: '', sku: '', discount: 0, isFeatured: false, isActive: true, images: [], tags: '' };

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, isActive: undefined };
      if (search) params.search = search;
      const { data } = await productAPI.getAll({ ...params, limit: 15 });
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, [page, search]);

  const openCreate = () => { setEditProduct(null); setForm(EMPTY_FORM); setModalOpen(true); };
  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ ...p, price: p.price, comparePrice: p.comparePrice || '', stock: p.stock, tags: p.tags?.join(', ') || '', images: p.images || [] });
    setModalOpen(true);
  };

  const handleImageUpload = async (e) => {
    const files = e.target.files;
    if (!files?.length) return;
    setUploading(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((f) => formData.append('images', f));
      const { data } = await uploadAPI.uploadImages(formData);
      setForm((f) => ({ ...f, images: [...f.images, ...data.data] }));
      toast.success(`${data.data.length} image(s) uploaded`);
    } catch { toast.error('Upload failed'); }
    finally { setUploading(false); }
  };

  const removeImage = (idx) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : undefined,
        stock: parseInt(form.stock),
        discount: parseFloat(form.discount) || 0,
        tags: form.tags ? form.tags.split(',').map((t) => t.trim()).filter(Boolean) : [],
      };

      if (editProduct) {
        await productAPI.update(editProduct._id, payload);
        toast.success('Product updated!');
      } else {
        await productAPI.create(payload);
        toast.success('Product created!');
      }
      setModalOpen(false);
      fetchProducts();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Save failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Products</h1>
          <p className="text-sm text-gray-500">{pagination.total} total products</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 text-sm">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} className="input pl-9 text-sm py-2" placeholder="Search products..." />
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-800">
              <tr>
                {['Product', 'Category', 'Price', 'Stock', 'Rating', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i}>
                    {[...Array(7)].map((_, j) => (
                      <td key={j} className="px-5 py-4"><div className="skeleton h-4 rounded w-full" /></td>
                    ))}
                  </tr>
                ))
              ) : products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                        {product.images?.[0]?.url ? (
                          <Image src={product.images[0].url} alt={product.name} fill className="object-cover" />
                        ) : <Package className="w-5 h-5 text-gray-400 m-auto mt-2.5" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{product.name}</p>
                        {product.brand && <p className="text-xs text-gray-500">{product.brand}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4"><span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs">{product.category}</span></td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">${product.price.toFixed(2)}</p>
                    {product.discount > 0 && <p className="text-xs text-green-600">-{product.discount}%</p>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`font-semibold ${product.stock <= 10 ? 'text-red-600' : product.stock <= 50 ? 'text-amber-600' : 'text-green-600'}`}>{product.stock}</span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      <span className="text-xs font-medium">{product.rating} ({product.numReviews})</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`badge text-xs ${product.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-800'}`}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(product)} className="p-1.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 text-blue-600 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(product._id, product.name)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && products.length === 0 && (
            <div className="text-center py-16 text-gray-500">
              <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No products found</p>
            </div>
          )}
        </div>

        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page <= 1} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Prev</button>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= pagination.pages} className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{editProduct ? 'Edit Product' : 'Add New Product'}</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"><X className="w-5 h-5" /></button>
              </div>

              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Product Name *</label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input" required placeholder="Sony WH-1000XM5" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Price *</label>
                    <input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="input" required placeholder="99.99" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Compare Price</label>
                    <input type="number" step="0.01" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })} className="input" placeholder="129.99" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input" required>
                      {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Brand</label>
                    <input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className="input" placeholder="Sony" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Stock *</label>
                    <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input" required placeholder="100" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Discount %</label>
                    <input type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} className="input" placeholder="0" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">SKU</label>
                    <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="input" placeholder="PROD-001" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tags (comma separated)</label>
                    <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="input" placeholder="wireless, bluetooth, audio" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Short Description</label>
                  <input value={form.shortDescription} onChange={(e) => setForm({ ...form, shortDescription: e.target.value })} className="input" placeholder="Brief product summary" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Description *</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input resize-none" rows={4} required placeholder="Detailed product description..." />
                </div>

                {/* Images */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Images</label>
                  <label className={`flex flex-col items-center justify-center border-2 border-dashed rounded-xl p-6 cursor-pointer transition-colors ${uploading ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-gray-200 dark:border-gray-700 hover:border-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/10'}`}>
                    <Upload className={`w-8 h-8 mb-2 ${uploading ? 'text-primary-600 animate-pulse' : 'text-gray-400'}`} />
                    <span className="text-sm text-gray-500">{uploading ? 'Uploading...' : 'Click to upload images (max 5)'}</span>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" disabled={uploading} />
                  </label>
                  {form.images.length > 0 && (
                    <div className="flex gap-3 mt-3 flex-wrap">
                      {form.images.map((img, i) => (
                        <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden group">
                          <Image src={img.url} alt="" fill className="object-cover" />
                          <button type="button" onClick={() => removeImage(i)} className="absolute inset-0 bg-black/50 hidden group-hover:flex items-center justify-center text-white">
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="w-4 h-4 accent-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Featured product</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Active (visible in store)</span>
                  </label>
                </div>

                <div className="flex justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                  <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary text-sm">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary text-sm flex items-center gap-2">
                    {saving ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...</> : editProduct ? 'Update Product' : 'Create Product'}
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
