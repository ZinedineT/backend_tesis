const { Ollama } = require('ollama');

async function testAIIntegration() {
  try {
    const ollama = new Ollama({ host: 'http://localhost:11434' });

    console.log('🧪 Probando análisis de texto con LLaVA...');
    
    // Simular descripción de una imagen
    const imageDescription = "Una persona usando un smartphone moderno y unos audífonos inalámbricos";
    
    const analysis = await ollama.generate({
      model: 'llava',
      prompt: `Analiza esta descripción y extrae palabras clave de productos comerciales: "${imageDescription}". Devuelve solo una lista de palabras separadas por comas.`
    });

    console.log('✅ Análisis completado:');
    console.log('Respuesta de Ollama:', analysis.response);
    
    // Extraer keywords
    const keywords = analysis.response.toLowerCase().split(',').map(k => k.trim());
    console.log('Keywords extraídas:', keywords);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testAIIntegration();