const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct,
  deleteProduct, createReview, getRelatedProducts, getCategories,
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/', getProducts);
router.post('/', protect, admin, createProduct);
router.get('/:id', getProduct);
router.put('/:id', protect, admin, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);
router.post('/:id/reviews', protect, createReview);
router.get('/:id/related', getRelatedProducts);

module.exports = router;
