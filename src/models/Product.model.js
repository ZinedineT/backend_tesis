const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'El título es requerido'],
    trim: true,
    maxlength: [200, 'El título no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [1000, 'La descripción no puede exceder 1000 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  currency: {
    type: String,
    default: 'PEN',
    uppercase: true,
    enum: ['PEN', 'USD']
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  images: [{
    type: String,
    match: [/https?:\/\/.+/, 'La URL de la imagen debe ser válida']
  }],
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    trim: true
  },
  metadata: {
    weight: Number,
    dimensions: {
      width: Number,
      height: Number,
      depth: Number
    },
    colors: [String],
    tags: [String]
  }
}, {
  timestamps: true
});

// Índices para búsquedas eficientes
productSchema.index({ title: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

module.exports = mongoose.model('Product', productSchema);
