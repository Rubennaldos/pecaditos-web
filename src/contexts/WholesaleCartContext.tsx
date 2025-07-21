
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/data/mockData';

/**
 * CONTEXTO DEL CARRITO MAYORISTA
 * 
 * Maneja el carrito específico para mayoristas con:
 * - Pedido mínimo S/ 300
 * - Cantidades en múltiplos de 6
 * - Descuentos por volumen mayorista
 * - Productos frecuentes guardados
 * 
 * PARA PERSONALIZAR:
 * - Modificar pedido mínimo
 * - Cambiar estructura de descuentos
 * - Agregar más validaciones
 */

interface WholesaleCartItem {
  product: Product;
  quantity: number;
  unitPrice: number; // Precio mayorista unitario
  subtotal: number;
  discount: number;
  finalPrice: number;
}

interface WholesaleCartContextType {
  items: WholesaleCartItem[];
  subtotal: number;
  totalDiscount: number;
  finalTotal: number;
  itemCount: number;
  isMinimumMet: boolean;
  minimumAmount: number;
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  applyDiscountCode: (code: string) => boolean;
  discountCode: string | null;
  additionalDiscount: number;
}

const WholesaleCartContext = createContext<WholesaleCartContextType | undefined>(undefined);

export const useWholesaleCart = () => {
  const context = useContext(WholesaleCartContext);
  if (context === undefined) {
    throw new Error('useWholesaleCart debe ser usado dentro de un WholesaleCartProvider');
  }
  return context;
};

const MINIMUM_ORDER = 300; // Pedido mínimo mayorista S/ 300

interface WholesaleCartProviderProps {
  children: ReactNode;
}

export const WholesaleCartProvider = ({ children }: WholesaleCartProviderProps) => {
  const [items, setItems] = useState<WholesaleCartItem[]>([]);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);

  // Cargar carrito desde localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('wholesaleCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Error cargando carrito mayorista:', error);
      }
    }
  }, []);

  // Guardar carrito en localStorage
  useEffect(() => {
    localStorage.setItem('wholesaleCart', JSON.stringify(items));
  }, [items]);

  // Calcular precio mayorista con descuentos por volumen
  const calculateWholesalePrice = (product: Product, quantity: number) => {
    const wholesaleUnitPrice = product.price * 0.8; // 20% menos que precio minorista
    const baseTotal = wholesaleUnitPrice * quantity;
    
    let discountPercent = 0;
    
    // Descuentos por volumen mayorista
    if (quantity >= 24) {
      discountPercent = 0.25; // 25% descuento
    } else if (quantity >= 12) {
      discountPercent = 0.15; // 15% descuento
    } else if (quantity >= 6) {
      discountPercent = 0.10; // 10% descuento
    }
    
    const discount = baseTotal * discountPercent;
    const finalPrice = baseTotal - discount;
    
    return {
      unitPrice: wholesaleUnitPrice,
      subtotal: baseTotal,
      discount,
      finalPrice
    };
  };

  const addItem = (product: Product, quantity: number) => {
    // Validar múltiplos de 6
    if (quantity % 6 !== 0) {
      throw new Error('La cantidad debe ser múltiplo de 6');
    }

    const pricing = calculateWholesalePrice(product, quantity);
    
    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Actualizar cantidad del producto existente
        const newQuantity = existingItem.quantity + quantity;
        const newPricing = calculateWholesalePrice(product, newQuantity);
        
        return prevItems.map(item =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: newQuantity,
                ...newPricing
              }
            : item
        );
      } else {
        // Agregar nuevo producto
        return [...prevItems, {
          product,
          quantity,
          ...pricing
        }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems(prevItems => prevItems.filter(item => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // Validar múltiplos de 6
    if (quantity % 6 !== 0 || quantity < 6) {
      throw new Error('La cantidad debe ser múltiplo de 6 y mínimo 6 unidades');
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.product.id === productId);
      
      if (!existingItem) {
        throw new Error('Producto no encontrado en el carrito');
      }
      
      return prevItems.map(item => {
        if (item.product.id === productId) {
          const newPricing = calculateWholesalePrice(item.product, quantity);
          return {
            ...item,
            quantity,
            ...newPricing
          };
        }
        return item;
      });
    });
  };

  const clearCart = () => {
    setItems([]);
    setDiscountCode(null);
    setAdditionalDiscount(0);
  };

  const applyDiscountCode = (code: string): boolean => {
    // Códigos de descuento mayorista
    const validCodes = {
      'MAYORISTA15': 0.15, // 15% descuento adicional
      'ENERO2024': 0.10,  // 10% descuento enero
      'NUEVOCLIENTE': 0.20 // 20% descuento nuevo cliente
    };

    const discountPercent = validCodes[code as keyof typeof validCodes];
    
    if (discountPercent) {
      setDiscountCode(code);
      setAdditionalDiscount(discountPercent);
      return true;
    }
    
    return false;
  };

  // Cálculos del carrito
  const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
  const totalDiscount = items.reduce((sum, item) => sum + item.discount, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.finalPrice, 0);
  const additionalDiscountAmount = cartTotal * additionalDiscount;
  const finalTotal = cartTotal - additionalDiscountAmount;
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const isMinimumMet = finalTotal >= MINIMUM_ORDER;

  const value = {
    items,
    subtotal,
    totalDiscount: totalDiscount + additionalDiscountAmount,
    finalTotal,
    itemCount,
    isMinimumMet,
    minimumAmount: MINIMUM_ORDER,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyDiscountCode,
    discountCode,
    additionalDiscount
  };

  return (
    <WholesaleCartContext.Provider value={value}>
      {children}
    </WholesaleCartContext.Provider>
  );
};

/*
INSTRUCCIONES PARA USAR:

1. Envolver componentes mayoristas con WholesaleCartProvider
2. Usar useWholesaleCart() en componentes que necesiten el carrito
3. Validaciones automáticas:
   - Múltiplos de 6 unidades
   - Pedido mínimo S/ 300
   - Descuentos por volumen automáticos

4. Códigos de descuento disponibles:
   - MAYORISTA15: 15% descuento adicional
   - ENERO2024: 10% descuento enero
   - NUEVOCLIENTE: 20% descuento nuevo cliente

5. Para conectar con Firebase:
   - Guardar carritos pendientes en Realtime Database
   - Sincronizar entre dispositivos del mismo usuario
   - Mantener historial de carritos frecuentes
*/
