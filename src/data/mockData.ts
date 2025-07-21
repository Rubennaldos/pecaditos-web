
// Mock Data para desarrollo y pruebas
// TODO: Estos datos serán reemplazados por Firebase en producción

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

// PRODUCTOS - Sistema limpio, sin datos de ejemplo
export const mockProducts: Product[] = [];

// USUARIOS - Sistema limpio, sin datos de ejemplo
export const mockUsers: User[] = [];

// PEDIDOS - Sistema limpio, sin datos de ejemplo
export const mockOrders: Order[] = [];

// CATEGORÍAS DE PRODUCTOS
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
INSTRUCCIONES PARA USAR MOCK DATA:

1. Estos datos simulan lo que vendrá de Firebase
2. En components, usar estos datos para mostrar información
3. Cuando Firebase esté configurado, reemplazar las llamadas por:
   - ref(database, 'products') para productos
   - ref(database, 'orders') para pedidos
   - ref(database, 'users') para usuarios

4. Para desarrollo, importar así:
   import { mockProducts, mockOrders } from '@/data/mockData';

5. Para producción, reemplazar por servicios de Firebase
*/
