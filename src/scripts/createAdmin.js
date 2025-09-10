require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');

const createAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'adminpassword123';

    // Verificar si ya existe
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('✅ Usuario admin ya existe:', existingAdmin.email);
      process.exit(0);
    }

    // Crear admin
    const passwordHash = await bcrypt.hash(adminPassword, 12);
    const adminUser = new User({
      name: 'Administrador',
      email: adminEmail,
      passwordHash,
      role: 'admin'
    });

    await adminUser.save();
    console.log('✅ Usuario admin creado exitosamente:');
    console.log('   Email:', adminEmail);
    console.log('   Password:', adminPassword);
    console.log('   Role: admin');

    process.exit(0);
  } catch (error) {
    console.error('Error creando usuario admin:', error);
    process.exit(1);
  }
};

createAdminUser();