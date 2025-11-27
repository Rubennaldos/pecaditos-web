/**
 * Script de prueba para la funcionalidad de consultas RUC/DNI
 * 
 * Este archivo contiene funciones de prueba que puedes ejecutar desde
 * la consola del navegador para verificar que todo funciona correctamente.
 */

import { getFunctions, httpsCallable } from 'firebase/functions';

/**
 * Prueba de consulta de RUC
 */
export async function testConsultaRUC(ruc: string = '20131312955') {
  console.log('🔍 Consultando RUC:', ruc);
  
  try {
    const functions = getFunctions();
    const consultarDocumento = httpsCallable(functions, 'consultarDocumento');
    
    const result = await consultarDocumento({ 
      tipo: 'ruc', 
      numero: ruc 
    });
    
    console.log('✅ Resultado:', result.data);
    return result.data;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
    throw error;
  }
}

/**
 * Prueba de consulta de DNI
 */
export async function testConsultaDNI(dni: string = '43837522') {
  console.log('🔍 Consultando DNI:', dni);
  
  try {
    const functions = getFunctions();
    const consultarDocumento = httpsCallable(functions, 'consultarDocumento');
    
    const result = await consultarDocumento({ 
      tipo: 'dni', 
      numero: dni 
    });
    
    console.log('✅ Resultado:', result.data);
    return result.data;
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Detalles:', error);
    throw error;
  }
}

/**
 * Prueba de validación de RUC inválido (longitud incorrecta)
 */
export async function testRUCInvalido() {
  console.log('🧪 Probando RUC con longitud inválida...');
  
  try {
    const functions = getFunctions();
    const consultarDocumento = httpsCallable(functions, 'consultarDocumento');
    
    await consultarDocumento({ 
      tipo: 'ruc', 
      numero: '12345' // Solo 5 dígitos, debería fallar
    });
    
    console.error('❌ No debería llegar aquí - la validación debió fallar');
  } catch (error: any) {
    console.log('✅ Validación funcionó correctamente:', error.message);
  }
}

/**
 * Prueba de validación de DNI inválido (longitud incorrecta)
 */
export async function testDNIInvalido() {
  console.log('🧪 Probando DNI con longitud inválida...');
  
  try {
    const functions = getFunctions();
    const consultarDocumento = httpsCallable(functions, 'consultarDocumento');
    
    await consultarDocumento({ 
      tipo: 'dni', 
      numero: '123' // Solo 3 dígitos, debería fallar
    });
    
    console.error('❌ No debería llegar aquí - la validación debió fallar');
  } catch (error: any) {
    console.log('✅ Validación funcionó correctamente:', error.message);
  }
}

/**
 * Ejecutar todas las pruebas
 */
export async function runAllTests() {
  console.log('🚀 Ejecutando todas las pruebas...\n');
  
  try {
    // Prueba 1: RUC válido
    console.log('--- Prueba 1: RUC Válido ---');
    await testConsultaRUC('20131312955');
    console.log('');
    
    // Prueba 2: DNI válido
    console.log('--- Prueba 2: DNI Válido ---');
    await testConsultaDNI('43837522');
    console.log('');
    
    // Prueba 3: RUC inválido
    console.log('--- Prueba 3: RUC Inválido ---');
    await testRUCInvalido();
    console.log('');
    
    // Prueba 4: DNI inválido
    console.log('--- Prueba 4: DNI Inválido ---');
    await testDNIInvalido();
    console.log('');
    
    console.log('✅ ¡Todas las pruebas completadas!');
  } catch (error) {
    console.error('❌ Error en las pruebas:', error);
  }
}

/**
 * Ejemplo de uso en la consola del navegador:
 * 
 * 1. Abre la aplicación en el navegador
 * 2. Abre la consola de desarrollador (F12)
 * 3. Importa este módulo en algún componente de tu app:
 *    import * as TestConsultas from '@/services/testConsultas';
 *    window.TestConsultas = TestConsultas;
 * 
 * 4. Desde la consola del navegador, ejecuta:
 * 
 *    // Probar un RUC específico
 *    TestConsultas.testConsultaRUC('20131312955')
 * 
 *    // Probar un DNI específico
 *    TestConsultas.testConsultaDNI('43837522')
 * 
 *    // Ejecutar todas las pruebas
 *    TestConsultas.runAllTests()
 */
