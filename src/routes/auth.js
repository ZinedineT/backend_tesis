const express = require('express');
const router = express.Router();
const { register, login, getProfile } = require('../controllers/authController');
const { authMiddleware } = require('../middleware/authMiddleware');
const { registerValidation, loginValidation} = require('../middleware/validation');

// Rutas públicas
router.post('/register',registerValidation, register);
router.post('/login',loginValidation, login);

// Ruta protegida - obtener perfil del usuario actual
router.get('/profile', authMiddleware, getProfile);

module.exports = router;
