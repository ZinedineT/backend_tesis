require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product.model');

const sampleProducts = [
  {
    title: 'Smartphone XYZ',
    description: 'Un smartphone de última generación con cámara de 108MP',
    price: 899.99,
    currency: 'PEN',
    stock: 50,
    category: 'electronics',
    images: ['https://example.com/phone1.jpg', 'https://example.com/phone2.jpg']
  },
  {
    title: 'Laptop ABC',
    description: 'Laptop potente para gaming y trabajo',
    price: 2499.99,
    currency: 'PEN',
    stock: 25,
    category: 'electronics',
    images: ['https://example.com/laptop1.jpg']
  },
  {
    title: 'Camiseta Básica',
    description: 'Camiseta de algodón 100% de alta calidad',
    price: 29.99,
    currency: 'PEN',
    stock: 100,
    category: 'clothing',
    images: ['https://example.com/shirt1.jpg']
  },
  {
    title: 'Zapatos Deportivos',
    description: 'Zapatos cómodos para correr y hacer ejercicio',
    price: 129.99,
    currency: 'PEN',
    stock: 75,
    category: 'footwear',
    images: ['https://example.com/shoes1.jpg', 'https://example.com/shoes2.jpg']
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');
    
    // Eliminar productos existentes
    await Product.deleteMany({});
    console.log('Productos existentes eliminados');
    
    // Insertar nuevos productos
    await Product.insertMany(sampleProducts);
    console.log('Productos de ejemplo insertados');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();