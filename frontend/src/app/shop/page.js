'use client';
import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X, ChevronDown, Grid2X2, List } from 'lucide-react';
import { productAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';

const CATEGORIES = ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive', 'Food', 'Other'];
const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-asc' },
  { label: 'Price: High to Low', value: 'price-desc' },
  { label: 'Top Rated', value: 'rating' },
  { label: 'Most Popular', value: 'popular' },
];
const RATINGS = [4, 3, 2, 1];

export default function ShopPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    minRating: searchParams.get('minRating') || '',
    sort: searchParams.get('sort') || 'newest',
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true',
    page: parseInt(searchParams.get('page')) || 1,
  });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      if (filters.sort) params.sort = filters.sort;
      if (filters.inStock) params.inStock = 'true';
      if (filters.featured) params.featured = 'true';
      params.page = filters.page;
      params.limit = 12;

      const { data } = await productAPI.getAll(params);
      setProducts(data.data);
      setPagination(data.pagination);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const setFilter = (key, value) => setFilters((f) => ({ ...f, [key]: value, page: 1 }));

  const clearFilters = () => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', minRating: '', sort: 'newest', inStock: false, featured: false, page: 1 });

  const activeFilterCount = [filters.category, filters.minPrice, filters.maxPrice, filters.minRating, filters.inStock, filters.featured].filter(Boolean).length;

  const FilterPanel = () => (
    <div className="space-y-6">
      {/* Category */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Category</h3>
        <div className="space-y-2">
          <button onClick={() => setFilter('category', '')} className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${!filters.category ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
            All Categories
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => setFilter('category', c)} className={`block text-sm w-full text-left px-3 py-2 rounded-lg transition-colors ${filters.category === c ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600 font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Price Range</h3>
        <div className="flex gap-2">
          <input type="number" placeholder="Min" value={filters.minPrice} onChange={(e) => setFilter('minPrice', e.target.value)} className="input text-sm py-2 px-3" min="0" />
          <input type="number" placeholder="Max" value={filters.maxPrice} onChange={(e) => setFilter('maxPrice', e.target.value)} className="input text-sm py-2 px-3" min="0" />
        </div>
      </div>

      {/* Rating */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm uppercase tracking-wide">Min Rating</h3>
        <div className="space-y-2">
          {RATINGS.map((r) => (
            <button key={r} onClick={() => setFilter('minRating', filters.minRating == r ? '' : r)} className={`flex items-center gap-2 text-sm w-full px-3 py-2 rounded-lg transition-colors ${filters.minRating == r ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-600' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              {'★'.repeat(r)}{'☆'.repeat(5 - r)} <span>& up</span>
            </button>
          ))}
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3">
        {[{ label: 'In Stock Only', key: 'inStock' }, { label: 'Featured Only', key: 'featured' }].map(({ label, key }) => (
          <label key={key} className="flex items-center gap-3 cursor-pointer">
            <div className={`w-10 h-6 rounded-full transition-colors ${filters[key] ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'} relative`} onClick={() => setFilter(key, !filters[key])}>
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${filters[key] ? 'translate-x-5' : 'translate-x-1'}`} />
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300">{label}</span>
          </label>
        ))}
      </div>

      {activeFilterCount > 0 && (
        <button onClick={clearFilters} className="w-full text-sm text-red-500 hover:text-red-600 flex items-center justify-center gap-2 py-2">
          <X className="w-4 h-4" /> Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 py-8">
          <div className="page-container">
            <h1 className="section-title mb-2">
              {filters.category || filters.search ? (filters.category || `"${filters.search}"`) : 'All Products'}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{pagination.total} products found</p>
          </div>
        </div>

        <div className="page-container py-8">
          <div className="flex gap-8">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="card p-6 sticky top-24">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-900 dark:text-white">Filters</h2>
                  {activeFilterCount > 0 && <span className="badge bg-primary-100 dark:bg-primary-900 text-primary-600 text-xs">{activeFilterCount}</span>}
                </div>
                <FilterPanel />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center justify-between gap-4 mb-6 flex-wrap">
                <button onClick={() => setFiltersOpen(true)} className="lg:hidden flex items-center gap-2 btn-secondary text-sm py-2 px-4">
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                </button>

                <div className="flex items-center gap-3 ml-auto">
                  <select
                    value={filters.sort}
                    onChange={(e) => setFilter('sort', e.target.value)}
                    className="input text-sm py-2 w-auto"
                  >
                    {SORT_OPTIONS.map(({ label, value }) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(9)].map((_, i) => (
                    <div key={i} className="card p-4 space-y-3">
                      <div className="skeleton h-52 w-full rounded-xl" />
                      <div className="skeleton h-4 w-3/4" />
                      <div className="skeleton h-4 w-1/2" />
                      <div className="skeleton h-8 w-full" />
                    </div>
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-24">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No products found</h3>
                  <p className="text-gray-500 mb-6">Try adjusting your filters or search terms</p>
                  <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
                </div>
              ) : (
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </motion.div>
              )}

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-10">
                  <button
                    onClick={() => setFilter('page', filters.page - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Previous
                  </button>
                  {[...Array(pagination.pages)].map((_, i) => {
                    const page = i + 1;
                    if (page === 1 || page === pagination.pages || Math.abs(page - filters.page) <= 2) {
                      return (
                        <button key={page} onClick={() => setFilter('page', page)} className={`w-9 h-9 rounded-xl text-sm font-medium transition-colors ${page === filters.page ? 'bg-primary-600 text-white' : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                          {page}
                        </button>
                      );
                    }
                    if (Math.abs(page - filters.page) === 3) return <span key={page} className="px-1 text-gray-400">…</span>;
                    return null;
                  })}
                  <button
                    onClick={() => setFilter('page', filters.page + 1)}
                    disabled={!pagination.hasNext}
                    className="px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 text-sm font-medium disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            className="absolute left-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 overflow-y-auto"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="font-bold text-lg text-gray-900 dark:text-white">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6"><FilterPanel /></div>
          </motion.div>
        </div>
      )}

      <Footer />
    </div>
  );
}
