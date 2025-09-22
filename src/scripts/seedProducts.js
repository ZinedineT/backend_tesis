require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../models/Product.model');

const sampleProducts = [
  // IMPRESORAS TERMICAS
  {
    title: 'Impresora térmica 3NSTAR RPT004 - 80MM - USB Y Ethernet',
    description: 'Impresora térmica de alta velocidad, ideal para puntos de venta, con conectividad USB y Ethernet para mayor versatilidad.',
    price: 495.00,
    currency: 'PEN',
    stock: 10,
    category: 'Impresoras',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552274/Impresora-RPT004_mfudie.png']
  },
  {
    title: 'Impresora térmica CBX POS-89E - 80MM - USB y Ethernet',
    description: 'Impresora de recibos confiable y compacta, perfecta para negocios que requieren impresión rápida y clara. Incluye puertos USB y Ethernet.',
    price: 426.00,
    currency: 'PEN',
    stock: 10,
    category: 'Impresoras',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552277/Impresora-ZD220_h1lfmq.png']
  },
  {
    title: 'Impresora de Código de Barras ZEBRA - ZD220 - 1D Y 2D - USB',
    description: 'Impresora profesional para códigos de barras 1D y 2D. Conectividad USB, ideal para gestión de inventario, logística y tiendas minoristas.',
    price: 1489.00,
    currency: 'PEN',
    stock: 10,
    category: 'Impresoras',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552277/Impresora-ZD220_h1lfmq.png']
  },

  // LECTORES DE CÓDIGO DE BARRAS
  {
    title: 'Lector De Código De Barras 3nSTAR - SC050 - 1D - USB - Laser C/Base',
    description: 'Lector láser de códigos de barras 1D de mano, con base incluida para uso estacionario. Conexión USB para una fácil integración.',
    price: 169.00,
    currency: 'PEN',
    stock: 10,
    category: 'Lectores',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552275/Lector-SC050_vi7hxt.png']
  },
  {
    title: 'Lector De Código De Barras POS-D - PRO SCAN - 1D/2D - USB - Laser S/Base',
    description: 'Lector de códigos de barras profesional, capaz de leer códigos 1D y 2D (QR). Diseño ergonómico y conexión USB.',
    price: 235.00,
    currency: 'PEN',
    stock: 10,
    category: 'Lectores',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552274/Lector-PROSCAN_lupehs.png']
  },
  {
    title: 'Lector De Código De Barras CBX - I-1915 - 1D - USB - Laser C/Base',
    description: 'Escáner láser de códigos de barras 1D, duradero y fácil de usar, con base incluida para un trabajo cómodo y continuo.',
    price: 145.00,
    currency: 'PEN',
    stock: 10,
    category: 'Lectores',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552274/Lector-CBX_g9rxb3.png']
  },
  {
    title: 'Lector De Código De Barras 3nSTAR - SCI150-1 - 1D - USB - Imager/Base',
    description: 'Lector de imágenes (imager) para códigos 1D, proporcionando una lectura precisa y rápida. Incluye base para un uso eficiente en puntos de venta.',
    price: 218.00,
    currency: 'PEN',
    stock: 10,
    category: 'Lectores',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552275/Lector-SCI150_utqlpf.png']
  },
  {
    title: 'Lector De Código De Barras 3nSTAR - SC100-1 - 1D - USB - Laser C/Base',
    description: 'Escáner láser de alta precisión para códigos de barras 1D. Diseño robusto y base ajustable para una lectura sin esfuerzo.',
    price: 239.00,
    currency: 'PEN',
    stock: 10,
    category: 'Lectores',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552274/Lector-SCI100_ooqimh.png']
  },

  // GAVETAS CAJA DE DINERO
  {
    title: 'Gaveta de dinero POS-D CASH330 - 33x35.5x10cm - 4 compartimientos',
    description: 'Cajón de dinero compacto y seguro con 4 compartimientos para billetes y monedero extraíble. Ideal para espacios pequeños.',
    price: 231.00,
    currency: 'PEN',
    stock: 10,
    category: 'Gavetas',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552274/Gaveta-CASH330_yzaqiq.png']
  },
  {
    title: 'Gaveta de dinero 3NSTAR CD350 LARGE - 41x42x10CM - 5 compartimientos',
    description: 'Cajón de dinero de gran capacidad con 5 compartimientos para billetes y monedero de alta resistencia. Perfecto para negocios con alto flujo de efectivo.',
    price: 312.00,
    currency: 'PEN',
    stock: 10,
    category: 'Gavetas',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552275/Gaveta-CD350_tvggkz.png']
  },

  // SUMINISTROS
  {
    title: 'Papel Contómetro Térmico 80mm x 80mm - Caja de 50',
    description: 'Caja con 50 rollos de papel térmico de alta calidad, ideal para impresoras de recibos de 80mm. Impresión nítida y duradera.',
    price: 315.00,
    currency: 'PEN',
    stock: 10,
    category: 'Suministros',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552276/PAPEL-CONTOMETRO_bsf8ny.png']
  },
  {
    title: 'Papel Contómetro Térmico 80mm x 80mm - Caja de 20',
    description: 'Caja con 20 rollos de papel térmico, perfecto para impresoras de 80mm. Formato estándar para puntos de venta y cajas registradoras.',
    price: 137.00,
    currency: 'PEN',
    stock: 10,
    category: 'Suministros',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552276/PAPEL-CONTOMETRO_bsf8ny.png']
  },
  {
    title: 'Papel Contómetro Térmico 80mm x 80mm - Caja de 10',
    description: 'Paquete con 10 rollos de papel térmico de 80mm, ideal para mantener un stock mínimo de suministros en tu negocio.',
    price: 71.00,
    currency: 'PEN',
    stock: 10,
    category: 'Suministros',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552276/PAPEL-CONTOMETRO_bsf8ny.png']
  },
  {
    title: 'Etiquetas de papel TT - Rollo x 3000 - 5cm x 2.5cm',
    description: 'Rollo de 3000 etiquetas de papel térmico de transferencia térmica, perfecto para impresión de precios, códigos de barras y etiquetas de envío.',
    price: 51.00,
    currency: 'PEN',
    stock: 10,
    category: 'Suministros',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552274/Etiqueta-adhesiva_wtvn3j.png']
  },
  {
    title: 'Etiquetas de papel TT- Rollo x 6000 - 3cm x 2cm',
    description: 'Rollo con 6000 etiquetas de papel térmico de transferencia térmica. Ideal para productos pequeños o con espacio limitado para etiquetas.',
    price: 59.00,
    currency: 'PEN',
    stock: 10,
    category: 'Suministros',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552274/Etiqueta-adhesiva_wtvn3j.png']
  },
  {
    title: 'Cinta de cera - 110mm - 74mt.',
    description: 'Cinta de cera para impresoras de etiquetas por transferencia térmica. Proporciona una impresión de alta calidad y resistencia.',
    price: 22.00,
    currency: 'PEN',
    stock: 10,
    category: 'Suministros',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552274/Cinta-Cera_c3mqj7.png']
  },

  // COMPUTADORAS
  {
    title: 'Computadora Mini PC para punto de venta HP PRODESK 600 G5 + Monitor 19" + Teclado + Mouse + Estabilizador',
    description: 'Kit completo de computación para puntos de venta. Incluye una Mini PC HP PRODESK, monitor, teclado, mouse y estabilizador. Todo lo necesario para comenzar a operar.',
    price: 1900.00,
    currency: 'PEN',
    stock: 10,
    category: 'Computadoras',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552275/PackCompleto_j8imeb.png']
  },

  // PACKS
  {
    title: 'Pack: Impresora CBX POS-89E + Gaveta CASH330',
    description: 'Pack de inicio para punto de venta, incluye una impresora térmica y una gaveta de dinero. Una solución completa para agilizar tus ventas.',
    price: 649.00,
    currency: 'PEN',
    stock: 10,
    category: 'Packs',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552275/PackImpresoraCBX-CASH330_jd6tah.png']
  },
  {
    title: 'Pack: Impresora 3NSTAR RPT004 + Gaveta CASH330',
    description: 'Conjunto de impresora térmica de alto rendimiento y una gaveta de dinero para organizar tu área de caja de forma eficiente.',
    price: 719.00,
    currency: 'PEN',
    stock: 10,
    category: 'Packs',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552276/PackImpresoraRPT004-CASH330_fozuzk.png']
  },
  {
    title: 'Pack: Impresora CBX POS-89E + Gaveta CASH330 + Lector SC050',
    description: 'Solución completa para punto de venta. Incluye una impresora, una gaveta de dinero y un lector de códigos de barras para una gestión de inventario y ventas más rápida.',
    price: 815.00,
    currency: 'PEN',
    stock: 10,
    category: 'Packs',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552275/PackImpresoraCBX-CASH330_jd6tah.png']
  },
  {
    title: 'Pack: Impresora 3NSTAR RPT004 + Gaveta CASH330 + Lector SC050',
    description: 'El kit definitivo para tu negocio. Incluye una impresora de alta velocidad, gaveta de dinero y un lector de códigos de barras de láser con base.',
    price: 885.00,
    currency: 'PEN',
    stock: 10,
    category: 'Packs',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552276/PackImpresoraRPT004-CASH330-SC050_a97caz.png']
  },
  {
    title: 'Pack: Gaveta CASH330 + Lector SC050',
    description: 'Pack de seguridad y control de inventario. Combina una gaveta de dinero con un lector de códigos de barras para un manejo de caja y productos más eficiente.',
    price: 390.00,
    currency: 'PEN',
    stock: 10,
    category: 'Packs',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552275/PackGaveta330-SC050_bq8y9k.png']
  },
  {
    title: 'Pack: Gaveta CASH330 + Lector PRO SCAN',
    description: 'Pack de punto de venta que incluye una gaveta de dinero y un lector de códigos de barras 1D/2D, ideal para negocios que usan códigos QR.',
    price: 456.00,
    currency: 'PEN',
    stock: 10,
    category: 'Packs',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552275/PackGaveta330-PROSCAN_lfmxg9.png']
  },
  {
    title: 'Pack Completo: Computadora + Impresora + Gaveta + Lector',
    description: 'Solución integral para tu negocio. Incluye una computadora Mini PC, impresora térmica, gaveta de dinero y un lector de códigos de barras.',
    price: 2699.00,
    currency: 'PEN',
    stock: 10,
    category: 'Packs',
    images: ['https://res.cloudinary.com/dizgokre5/image/upload/v1758552275/PackCompleto_j8imeb.png']
  },
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Conectado a MongoDB');

    // Eliminar productos existentes
    await Product.deleteMany({});
    console.log('Productos existentes eliminados');

    // Insertar nuevos productos
    await Product.insertMany(sampleProducts);
    console.log('Productos de ejemplo insertados');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
