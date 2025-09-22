const axios = require('axios');

async function testImageRecommendation() {
  try {
    // Primero login para obtener token
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'zinedine@cistcor.com',
      password: '12345678'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido:', token.substring(0, 50) + '...');

    // Probar endpoint de salud de IA
    const healthResponse = await axios.get('http://localhost:5001/api/ai/health', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('🧪 Salud de IA:', healthResponse.data.status);

    // Probar recomendación por texto (sin imagen primero)
    const textRecommendation = await axios.post('http://localhost:5001/api/ai/recommend-from-text', 
      {
        // Para impresoras:
        description: "Necesito una impresora térmica para mi tienda",

        // Para lectores de código de barras:
        description: "Busco un lector de códigos de barras para mi inventario",

        // Para gavetas de dinero:
        description: "Quiero una gaveta de dinero para mi caja registradora",

        // Para suministros:
        description: "Necesito papel térmico para impresora de recibos",

        // Para packs completos:
        description: "Busco un pack completo para punto de venta",

        // Para computadoras:
        description: "Necesito una computadora para mi negocio",

        // Búsquedas específicas:
        description: "Lector de códigos QR profesional",
        description: "Cajón de dinero con compartimientos" , 
        description: "Rollos de papel térmico 80mm",
        description: "Impresora para códigos de barras Zebra"
      },
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Recomendación por texto exitosa');
    console.log('📋 Análisis:', textRecommendation.data.analysis);
    console.log('🔍 Keywords:', textRecommendation.data.keywords);
    console.log('🛍️ Productos encontrados:', textRecommendation.data.count);
    console.log('📦 Primer producto:', textRecommendation.data.products[0]?.title);

  } catch (error) {
    console.error('❌ Error en prueba:', error.response?.data || error.message);
  }
}

testImageRecommendation();