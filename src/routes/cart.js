const express = require('express');
const router = express.Router();
const {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  mergeCart
} = require('../controllers/cartController');
const { authMiddleware } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

router.get('/', getCart);
router.post('/', addToCart);
router.delete('/:productId', removeFromCart);
router.delete('/', clearCart);
router.post('/merge', mergeCart);
router.put('/item/:productId', updateQuantity);

module.exports = router;
