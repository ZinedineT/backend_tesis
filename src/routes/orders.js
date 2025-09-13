// routes/orders.js
const express = require('express');
const router = express.Router();
const { getOrder, getUserOrders } = require('../controllers/ordersController');
const { authMiddleware } = require('../middleware/authMiddleware');

router.get('/:id', authMiddleware, getOrder);
router.get('/', authMiddleware, getUserOrders);

module.exports = router;
