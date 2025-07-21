
// Servicios para interactuar con Firebase
// TODO: Implementar cuando Firebase esté configurado

import { auth, database } from '@/config/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { ref, set, get, push, update } from 'firebase/database';
import { mockProducts, mockOrders, mockUsers, Product, Order, User } from '@/data/mockData';

// SERVICIOS DE AUTENTICACIÓN

export const loginUser = async (email: string, password: string) => {
  try {
    // En modo de desarrollo/demo, simular login exitoso para usuarios específicos
    const demoUsers = [
      'admin@pecaditos.com',
      'pedidos@pecaditos.com', 
      'reparto@pecaditos.com',
      'produccion@pecaditos.com',
      'cobranzas@pecaditos.com',
      'distribuidora@ejemplo.com',
      'minimarket@ejemplo.com'
    ];
    
    if (demoUsers.includes(email)) {
      // Simular usuario Firebase para demo
      return {
        uid: `demo-${email.split('@')[0]}`,
        email: email,
        displayName: email.split('@')[0],
        emailVerified: true
      } as any;
    }
    
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
    await set(ref(database, `users/${user.uid}`), {
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
    // TODO: Cuando Firebase esté configurado, usar:
    // const snapshot = await get(ref(database, 'products'));
    // return snapshot.exists() ? Object.values(snapshot.val()) : [];
    
    // Por ahora retornar mock data
    return mockProducts;
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return mockProducts; // Fallback a mock data
  }
};

export const getProductById = async (id: string): Promise<Product | null> => {
  try {
    // TODO: Implementar con Firebase
    // const snapshot = await get(ref(database, `products/${id}`));
    // return snapshot.exists() ? snapshot.val() : null;
    
    return mockProducts.find(p => p.id === id) || null;
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
    
    // TODO: Cuando Firebase esté configurado, usar:
    // const ordersRef = ref(database, 'orders');
    // const newOrderRef = push(ordersRef);
    // await set(newOrderRef, newOrder);
    
    console.log('Pedido creado:', newOrder);
    return { ...newOrder, id: orderNumber };
  } catch (error) {
    console.error('Error al crear pedido:', error);
    throw error;
  }
};

export const getOrderByNumber = async (orderNumber: string): Promise<Order | null> => {
  try {
    // TODO: Implementar búsqueda en Firebase
    // const snapshot = await get(ref(database, 'orders'));
    // if (snapshot.exists()) {
    //   const orders = Object.values(snapshot.val()) as Order[];
    //   return orders.find(order => order.orderNumber === orderNumber) || null;
    // }
    
    return mockOrders.find(order => order.orderNumber === orderNumber) || null;
  } catch (error) {
    console.error('Error al buscar pedido:', error);
    return null;
  }
};

export const updateOrderStatus = async (orderId: string, status: Order['status']) => {
  try {
    // TODO: Implementar con Firebase
    // await update(ref(database, `orders/${orderId}`), { status });
    
    console.log(`Estado del pedido ${orderId} actualizado a: ${status}`);
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    throw error;
  }
};

// SERVICIOS DE USUARIO

export const getUserData = async (userId: string): Promise<User | null> => {
  try {
    // TODO: Implementar con Firebase
    // const snapshot = await get(ref(database, `users/${userId}`));
    // return snapshot.exists() ? snapshot.val() : null;
    
    return mockUsers.find(user => user.id === userId) || null;
  } catch (error) {
    console.error('Error al obtener datos del usuario:', error);
    return null;
  }
};

export const updateUserProfile = async (userId: string, userData: Partial<User>) => {
  try {
    // TODO: Implementar con Firebase
    // await update(ref(database, `users/${userId}`), userData);
    
    console.log('Perfil de usuario actualizado:', userData);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    throw error;
  }
};

/*
INSTRUCCIONES PARA IMPLEMENTAR FIREBASE:

1. Configurar Firebase en src/config/firebase.ts
2. Descomentar las líneas marcadas con TODO
3. Comentar o eliminar las líneas que usan mockData
4. Probar cada función gradualmente
5. Implementar manejo de errores apropiado
6. Agregar validaciones de datos antes de enviar a Firebase

EJEMPLO DE USO:
import { getProducts, createOrder, loginUser } from '@/services/firebaseService';

// En un componente:
const products = await getProducts();
const user = await loginUser(email, password);
const order = await createOrder(orderData);
*/
