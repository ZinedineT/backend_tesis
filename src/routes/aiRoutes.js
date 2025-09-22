const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const authMiddleware = require('../middleware/authMiddleware'); // Ajusta la ruta

// Ruta para análisis de imagen (protegida)
router.post('/analyze-image', authMiddleware, aiController.analyzeImage);

// Ruta para recomendaciones basadas en texto
router.post('/recommend-products', authMiddleware, aiController.recommendProducts);

// Ruta de prueba de conexión con Ollama
router.get('/test', async (req, res) => {
  try {
    const { Ollama } = require('ollama');
    const ollama = new Ollama({ host: 'http://localhost:11434' });
    
    const models = await ollama.list();
    res.json({ 
      status: 'Ollama conectado correctamente',
      models: models.models 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;