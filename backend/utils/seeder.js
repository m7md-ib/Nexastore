const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Coupon = require('../models/Coupon');

const connectDB = require('../config/db');

const products = [
  {
    name: 'Sony WH-1000XM5 Wireless Headphones',
    description: 'Industry-leading noise cancellation with the new QN2 HD processor. Up to 30-hour battery life with quick charge. Speak-to-Chat technology, multipoint connection.',
    shortDescription: 'Premium noise-cancelling wireless headphones.',
    price: 349.99,
    comparePrice: 399.99,
    category: 'Electronics',
    brand: 'Sony',
    stock: 45,
    images: [{ url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800', alt: 'Sony Headphones' }],
    isFeatured: true,
    tags: ['headphones', 'wireless', 'noise-cancelling'],
    discount: 12,
  },
  {
    name: 'MacBook Pro 14" M3 Pro',
    description: 'The M3 Pro chip with 11-core CPU and 14-core GPU delivers exceptional performance. Liquid Retina XDR display, 18-hour battery life.',
    shortDescription: 'Apple M3 Pro chip, Liquid Retina XDR display.',
    price: 1999.00,
    comparePrice: 2199.00,
    category: 'Electronics',
    brand: 'Apple',
    stock: 20,
    images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800', alt: 'MacBook Pro' }],
    isFeatured: true,
    tags: ['laptop', 'apple', 'macbook'],
    discount: 9,
  },
  {
    name: 'Nike Air Max 270',
    description: 'The Nike Air Max 270 is inspired by two icons of Air: the Air Max 180 and Air Max 93. The design draws on their combined heritage to create a shoe with the biggest heel Air unit yet.',
    shortDescription: 'Lifestyle shoes with max Air cushioning.',
    price: 150.00,
    comparePrice: 180.00,
    category: 'Clothing',
    brand: 'Nike',
    stock: 120,
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800', alt: 'Nike Air Max 270' }],
    isFeatured: true,
    tags: ['shoes', 'nike', 'sneakers'],
    discount: 16,
  },
  {
    name: 'Dyson V15 Detect Vacuum',
    description: 'Laser Detect technology to reveal hidden dust. Acoustic piezo sensor counts and measures dust particles. Up to 60 minutes of powerful suction.',
    shortDescription: 'Cordless vacuum with laser dust detection.',
    price: 749.99,
    category: 'Home & Garden',
    brand: 'Dyson',
    stock: 30,
    images: [{ url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800', alt: 'Dyson Vacuum' }],
    isFeatured: false,
    tags: ['vacuum', 'dyson', 'cleaning'],
  },
  {
    name: 'Levi\'s 501 Original Jeans',
    description: 'The original blue jean since 1873. Straight fit with button fly. Made from 100% cotton denim that gets better with age.',
    shortDescription: 'The original blue jean, straight fit.',
    price: 79.50,
    comparePrice: 98.00,
    category: 'Clothing',
    brand: "Levi's",
    stock: 200,
    images: [{ url: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800', alt: "Levi's 501" }],
    tags: ['jeans', 'denim', 'levis'],
    discount: 18,
  },
  {
    name: 'Samsung 65" QLED 4K TV',
    description: 'Quantum HDR 32X, Neo Quantum Processor 4K, Motion Xcelerator Turbo+. Smart TV with Alexa built-in. Object Tracking Sound+ for immersive audio.',
    shortDescription: '65" QLED 4K Smart TV with Quantum HDR.',
    price: 1297.99,
    comparePrice: 1599.99,
    category: 'Electronics',
    brand: 'Samsung',
    stock: 15,
    images: [{ url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f4834c?w=800', alt: 'Samsung TV' }],
    isFeatured: true,
    tags: ['tv', 'samsung', '4k', 'qled'],
    discount: 18,
  },
  {
    name: 'Instant Pot Duo 7-in-1',
    description: 'Pressure cooker, slow cooker, rice cooker, steamer, sauté, yogurt maker, and warmer. 6-quart capacity, 14 one-touch programs.',
    shortDescription: '7-in-1 electric pressure cooker.',
    price: 89.99,
    comparePrice: 119.99,
    category: 'Home & Garden',
    brand: 'Instant Pot',
    stock: 75,
    images: [{ url: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=800', alt: 'Instant Pot' }],
    tags: ['cooking', 'pressure-cooker', 'kitchen'],
    discount: 25,
  },
  {
    name: 'Yoga Pro 9i Laptop',
    description: 'Intel Core Ultra 9 processor, 32GB RAM, 1TB SSD. 16" 4K OLED display with 120Hz refresh rate. Slim and powerful design for creators.',
    shortDescription: 'Creator laptop with 4K OLED display.',
    price: 1799.00,
    category: 'Electronics',
    brand: 'Lenovo',
    stock: 25,
    images: [{ url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800', alt: 'Lenovo Yoga' }],
    tags: ['laptop', 'lenovo', 'creator'],
  },
  {
    name: 'The Ordinary Skincare Set',
    description: 'Complete skincare routine set including Hyaluronic Acid 2% + B5, Niacinamide 10% + Zinc 1%, Retinol 0.5% in Squalane, and more.',
    shortDescription: 'Complete skincare routine starter kit.',
    price: 45.00,
    comparePrice: 65.00,
    category: 'Beauty',
    brand: 'The Ordinary',
    stock: 150,
    images: [{ url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800', alt: 'Skincare Set' }],
    isFeatured: true,
    tags: ['skincare', 'beauty', 'serum'],
    discount: 30,
  },
  {
    name: 'Atomic Habits - James Clear',
    description: 'An Easy & Proven Way to Build Good Habits & Break Bad Ones. The most comprehensive guide on how to change your habits and get 1% better every day.',
    shortDescription: 'The transformative habit-building bestseller.',
    price: 16.99,
    comparePrice: 27.00,
    category: 'Books',
    brand: 'Penguin Random House',
    stock: 300,
    images: [{ url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800', alt: 'Atomic Habits' }],
    tags: ['books', 'self-help', 'habits'],
    discount: 37,
  },
  {
    name: 'Peloton Bike+',
    description: 'Auto-resistance changes when the instructor calls it. 23.8" rotating HD touchscreen. Slate frame, carbon steel and aluminum construction.',
    shortDescription: 'Premium indoor exercise bike with auto-resistance.',
    price: 2495.00,
    category: 'Sports',
    brand: 'Peloton',
    stock: 10,
    images: [{ url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', alt: 'Peloton Bike' }],
    isFeatured: true,
    tags: ['fitness', 'cycling', 'exercise'],
  },
  {
    name: 'AirPods Pro (2nd Gen)',
    description: 'Active Noise Cancellation for immersive sound. Adaptive Transparency lets you hear your surroundings. Personalized Spatial Audio with dynamic head tracking.',
    shortDescription: 'Active noise cancellation, Spatial Audio.',
    price: 249.00,
    comparePrice: 279.00,
    category: 'Electronics',
    brand: 'Apple',
    stock: 60,
    images: [{ url: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800', alt: 'AirPods Pro' }],
    isFeatured: true,
    tags: ['airpods', 'apple', 'earbuds'],
    discount: 10,
  },
];

const coupons = [
  {
    code: 'WELCOME20',
    description: '20% off your first order',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 50,
    maxDiscount: 100,
    usageLimit: 1000,
    userUsageLimit: 1,
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'SAVE50',
    description: '$50 off orders over $200',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 200,
    usageLimit: 500,
    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
  },
  {
    code: 'FREESHIP',
    description: 'Free shipping on any order',
    discountType: 'fixed',
    discountValue: 9.99,
    usageLimit: null,
  },
];

const importData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Coupon.deleteMany();

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@nexastore.com',
      password: 'Admin@123456',
      role: 'admin',
    });

    // Create test user
    const user = await User.create({
      name: 'John Doe',
      email: 'user@nexastore.com',
      password: 'User@123456',
      role: 'user',
    });

    // Create products
    const createdProducts = await Product.insertMany(products);

    // Create sample orders
    await Order.create({
      user: user._id,
      items: [
        {
          product: createdProducts[0]._id,
          name: createdProducts[0].name,
          image: createdProducts[0].images[0].url,
          price: createdProducts[0].price,
          quantity: 1,
        },
      ],
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        postalCode: '10001',
        country: 'US',
      },
      paymentMethod: 'stripe',
      subtotal: createdProducts[0].price,
      taxPrice: 28.00,
      shippingPrice: 0,
      totalPrice: createdProducts[0].price + 28.00,
      status: 'Delivered',
      isPaid: true,
      paidAt: new Date(),
      isDelivered: true,
      deliveredAt: new Date(),
    });

    // Create coupons
    await Coupon.insertMany(coupons);

    console.log('✅ Data seeded successfully!');
    console.log('👤 Admin: admin@nexastore.com / Admin@123456');
    console.log('👤 User:  user@nexastore.com / User@123456');
    console.log('🏷️  Coupons: WELCOME20, SAVE50, FREESHIP');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

const destroyData = async () => {
  try {
    await connectDB();
    await User.deleteMany();
    await Product.deleteMany();
    await Order.deleteMany();
    await Coupon.deleteMany();
    console.log('✅ Data destroyed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

if (process.argv[2] === '-d') {
  destroyData();
} else {
  importData();
}
