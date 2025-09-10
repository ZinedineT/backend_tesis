const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'La cantidad debe ser al menos 1'],
    default: 1
  },
  priceAtMoment: {
    type: Number,
    required: true,
    min: 0
  }
});

const cartSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Un carrito por usuario
  },
  items: [cartItemSchema],
  status: {
    type: String,
    enum: ['active', 'converted'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Actualizar la fecha de modificación cuando cambie el carrito
cartSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calcular el total del carrito (virtual)
cartSchema.virtual('total').get(function() {
  return this.items.reduce((total, item) => {
    return total + (item.priceAtMoment * item.quantity);
  }, 0);
});

// Asegurar que los virtuals se incluyan en JSON
cartSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Cart', cartSchema);