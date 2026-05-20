const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');

// @desc    Get all products with filtering, search, pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 12;
  const skip = (page - 1) * limit;

  const query = { isActive: true };

  // Text search
  if (req.query.search) {
    query.$text = { $search: req.query.search };
  }

  // Category filter
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Brand filter
  if (req.query.brand) {
    query.brand = { $regex: req.query.brand, $options: 'i' };
  }

  // Price range
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
  }

  // Rating filter
  if (req.query.minRating) {
    query.rating = { $gte: parseFloat(req.query.minRating) };
  }

  // In stock only
  if (req.query.inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  // Featured
  if (req.query.featured === 'true') {
    query.isFeatured = true;
  }

  // Tags
  if (req.query.tags) {
    query.tags = { $in: req.query.tags.split(',') };
  }

  // Sorting
  let sortBy = {};
  switch (req.query.sort) {
    case 'price-asc': sortBy = { price: 1 }; break;
    case 'price-desc': sortBy = { price: -1 }; break;
    case 'rating': sortBy = { rating: -1 }; break;
    case 'newest': sortBy = { createdAt: -1 }; break;
    case 'popular': sortBy = { soldCount: -1 }; break;
    default: sortBy = { createdAt: -1 };
  }

  const [products, total] = await Promise.all([
    Product.find(query).sort(sortBy).skip(skip).limit(limit).lean(),
    Product.countDocuments(query),
  ]);

  res.json({
    success: true,
    data: products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    },
  });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findOne({
    $or: [{ _id: req.params.id.match(/^[0-9a-fA-F]{24}$/) ? req.params.id : null }, { slug: req.params.id }],
    isActive: true,
  }).populate('reviews.user', 'name avatar');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

// @desc    Create product
// @route   POST /api/products
// @access  Admin
const createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Admin
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, data: product });
});

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Admin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json({ success: true, message: 'Product removed' });
});

// @desc    Create/Update product review
// @route   POST /api/products/:id/reviews
// @access  Private
const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;

  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    alreadyReviewed.rating = rating;
    alreadyReviewed.comment = comment;
  } else {
    product.reviews.push({
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment,
    });
  }

  product.calculateRating();
  await product.save();

  res.status(201).json({ success: true, message: 'Review submitted', data: product });
});

// @desc    Get featured/related products
// @route   GET /api/products/:id/related
// @access  Public
const getRelatedProducts = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const related = await Product.find({
    category: product.category,
    _id: { $ne: product._id },
    isActive: true,
  }).limit(6).lean();

  res.json({ success: true, data: related });
});

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const categories = await Product.distinct('category', { isActive: true });
  res.json({ success: true, data: categories });
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  getRelatedProducts,
  getCategories,
};
