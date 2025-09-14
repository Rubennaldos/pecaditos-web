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
  runTransaction,
} from 'firebase/database';
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

/** Crea un pedido y le asigna correlativo global ORD-### */
export const createOrder = async (
  orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>
) => {
  try {
    // 1) crear nodo /orders y obtener id
    const ordersRef = ref(db, 'orders');
    const newRef = push(ordersRef);
    const id = newRef.key!;
    const createdAt = new Date().toISOString();

    const dataToSave = {
      ...orderData,
      id,
      createdAt,
      status: (orderData as any)?.status ?? 'pendiente',
    };

    await set(newRef, dataToSave);

    // 2) correlativo global ORD-###
    const orderNumber = await ensureOrderNumber(id);

    // 3) devolver con id + correlativo
    return { ...dataToSave, orderNumber, id } as Order;
  } catch (error) {
    console.error('Error al crear pedido:', error);
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
 * Actualiza el estado del pedido y “marca tiempos” cuando corresponde.
 * Se acepta cualquier string para evitar conflictos de tipos (es/inglés).
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
