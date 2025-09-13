const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  getOrderStatus,
  handleStripeWebhook
} = require('../controllers/checkoutController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Rutas protegidas
router.post('/session', authMiddleware, createCheckoutSession);
router.get('/order-status/:sessionId', authMiddleware, getOrderStatus);

module.exports = router;
