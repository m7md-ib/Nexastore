'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, ShoppingBag, Star, Truck, Shield, RefreshCcw, Headphones } from 'lucide-react';
import { productAPI } from '@/lib/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/product/ProductCard';

const CATEGORIES = [
  { name: 'Electronics', icon: '💻', color: 'from-blue-500 to-cyan-500', href: '/shop?category=Electronics' },
  { name: 'Clothing', icon: '👗', color: 'from-pink-500 to-rose-500', href: '/shop?category=Clothing' },
  { name: 'Home & Garden', icon: '🏠', color: 'from-green-500 to-emerald-500', href: '/shop?category=Home+%26+Garden' },
  { name: 'Sports', icon: '⚽', color: 'from-orange-500 to-amber-500', href: '/shop?category=Sports' },
  { name: 'Beauty', icon: '✨', color: 'from-purple-500 to-violet-500', href: '/shop?category=Beauty' },
  { name: 'Books', icon: '📚', color: 'from-yellow-500 to-orange-500', href: '/shop?category=Books' },
];

const FEATURES = [
  { icon: Truck, title: 'Free Shipping', desc: 'On orders over $100', color: 'text-blue-500' },
  { icon: Shield, title: 'Secure Payment', desc: '100% protected payments', color: 'text-green-500' },
  { icon: RefreshCcw, title: 'Easy Returns', desc: '30-day return policy', color: 'text-purple-500' },
  { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support team', color: 'text-orange-500' },
];

const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0 } };

export default function HomePage() {
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [featRes, newRes] = await Promise.all([
          productAPI.getAll({ featured: true, limit: 4 }),
          productAPI.getAll({ sort: 'newest', limit: 8 }),
        ]);
        setFeatured(featRes.data.data);
        setNewArrivals(newRes.data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white pt-20">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.04%22%3E%3Cpath d=%22M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30" />
        <div className="page-container relative py-24 lg:py-36 flex flex-col lg:flex-row items-center gap-12">
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
              Trusted by 50,000+ customers
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
              Shop the Future<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-cyan-300">
                Today at NexaStore
              </span>
            </h1>
            <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto lg:mx-0">
              Discover thousands of premium products at unbeatable prices. Fast shipping, easy returns, and world-class customer support.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/shop" className="btn-primary bg-white text-primary-700 hover:bg-blue-50 flex items-center justify-center gap-2 text-base">
                <ShoppingBag className="w-5 h-5" /> Shop Now
              </Link>
              <Link href="/shop?featured=true" className="btn-outline border-white text-white hover:bg-white hover:text-primary-700 flex items-center justify-center gap-2 text-base">
                Featured Products <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
          <motion.div
            className="flex-1 hidden lg:flex justify-center"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative w-96 h-96">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-cyan-400/20 rounded-3xl backdrop-blur-sm border border-white/10" />
              <div className="absolute top-8 left-8 right-8 bottom-8 grid grid-cols-2 gap-4">
                {['📱','💻','👟','⌚'].map((emoji, i) => (
                  <motion.div
                    key={i}
                    className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl flex items-center justify-center text-5xl"
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 2, delay: i * 0.3, repeat: Infinity }}
                  >
                    {emoji}
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white dark:from-gray-950 to-transparent" />
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50 dark:bg-gray-900/50">
        <div className="page-container grid grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURES.map(({ icon: Icon, title, desc, color }, i) => (
            <motion.div
              key={title}
              className="flex items-center gap-4 p-4"
              initial="hidden" whileInView="visible" viewport={{ once: true }}
              variants={fadeUp} transition={{ delay: i * 0.1 }}
            >
              <div className={`p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm ${color}`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white text-sm">{title}</p>
                <p className="text-gray-500 text-xs">{desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="page-container">
          <motion.div className="text-center mb-10" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
            <h2 className="section-title mb-3">Shop by Category</h2>
            <p className="text-gray-500 dark:text-gray-400">Find exactly what you're looking for</p>
          </motion.div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map(({ name, icon, color, href }, i) => (
              <motion.div key={name} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.07 }}>
                <Link href={href} className="group block text-center">
                  <div className={`bg-gradient-to-br ${color} rounded-2xl p-6 mb-3 shadow-sm group-hover:shadow-lg group-hover:scale-105 transition-all duration-300`}>
                    <span className="text-4xl">{icon}</span>
                  </div>
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 group-hover:text-primary-600 transition-colors">{name}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/30">
        <div className="page-container">
          <div className="flex items-center justify-between mb-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="section-title mb-1">Featured Products</h2>
              <p className="text-gray-500 dark:text-gray-400">Handpicked just for you</p>
            </motion.div>
            <Link href="/shop?featured=true" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featured.map((p, i) => (
                <motion.div key={p._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.1 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Promo Banner */}
      <section className="py-16">
        <div className="page-container">
          <motion.div
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-accent-600 to-primary-600 text-white p-10 lg:p-16 text-center"
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2240%22 height=%2240%22 viewBox=%220 0 40 40%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22%23fff%22 fill-opacity=%220.05%22%3E%3Cpath d=%22M20 0L0 20L20 40L40 20z%22/%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
            <div className="relative">
              <span className="badge bg-white/20 text-white mb-4 text-sm px-4 py-1.5">Limited Time Offer</span>
              <h2 className="text-3xl lg:text-5xl font-bold mb-4">Up to 40% Off</h2>
              <p className="text-lg text-white/80 mb-8">Use code <span className="font-mono font-bold bg-white/20 px-3 py-1 rounded-lg">WELCOME20</span> on your first order</p>
              <Link href="/shop" className="inline-flex items-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-lg">
                Shop Now <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/30">
        <div className="page-container">
          <div className="flex items-center justify-between mb-10">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="section-title mb-1">New Arrivals</h2>
              <p className="text-gray-500 dark:text-gray-400">Fresh products just landed</p>
            </motion.div>
            <Link href="/shop?sort=newest" className="text-primary-600 hover:text-primary-700 font-semibold flex items-center gap-1 text-sm">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((p, i) => (
                <motion.div key={p._id} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} transition={{ delay: i * 0.07 }}>
                  <ProductCard product={p} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="card p-4 space-y-3">
      <div className="skeleton h-56 w-full rounded-xl" />
      <div className="skeleton h-4 w-3/4" />
      <div className="skeleton h-4 w-1/2" />
      <div className="skeleton h-8 w-full" />
    </div>
  );
}
