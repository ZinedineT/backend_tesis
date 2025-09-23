const multer = require('multer');
const path = require('path');

// Configurar multer para memoria (no guardar archivos en disco)
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  // Verificar que sea una imagen
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Solo se permiten archivos de imagen'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB máximo
  },
  fileFilter: fileFilter
});

// Middleware para subir una sola imagen
const uploadSingleImage = upload.single('image');

// Middleware de manejo de errores
const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'La imagen es demasiado grande (máximo 5MB)' });
    }
  } else if (err) {
    return res.status(400).json({ error: err.message });
  }
  next();
};

module.exports = { uploadSingleImage, handleUploadErrors };