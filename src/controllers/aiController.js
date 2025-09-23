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
      const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
      // Cambiar el prompt para que use español
      const analysis = await ollama.generate({
        model: 'llava',
        prompt: `Analiza esta imagen y extrae palabras clave específicas de productos de punto de venta y oficina.

          PRODUCTOS ESPECÍFICOS QUE DEBES IDENTIFICAR:
          - Impresoras térmicas, impresoras de recibos, impresoras de código de barras
          - Lectores de código de barras, escáneres, lectores QR
          - Gavetas de dinero, cajones de efectivo, cajas registradoras
          - Papel térmico, rollos de papel, suministros de impresión
          - Etiquetas adhesivas, cintas de cera
          - Computadoras para punto de venta, kits completos

          Si ves algún objeto similar a estos, usa las palabras clave exactas de la lista.
          Devuelve SOLO una lista de palabras clave separadas por comas, en español.`,
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
// Recomendar productos basado en análisis de imagen
  recommendFromImage: async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: 'Imagen requerida en base64' });
    }

    console.log('🔍 Analizando imagen y buscando productos...');
    
    // 1. Analizar imagen con LLaVA
    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');
    const analysis = await ollama.generate({
      model: 'llava',
      prompt: `Analiza esta imagen y extrae palabras clave específicas de productos de punto de venta y oficina.

      PRODUCTOS ESPECÍFICOS QUE DEBES IDENTIFICAR:
      - Impresoras térmicas, impresoras de recibos, impresoras de código de barras
      - Lectores de código de barras, escáneres, lectores QR
      - Gavetas de dinero, cajones de efectivo, cajas registradoras
      - Papel térmico, rollos de papel, suministros de impresión
      - Etiquetas adhesivas, cintas de cera
      - Computadoras para punto de venta, kits completos

      Si ves algún objeto similar a estos, usa las palabras clave exactas de la lista.
      Devuelve SOLO una lista de palabras clave separadas por comas, en español.`,
      images: [cleanBase64] 
    });

    const keywords = analysis.response.toLowerCase();
    console.log('📋 Keywords extraídas:', keywords);

    // 2. Limpiar y preparar keywords para búsqueda
    const searchTerms = keywords.split(',')
      .map(term => term.trim())
      .filter(term => term.length > 2)
      .slice(0, 10);

    console.log('🔎 Términos de búsqueda:', searchTerms);

    // 3. DETECTAR CATEGORÍA PRINCIPAL
    let mainCategory = null;
    
    // Priorizar por categoría detectada
    if (searchTerms.some(term => term.includes('gaveta') || term.includes('cajón') || term.includes('dinero'))) {
      mainCategory = 'Gavetas';
    } else if (searchTerms.some(term => term.includes('impresora') || term.includes('imprimir'))) {
      mainCategory = 'Impresoras';
    } else if (searchTerms.some(term => term.includes('lector') || term.includes('escáner') || term.includes('código'))) {
      mainCategory = 'Lectores';
    } else if (searchTerms.some(term => term.includes('papel') || term.includes('rollo') || term.includes('suministro'))) {
      mainCategory = 'Suministros';
    } else if (searchTerms.some(term => term.includes('computadora') || term.includes('pc') || term.includes('kit'))) {
      mainCategory = 'Computadoras';
    }

    console.log('🎯 Categoría principal detectada:', mainCategory);

    // 4. BUSCAR PRODUCTOS CON PRIORIDAD POR CATEGORÍA
    let products = [];

    if (searchTerms.length > 0) {
      // PRIMERO: Buscar en la categoría principal
      if (mainCategory) {
        const categoryProducts = await Product.find({
          category: mainCategory
        })
        .limit(8)
        .select('title price images category description stock');
        
        products.push(...categoryProducts);
        console.log(`📦 Productos de categoría ${mainCategory}:`, categoryProducts.length);
      }

      // SEGUNDO: Buscar por términos específicos en todas las categorías
      const orConditions = [];
      
      searchTerms.forEach(term => {
        orConditions.push(
          { title: { $regex: term, $options: 'i' } },
          { category: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } }
        );
      });

      // Eliminar duplicados
      const uniqueConditions = orConditions.filter((condition, index, self) =>
        index === self.findIndex((c) => JSON.stringify(c) === JSON.stringify(condition))
      );

      const termProducts = await Product.find({
        $or: uniqueConditions,
        _id: { $nin: products.map(p => p._id) } // Excluir los ya encontrados
      })
      .limit(10)
      .select('title price images category description stock');

      products.push(...termProducts);
      console.log('🔍 Productos por términos:', termProducts.length);
    }

    // 5. ELIMINAR DUPLICADOS Y LIMITAR
    const uniqueProducts = products.filter((product, index, self) =>
      index === self.findIndex((p) => p._id.toString() === product._id.toString())
    ).slice(0, 12);

    // 6. FALLBACK: Si no hay resultados, mostrar productos de la categoría detectada
    if (uniqueProducts.length === 0 && mainCategory) {
      console.log('🔄 Usando fallback por categoría principal');
      uniqueProducts = await Product.find({
        category: mainCategory
      })
      .limit(8)
      .select('title price images category description stock');
    }

    // 7. FALLBACK GENERAL: Si aún no hay resultados
    if (uniqueProducts.length === 0) {
      console.log('🔄 Usando fallback general');
      const fallbackCategories = ['Impresoras', 'Lectores', 'Gavetas', 'Suministros', 'Computadoras', 'Packs'];
      uniqueProducts = await Product.find({
        category: { $in: fallbackCategories }
      })
      .limit(8)
      .select('title price images category description stock');
    }

    console.log('🎯 Productos finales encontrados:', uniqueProducts.length);
    console.log('🏷️ Distribución por categoría:', 
      uniqueProducts.reduce((acc, product) => {
        acc[product.category] = (acc[product.category] || 0) + 1;
        return acc;
      }, {})
    );

    res.json({
      success: true,
      analysis: analysis.response,
      keywords: searchTerms,
      mainCategory: mainCategory,
      products: uniqueProducts,
      productsCount: uniqueProducts.length,
      message: uniqueProducts.length > 0 
        ? `Se encontraron ${uniqueProducts.length} productos relacionados` 
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
},
// Agregar ESTE MÉTODO NUEVO antes del module.exports
analyzeUploadedImage: async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No se subió ninguna imagen' });
    }

    console.log('🖼️ Procesando imagen subida...');
    
    // Convertir buffer a base64
    const imageBase64 = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;
    const base64String = `data:${mimeType};base64,${imageBase64}`;

    console.log('📊 Tamaño de imagen:', req.file.size, 'bytes');
    
    // Usar el mismo código que recommendFromImage pero con la imagen subida
    const analysis = await ollama.generate({
      model: 'llava',
      prompt: 'Analiza esta imagen y extrae palabras clave de productos comerciales (equipos, tecnología, oficina, puntos de venta). Devuelve SOLO una lista de palabras clave separadas por comas, en español.',
      images: [imageBase64]
    });

    const keywords = analysis.response.toLowerCase()
      .replace('palabras clave:', '')
      .replace('keywords:', '')
      .trim();

    const searchTerms = keywords.split(',')
      .map(term => term.trim())
      .filter(term => term.length > 2)
      .slice(0, 10);

    console.log('🔍 Términos extraídos:', searchTerms);

    // Búsqueda de productos (mismo código que recommendFromImage)
    let products = [];

    if (searchTerms.length > 0) {
      const orConditions = [];
      
      searchTerms.forEach(term => {
        orConditions.push(
          { title: { $regex: term, $options: 'i' } },
          { category: { $regex: term, $options: 'i' } },
          { description: { $regex: term, $options: 'i' } }
        );
        
        // Búsqueda por sinónimos
        if (term.includes('impresora') || term.includes('imprimir')) {
          orConditions.push({ category: 'Impresoras' });
        }
        if (term.includes('lector') || term.includes('escáner') || term.includes('código')) {
          orConditions.push({ category: 'Lectores' });
        }
        if (term.includes('gaveta') || term.includes('cajón') || term.includes('dinero')) {
          orConditions.push({ category: 'Gavetas' });
        }
        if (term.includes('papel') || term.includes('rollo') || term.includes('suministro')) {
          orConditions.push({ category: 'Suministros' });
        }
        if (term.includes('computadora') || term.includes('pc') || term.includes('kit')) {
          orConditions.push({ $or: [{ category: 'Computadoras' }, { category: 'Packs' }] });
        }
      });

      // Eliminar duplicados
      const uniqueConditions = orConditions.filter((condition, index, self) =>
        index === self.findIndex((c) => JSON.stringify(c) === JSON.stringify(condition))
      );

      products = await Product.find({
        $or: uniqueConditions
      })
      .limit(15)
      .select('title price images category description stock');
    }

    // Fallback mejorado
    if (products.length === 0) {
      const fallbackCategories = [
        'Impresoras', 'Lectores', 'Gavetas', 'Suministros', 'Computadoras', 'Packs'
      ];
      
      products = await Product.find({
        category: { $in: fallbackCategories }
      })
      .limit(12)
      .select('title price images category description stock');
    }

    res.json({
      success: true,
      analysis: analysis.response,
      keywords: searchTerms,
      products: products,
      productsCount: products.length,
      imageInfo: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      },
      message: products.length > 0 
        ? `Se encontraron ${products.length} productos relacionados con tu imagen` 
        : 'No se encontraron productos específicos, mostrando sugerencias generales'
    });

  } catch (error) {
    console.error('❌ Error procesando imagen:', error);
    res.status(500).json({ error: 'Error procesando la imagen: ' + error.message });
  }
}
};

module.exports = aiController;