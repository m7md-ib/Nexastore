'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';
import useAuthStore from '@/store/authStore';

export default function WishlistPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isLoggedIn, refreshUser } = useAuthStore();

  useEffect(() => {
    if (!isLoggedIn()) return;
    authAPI.getMe()
      .then(({ data }) => { setProducts(data.data.wishlist || []); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="page-container py-8">
          <div className="flex items-center gap-3 mb-8">
            <Heart className="w-7 h-7 text-red-500 fill-red-500" />
            <h1 className="section-title">My Wishlist</h1>
            {products.length > 0 && <span className="badge bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{products.length} items</span>}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="card p-4 space-y-3">
                  <div className="skeleton h-52 w-full rounded-xl" />
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-8 w-full" />
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24">
              <Heart className="w-16 h-16 mx-auto text-gray-200 dark:text-gray-700 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Your wishlist is empty</h3>
              <p className="text-gray-500 mb-6">Save items you love to buy them later</p>
              <Link href="/shop" className="btn-primary">Explore Products</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, i) => (
                <motion.div key={product._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <ProductCard product={product} />
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
