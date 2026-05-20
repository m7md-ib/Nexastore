const express = require('express');
const router = express.Router();
const {
  getSummary, getSalesChart, getBestSellers,
  getUserGrowth, getOrderStatusBreakdown, getCategoryRevenue,
} = require('../controllers/analyticsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.use(protect, admin);
router.get('/summary', getSummary);
router.get('/sales', getSalesChart);
router.get('/best-sellers', getBestSellers);
router.get('/user-growth', getUserGrowth);
router.get('/order-status', getOrderStatusBreakdown);
router.get('/category-revenue', getCategoryRevenue);

module.exports = router;
