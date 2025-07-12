
// Mock Data para desarrollo y pruebas
// TODO: Estos datos serán reemplazados por Firebase en producción

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  image: string;
  ingredients: string[];
  available: boolean;
  featured: boolean;
  onPromotion?: boolean;
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

export interface CartItem {
  product: Product;
  quantity: number;
}

// PRODUCTOS DE EJEMPLO
export const mockProducts: Product[] = [
  {
    id: 'prod_001',
    name: 'Galletas Chocochips Integrales',
    description: 'Deliciosas galletas integrales con chips de chocolate belga. Sin preservantes artificiales.',
    price: 12.50,
    category: 'clasicas',
    image: '/placeholder-cookie-choco.jpg',
    ingredients: ['Harina integral', 'Chocolate belga', 'Miel de abeja', 'Aceite de coco'],
    available: true,
    featured: true,
    onPromotion: true
  },
  {
    id: 'prod_002',
    name: 'Galletas de Avena y Pasas',
    description: 'Tradicionales galletas de avena con pasas naturales. Rica en fibra y sabor casero.',
    price: 11.00,
    category: 'clasicas',
    image: '/placeholder-cookie-oat.jpg',
    ingredients: ['Avena integral', 'Pasas naturales', 'Canela', 'Miel de abeja'],
    available: true,
    featured: false
  },
  {
    id: 'prod_003',
    name: 'Galletas de Maracuyá',
    description: 'Sabor tropical único con maracuyá peruano. Frescas y deliciosas.',
    price: 13.00,
    category: 'tropicales',
    image: '/placeholder-cookie-maracuya.jpg',
    ingredients: ['Harina integral', 'Maracuyá', 'Miel de abeja'],
    available: true,
    featured: true
  },
  {
    id: 'prod_004',
    name: 'Galletas de Higo',
    description: 'Con higos naturales deshidratados. Dulzura natural y textura perfecta.',
    price: 14.00,
    category: 'especiales',
    image: '/placeholder-cookie-fig.jpg',
    ingredients: ['Harina integral', 'Higos deshidratados', 'Canela'],
    available: true,
    featured: false
  },
  {
    id: 'prod_005',
    name: 'Galletas de Frutos Rojos',
    description: 'Mezcla de arándanos, frambuesas y fresas deshidratadas.',
    price: 15.00,
    category: 'especiales',
    image: '/placeholder-cookie-berries.jpg',
    ingredients: ['Harina integral', 'Frutos rojos', 'Miel de abeja'],
    available: true,
    featured: true,
    onPromotion: true
  },
  {
    id: 'prod_006',
    name: 'Combo Familiar (12 unidades)',
    description: 'Variedad de nuestras mejores galletas. Perfecto para compartir en familia.',
    price: 65.00,
    category: 'combos',
    image: '/placeholder-combo-family.jpg',
    ingredients: ['Variedad de galletas integrales'],
    available: true,
    featured: true
  },
  {
    id: 'prod_007',
    name: 'Galletas Energéticas con Quinua',
    description: 'Galletas nutritivas con quinua peruana y frutos secos. Ideales para deportistas.',
    price: 16.00,
    category: 'especiales',
    image: '/placeholder-cookie-quinoa.jpg',
    ingredients: ['Harina integral', 'Quinua', 'Almendras', 'Nueces'],
    available: true,
    featured: false
  }
];

// USUARIOS DE EJEMPLO
export const mockUsers: User[] = [
  {
    id: 'user_001',
    email: 'juan.perez@email.com',
    name: 'Juan Pérez',
    phone: '+51 999 888 777',
    address: 'Av. Los Olivos 123, San Borja, Lima',
    orderHistory: ['ORD001', 'ORD003'],
    createdAt: '2024-01-01T10:00:00Z'
  },
  {
    id: 'user_002',
    email: 'maria.garcia@email.com',
    name: 'María García',
    phone: '+51 888 777 666',
    address: 'Jr. Las Flores 456, Miraflores, Lima',
    orderHistory: ['ORD002'],
    createdAt: '2024-01-05T14:30:00Z'
  }
];

// PEDIDOS DE EJEMPLO
export const mockOrders: Order[] = [
  {
    id: 'order_001',
    userId: 'user_001',
    orderNumber: 'ORD001',
    items: [
      {
        productId: 'prod_001',
        productName: 'Galletas Chocochips Integrales',
        quantity: 6,
        unitPrice: 12.50,
        subtotal: 75.00
      }
    ],
    subtotal: 75.00,
    discount: 3.75, // 5% descuento por 6 unidades
    total: 71.25,
    status: 'in_transit',
    deliveryAddress: 'Av. Los Olivos 123, San Borja, Lima',
    customerInfo: {
      name: 'Juan Pérez',
      phone: '+51 999 888 777',
      email: 'juan.perez@email.com'
    },
    createdAt: '2024-01-15T09:00:00Z',
    estimatedDelivery: '2024-01-16T15:00:00Z'
  },
  {
    id: 'order_002',
    userId: 'user_002',
    orderNumber: 'ORD002',
    items: [
      {
        productId: 'prod_002',
        productName: 'Galletas de Avena y Pasas',
        quantity: 12,
        unitPrice: 11.00,
        subtotal: 132.00
      }
    ],
    subtotal: 132.00,
    discount: 13.20, // 10% descuento por 12 unidades
    total: 118.80,
    status: 'delivered',
    deliveryAddress: 'Jr. Las Flores 456, Miraflores, Lima',
    customerInfo: {
      name: 'María García',
      phone: '+51 888 777 666',
      email: 'maria.garcia@email.com'
    },
    createdAt: '2024-01-10T11:30:00Z',
    estimatedDelivery: 'Entregado el 2024-01-11T16:00:00Z'
  }
];

// CATEGORÍAS DE PRODUCTOS
export const productCategories = [
  { id: 'todas', name: 'Todas', description: 'Todos nuestros productos' },
  { id: 'clasicas', name: 'Clásicas', description: 'Nuestros sabores tradicionales' },
  { id: 'tropicales', name: 'Tropicales', description: 'Sabores exóticos peruanos' },
  { id: 'especiales', name: 'Especiales', description: 'Sabores únicos y nutritivos' },
  { id: 'combos', name: 'Combos', description: 'Packs familiares y promocionales' },
  { id: 'promociones', name: 'Promociones', description: 'Ofertas limitadas' }
];

// CONFIGURACIÓN DE DESCUENTOS
export const discountRules = {
  quantity6: { minQuantity: 6, discount: 0.05, description: '5% de descuento por 6 unidades' },
  quantity12: { minQuantity: 12, discount: 0.10, description: '10% de descuento por 12 unidades' }
};

// DISTRITOS PERMITIDOS PARA DELIVERY
export const allowedDistricts = [
  'San Borja', 'Miraflores', 'San Isidro', 'Surco', 'La Molina',
  'Barranco', 'Chorrillos', 'Magdalena', 'Pueblo Libre', 'Jesús María',
  'Lince', 'Breña', 'San Miguel'
];

// DISTRITOS CON ZONAS PELIGROSAS
export const dangerousDistricts = [
  'Cercado de Lima', 'La Victoria', 'El Agustino', 'Ate', 'San Juan de Lurigancho'
];

// CONFIGURACIÓN GENERAL
export const appConfig = {
  minOrderAmount: 70, // Monto mínimo de pedido en soles
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
  whatsappNumber: '+51999888777',
  socialMedia: {
    instagram: '@pecaditos.integrales',
    facebook: 'PecaditosIntegrales',
    tiktok: '@pecaditos.integrales'
  }
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
   import { mockProducts, mockOrders, productCategories } from '@/data/mockData';

5. Para producción, reemplazar por servicios de Firebase
*/
