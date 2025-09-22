const express = require('express');
const multer = require('multer');
const router = express.Router();
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
  getAllUsers
} = require('../controllers/adminController');
const {
  getProducts,
  getCategories,
  createProduct,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
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
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);

// Rutas de productos (admin)
router.get('/products', getProducts);
router.get('/products/categories', getCategories);
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);
// Rutas de dashboard
router.get('/stats', getDashboardStats);
// Agrega esta línea con las demás rutas:
router.post('/upload', upload.single('image'), (req, res) => {
  res.json({ imageUrl: req.file.path});
});

module.exports = router;
