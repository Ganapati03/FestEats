const express = require('express');
const { createOrder, getMyOrders, getAllOrders, updateOrderStatus, updatePaymentStatus } = require('../controllers/orderController');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();

router.post('/', auth, createOrder);
router.get('/my', auth, getMyOrders);
router.get('/', auth, admin, getAllOrders);
router.put('/:id/status', auth, admin, updateOrderStatus);
router.put('/:id/payment-status', auth, admin, updatePaymentStatus);

module.exports = router;
