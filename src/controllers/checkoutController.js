const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order.model');
const Cart = require('../models/Cart.model');
const Product = require('../models/Product.model');

// Crear sesión de checkout de Stripe
const createCheckoutSession = async (req, res) => {
  try {
    const { shippingAddress } = req.body;
    
    // Obtener el carrito del usuario
    const cart = await Cart.findOne({
      userId: req.user._id,
      status: 'active'
    }).populate('items.productId');

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        message: 'El carrito está vacío.'
      });
    }

    // Verificar stock y precios actuales
    for (const item of cart.items) {
      const product = await Product.findById(item.productId._id);
      
      if (!product) {
        return res.status(404).json({
          message: `Producto ${item.productId.title} no encontrado.`
        });
      }

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock insuficiente para ${item.productId.title}. Solo quedan ${product.stock} unidades.`
        });
      }

      // Verificar que el precio no haya cambiado
      if (product.price !== item.priceAtMoment) {
        return res.status(400).json({
          message: `El precio de ${item.productId.title} ha cambiado. Actualiza tu carrito.`
        });
      }
    }

    // Crear order en la base de datos
    const order = new Order({
      userId: req.user._id,
      items: cart.items.map(item => ({
        productId: item.productId._id,
        quantity: item.quantity,
        unitPrice: item.priceAtMoment,
        title: item.productId.title
      })),
      total: cart.total,
      currency: 'PEN',
      paymentStatus: 'pending',
      shippingAddress: shippingAddress || {},
      customerEmail: req.user.email
    });

    // Preparar line items para Stripe
    const lineItems = cart.items.map(item => ({
      price_data: {
        currency: 'pen',
        product_data: {
          name: item.productId.title,
          images: item.productId.images,
        },
        unit_amount: Math.round(item.priceAtMoment * 100), // Convertir a centavos
      },
      quantity: item.quantity,
    }));

    // Crear sesión de checkout en Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}${process.env.STRIPE_CANCEL_URL}`,
      customer_email: req.user.email,
      metadata: {
        orderId: order._id.toString(),
        userId: req.user._id.toString()
      }
    });

    // Guardar session ID en la order
    order.stripeSessionId = session.id;
    await order.save();

    // Responder con la URL de checkout
    res.json({
      url: session.url,
      sessionId: session.id
    });

  } catch (error) {
    console.error('Error en createCheckoutSession:', error);
    res.status(500).json({
      message: 'Error del servidor al crear sesión de checkout.'
    });
  }
};

// Verificar estado de la order
const getOrderStatus = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const order = await Order.findOne({
      stripeSessionId: sessionId,
      userId: req.user._id
    });

    if (!order) {
      return res.status(404).json({
        message: 'Order no encontrada.'
      });
    }

    res.json({
      paymentStatus: order.paymentStatus,
      orderId: order._id
    });

  } catch (error) {
    console.error('Error en getOrderStatus:', error);
    res.status(500).json({
      message: 'Error del servidor al verificar estado de order.'
    });
  }
};

// Webhook handler para Stripe
const handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verificar la firma del webhook
    event = stripe.webhooks.constructEvent(
      req.rawBody, // Necesitamos el raw body para verificar la firma
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('Webhook verificado correctamente:', event.type);
  } catch (err) {
    console.error('⚠️ Error de verificación de webhook:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Manejar el evento checkout.session.completed
  if (event.type === 'checkout.session.completed') {
    console.log('Procesando checkout.session.completed...');
    const session = event.data.object;

    try {
      // Buscar la order por session ID
      const order = await Order.findOne({
        stripeSessionId: session.id
      });

      if (order && order.paymentStatus === 'pending') {
        // Actualizar order a pagada
        order.paymentStatus = 'paid';
        order.stripePaymentIntentId = session.payment_intent;
        await order.save();

        // Reducir stock de productos
        for (const item of order.items) {
          await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: -item.quantity } }
          );
        }

        // Limpiar carrito del usuario
        await Cart.findOneAndUpdate(
          { userId: order.userId, status: 'active' },
          { 
            items: [],
            status: 'converted'
          }
        );

        console.log(`✅ Order ${order._id} marcada como pagada`);
      }
    } catch (error) {
      console.error('Error procesando webhook:', error);
    }
  }

  res.json({ received: true });
};

module.exports = {
  createCheckoutSession,
  getOrderStatus,
  handleStripeWebhook
};