// backend/src/server.js
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Carga las variables del archivo .env

// Crear la aplicación Express
const app = express();
// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const checkoutRoutes = require('./routes/checkout');
const adminRoutes = require('./routes/admin');
const orderRoutes = require('./routes/orders');
// Después de tus otras rutas, agrega:
const aiRoutes = require('./routes/aiRoutes');

// Middleware para webhooks - debe venir antes de express.json()
// app.use('/api/checkout/webhooks/stripe',
//   express.raw({ type: 'application/json' }),
//   (req, res, next) => {
//     // Guardar el raw body para que esté disponible en el controller
//     req.rawBody = req.body;
//     req.body = {}; // Limpiar el body parsed para evitar confusiones
//     next();
//   }
// );
// ⚠️ Webhook de Stripe - debe ir ANTES de express.json()
app.post('/api/checkout/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  require('./controllers/checkoutController').handleStripeWebhook
);
// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL, credentials:true })); // Permite requests desde tu frontend
app.use(express.json({limit: '10mb'})); // Permite leer bodies en formato JSON

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI,{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((error) => {
    console.error('❌ Error conectando a la DB:', error);
    process.exit(1);
});
// Ruta de prueba simple para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
  res.json({ message: '¡El backend está funcionando!' });
});

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/checkout', checkoutRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/ai', aiRoutes);
// Agrega esta línea para servir archivos estáticos:
app.use('/api/uploads', express.static(path.join(__dirname, 'uploads')));

// Manejar rutas no encontradas (404)
app.use( (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada' });
});

// Manejar errores globales
app.use((error, req, res, next) => {
  console.error(error.stack);
  res.status(500).json({ message: 'Algo salió mal!' });
});

// Iniciar el servidor
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});
