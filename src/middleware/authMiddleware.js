const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const authMiddleware = async (req, res, next) => {
  try {
    // Obtener el token del header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        message: 'Acceso denegado. No se proporcionó token.' 
      });
    }

    // Verificar el token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar el usuario y excluir el passwordHash
    const user = await User.findById(decoded.userId).select('-passwordHash');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Token inválido. Usuario no encontrado.' 
      });
    }

    // Añadir el usuario a la request
    req.user = user;
    next();
  } catch (error) {
    console.error('Error en authMiddleware:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token inválido.' 
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expirado.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error del servidor en autenticación.' 
    });
  }
};

// Middleware para verificar rol de administrador
const adminMiddleware = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ 
      message: 'Acceso denegado. Se requieren privilegios de administrador.' 
    });
  }
};

module.exports = { authMiddleware, adminMiddleware };