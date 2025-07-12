
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, discountRules, appConfig } from '@/data/mockData';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  isMinimumMet: boolean;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  nextDiscountProgress: { current: number; next: number; progress: number } | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [discountCode, setDiscountCode] = useState('');

  // Calcular cantidad total de items
  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Calcular subtotal sin descuentos
  const subtotal = items.reduce((total, item) => total + (item.product.price * item.quantity), 0);

  // Calcular descuento por cantidad
  const calculateQuantityDiscount = () => {
    let totalDiscount = 0;
    
    items.forEach(item => {
      const quantity = item.quantity;
      const itemSubtotal = item.product.price * quantity;
      
      if (quantity >= discountRules.quantity12.minQuantity) {
        totalDiscount += itemSubtotal * discountRules.quantity12.discount;
      } else if (quantity >= discountRules.quantity6.minQuantity) {
        totalDiscount += itemSubtotal * discountRules.quantity6.discount;
      }
    });
    
    return totalDiscount;
  };

  const discount = calculateQuantityDiscount();
  const total = subtotal - discount;
  const isMinimumMet = total >= appConfig.minOrderAmount;

  // Calcular progreso hacia el siguiente descuento
  const getNextDiscountProgress = () => {
    const totalQuantity = itemCount;
    
    if (totalQuantity < discountRules.quantity6.minQuantity) {
      return {
        current: totalQuantity,
        next: discountRules.quantity6.minQuantity,
        progress: (totalQuantity / discountRules.quantity6.minQuantity) * 100
      };
    } else if (totalQuantity < discountRules.quantity12.minQuantity) {
      return {
        current: totalQuantity,
        next: discountRules.quantity12.minQuantity,
        progress: (totalQuantity / discountRules.quantity12.minQuantity) * 100
      };
    }
    
    return null; // Ya tiene el máximo descuento
  };

  const nextDiscountProgress = getNextDiscountProgress();

  const addToCart = (product: Product, quantity: number) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        const updatedItems = prevItems.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        toast.success(`${product.name} actualizado en el carrito`);
        return updatedItems;
      } else {
        toast.success(`${product.name} agregado al carrito`);
        return [...prevItems, { product, quantity }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setItems(prevItems => {
      const item = prevItems.find(item => item.product.id === productId);
      if (item) {
        toast.info(`${item.product.name} eliminado del carrito`);
      }
      return prevItems.filter(item => item.product.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.product.id === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    setDiscountCode('');
    toast.info('Carrito vaciado');
  };

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal,
    discount,
    total,
    itemCount,
    isMinimumMet,
    discountCode,
    setDiscountCode,
    nextDiscountProgress
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
