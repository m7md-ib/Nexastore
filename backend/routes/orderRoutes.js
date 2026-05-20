const express = require('express');
const router = express.Router();
const {
  createOrder, getMyOrders, getOrder,
  getAllOrders, updateOrderStatus, cancelOrder,
} = require('../controllers/orderController');
const { protect, admin } = require('../middleware/authMiddleware');

router.post('/', protect, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/', protect, admin, getAllOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, admin, updateOrderStatus);
router.put('/:id/cancel', protect, cancelOrder);

module.exports = router;
