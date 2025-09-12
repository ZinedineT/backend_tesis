// En ../middleware/validation.js - MODIFICA ESTE ARCHIVO

const { body, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: 'Datos de entrada inválidos',
      errors: errors.array()
    });
  }
  next();
};

// Validación SOLO para registro
const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('La contraseña debe tener al menos 6 caracteres'),
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('El nombre debe tener entre 2 y 50 caracteres'),
  handleValidationErrors
];

// Validación SOLO para login (solo email y password)
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Debe ser un email válido'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('La contraseña es requerida'),
  handleValidationErrors
];

const productValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('El título debe tener entre 3 y 200 caracteres'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('La descripción debe tener entre 10 y 1000 caracteres'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('El precio debe ser un número positivo'),
  body('stock')
    .isInt({ min: 0 })
    .withMessage('El stock debe ser un número entero positivo'),
  body('category')
    .trim()
    .notEmpty()
    .withMessage('La categoría es requerida'),
  handleValidationErrors
];

module.exports = {
  productValidation,
  registerValidation, // Cambiado de userValidation
  loginValidation,    // Nueva validación para login
  handleValidationErrors
};
