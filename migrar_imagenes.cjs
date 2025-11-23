/**
 * Script de Migración de Imágenes Base64 a Firebase Storage
 * 
 * Este script migra todas las imágenes almacenadas como Base64 en Firestore
 * hacia Firebase Storage, reemplazando el campo con la URL pública.
 * 
 * Requisitos:
 * 1. Tener firebase-admin instalado: npm install firebase-admin
 * 2. Tener el archivo serviceAccountKey.json en la raíz del proyecto
 * 3. Configurar el STORAGE_BUCKET con el nombre de tu bucket
 * 
 * Uso:
 * node migrar_imagenes.cjs
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// ========================================
// CONFIGURACIÓN
// ========================================

// TODO: Reemplaza con el nombre de tu bucket de Storage
// Formato: "tu-proyecto.appspot.com" o "gs://tu-bucket"
const STORAGE_BUCKET = 'crm-pecaditos-integrales.firebasestorage.app';

// Nombre de la colección (puedes cambiarlo a 'catalog/products' si usas RTDB)
const COLLECTION_NAME = 'productos';

// Prefijo de la ruta en Storage
const STORAGE_PATH_PREFIX = 'productos';

// Tamaño mínimo para considerar que es Base64 (caracteres)
const MIN_BASE64_LENGTH = 500;

// ========================================
// INICIALIZACIÓN DE FIREBASE ADMIN
// ========================================

const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');

if (!fs.existsSync(serviceAccountPath)) {
  console.error('❌ ERROR: No se encontró el archivo serviceAccountKey.json');
  console.error('   Por favor, descárgalo desde Firebase Console:');
  console.error('   Configuración del proyecto > Cuentas de servicio > Generar nueva clave privada');
  process.exit(1);
}

try {
  const serviceAccount = require(serviceAccountPath);
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: STORAGE_BUCKET
  });

  console.log('✅ Firebase Admin inicializado correctamente');
} catch (error) {
  console.error('❌ Error al inicializar Firebase Admin:', error.message);
  process.exit(1);
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

// ========================================
// FUNCIONES AUXILIARES
// ========================================

/**
 * Verifica si un string parece ser una imagen en Base64
 * @param {string} str - String a verificar
 * @returns {boolean}
 */
function isBase64Image(str) {
  if (typeof str !== 'string' || str.length < MIN_BASE64_LENGTH) {
    return false;
  }

  // Patrones comunes de Base64 con data URI
  const base64Patterns = [
    /^data:image\/(png|jpg|jpeg|gif|webp);base64,/i,
    /^data:image\/(png|jpg|jpeg|gif|webp),/i,
  ];

  return base64Patterns.some(pattern => pattern.test(str));
}

/**
 * Convierte un string Base64 en un Buffer
 * @param {string} base64String - String en formato Base64
 * @returns {Object} { buffer: Buffer, mimeType: string }
 */
function base64ToBuffer(base64String) {
  // Extraer el MIME type y los datos
  const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  
  if (matches && matches.length === 3) {
    const mimeType = matches[1];
    const base64Data = matches[2];
    const buffer = Buffer.from(base64Data, 'base64');
    return { buffer, mimeType };
  }

  // Si no tiene el prefijo data:, asumimos que es base64 puro
  const buffer = Buffer.from(base64String, 'base64');
  return { buffer, mimeType: 'image/jpeg' }; // Default MIME type
}

/**
 * Obtiene la extensión de archivo según el MIME type
 * @param {string} mimeType - Tipo MIME
 * @returns {string}
 */
function getExtensionFromMimeType(mimeType) {
  const mimeMap = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
  };

  return mimeMap[mimeType.toLowerCase()] || 'jpg';
}

/**
 * Sube un buffer a Firebase Storage
 * @param {Buffer} buffer - Buffer de la imagen
 * @param {string} destinationPath - Ruta en Storage
 * @param {string} mimeType - Tipo MIME de la imagen
 * @returns {Promise<string>} URL pública de la imagen
 */
async function uploadToStorage(buffer, destinationPath, mimeType) {
  const file = bucket.file(destinationPath);

  await file.save(buffer, {
    metadata: {
      contentType: mimeType,
      metadata: {
        migratedAt: new Date().toISOString(),
        source: 'migration_script'
      }
    },
    public: true, // Hacer el archivo público
  });

  // Obtener URL pública
  const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destinationPath}`;
  
  return publicUrl;
}

/**
 * Migra un documento individual
 * @param {Object} doc - Documento de Firestore
 * @returns {Promise<Object>} Resultado de la migración
 */
async function migrateDocument(doc) {
  const docId = doc.id;
  const data = doc.data();

  try {
    // Verificar si el campo 'imagen' existe y es Base64
    if (!data.imagen || !isBase64Image(data.imagen)) {
      return {
        success: false,
        docId,
        reason: 'No tiene imagen Base64',
        skipped: true
      };
    }

    console.log(`📦 Procesando documento: ${docId}`);

    // Convertir Base64 a Buffer
    const { buffer, mimeType } = base64ToBuffer(data.imagen);
    const extension = getExtensionFromMimeType(mimeType);

    // Definir la ruta en Storage
    const storagePath = `${STORAGE_PATH_PREFIX}/${docId}/imagen.${extension}`;

    console.log(`   📤 Subiendo a Storage: ${storagePath}`);

    // Subir a Storage
    const publicUrl = await uploadToStorage(buffer, storagePath, mimeType);

    console.log(`   ✅ URL generada: ${publicUrl}`);

    // Actualizar documento en Firestore
    await db.collection(COLLECTION_NAME).doc(docId).update({
      imagen: publicUrl,
      imagenMigradaEn: admin.firestore.FieldValue.serverTimestamp(),
      imagenAnterior: 'migrada_desde_base64' // Marcador de que fue migrada
    });

    console.log(`   💾 Documento actualizado en Firestore`);

    return {
      success: true,
      docId,
      url: publicUrl,
      size: buffer.length
    };

  } catch (error) {
    console.error(`   ❌ Error en documento ${docId}:`, error.message);
    return {
      success: false,
      docId,
      error: error.message
    };
  }
}

// ========================================
// FUNCIÓN PRINCIPAL DE MIGRACIÓN
// ========================================

async function migrateAllImages() {
  console.log('\n🚀 Iniciando migración de imágenes...\n');
  console.log(`📂 Colección: ${COLLECTION_NAME}`);
  console.log(`🪣 Storage Bucket: ${STORAGE_BUCKET}`);
  console.log(`📁 Ruta en Storage: ${STORAGE_PATH_PREFIX}/\n`);

  const startTime = Date.now();
  const results = {
    total: 0,
    migrated: 0,
    skipped: 0,
    failed: 0,
    errors: []
  };

  try {
    // Obtener todos los documentos de la colección
    const snapshot = await db.collection(COLLECTION_NAME).get();
    results.total = snapshot.size;

    console.log(`📊 Total de documentos encontrados: ${results.total}\n`);

    if (results.total === 0) {
      console.log('⚠️  No se encontraron documentos en la colección');
      return;
    }

    // Procesar cada documento
    for (const doc of snapshot.docs) {
      const result = await migrateDocument(doc);

      if (result.success) {
        results.migrated++;
      } else if (result.skipped) {
        results.skipped++;
      } else {
        results.failed++;
        results.errors.push({
          docId: result.docId,
          error: result.error || result.reason
        });
      }
    }

  } catch (error) {
    console.error('❌ Error fatal durante la migración:', error);
    throw error;
  }

  // ========================================
  // RESUMEN FINAL
  // ========================================

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE MIGRACIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Migrados exitosamente: ${results.migrated}`);
  console.log(`⏭️  Omitidos (no Base64):  ${results.skipped}`);
  console.log(`❌ Fallidos:               ${results.failed}`);
  console.log(`📈 Total procesados:       ${results.total}`);
  console.log(`⏱️  Duración:               ${duration}s`);
  console.log('='.repeat(60));

  if (results.errors.length > 0) {
    console.log('\n⚠️  ERRORES DETALLADOS:');
    results.errors.forEach((err, index) => {
      console.log(`   ${index + 1}. Doc: ${err.docId}`);
      console.log(`      Error: ${err.error}`);
    });
  }

  console.log('\n✨ Migración completada\n');
}

// ========================================
// EJECUCIÓN DEL SCRIPT
// ========================================

// Verificar que el bucket esté configurado
if (STORAGE_BUCKET === 'tu-proyecto.appspot.com') {
  console.error('\n❌ ERROR: Debes configurar el STORAGE_BUCKET');
  console.error('   Edita el archivo y reemplaza "tu-proyecto.appspot.com"');
  console.error('   con el nombre de tu bucket de Firebase Storage.\n');
  console.error('   Lo encuentras en: Firebase Console > Storage > gs://tu-bucket\n');
  process.exit(1);
}

// Ejecutar migración
migrateAllImages()
  .then(() => {
    console.log('🎉 Script finalizado exitosamente');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Error fatal:', error);
    process.exit(1);
  });
