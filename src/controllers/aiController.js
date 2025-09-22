const { Ollama } = require('ollama');
const Product = require('../models/Product.model'); // Ajusta la ruta según tu estructura

const ollama = new Ollama({ host: 'http://localhost:11434' });

const aiController = {
  // Analizar imagen y extraer descripción
  analyzeImage: async (req, res) => {
    try {
      // Aquí procesaremos la imagen (próximo paso)
      res.json({ message: 'Endpoint de análisis de imagen' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Recomendar productos basado en texto/descripción
  recommendProducts: async (req, res) => {
    try {
      const { description } = req.body;
      
      // 1. Analizar la descripción con Ollama para extraer keywords
      const analysis = await ollama.generate({
        model: 'llava',
        prompt: `Analiza esta descripción y extrae palabras clave de productos comerciales: "${description}". Devuelve solo una lista de palabras separadas por comas.`
      });

      const keywords = analysis.response.toLowerCase();
      console.log('Keywords extraídas:', keywords);

      // 2. Buscar productos en la base de datos
      const products = await Product.find({
        $or: [
          { title: { $regex: keywords, $options: 'i' } },
          { category: { $regex: keywords, $options: 'i' } },
          { description: { $regex: keywords, $options: 'i' } }
        ]
      }).limit(10);

      res.json({
        analysis: analysis.response,
        keywords: keywords.split(',').map(k => k.trim()),
        products: products,
        count: products.length
      });

    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

module.exports = aiController;