const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

async function testImageUpload() {
  try {
    // 1. Login
    const loginResponse = await axios.post('http://localhost:5001/api/auth/login', {
      email: 'zinedine@cistcor.com',
      password: '12345678'
    });

    const token = loginResponse.data.token;
    console.log('✅ Token obtenido');

    // 2. Crear form-data con imagen de prueba
    const formData = new FormData();
    
    // Usar una imagen de prueba (puedes cambiar la ruta)
    const imagePath = './test-image.jpg'; // Cambia por una imagen real
    formData.append('image', fs.createReadStream(imagePath));

    // 3. Enviar imagen
    const response = await axios.post('http://localhost:5001/api/ai/analyze-upload', formData, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
        ...formData.getHeaders()
      }
    });

    console.log('✅ Análisis de imagen exitoso');
    console.log('📋 Análisis:', response.data.analysis);
    console.log('🔍 Keywords:', response.data.keywords);
    console.log('🛍️ Productos encontrados:', response.data.productsCount);
    
    if (response.data.productsCount > 0) {
      console.log('📦 Primer producto:', response.data.products[0].title);
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Instalar form-data si no lo tienes: npm install form-data
testImageUpload();