const Product = require('../models/Product.model');
const { validationResult } = require('express-validator');

// Obtener todos los productos con paginación y filtros
const getProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const category = req.query.category;
    const search = req.query.search?.trim();

    // Construir objeto de filtro
    let filter = {};
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (search && search.length > 0) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    // Obtener productos con filtros
    const products = await Product.find(filter)
      .select('title description price currency stock images category createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Obtener total de productos para paginación
    const totalProducts = await Product.countDocuments(filter);
    const totalPages = Math.ceil(totalProducts / limit);

    res.json({
      products,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error en getProducts:', error);
    res.status(500).json({
      message: 'Error del servidor al obtener productos.'
    });
  }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado.'
      });
    }

    res.json(product);
  } catch (error) {
    console.error('Error en getProductById:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de producto inválido.'
      });
    }

    res.status(500).json({
      message: 'Error del servidor al obtener producto.'
    });
  }
};

// Crear un nuevo producto (solo admin)
const createProduct = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de producto inválidos.',
        errors: errors.array()
      });
    }

    const product = new Product(req.body);
    const savedProduct = await product.save();

    res.status(201).json({
      message: 'Producto creado exitosamente.',
      product: savedProduct
    });
  } catch (error) {
    console.error('Error en createProduct:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Datos de producto inválidos.',
        errors
      });
    }

    res.status(500).json({
      message: 'Error del servidor al crear producto.'
    });
  }
};

// Actualizar un producto (solo admin)
const updateProduct = async (req, res) => {
  try {
    // Verificar errores de validación
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'Datos de producto inválidos.',
        errors: errors.array()
      });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado.'
      });
    }

    res.json({
      message: 'Producto actualizado exitosamente.',
      product
    });
  } catch (error) {
    console.error('Error en updateProduct:', error);

    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        message: 'Datos de producto inválidos.',
        errors
      });
    }

    res.status(500).json({
      message: 'Error del servidor al actualizar producto.'
    });
  }
};

// Eliminar un producto (solo admin)
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado.'
      });
    }

    res.json({
      message: 'Producto eliminado exitosamente.'
    });
  } catch (error) {
    console.error('Error en deleteProduct:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de producto inválido.'
      });
    }

    res.status(500).json({
      message: 'Error del servidor al eliminar producto.'
    });
  }
};

// Obtener categorías únicas
const getCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    console.error('Error en getCategories:', error);
    res.status(500).json({
      message: 'Error del servidor al obtener categorías.'
    });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
