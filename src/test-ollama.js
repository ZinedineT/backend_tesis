// test-ollama.js - VERSIÓN CORREGIDA
const { Ollama } = require('ollama');

async function testOllama() {
  try {
    console.log('🔍 Probando conexión con Ollama...');
    
    // Crear instancia con configuración explícita
    const ollama = new Ollama({ 
      host: 'http://localhost:11434' 
    });
    
    // Verificar modelos disponibles
    const models = await ollama.list();
    console.log('✅ Modelos disponibles:', models.models);
    
    // Probar generación de texto
    const response = await ollama.generate({
      model: 'llava',
      prompt: 'Hola, responde en español si estás funcionando'
    });
    
    console.log('✅ Ollama responde:', response.response);
    console.log('🎉 ¡Integración exitosa!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('Detalles del error:', error);
  }
}

testOllama();