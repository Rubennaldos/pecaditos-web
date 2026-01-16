// src/services/supabaseService.ts
// Servicios para interactuar con Supabase PostgreSQL
// Sistema migrado de Firebase RTDB a PostgreSQL

import { supabase } from '@/config/supabase';
import type {
  UserRegistrationData,
  CreateOrderOptions,
  DeliveryUpdateMetadata,
  DeliveryUpdateResult,
  DeliveryStatus,
} from '@/types/firebase';
import logger from '@/lib/logger';

/* ===========================
   AUTENTICACIÓN
   =========================== */

export const loginUser = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    
    logger.auth(`Login exitoso: ${email}`);
    return data.user;
  } catch (error) {
    logger.error('Error al iniciar sesión:', error);
    throw error;
  }
};

export const registerUser = async (
  email: string,
  password: string,
  userData: UserRegistrationData
) => {
  try {
    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: userData.nombre,
        },
      },
    });

    if (authError) throw authError;
    if (!authData.user) throw new Error('No se pudo crear el usuario');

    // 2. Crear perfil en tabla usuarios
    const { error: profileError } = await supabase
      .from('usuarios')
      .insert({
        id: authData.user.id,
        email: authData.user.email!,
        nombre: userData.nombre,
        telefono: userData.telefono || null,
        rol: 'cliente',
        activo: true,
        permissions: [],
        access_modules: [],
      });

    if (profileError) throw profileError;

    logger.auth(`Usuario registrado: ${email}`);
    return authData.user;
  } catch (error) {
    logger.error('Error al registrar usuario:', error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    logger.auth('Sesión cerrada');
  } catch (error) {
    logger.error('Error al cerrar sesión:', error);
    throw error;
  }
};

/* ===========================
   PRODUCTOS
   =========================== */

export const getProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('disponible', true)
      .order('nombre', { ascending: true });

    if (error) throw error;

    logger.debug(`Productos cargados: ${data?.length || 0}`);
    return data || [];
  } catch (error) {
    logger.error('Error al obtener productos:', error);
    return [];
  }
};

export const getProductById = async (id: string) => {
  try {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error al obtener producto:', error);
    return null;
  }
};

/* ===========================
   HELPERS DE ÓRDENES
   =========================== */

/** Asigna el correlativo global ORD-### */
export const ensureOrderNumber = async (): Promise<string> => {
  try {
    // Llamar a la función SQL que genera el número de orden
    const { data, error } = await supabase.rpc('generar_numero_orden');

    if (error) throw error;
    
    return data as string;
  } catch (error) {
    logger.error('Error al generar número de orden:', error);
    // Fallback: generar uno temporal
    return `ORD-${Date.now().toString().slice(-6)}`;
  }
};

/* ===========================
   PEDIDOS
   =========================== */

/**
 * FUNCIÓN CENTRALIZADA PARA CREAR PEDIDOS
 * Migrada de Firebase a Supabase PostgreSQL
 */
export const createOrder = async (
  orderData: any,
  options?: CreateOrderOptions
) => {
  try {
    const createdAt = new Date().toISOString();

    // 1) Generar número de orden
    const orderNumber = await ensureOrderNumber();

    // 2) Preparar datos del pedido
    const pedidoData = {
      numero_orden: orderNumber,
      tipo_pedido: options?.channel === 'wholesale' ? 'mayorista' : 'minorista',
      canal: options?.channel || 'web',
      estado: 'pendiente',
      subtotal: orderData.subtotal || 0,
      descuento: orderData.discount || orderData.descuento || 0,
      total: orderData.total || 0,
      metodo_pago: orderData.paymentMethod || orderData.metodo_pago,
      direccion_entrega: orderData.customerAddress || orderData.direccion_entrega,
      distrito_entrega: orderData.district || orderData.distrito_entrega,
      telefono_contacto: orderData.customerPhone || orderData.telefono_contacto,
      nombre_contacto: orderData.customerName || orderData.nombre_contacto,
      notas: orderData.notes || orderData.notas,
      created_at: createdAt,
    };

    // 3) Insertar pedido
    const { data: pedido, error: pedidoError } = await supabase
      .from('pedidos')
      .insert(pedidoData)
      .select()
      .single();

    if (pedidoError) throw pedidoError;

    // 4) Insertar items del pedido
    const items = orderData.items || [];
    const itemsData = items.map((item: any) => ({
      pedido_id: pedido.id,
      producto_nombre: item.name || item.productName || item.product,
      producto_codigo: item.productId,
      cantidad: item.quantity || item.cantidad,
      precio_unitario: item.unitPrice || item.price,
      subtotal: item.subtotal,
    }));

    if (itemsData.length > 0) {
      const { error: itemsError } = await supabase
        .from('pedidos_items')
        .insert(itemsData);

      if (itemsError) throw itemsError;
    }

    logger.orderCreated(orderNumber, pedido.id);

    return {
      ...pedido,
      items: itemsData,
    };
  } catch (error) {
    logger.error('Error al crear pedido:', error);
    throw error;
  }
};

/**
 * Obtener pedido por número
 */
export const getOrderByNumber = async (orderNumber: string) => {
  try {
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        items:pedidos_items(*)
      `)
      .eq('numero_orden', orderNumber)
      .single();

    if (error) throw error;

    logger.debug(`Pedido encontrado: ${orderNumber}`);
    return data;
  } catch (error) {
    logger.error('Error al buscar pedido:', error);
    return null;
  }
};

/**
 * Actualizar estado del pedido
 */
export const updateOrderStatus = async (orderId: string, status: string) => {
  try {
    const now = new Date().toISOString();
    const updates: any = { 
      estado: status,
      updated_at: now,
    };

    // Marcar timestamps según el estado
    if (status === 'en_preparacion' || status === 'accepted') {
      updates.accepted_at = now;
    }
    if (status === 'listo' || status === 'ready') {
      updates.ready_at = now;
    }
    if (status === 'entregado' || status === 'delivered') {
      updates.delivered_at = now;
    }
    if (status === 'rechazado' || status === 'rejected') {
      updates.rejected_at = now;
    }

    const { error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', orderId);

    if (error) throw error;

    logger.info(`Pedido ${orderId} actualizado a: ${status}`);
  } catch (error) {
    logger.error('Error al actualizar estado del pedido:', error);
    throw error;
  }
};

/**
 * Actualizar estado de delivery con metadata
 */
export const updateDeliveryStatus = async (
  orderId: string,
  status: DeliveryStatus,
  metadata?: DeliveryUpdateMetadata
): Promise<DeliveryUpdateResult> => {
  try {
    const now = new Date().toISOString();
    const updates: any = {
      estado: status,
      updated_at: now,
    };

    if (status === 'en_ruta') {
      updates.taken_at = now;
      if (metadata?.assignedTo) {
        updates.asignado_a = metadata.assignedTo;
      }
    }

    if (status === 'entregado') {
      updates.delivered_at = now;
      if (metadata?.deliveryNotes) {
        updates.notas_delivery = metadata.deliveryNotes;
      }
    }

    const { data, error } = await supabase
      .from('pedidos')
      .update(updates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;

    logger.delivery(orderId, status);

    return {
      success: true,
      orderId,
      status,
      previousStatus: data.estado,
      updates,
    };
  } catch (error) {
    logger.error('Error al actualizar delivery:', error);
    throw error;
  }
};

/* ===========================
   USUARIOS
   =========================== */

export const getUserData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    logger.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, userData: any) => {
  try {
    const { error } = await supabase
      .from('usuarios')
      .update({
        ...userData,
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId);

    if (error) throw error;

    logger.info(`Perfil actualizado: ${userId}`);
  } catch (error) {
    logger.error('Error al actualizar perfil:', error);
    throw error;
  }
};

/* ===========================
   FACTURACIÓN
   =========================== */

export const sendOrderToCollection = async (orderId: string) => {
  try {
    // Actualizar estado de billing del pedido
    const { error } = await supabase
      .from('pedidos')
      .update({
        'billing->status': 'por_cobrar',
        'billing->sentToCollectionAt': new Date().toISOString(),
      })
      .eq('id', orderId);

    if (error) throw error;

    logger.billing(`Pedido ${orderId} enviado a Por Cobrar`);
    return { orderId };
  } catch (error) {
    logger.error('Error al enviar a cobranzas:', error);
    throw error;
  }
};

/*
SISTEMA DE PRODUCCIÓN - SUPABASE COMPLETAMENTE INTEGRADO

- Autenticación de usuarios (Supabase Auth)
- Gestión de productos en PostgreSQL
- Manejo de pedidos con correlativo global ORD-###
- Triggers automáticos para stock e integridad
- Perfiles de usuario y datos personalizados
*/
