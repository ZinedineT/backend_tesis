const { Ollama } = require('ollama');
const Product = require('../models/Product.model'); // Tu ruta correcta

const ollama = new Ollama({ host: 'http://localhost:11434' });

const aiController = {
  // Analizar imagen (base64) y extraer descripción
  analyzeImage: async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: 'Imagen requerida en base64' });
      }

      console.log('🖼️ Analizando imagen con LLaVA...');
      
      // Enviar imagen a LLaVA para análisis
      // Cambiar el prompt para que use español
      const analysis = await ollama.generate({
        model: 'llava',
        prompt: `Analiza esta descripción y extrae palabras clave de productos comerciales: "${description}". 
        Incluye categorías en ESPAÑOL como: impresoras, tecnología, electrónica, audio, accesorios.
        Devuelve SOLO una lista de palabras separadas por comas, en ESPAÑOL.`
      });

      console.log('✅ Análisis de imagen completado:', analysis.response);

      res.json({
        success: true,
        analysis: analysis.response,
        message: 'Imagen analizada correctamente'
      });

    } catch (error) {
      console.error('❌ Error analizando imagen:', error);
      res.status(500).json({ error: 'Error procesando la imagen: ' + error.message });
    }
  },

  // Recomendar productos basado en análisis de imagen
  recommendFromImage: async (req, res) => {
    try {
      const { imageBase64 } = req.body;
      
      if (!imageBase64) {
        return res.status(400).json({ error: 'Imagen requerida en base64' });
      }

      console.log('🔍 Analizando imagen y buscando productos...');
      
      // 1. Analizar imagen con LLaVA
      const analysis = await ollama.generate({
        model: 'llava',
        prompt: 'Analiza esta imagen y extrae palabras clave de productos comerciales (electrónica, ropa, accesorios, etc.). Devuelve SOLO una lista de palabras clave separadas por comas, en español.',
        images: [imageBase64]
      });

      const keywords = analysis.response.toLowerCase();
      console.log('📋 Keywords extraídas:', keywords);

      // 2. Limpiar y preparar keywords para búsqueda
      const searchTerms = keywords.split(',')
        .map(term => term.trim())
        .filter(term => term.length > 2)
        .slice(0, 10); // Limitar a 10 términos

      console.log('🔎 Términos de búsqueda:', searchTerms);

      // 3. Buscar productos en la base de datos
      let products = [];
      
      if (searchTerms.length > 0) {
        // Crear expresión regular para cada término
        const regexQueries = searchTerms.map(term => ({
          $or: [
            { title: { $regex: term, $options: 'i' } },
            { category: { $regex: term, $options: 'i' } },
            { description: { $regex: term, $options: 'i' } }
          ]
        }));

        products = await Product.find({
          $or: regexQueries
        })
        .limit(12)
        .select('title price images category description stock');
      }

        // Si no hay resultados, buscar por categorías en español
        if (products.length === 0) {
          const spanishCategories = ['impresora', 'tecnología', 'electrónica', 'accesorio'];
          const orConditions = spanishCategories.map(cat => ({
            category: { $regex: cat, $options: 'i' }
          }));

          products = await Product.find({
            $or: orConditions
          })
          .limit(10)
          .select('title price images category description stock');
        }

      res.json({
        success: true,
        analysis: analysis.response,
        keywords: searchTerms,
        products: products,
        productsCount: products.length,
        message: products.length > 0 
          ? `Se encontraron ${products.length} productos relacionados` 
          : 'No se encontraron productos específicos, mostrando sugerencias generales'
      });

    } catch (error) {
      console.error('❌ Error en recomendación:', error);
      res.status(500).json({ error: 'Error generando recomendaciones: ' + error.message });
    }
  },

  // Recomendar productos basado en texto/descripción
// Recomendar productos basado en texto/descripción
recommendFromText: async (req, res) => {
  try {
    const { description } = req.body;
    
    if (!description) {
      return res.status(400).json({ error: 'Descripción requerida' });
    }

    console.log('📝 Analizando descripción:', description);
    
    // Analizar el texto para extraer keywords - PROMPT MEJORADO
    const analysis = await ollama.generate({
      model: 'llava',
      prompt: `De esta descripción: "${description}", extrae SOLO palabras clave de productos separadas por comas, sin texto adicional.`
    });

    // LIMPIAR MEJOR LA RESPUESTA
    const keywords = analysis.response.toLowerCase()
      .replace('palabras clave:', '')
      .replace('keywords:', '')
      .replace('key words:', '')
      .trim();

    const searchTerms = keywords.split(',')
      .map(term => term.trim())
      .filter(term => term.length > 2 && !term.includes('palabras clave'));

    console.log('🔍 Buscando productos con términos:', searchTerms);

    // BÚSQUEDA MEJORADA
    let products = [];
    if (searchTerms.length > 0) {
      const orConditions = [];
      
      searchTerms.forEach(term => {
        orConditions.push(
          { title: { $regex: term, $options: 'i' } },
          { category: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } }
        );
      });

      products = await Product.find({
        $or: orConditions
      })
      .limit(10)
      .select('title price images category description stock');
    }

    // FALLBACK EN ESPAÑOL
    if (products.length === 0) {
        const spanishCategories = [
          'impresora', 'lector', 'gaveta', 'suministro', 'computadora', 'pack',
          'impresoras', 'lectores', 'gavetas', 'suministros', 'computadoras', 'packs'
        ];
      const orConditions = spanishCategories.map(cat => ({
        category: { $regex: cat, $options: 'i' }
      }));

      products = await Product.find({
        $or: orConditions
      })
      .limit(10)
      .select('title price images category description stock');
    }

    res.json({
      analysis: analysis.response,
      keywords: searchTerms,
      products: products,
      count: products.length,
      searchType: products.length > 0 ? 'specific' : 'fallback'
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
};

module.exports = aiController;