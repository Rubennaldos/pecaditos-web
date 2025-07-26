// Servicios para interactuar con Firebase
// Sistema completamente integrado con Firebase Realtime Database

import { auth, db } from '@/config/firebase'; // ← CORREGIDO
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { ref, set, get, push, update } from 'firebase/database';
import { Product, Order, User } from '@/data/mockData';

// SERVICIOS DE AUTENTICACIÓN

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

    // Guardar datos adicionales del usuario
    await set(ref(db, `users/${user.uid}`), {
      email: user.email,
      ...userData,
      createdAt: new Date().toISOString()
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

// SERVICIOS DE PRODUCTOS

export const getProducts = async (): Promise<Product[]> => {
  try {
    const snapshot = await get(ref(db, 'products'));
    return snapshot.exists() ? Object.values(snapshot.val()) : [];
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return [];
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    const snapshot = await get(ref(db, `products/${id}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error al obtener producto:', error);
    return null;
  }
};

// SERVICIOS DE PEDIDOS

export const createOrder = async (orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt'>) => {
  try {
    const orderNumber = `ORD${Date.now()}`;
    const newOrder = {
      ...orderData,
      orderNumber,
      createdAt: new Date().toISOString()
    };

    const ordersRef = ref(db, 'orders');
    const newOrderRef = push(ordersRef);
    await set(newOrderRef, newOrder);

    return { ...newOrder, id: newOrderRef.key };
  } catch (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }
};

export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  try {
    const snapshot = await get(ref(db, 'orders'));
    if (snapshot.exists()) {
      const orders = Object.values(snapshot.val()) as Order[];
      return orders.find(order => order.orderNumber === orderNumber) || null;
    }
    return null;
  } catch (error) {
    console.error('Error al buscar pedido:', error);
    return null;
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    await update(ref(db, `orders/${orderId}`), { status });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    throw error;
  }
};

// SERVICIOS DE USUARIO

export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    const snapshot = await get(ref(db, `users/${userId}`));
    return snapshot.exists() ? snapshot.val() : null;
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

Firebase Realtime Database configurado y listo para:
- Autenticación de usuarios (Firebase Auth)
- Gestión de productos en tiempo real
- Manejo de pedidos y órdenes
- Perfiles de usuario y datos personalizados
- Sistema completamente limpio sin datos de ejemplo

El sistema está preparado para conectar con sus credenciales de Firebase.
Solo necesita actualizar la configuración en src/config/firebase.ts con sus datos reales.
*/
