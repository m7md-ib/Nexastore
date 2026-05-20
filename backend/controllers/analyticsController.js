const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');

// @desc    Get dashboard summary stats
// @route   GET /api/analytics/summary
// @access  Admin
const getSummary = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders, monthOrders, lastMonthOrders,
    totalUsers, monthUsers,
    totalProducts, lowStockProducts,
    revenueData, monthRevenueData,
  ] = await Promise.all([
    Order.countDocuments(),
    Order.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Order.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    User.countDocuments({ role: 'user' }),
    User.countDocuments({ role: 'user', createdAt: { $gte: startOfMonth } }),
    Product.countDocuments({ isActive: true }),
    Product.countDocuments({ isActive: true, stock: { $lte: 10 } }),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' }, createdAt: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
  ]);

  const totalRevenue = revenueData[0]?.total || 0;
  const monthRevenue = monthRevenueData[0]?.total || 0;

  res.json({
    success: true,
    data: {
      totalRevenue,
      monthRevenue,
      totalOrders,
      monthOrders,
      orderGrowth: lastMonthOrders ? ((monthOrders - lastMonthOrders) / lastMonthOrders * 100).toFixed(1) : 0,
      totalUsers,
      monthUsers,
      totalProducts,
      lowStockProducts,
    },
  });
});

// @desc    Get sales over time (last 12 months)
// @route   GET /api/analytics/sales
// @access  Admin
const getSalesChart = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);
  startDate.setHours(0, 0, 0, 0);

  const salesData = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: { $ne: 'Cancelled' },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  // Fill missing months
  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const found = salesData.find(s => s._id.year === year && s._id.month === month);
    result.push({
      month: d.toLocaleString('default', { month: 'short' }),
      year,
      revenue: found ? Math.round(found.revenue * 100) / 100 : 0,
      orders: found ? found.orders : 0,
    });
  }

  res.json({ success: true, data: result });
});

// @desc    Get best selling products
// @route   GET /api/analytics/best-sellers
// @access  Admin
const getBestSellers = asyncHandler(async (req, res) => {
  const products = await Product.find({ isActive: true })
    .sort({ soldCount: -1 })
    .limit(10)
    .select('name images price soldCount rating category')
    .lean();

  res.json({ success: true, data: products });
});

// @desc    Get user growth over time
// @route   GET /api/analytics/user-growth
// @access  Admin
const getUserGrowth = asyncHandler(async (req, res) => {
  const months = parseInt(req.query.months) || 12;
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months + 1);
  startDate.setDate(1);

  const userData = await User.aggregate([
    { $match: { createdAt: { $gte: startDate }, role: 'user' } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const result = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const found = userData.find(u => u._id.year === year && u._id.month === month);
    result.push({
      month: d.toLocaleString('default', { month: 'short' }),
      year,
      users: found ? found.count : 0,
    });
  }

  res.json({ success: true, data: result });
});

// @desc    Get orders by status
// @route   GET /api/analytics/order-status
// @access  Admin
const getOrderStatusBreakdown = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);

  res.json({ success: true, data });
});

// @desc    Get category revenue breakdown
// @route   GET /api/analytics/category-revenue
// @access  Admin
const getCategoryRevenue = asyncHandler(async (req, res) => {
  const data = await Order.aggregate([
    { $match: { status: { $ne: 'Cancelled' } } },
    { $unwind: '$items' },
    {
      $lookup: {
        from: 'products',
        localField: 'items.product',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: '$product' },
    {
      $group: {
        _id: '$product.category',
        revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        units: { $sum: '$items.quantity' },
      },
    },
    { $sort: { revenue: -1 } },
  ]);

  res.json({ success: true, data });
});

module.exports = { getSummary, getSalesChart, getBestSellers, getUserGrowth, getOrderStatusBreakdown, getCategoryRevenue };
