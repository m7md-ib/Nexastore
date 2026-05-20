const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed'],
      required: true,
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: 0,
    },
    minOrderAmount: { type: Number, default: 0 },
    maxDiscount: Number, // max discount for percentage coupons
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },
    userUsageLimit: { type: Number, default: 1 }, // per user
    usedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    startDate: { type: Date, default: Date.now },
    endDate: Date,
    isActive: { type: Boolean, default: true },
    applicableCategories: [String], // empty = all categories
  },
  { timestamps: true }
);

// Check if coupon is valid
couponSchema.methods.isValid = function (userId, orderAmount) {
  const now = new Date();

  if (!this.isActive) return { valid: false, message: 'Coupon is not active' };
  if (this.endDate && now > this.endDate) return { valid: false, message: 'Coupon has expired' };
  if (now < this.startDate) return { valid: false, message: 'Coupon is not yet valid' };
  if (this.usageLimit && this.usedCount >= this.usageLimit) return { valid: false, message: 'Coupon usage limit reached' };
  if (orderAmount < this.minOrderAmount) return { valid: false, message: `Minimum order amount is $${this.minOrderAmount}` };

  const userUsed = this.usedBy.filter((id) => id.toString() === userId.toString()).length;
  if (userUsed >= this.userUsageLimit) return { valid: false, message: 'You have already used this coupon' };

  return { valid: true };
};

// Calculate discount
couponSchema.methods.calculateDiscount = function (orderAmount) {
  if (this.discountType === 'percentage') {
    const discount = (orderAmount * this.discountValue) / 100;
    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
  }
  return Math.min(this.discountValue, orderAmount);
};

module.exports = mongoose.model('Coupon', couponSchema);
