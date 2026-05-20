const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Coupon = require('../models/Coupon');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = asyncHandler(async (req, res) => {
  const { items, shippingAddress, paymentMethod, couponCode, paymentResult } = req.body;

  if (!items?.length) {
    res.status(400);
    throw new Error('No order items');
  }

  // Validate items and calculate prices
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      res.status(404);
      throw new Error(`Product not found: ${item.product}`);
    }
    if (product.stock < item.quantity) {
      res.status(400);
      throw new Error(`Insufficient stock for ${product.name}`);
    }

    const price = product.discountedPrice || product.price;
    subtotal += price * item.quantity;

    orderItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url,
      price,
      quantity: item.quantity,
    });

    // Deduct stock
    product.stock -= item.quantity;
    product.soldCount += item.quantity;
    await product.save();
  }

  // Apply coupon
  let discountAmount = 0;
  let couponData = null;

  if (couponCode) {
    const coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (coupon) {
      const validation = coupon.isValid(req.user._id, subtotal);
      if (validation.valid) {
        discountAmount = coupon.calculateDiscount(subtotal);
        couponData = { code: coupon.code, discount: discountAmount };
        coupon.usedCount += 1;
        coupon.usedBy.push(req.user._id);
        await coupon.save();
      }
    }
  }

  const taxPrice = Math.round(subtotal * 0.08 * 100) / 100; // 8% tax
  const shippingPrice = subtotal > 100 ? 0 : 9.99; // Free shipping over $100
  const totalPrice = Math.round((subtotal + taxPrice + shippingPrice - discountAmount) * 100) / 100;

  const order = await Order.create({
    user: req.user._id,
    items: orderItems,
    shippingAddress,
    paymentMethod,
    paymentResult,
    coupon: couponData,
    subtotal,
    taxPrice,
    shippingPrice,
    discountAmount,
    totalPrice,
    isPaid: paymentResult ? true : paymentMethod === 'cod' ? false : false,
    paidAt: paymentResult ? Date.now() : undefined,
  });

  // Emit socket event for real-time update
  const io = req.app.get('io');
  if (io) {
    io.emit('newOrder', { orderId: order._id, orderNumber: order.orderNumber });
  }

  res.status(201).json({ success: true, data: order });
});

// @desc    Get user's orders
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  // Users can only view their own orders (admins can view all)
  if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }

  res.json({ success: true, data: order });
});

// @desc    Get all orders (admin)
// @route   GET /api/orders
// @access  Admin
const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.status = req.query.status;
  if (req.query.userId) query.user = req.query.userId;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

// @desc    Update order status (admin)
// @route   PUT /api/orders/:id/status
// @access  Admin
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

  if (trackingNumber) order.trackingNumber = trackingNumber;

  if (status === 'Delivered') {
    order.isDelivered = true;
    order.deliveredAt = Date.now();
  }

  await order.save();

  // Emit real-time update
  const io = req.app.get('io');
  if (io) {
    io.to(`order_${order._id}`).emit('orderStatusUpdate', {
      orderId: order._id,
      status: order.status,
    });
  }

  res.json({ success: true, data: order });
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.user.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Not authorized');
  }

  if (!['Pending', 'Processing'].includes(order.status)) {
    res.status(400);
    throw new Error('Order cannot be cancelled at this stage');
  }

  // Restore stock
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  order.status = 'Cancelled';
  order.statusHistory.push({ status: 'Cancelled', note: 'Cancelled by customer' });
  await order.save();

  res.json({ success: true, data: order });
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
};
