'use client';
import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import { authAPI } from '@/lib/api';

export default function ProductCard({ product }) {
  const [wishListed, setWishListed] = useState(false);
  const [imgError, setImgError] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const { isLoggedIn } = useAuthStore();

  const price = product.discountedPrice ?? product.price;
  const hasDiscount = product.discount > 0;
  const inStock = product.stock > 0;
  const image = product.images?.[0]?.url;

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (!inStock) return;
    addItem(product, 1);
    toast.success('Added to cart!');
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) { toast.error('Please login first'); return; }
    try {
      await authAPI.toggleWishlist(product._id);
      setWishListed(!wishListed);
      toast.success(wishListed ? 'Removed from wishlist' : 'Added to wishlist');
    } catch { toast.error('Something went wrong'); }
  };

  return (
    <motion.div whileHover={{ y: -4 }} transition={{ duration: 0.2 }}>
      <Link href={`/product/${product._id}`} className="group card block overflow-hidden">
        {/* Image */}
        <div className="relative overflow-hidden bg-gray-50 dark:bg-gray-800 h-56">
          {image && !imgError ? (
            <Image
              src={image}
              alt={product.images?.[0]?.alt || product.name}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-6xl">📦</div>
          )}

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1.5">
            {hasDiscount && (
              <span className="badge bg-red-500 text-white text-xs px-2 py-0.5">-{product.discount}%</span>
            )}
            {product.isFeatured && (
              <span className="badge bg-primary-500 text-white text-xs px-2 py-0.5">Featured</span>
            )}
            {!inStock && (
              <span className="badge bg-gray-500 text-white text-xs px-2 py-0.5">Out of Stock</span>
            )}
          </div>

          {/* Actions overlay */}
          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-colors ${wishListed ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-red-50 hover:text-red-500'}`}
            >
              <Heart className={`w-4 h-4 ${wishListed ? 'fill-white' : ''}`} />
            </button>
            <Link
              href={`/product/${product._id}`}
              onClick={(e) => e.stopPropagation()}
              className="w-8 h-8 rounded-full bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-primary-50 hover:text-primary-600 flex items-center justify-center shadow-md transition-colors"
            >
              <Eye className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {product.brand && (
            <p className="text-xs font-medium text-primary-600 uppercase tracking-wide mb-1">{product.brand}</p>
          )}
          <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          {product.numReviews > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                ))}
              </div>
              <span className="text-xs text-gray-500">({product.numReviews})</span>
            </div>
          )}

          {/* Price & Cart */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="font-bold text-lg text-gray-900 dark:text-white">${price.toFixed(2)}</span>
              {hasDiscount && (
                <span className="text-xs text-gray-400 line-through ml-2">${product.price.toFixed(2)}</span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl transition-all duration-200 ${inStock ? 'bg-primary-600 hover:bg-primary-700 text-white shadow-sm hover:shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed'}`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {inStock ? 'Add' : 'Sold Out'}
            </button>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
