const express = require('express');
const router = express.Router();
const {
  createCheckoutSession,
  getOrderStatus,
  handleStripeWebhook
} = require('../controllers/checkoutController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Webhook debe estar sin autenticación (Stripe lo llama directamente)
router.post('/webhooks/stripe', handleStripeWebhook);

// Rutas protegidas
router.post('/session', authMiddleware, createCheckoutSession);
router.get('/order-status/:sessionId', authMiddleware, getOrderStatus);

module.exports = router;