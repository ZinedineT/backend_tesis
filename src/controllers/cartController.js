const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');

// Obtener carrito del usuario
const getCart = async (req, res) => {
  try {
    let cart = await Cart.findOne({
      userId: req.user._id,
      status: 'active'
    }).populate('items.productId', 'title price images');

    if (!cart) {
      // Crear carrito vacío si no existe
      cart = new Cart({
        userId: req.user._id,
        items: [],
        status: 'active'
      });
      await cart.save();
    }

    res.json(cart);
  } catch (error) {
    console.error('Error en getCart:', error);
    res.status(500).json({
      message: 'Error del servidor al obtener carrito.'
    });
  }
};

// Agregar o actualizar item en el carrito
const addToCart = async (req, res) => {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({
        message: 'productId y quantity (mínimo 1) son requeridos.'
      });
    }

    // Verificar que el producto existe y obtener precio actual
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        message: 'Producto no encontrado.'
      });
    }

    if (product.stock < quantity) {
      return res.status(400).json({
        message: `Stock insuficiente. Solo quedan ${product.stock} unidades.`
      });
    }

    // Buscar o crear carrito
    let cart = await Cart.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: []
      });
    }

    // Verificar si el producto ya está en el carrito
    const existingItemIndex = cart.items.findIndex(
      item => item.productId.toString() === productId
    );

    if (existingItemIndex > -1) {
      // Actualizar cantidad si ya existe
      cart.items[existingItemIndex].quantity = quantity;
    } else {
      // Agregar nuevo item
      cart.items.push({
        productId,
        quantity,
        priceAtMoment: product.price
      });
    }

    await cart.save();
    await cart.populate('items.productId', 'title price images');

    res.json({
      message: 'Producto agregado al carrito.',
      cart
    });
  } catch (error) {
    console.error('Error en addToCart:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de producto inválido.'
      });
    }

    res.status(500).json({
      message: 'Error del servidor al agregar al carrito.'
    });
  }
};

// Eliminar item del carrito
const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;

    const cart = await Cart.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({
        message: 'Carrito no encontrado.'
      });
    }

    // Filtrar el item a eliminar
    cart.items = cart.items.filter(
      item => item.productId.toString() !== productId
    );

    await cart.save();
    await cart.populate('items.productId', 'title price images');

    res.json({
      message: 'Producto eliminado del carrito.',
      cart
    });
  } catch (error) {
    console.error('Error en removeFromCart:', error);

    if (error.name === 'CastError') {
      return res.status(400).json({
        message: 'ID de producto inválido.'
      });
    }

    res.status(500).json({
      message: 'Error del servidor al eliminar del carrito.'
    });
  }
};

// Vaciar carrito
const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({
        message: 'Carrito no encontrado.'
      });
    }

    cart.items = [];
    await cart.save();

    res.json({
      message: 'Carrito vaciado exitosamente.'
    });
  } catch (error) {
    console.error('Error en clearCart:', error);
    res.status(500).json({
      message: 'Error del servidor al vaciar carrito.'
    });
  }
};

// Fusionar carrito local con carrito del servidor
const mergeCart = async (req, res) => {
  try {
    const { localCart } = req.body;

    if (!localCart || !Array.isArray(localCart.items)) {
      return res.status(400).json({
        message: 'Datos de carrito local inválidos.'
      });
    }

    let cart = await Cart.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!cart) {
      cart = new Cart({
        userId: req.user._id,
        items: []
      });
    }

    // Procesar cada item del carrito local
    for (const localItem of localCart.items) {
      try {
        const product = await Product.findById(localItem.productId);

        if (product && product.stock > 0) {
          const existingItemIndex = cart.items.findIndex(
            item => item.productId.toString() === localItem.productId
          );

          if (existingItemIndex > -1) {
            // Actualizar cantidad si ya existe (usar la mayor cantidad)
            const newQuantity = Math.min(
              cart.items[existingItemIndex].quantity + localItem.quantity,
              product.stock
            );
            cart.items[existingItemIndex].quantity = newQuantity;
          } else {
            // Agregar nuevo item
            cart.items.push({
              productId: localItem.productId,
              quantity: Math.min(localItem.quantity, product.stock),
              priceAtMoment: product.price
            });
          }
        }
      } catch (error) {
        console.warn(`Error procesando item ${localItem.productId}:`, error);
        // Continuar con los demás items
      }
    }

    await cart.save();
    await cart.populate('items.productId', 'title price images');

    res.json({
      message: 'Carrito fusionado exitosamente.',
      cart
    });
  } catch (error) {
    console.error('Error en mergeCart:', error);
    res.status(500).json({
      message: 'Error del servidor al fusionar carrito.'
    });
  }
};
// Actualizar solo la cantidad de un producto en el carrito
const updateQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: 'Cantidad inválida' });
    }

    const cart = await Cart.findOne({
      userId: req.user._id,
      status: 'active'
    });

    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' });
    }

    const item = cart.items.find(
      (i) => i.productId.toString() === productId
    );

    if (!item) {
      return res.status(404).json({ message: 'Producto no está en el carrito' });
    }

    // Actualiza cantidad
    item.quantity = quantity;

    await cart.save();
    await cart.populate('items.productId', 'title price images');

    res.json({
      message: 'Cantidad actualizada',
      cart
    });
  } catch (error) {
    console.error('Error en updateQuantity:', error);
    res.status(500).json({ message: 'Error del servidor al actualizar cantidad' });
  }
};


module.exports = {
  getCart,
  addToCart,
  removeFromCart,
  updateQuantity,
  clearCart,
  mergeCart
};
