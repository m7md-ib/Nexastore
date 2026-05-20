const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [200, 'Product name cannot exceed 200 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    shortDescription: String,
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    comparePrice: {
      type: Number,
      min: [0, 'Compare price cannot be negative'],
    },
    images: [
      {
        url: { type: String, required: true },
        publicId: String,
        alt: String,
      },
    ],
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['Electronics', 'Clothing', 'Home & Garden', 'Sports', 'Books', 'Beauty', 'Toys', 'Automotive', 'Food', 'Other'],
    },
    brand: { type: String, trim: true },
    tags: [String],
    stock: {
      type: Number,
      required: true,
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    sku: { type: String, unique: true, sparse: true },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    soldCount: { type: Number, default: 0 },
    discount: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-generate slug from name
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

// Calculate average rating
productSchema.methods.calculateRating = function () {
  if (this.reviews.length === 0) {
    this.rating = 0;
    this.numReviews = 0;
  } else {
    const total = this.reviews.reduce((sum, review) => sum + review.rating, 0);
    this.rating = Math.round((total / this.reviews.length) * 10) / 10;
    this.numReviews = this.reviews.length;
  }
};

// Virtual for discount price
productSchema.virtual('discountedPrice').get(function () {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100) * 100) / 100;
  }
  return this.price;
});

productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Indexes for search performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });
productSchema.index({ category: 1, price: 1, rating: -1 });
productSchema.index({ slug: 1 });

module.exports = mongoose.model('Product', productSchema);
