const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: String,
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
});

const shippingAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, required: true },
});

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    orderNumber: { type: String, unique: true },
    items: [orderItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ['stripe', 'paypal', 'cod'],
      required: true,
    },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String,
      emailAddress: String,
    },
    coupon: {
      code: String,
      discount: Number,
    },
    subtotal: { type: Number, required: true },
    taxPrice: { type: Number, default: 0 },
    shippingPrice: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalPrice: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Refunded'],
      default: 'Pending',
    },
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
      },
    ],
    isPaid: { type: Boolean, default: false },
    paidAt: Date,
    isDelivered: { type: Boolean, default: false },
    deliveredAt: Date,
    trackingNumber: String,
    notes: String,
  },
  { timestamps: true }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (this.isNew) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `NX-${String(count + 1).padStart(6, '0')}`;
    this.statusHistory.push({ status: this.status, note: 'Order created' });
  }
  next();
});

// Indexes
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });

module.exports = mongoose.model('Order', orderSchema);
