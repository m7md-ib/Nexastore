'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Star, Truck, Shield, RefreshCcw, Minus, Plus, Share2, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { productAPI, authAPI } from '@/lib/api';
import useCartStore from '@/store/cartStore';
import useAuthStore from '@/store/authStore';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [wishListed, setWishListed] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  const addItem = useCartStore((s) => s.addItem);
  const { isLoggedIn, user } = useAuthStore();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [pRes, rRes] = await Promise.all([
          productAPI.getById(id),
          productAPI.getRelated(id),
        ]);
        setProduct(pRes.data.data);
        setRelated(rRes.data.data);
      } catch { toast.error('Product not found'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast.success(`${quantity} item(s) added to cart!`);
  };

  const handleWishlist = async () => {
    if (!isLoggedIn()) { toast.error('Please login first'); return; }
    try {
      await authAPI.toggleWishlist(product._id);
      setWishListed(!wishListed);
      toast.success(wishListed ? 'Removed from wishlist' : 'Added to wishlist!');
    } catch { toast.error('Something went wrong'); }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn()) { toast.error('Please login to leave a review'); return; }
    setSubmittingReview(true);
    try {
      const { data } = await productAPI.createReview(product._id, { rating: reviewRating, comment: reviewText });
      setProduct(data.data);
      setReviewText('');
      setReviewRating(5);
      toast.success('Review submitted!');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Error submitting review');
    } finally { setSubmittingReview(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20 page-container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="skeleton h-96 rounded-2xl" />
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => <div key={i} className={`skeleton h-${i === 0 ? 8 : 4} w-${i === 0 ? 'full' : '3/4'} rounded`} />)}
          </div>
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center"><p className="text-gray-500">Product not found.</p></div>
      <Footer />
    </div>
  );

  const price = product.discountedPrice ?? product.price;
  const inStock = product.stock > 0;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 pt-20">
        <div className="page-container py-8">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-primary-600">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href="/shop" className="hover:text-primary-600">Shop</Link>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/shop?category=${product.category}`} className="hover:text-primary-600">{product.category}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 dark:text-white line-clamp-1">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Images */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 mb-4">
                {product.images?.[selectedImage]?.url ? (
                  <Image src={product.images[selectedImage].url} alt={product.images[selectedImage].alt || product.name} fill className="object-cover" />
                ) : <div className="flex items-center justify-center h-full text-8xl">📦</div>}
                {product.discount > 0 && <span className="absolute top-4 left-4 badge bg-red-500 text-white px-3 py-1">-{product.discount}% OFF</span>}
              </div>
              {product.images?.length > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2">
                  {product.images.map((img, i) => (
                    <button key={i} onClick={() => setSelectedImage(i)} className={`relative w-20 h-20 shrink-0 rounded-xl overflow-hidden border-2 transition-all ${i === selectedImage ? 'border-primary-600' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'}`}>
                      <Image src={img.url} alt={img.alt || ''} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {product.brand && <p className="text-primary-600 font-semibold text-sm uppercase tracking-wide">{product.brand}</p>}
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{product.name}</h1>

              {/* Rating */}
              <div className="flex items-center gap-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'}`} />
                  ))}
                </div>
                <span className="text-gray-600 dark:text-gray-400 text-sm">{product.rating} ({product.numReviews} reviews)</span>
                {inStock ? <span className="text-green-600 text-sm font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-lg">In Stock ({product.stock})</span>
                  : <span className="text-red-600 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-lg">Out of Stock</span>}
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold text-gray-900 dark:text-white">${price.toFixed(2)}</span>
                {product.discount > 0 && <span className="text-xl text-gray-400 line-through">${product.price.toFixed(2)}</span>}
                {product.discount > 0 && <span className="text-green-600 font-semibold text-sm">Save ${(product.price - price).toFixed(2)}</span>}
              </div>

              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{product.shortDescription || product.description}</p>

              {/* Quantity */}
              {inStock && (
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-5 py-2 font-semibold text-gray-900 dark:text-white min-w-[3rem] text-center">{quantity}</span>
                    <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button onClick={handleAddToCart} disabled={!inStock} className="flex-1 btn-primary flex items-center justify-center gap-2 text-base py-4">
                  <ShoppingCart className="w-5 h-5" />
                  {inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
                <button onClick={handleWishlist} className={`p-4 rounded-xl border-2 transition-all ${wishListed ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-500' : 'border-gray-200 dark:border-gray-700 hover:border-red-300 text-gray-600 dark:text-gray-400'}`}>
                  <Heart className={`w-5 h-5 ${wishListed ? 'fill-red-500' : ''}`} />
                </button>
                <button onClick={() => { navigator.share?.({ title: product.name, url: window.location.href }) || navigator.clipboard.writeText(window.location.href).then(() => toast.success('Link copied!')); }} className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-gray-400 text-gray-600 dark:text-gray-400 transition-all">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>

              {/* Shipping info */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[{ Icon: Truck, label: 'Free shipping over $100' }, { Icon: Shield, label: 'Secure checkout' }, { Icon: RefreshCcw, label: '30-day returns' }].map(({ Icon, label }) => (
                  <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3 text-center">
                    <Icon className="w-5 h-5 mx-auto mb-1.5 text-primary-600" />
                    <p className="text-xs text-gray-600 dark:text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Description & Reviews Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Description</h2>
              <div className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed">
                {product.description}
              </div>
            </div>
            <div className="card p-6">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4">Product Info</h3>
              <dl className="space-y-3 text-sm">
                {[['SKU', product.sku || 'N/A'], ['Category', product.category], ['Brand', product.brand || 'N/A'], ['Stock', product.stock], ['Sold', `${product.soldCount} units`]].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <dt className="text-gray-500">{label}</dt>
                    <dd className="font-medium text-gray-900 dark:text-white">{val}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          {/* Reviews */}
          <div className="mb-16">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Customer Reviews ({product.numReviews})</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div>
                {/* Rating summary */}
                <div className="card p-6 text-center mb-6">
                  <div className="text-6xl font-bold text-gray-900 dark:text-white mb-2">{product.rating}</div>
                  <div className="flex justify-center mb-2">
                    {[...Array(5)].map((_, i) => <Star key={i} className={`w-6 h-6 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
                  </div>
                  <p className="text-gray-500 text-sm">Based on {product.numReviews} reviews</p>
                </div>

                {/* Write review */}
                {isLoggedIn() && (
                  <div className="card p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-4">Write a Review</h3>
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rating</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((r) => (
                            <button key={r} type="button" onClick={() => setReviewRating(r)}>
                              <Star className={`w-7 h-7 ${r <= reviewRating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200 dark:text-gray-700'} transition-colors`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Review</label>
                        <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)} className="input resize-none" rows={4} placeholder="Share your experience..." required />
                      </div>
                      <button type="submit" disabled={submittingReview} className="btn-primary w-full">
                        {submittingReview ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  </div>
                )}
              </div>

              {/* Reviews list */}
              <div className="lg:col-span-2 space-y-4">
                {product.reviews?.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">No reviews yet. Be the first to review!</div>
                ) : (
                  product.reviews?.map((review) => (
                    <div key={review._id} className="card p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center font-bold text-primary-600 text-sm">
                            {review.name?.[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white text-sm">{review.name}</p>
                            <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />)}
                        </div>
                      </div>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">{review.comment}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Related Products */}
          {related.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Related Products</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {related.map((p) => <ProductCard key={p._id} product={p} />)}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
