// Ejemplo de Testing de Facturación Electrónica
// Este archivo NO se debe incluir en producción, es solo para testing

import { getFunctions, httpsCallable } from 'firebase/functions';
import { app } from '@/config/firebase';

/**
 * Función de prueba para llamar directamente a issueElectronicInvoice
 * Útil para debugging y testing sin crear un pedido real
 */
export const testElectronicInvoice = async () => {
  const functions = getFunctions(app);
  const issueInvoice = httpsCallable(functions, 'issueElectronicInvoice');

  // Data de prueba (ajusta según tus necesidades)
  const testOrderData = {
    id: 'test-order-id',
    orderNumber: 'ORD-999',
    status: 'pendiente',
    createdAt: new Date().toISOString(),
    total: 100.00,
    client: {
      ruc: '20123456789', // Usa un RUC válido de prueba
      legalName: 'EMPRESA DE PRUEBA SAC',
      commercialName: 'Empresa Test'
    },
    customerAddress: 'Av. Test 123, Lima',
    customerPhone: '987654321',
    items: [
      {
        name: 'Producto de Prueba 1',
        quantity: 10,
        price: 8.00
      },
      {
        name: 'Producto de Prueba 2',
        quantity: 5,
        price: 4.00
      }
    ],
    notes: 'Pedido de prueba para testing de facturación'
  };

  try {
    console.log('🧪 Iniciando prueba de facturación electrónica...');
    console.log('📦 Data enviada:', JSON.stringify(testOrderData, null, 2));

    const result = await issueInvoice(testOrderData);

    console.log('✅ Resultado exitoso:', result.data);
    return result.data;
  } catch (error: any) {
    console.error('❌ Error en la prueba:', error);
    console.error('Código:', error.code);
    console.error('Mensaje:', error.message);
    console.error('Detalles:', error.details);
    throw error;
  }
};

/**
 * Función para verificar el estado de facturación de un pedido existente
 */
export const checkInvoiceStatus = async (orderId: string) => {
  const { ref, get } = await import('firebase/database');
  const { db } = await import('@/config/firebase');

  try {
    const billingRef = ref(db, `orders/${orderId}/billing`);
    const snapshot = await get(billingRef);

    if (!snapshot.exists()) {
      console.log('⚠️ No hay información de facturación para este pedido');
      return null;
    }

    const billingData = snapshot.val();
    console.log('📄 Estado de facturación:', billingData);

    if (billingData.invoiceIssued) {
      console.log('✅ Factura emitida exitosamente');
      console.log('Número:', billingData.invoiceData?.numero_comprobante);
      console.log('Fecha:', billingData.invoiceIssuedAt);
    } else {
      console.log('❌ Factura no emitida');
      console.log('Error:', billingData.invoiceError);
      console.log('Intento:', billingData.invoiceAttemptedAt);
    }

    return billingData;
  } catch (error) {
    console.error('Error al verificar estado:', error);
    throw error;
  }
};

/**
 * Función para reintentar la emisión de facturas fallidas
 */
export const retryFailedInvoices = async () => {
  const { ref, get, query, orderByChild, equalTo } = await import('firebase/database');
  const { db } = await import('@/config/firebase');
  const functions = getFunctions(app);
  const issueInvoice = httpsCallable(functions, 'issueElectronicInvoice');

  try {
    console.log('🔄 Buscando facturas fallidas...');

    const ordersRef = ref(db, 'orders');
    const snapshot = await get(ordersRef);

    if (!snapshot.exists()) {
      console.log('No hay pedidos');
      return;
    }

    const orders = snapshot.val();
    const failedOrders: any[] = [];

    // Buscar pedidos con facturación fallida
    Object.entries(orders).forEach(([id, order]: [string, any]) => {
      if (order.billing?.invoiceIssued === false) {
        failedOrders.push({ id, ...order });
      }
    });

    console.log(`📋 Encontradas ${failedOrders.length} facturas fallidas`);

    // Reintentar cada una
    for (const order of failedOrders) {
      console.log(`🔄 Reintentando orden ${order.orderNumber}...`);
      try {
        const result = await issueInvoice(order);
        console.log(`✅ Éxito: ${order.orderNumber}`, result.data);
      } catch (error: any) {
        console.error(`❌ Falló: ${order.orderNumber}`, error.message);
      }
    }

    console.log('✅ Proceso de reintentos completado');
  } catch (error) {
    console.error('Error en reintentos:', error);
    throw error;
  }
};

// Ejemplo de uso en consola del navegador:
/*

// 1. Importar el módulo
import { testElectronicInvoice, checkInvoiceStatus, retryFailedInvoices } from './testFacturacion';

// 2. Probar la emisión de factura
await testElectronicInvoice();

// 3. Verificar estado de un pedido específico
await checkInvoiceStatus('order-id-aqui');

// 4. Reintentar facturas fallidas
await retryFailedInvoices();

*/
