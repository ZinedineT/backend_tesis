const User = require('../models/User.model');
const Order = require('../models/Order.model');
const Product = require('../models/Product.model');

// Obtener todas las órdenes
const getAllOrders = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status;

    let filter = {};
    if (status && status !== 'all') {
      filter.paymentStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalOrders = await Order.countDocuments(filter);
    const totalPages = Math.ceil(totalOrders / limit);

    res.json({
      orders,
      pagination: {
        currentPage: page,
        totalPages,
        totalOrders,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error en getAllOrders:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener órdenes.' 
    });
  }
};

// Obtener orden específica
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('items.productId', 'title images');

    if (!order) {
      return res.status(404).json({ 
        message: 'Orden no encontrada.' 
      });
    }

    res.json(order);
  } catch (error) {
    console.error('Error en getOrderById:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'ID de orden inválido.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error del servidor al obtener orden.' 
    });
  }
};

// Actualizar estado de orden
const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        message: 'Estado inválido.' 
      });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus: status },
      { new: true, runValidators: true }
    ).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ 
        message: 'Orden no encontrada.' 
      });
    }

    res.json({
      message: 'Estado de orden actualizado exitosamente.',
      order
    });
  } catch (error) {
    console.error('Error en updateOrderStatus:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'ID de orden inválido.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error del servidor al actualizar orden.' 
    });
  }
};

// Obtener estadísticas
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const recentOrders = await Order.find({ paymentStatus: 'paid' })
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    const lowStockProducts = await Product.find({ 
      stock: { $lt: 10 } 
    }).limit(10);

    res.json({
      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0
      },
      recentOrders,
      lowStockProducts
    });
  } catch (error) {
    console.error('Error en getDashboardStats:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener estadísticas.' 
    });
  }
};

// Obtener todos los usuarios
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const role = req.query.role; 
    const search = req.query.search; 

        // ↓↓↓ AGREGA ESTOS FILTROS ↓↓↓
    let filter = {};
    if (role && role !== 'all') {
      filter.role = role;
    }
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-passwordHash')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalUsers = await User.countDocuments(filter);
    const totalPages = Math.ceil(totalUsers / limit);

    res.json({
      users,
      pagination: {
        currentPage: page,
        totalPages,
        totalUsers,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error en getAllUsers:', error);
    res.status(500).json({ 
      message: 'Error del servidor al obtener usuarios.' 
    });
  }
};
// Actualizar estado de usuario (activar/desactivar)
const updateUserStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    
    // No permitir desactivar a uno mismo
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ 
        message: 'No puedes desactivar tu propia cuenta.' 
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true, runValidators: true }
    ).select('-passwordHash');

    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado.' 
      });
    }

    res.json({
      message: `Usuario ${isActive ? 'activado' : 'desactivado'} exitosamente.`,
      user
    });
  } catch (error) {
    console.error('Error en updateUserStatus:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'ID de usuario inválido.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error del servidor al actualizar usuario.' 
    });
  }
};

// Eliminar usuario
const deleteUser = async (req, res) => {
  try {
    // No permitir eliminarse a uno mismo
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ 
        message: 'No puedes eliminar tu propia cuenta.' 
      });
    }

    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ 
        message: 'Usuario no encontrado.' 
      });
    }

    res.json({
      message: 'Usuario eliminado exitosamente.'
    });
  } catch (error) {
    console.error('Error en deleteUser:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({ 
        message: 'ID de usuario inválido.' 
      });
    }
    
    res.status(500).json({ 
      message: 'Error del servidor al eliminar usuario.' 
    });
  }
};

module.exports = {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  getDashboardStats,
  getAllUsers,
  updateUserStatus,    
  deleteUser  
};