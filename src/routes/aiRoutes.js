const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const {authMiddleware} = require('../middleware/authMiddleware');
const { uploadSingleImage, handleUploadErrors } = require('../middleware/uploadMiddleware'); // Ajusta tu ruta

// Analizar imagen (base64)
router.post('/analyze-image', authMiddleware, aiController.analyzeImage);

// Recomendar productos desde imagen (endpoint principal)
router.post('/recommend-from-image', authMiddleware, aiController.recommendFromImage);

// Recomendar productos desde texto
router.post('/recommend-from-text', authMiddleware, aiController.recommendFromText);

// Agregar después de las rutas existentes:
router.post('/analyze-upload', 
  authMiddleware, 
  uploadSingleImage, 
  handleUploadErrors, 
  aiController.analyzeUploadedImage 
);

// Ruta de salud de la IA
router.get('/health', async (req, res) => {
  try {
    const { Ollama } = require('ollama');
    const ollama = new Ollama({ host: 'http://localhost:11434' });
    
    const models = await ollama.list();
    res.json({ 
      status: '✅ IA conectada correctamente',
      model: 'llava:latest',
      available: true,
      models: models.models.map(m => m.name)
    });
  } catch (error) {
    res.status(500).json({ 
      status: '❌ IA no disponible',
      error: error.message 
    });
  }
});

module.exports = router;