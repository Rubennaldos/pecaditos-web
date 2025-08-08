// Modelos/Interfaces del sistema

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice?: number;
  category: string;
  image: string;
  ingredients: string[];
  available: boolean;
  featured: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  address?: string;
  orderHistory: string[];
  createdAt: string;
}

export interface Order {
  id: string;
  userId: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: 'received' | 'preparing' | 'in_transit' | 'delivered';
  deliveryAddress: string;
  customerInfo: {
    name: string;
    phone: string;
    email: string;
  };
  createdAt: string;
  estimatedDelivery?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

// PRODUCTOS - limpio para integración Firebase
export const mockProducts: Product[] = [];

// USUARIOS - limpio para integración Firebase
export const mockUsers: User[] = [];

// PEDIDOS - limpio para integración Firebase
export const mockOrders: Order[] = [];

// CATEGORÍAS DE PRODUCTOS (puedes migrar esto a Firebase si deseas editar desde panel de admin)
export const productCategories = [
  { id: 'todas', name: 'Todas', description: 'Ver todos los productos' },
  { id: 'clasicas', name: 'Clásicas', description: 'Nuestros sabores tradicionales' },
  { id: 'especiales', name: 'Especiales', description: 'Sabores únicos y nutritivos' },
  { id: 'combos', name: 'Combos', description: 'Packs familiares y promocionales' },
  { id: 'promociones', name: 'Promociones', description: 'Ofertas limitadas' }
];

// CONFIGURACIÓN DE DESCUENTOS
export const discountRules = {
  quantity6: { minQuantity: 6, discount: 0.05, description: '5% de descuento' },
  quantity12: { minQuantity: 12, discount: 0.10, description: '10% de descuento' }
};

// CONFIGURACIÓN GENERAL
export const appConfig = {
  minOrderAmount: 70, // Monto mínimo de pedido
  deliveryFee: 0, // Sin costo de delivery por ahora
  businessHours: {
    monday: { open: '08:00', close: '20:00' },
    tuesday: { open: '08:00', close: '20:00' },
    wednesday: { open: '08:00', close: '20:00' },
    thursday: { open: '08:00', close: '20:00' },
    friday: { open: '08:00', close: '20:00' },
    saturday: { open: '09:00', close: '18:00' },
    sunday: { open: '10:00', close: '16:00' }
  },
  allowedDistricts: [
    'San Borja', 'Miraflores', 'San Isidro', 'Surco', 'La Molina',
    'Barranco', 'Chorrillos', 'Magdalena', 'Pueblo Libre'
  ],
  dangerousZones: [
    'Cercado de Lima', 'La Victoria', 'El Agustino'
  ]
};

/*
==================== INSTRUCCIONES DE USO ====================
- Para DESARROLLO:
    import { mockProducts, mockOrders } from '@/data/mockData';
    Usar estos arrays para simular datos.
- Para PRODUCCIÓN (con Firebase):
    Reemplaza el uso de mockProducts, mockOrders, mockUsers por
    fetch desde Firebase, por ejemplo:

    import { ref, onValue } from 'firebase/database';
    const dbRef = ref(database, 'products');
    onValue(dbRef, (snapshot) => {
      const data = snapshot.val();
      // ...
    });

- Puedes borrar estos mocks cuando todo esté migrado a Firebase.
==============================================================
*/

