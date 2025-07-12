
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, discountRules, appConfig } from '@/data/mockData';

/**
 * CONTEXTO DEL CARRITO DE COMPRAS
 * 
 * Maneja todo el estado del carrito:
 * - Productos agregados
 * - Cantidades
 * - Descuentos automáticos
 * - Cálculos de totales
 * 
 * CONFIGURACIÓN DE DESCUENTOS:
 * - 6+ unidades: 5% descuento
 * - 12+ unidades: 10% descuento
 * - Pedido mínimo: S/ 70
 */

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  total: number;
  totalItems: number;
  isMinimumMet: boolean;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  applyDiscountCode: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe ser usado dentro de CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<string>('');

  // Calcular totales
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  // Calcular descuento automático por cantidad
  const getAutomaticDiscount = () => {
    if (totalItems >= discountRules.quantity12.minQuantity) {
      return subtotal * discountRules.quantity12.discount;
    } else if (totalItems >= discountRules.quantity6.minQuantity) {
      return subtotal * discountRules.quantity6.discount;
    }
    return 0;
  };

  const discount = getAutomaticDiscount();
  const total = subtotal - discount;
  const isMinimumMet = total >= appConfig.minOrderAmount;

  // Agregar producto al carrito
  const addItem = (product: Product, quantity: number) => {
    setItems(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, { product, quantity }];
    });
  };

  // Remover producto del carrito
  const removeItem = (productId: string) => {
    setItems(prev => prev.filter(item => item.product.id !== productId));
  };

  // Actualizar cantidad de un producto
  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }
    
    setItems(prev =>
      prev.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  // Limpiar carrito
  const clearCart = () => {
    setItems([]);
    setDiscountCode('');
  };

  // Aplicar código de descuento (simulado)
  const applyDiscountCode = () => {
    // TODO: Implementar lógica de códigos de descuento
    console.log('Aplicando código:', discountCode);
  };

  // Persistir carrito en localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('pecaditos-cart');
    if (savedCart) {
      try {
        setItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Error loading cart from localStorage:', error);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('pecaditos-cart', JSON.stringify(items));
  }, [items]);

  const value = {
    items,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    total,
    totalItems,
    isMinimumMet,
    discountCode,
    setDiscountCode,
    applyDiscountCode
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
