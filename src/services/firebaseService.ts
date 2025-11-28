// src/services/firebaseService.ts
// Servicios para interactuar con Firebase
// Sistema completamente integrado con Firebase Realtime Database

import { auth, db } from '@/config/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  ref,
  set,
  get,
  push,
  update,
  remove,
  runTransaction,
} from 'firebase/database';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Product, Order, User } from '@/data/mockData';

/* ===========================
   AUTENTICACIÓN
   =========================== */

export const loginUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    throw error;
  }
};

export const registerUser = async (email: string, password: string, userData: any) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    await set(ref(db, `users/${user.uid}`), {
      email: user.email,
      ...userData,
      createdAt: new Date().toISOString(),
    });

    return user;
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};

/* ===========================
   PRODUCTOS
   =========================== */

export const getProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await get(ref(db, 'products'));
    return snapshot.exists() ? (Object.values(snapshot.val()) as Product[]) : [];
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const snapshot = await get(ref(db, `products/${id}`));
    return snapshot.exists() ? (snapshot.val() as Product) : null;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return null;
  }
};

/* ===========================
   HELPERS DE ÓRDENES
   =========================== */

const pad3 = (n: number) => String(n).padStart(3, '0');

/** Asigna (transaccional) el correlativo global ORD-### usando /meta/orderSeq */
export const ensureOrderNumber = async (orderId: string) => {
  const seqRef = ref(db, 'meta/orderSeq');
  const tx = await runTransaction(seqRef, (curr) =>
    typeof curr !== 'number' ? 1 : curr + 1
  );
  const seq = tx.snapshot?.val() ?? 1;
  const orderNumber = `ORD-${pad3(seq)}`;
  await update(ref(db, `orders/${orderId}`), { orderNumber });
  return orderNumber;
};

/** Construye una “invoice” básica a partir del pedido para ‘Por Cobrar’ */
const buildInvoiceFromOrder = (o: any) => {
  const id = o?.id;
  const createdBase = o?.createdAt || new Date().toISOString();
  const dueBase = new Date(createdBase);
  const pm = String(o?.paymentMethod || '').toLowerCase();

  // vencimiento por defecto
  const due = new Date(dueBase);
  if (pm.includes('30')) due.setDate(dueBase.getDate() + 30);
  else if (pm.includes('15')) due.setDate(dueBase.getDate() + 15);
  else due.setDate(dueBase.getDate() + 7);

  const clientName =
    o?.client?.commercialName ||
    o?.customerName ||
    o?.client?.name ||
    o?.client?.legalName ||
    o?.site?.name ||
    '';

  // evitar mezclar ?? con || -> usar pasos
  const fallbackFromName =
    clientName ? clientName.toLowerCase().replace(/\s+/g, '_') : 'SIN_ID';

  const clientId =
    o?.clientId ||
    o?.client?.id ||
    o?.customer?.id ||
    o?.client?.ruc ||
    fallbackFromName;

  return {
    id,
    orderId: id,
    orderNumber: o?.orderNumber || o?.number || id,
    clientId,
    amount: Number(o?.total || 0),
    createdAt: createdBase,
    dueDate: due.toISOString(),
    status: 'pending' as const,
    clientName,
    ruc: o?.client?.ruc ?? null,
    phone: o?.customer?.phone ?? o?.phone ?? null,
  };
};

/* ===========================
   PEDIDOS
   =========================== */

/**
 * FUNCIÓN CENTRALIZADA PARA CREAR PEDIDOS
 * Esta es la única fuente de verdad para crear pedidos en el sistema.
 * 
 * Características:
 * - Asigna correlativo transaccional (ORD-001, ORD-002, etc.)
 * - Inicializa estructura de billing
 * - Reindexa en /ordersByStatus para consultas rápidas
 * - Emite factura electrónica de forma asíncrona (no bloqueante)
 * 
 * @param orderData - Datos del pedido (sin id, orderNumber ni createdAt)
 * @param options - Opciones adicionales { skipInvoice?: boolean, channel?: string }
 * @returns Pedido creado con id, orderNumber y createdAt
 */
export const createOrder = async (
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>,
  options?: { skipInvoice?: boolean; channel?: string }
) => {
  try {
    // 1) Crear nodo /orders y obtener ID único
    const ordersRef = ref(db, 'orders');
    const newRef = push(ordersRef);
    const id = newRef.key!;
    const createdAt = new Date().toISOString();

    // 2) Preparar datos del pedido con valores por defecto seguros
    const dataToSave = {
      ...orderData,
      id,
      createdAt,
      status: (orderData as any)?.status ?? 'pendiente',
      channel: options?.channel || 'retail', // retail, wholesale, quick, etc.
      // Inicializar estructura de billing para evitar problemas posteriores
      billing: {
        status: 'pending',
        invoiceIssued: false,
        ...(orderData as any)?.billing,
      },
    };

    // 3) Guardar pedido en Firebase
    await set(newRef, dataToSave);

    // 4) Asignar correlativo transaccional ORD-###
    const orderNumber = await ensureOrderNumber(id);

    // 5) Reindexar en /ordersByStatus para consultas rápidas
    const status = dataToSave.status;
    await set(ref(db, `ordersByStatus/${status}/${id}`), true);

    // 6) Integración de Facturación Electrónica (asíncrona, no bloqueante)
    if (!options?.skipInvoice) {
      const functions = getFunctions();
      const issueInvoice = httpsCallable(functions, 'issueElectronicInvoice');
      
      issueInvoice({ ...dataToSave, orderNumber, id })
        .then((result: any) => {
          console.log('✅ Factura electrónica emitida:', result.data);
          // Guardar el resultado exitoso en Firebase
          update(ref(db, `orders/${id}/billing`), {
            invoiceIssued: true,
            invoiceData: result.data,
            invoiceIssuedAt: new Date().toISOString(),
            status: 'invoiced',
          }).catch(err => console.error('Error al actualizar billing:', err));
        })
        .catch((error: any) => {
          console.error('⚠️ Error al emitir factura electrónica:', error.message);
          // Marcar como pendiente de facturación para retry manual
          update(ref(db, `orders/${id}/billing`), {
            invoiceIssued: false,
            invoiceError: error.message,
            invoiceAttemptedAt: new Date().toISOString(),
            status: 'error',
          }).catch(err => console.error('Error al actualizar billing:', err));
        });
    }

    console.log(`✅ Pedido creado exitosamente: ${orderNumber} (ID: ${id})`);

    // 7) Devolver pedido completo con id + correlativo (sin esperar facturación)
    return { ...dataToSave, orderNumber, id } as Order;
  } catch (error) {
    console.error('❌ Error al crear pedido:', error);
    throw error;
  }
};

/**
 * Enviar un pedido a “Por Cobrar”:
 * - Marca orders/{id}/billing.status = 'por_cobrar'
 * - Crea/actualiza billing/invoices/{id}
 */
export const sendOrderToCollection = async (orderId: string) => {
  const snap = await get(ref(db, `orders/${orderId}`));
  if (!snap.exists()) throw new Error('Pedido no encontrado');

  const order = snap.val();
  const orderNumber = order?.orderNumber || (await ensureOrderNumber(orderId));

  await update(ref(db, `orders/${orderId}`), {
    billing: {
      ...(order?.billing || {}),
      status: 'por_cobrar',
      sentToCollectionAt: new Date().toISOString(),
    },
  });

  const invoice = buildInvoiceFromOrder({ ...order, id: orderId, orderNumber });
  await update(ref(db, `billing/invoices/${orderId}`), invoice);

  return { orderId, orderNumber };
};

export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  try {
    const snapshot = await get(ref(db, 'orders'));
    if (!snapshot.exists()) return null;
    const ordersObj = snapshot.val() as Record<string, any>;
    for (const [id, v] of Object.entries(ordersObj)) {
      if ((v as any)?.orderNumber === orderNumber) {
        return { id, ...(v as any) } as Order;
      }
    }
    return null;
  } catch (error) {
    console.error('Error al buscar pedido:', error);
    return null;
  }
};

/**
 * Actualiza el estado del pedido y "marca tiempos" cuando corresponde.
 * Se acepta cualquier string para evitar conflictos de tipos (es/inglés).
 * 
 * @deprecated Usar updateDeliveryStatus para cambios de delivery o changeOrderStatus del contexto
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const st = String(status);
    const now = new Date().toISOString();
    const updates: Record<string, any> = { status: st };

    // equivalencias español/inglés por si en algún lado vienen distinto
    if (st === 'en_preparacion' || st === 'preparing' || st === 'accepted') {
      updates.acceptedAt = now;
    }
    if (st === 'listo' || st === 'ready') {
      updates.readyAt = now;
    }
    if (st === 'entregado' || st === 'delivered') {
      updates.deliveredAt = now;
    }
    if (st === 'rechazado' || st === 'rejected') {
      updates.rejectedAt = now;
    }

    await update(ref(db, `orders/${orderId}`), updates);
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    throw error;
  }
};

/**
 * FUNCIÓN PROFESIONAL PARA ACTUALIZAR ESTADO DE DELIVERY
 * Maneja el flujo de entrega de pedidos con persistencia completa en Firebase.
 * 
 * Estados soportados:
 * - 'en_ruta': Pedido tomado por repartidor
 * - 'entregado': Pedido entregado al cliente
 * 
 * Características:
 * - Persiste cambios en Firebase RTDB
 * - Actualiza índices /ordersByStatus
 * - Registra timestamps (takenAt, deliveredAt)
 * - Guarda metadata (assignedTo, deliveryNotes, etc.)
 * - Inicializa billing si no existe (para pedidos que no lo tengan)
 * 
 * @param orderId - ID del pedido
 * @param status - Nuevo estado ('en_ruta' o 'entregado')
 * @param metadata - Datos adicionales { assignedTo, deliveryNotes, etc. }
 */
export const updateDeliveryStatus = async (
  orderId: string,
  status: 'en_ruta' | 'entregado',
  metadata?: {
    assignedTo?: string;
    deliveryNotes?: string;
    deliveryLocation?: { lat: number; lng: number };
    [key: string]: any;
  }
) => {
  try {
    if (!orderId) {
      throw new Error('orderId es requerido');
    }

    const now = new Date().toISOString();
    const nowTimestamp = Date.now();

    // 1) Obtener estado anterior del pedido
    const orderRef = ref(db, `orders/${orderId}`);
    const snapshot = await get(orderRef);
    
    if (!snapshot.exists()) {
      throw new Error(`Pedido ${orderId} no encontrado`);
    }

    const currentOrder = snapshot.val();
    const previousStatus = currentOrder?.status;

    // 2) Preparar actualizaciones según el nuevo estado
    const updates: Record<string, any> = {
      status,
      updatedAt: now,
    };

    // Metadata específica según el estado
    if (status === 'en_ruta') {
      updates.takenAt = now;
      updates.takenAtTimestamp = nowTimestamp;
      if (metadata?.assignedTo) {
        updates.assignedTo = metadata.assignedTo;
      }
    }

    if (status === 'entregado') {
      updates.deliveredAt = now;
      updates.deliveredAtTimestamp = nowTimestamp;
      if (metadata?.deliveryNotes) {
        updates.deliveryNotes = metadata.deliveryNotes;
      }
      if (metadata?.deliveryLocation) {
        updates.deliveryLocation = metadata.deliveryLocation;
      }

      // PASO 3: Blindar el flujo - Inicializar billing si no existe
      if (!currentOrder.billing) {
        updates.billing = {
          status: 'pending',
          invoiceIssued: false,
          pendingManualInvoice: true,
          note: 'Billing inicializado automáticamente al entregar pedido',
        };
        console.log(`⚠️ Pedido ${orderId}: billing no existía, se inicializó automáticamente`);
      }
    }

    // Agregar cualquier metadata adicional
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        if (!['assignedTo', 'deliveryNotes', 'deliveryLocation'].includes(key)) {
          updates[key] = metadata[key];
        }
      });
    }

    // 3) Actualizar pedido en Firebase
    await update(orderRef, updates);

    // 4) Actualizar índices /ordersByStatus
    if (previousStatus && previousStatus !== status) {
      // Remover del índice anterior
      await remove(ref(db, `ordersByStatus/${previousStatus}/${orderId}`));
      console.log(`📍 Removido de ordersByStatus/${previousStatus}/${orderId}`);
    }

    // Agregar al índice nuevo
    await set(ref(db, `ordersByStatus/${status}/${orderId}`), true);
    console.log(`📍 Agregado a ordersByStatus/${status}/${orderId}`);

    console.log(`✅ Delivery actualizado: ${orderId} → ${status}`);

    return {
      success: true,
      orderId,
      status,
      previousStatus,
      updates,
    };
  } catch (error) {
    console.error('❌ Error al actualizar delivery:', error);
    throw error;
  }
};

/* ===========================
   USUARIOS
   =========================== */

export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const snapshot = await get(ref(db, `users/${userId}`));
    return snapshot.exists() ? (snapshot.val() as User) : null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    await update(ref(db, `users/${userId}`), userData);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
};

/*
SISTEMA DE PRODUCCIÓN - FIREBASE COMPLETAMENTE INTEGRADO

- Autenticación de usuarios (Firebase Auth)
- Gestión de productos en tiempo real
- Manejo de pedidos con correlativo global ORD-###
- Envío a "Por Cobrar" con billing/invoices
- Perfiles de usuario y datos personalizados
*/
// --- Helpers opcionales de contraseña --- //
import {
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';

export async function sendResetEmail(targetEmail: string) {
  return sendPasswordResetEmail(auth, targetEmail);
}

export async function changeOwnPassword(currentEmail: string, currentPassword: string, newPassword: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('No hay sesión activa');
  const cred = EmailAuthProvider.credential(currentEmail, currentPassword);
  await reauthenticateWithCredential(user, cred);
  await updatePassword(user, newPassword);
}
