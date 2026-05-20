const asyncHandler = require('express-async-handler');
const Coupon = require('../models/Coupon');

const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });
  res.json({ success: true, data: coupons });
});

const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create(req.body);
  res.status(201).json({ success: true, data: coupon });
});

const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, data: coupon });
});

const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndDelete(req.params.id);
  if (!coupon) { res.status(404); throw new Error('Coupon not found'); }
  res.json({ success: true, message: 'Coupon deleted' });
});

const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;
  const coupon = await Coupon.findOne({ code: code?.toUpperCase() });
  if (!coupon) { res.status(404); throw new Error('Invalid coupon code'); }

  const validation = coupon.isValid(req.user._id, orderAmount || 0);
  if (!validation.valid) { res.status(400); throw new Error(validation.message); }

  const discount = coupon.calculateDiscount(orderAmount || 0);
  res.json({
    success: true,
    data: {
      code: coupon.code,
      description: coupon.description,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discount,
    },
  });
});

module.exports = { getCoupons, createCoupon, updateCoupon, deleteCoupon, validateCoupon };
