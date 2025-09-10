// backend/src/server.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config(); // Carga las variables del archivo .env

// Crear la aplicación Express
const app = express();
// Importar rutas
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');


// Middlewares
app.use(cors({ origin: process.env.FRONTEND_URL })); // Permite requests desde tu frontend
app.use(express.json()); // Permite leer bodies en formato JSON

// Conectar a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB Atlas'))
  .catch((error) => console.error('❌ Error conectando a la DB:', error));

// Ruta de prueba simple para verificar que el servidor funciona
app.get('/api/test', (req, res) => {
  res.json({ message: '¡El backend está funcionando!' });
});

// Usar rutas
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/cart', cartRoutes);

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
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor escuchando en el puerto ${PORT}`);
});