const express = require('express');
const router = express.Router();
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardStats,
  getAllUsers
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Todas las rutas requieren autenticación y ser admin
router.use(authMiddleware);
router.use(adminMiddleware);

// Rutas de órdenes
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id', updateOrderStatus);

// Rutas de usuarios
router.get('/users', getAllUsers);

// Rutas de dashboard
router.get('/stats', getDashboardStats);

module.exports = router;