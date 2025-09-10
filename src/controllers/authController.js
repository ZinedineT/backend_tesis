const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

// Registrar nuevo usuario
const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validaciones básicas
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Nombre, email y contraseña son requeridos.' 
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ 
        message: 'El usuario ya existe con este email.' 
      });
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Crear nuevo usuario (siempre como customer por defecto)
    const newUser = new User({
      name,
      email,
      passwordHash,
      role: 'customer' // Siempre customer, los admins se crean manualmente
    });

    const savedUser = await newUser.save();

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: savedUser._id, 
        email: savedUser.email,
        role: savedUser.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Responder con el token y información del usuario (sin passwordHash)
    res.status(201).json({
      message: 'Usuario registrado exitosamente.',
      token,
      user: {
        id: savedUser._id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role
      }
    });

  } catch (error) {
    console.error('Error en register:', error);
    res.status(500).json({ 
      message: 'Error del servidor al registrar usuario.' 
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validaciones básicas
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Email y contraseña son requeridos.' 
      });
    }

    // Buscar usuario por email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas.' 
      });
    }

    // Verificar contraseña
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Credenciales inválidas.' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Responder con el token y información del usuario
    res.json({
      message: 'Login exitoso.',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ 
      message: 'Error del servidor al iniciar sesión.' 
    });
  }
};

// Obtener perfil de usuario actual
const getProfile = async (req, res) => {
  try {
    // El usuario ya está en req.user gracias al authMiddleware
    res.json({
      user: req.user
    });
  } catch (error) {
    console.error('Error en getProfile:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener perfil.' 
    });
  }
};

module.exports = {
  register,
  login,
  getProfile
};