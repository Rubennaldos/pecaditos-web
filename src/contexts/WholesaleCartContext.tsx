import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { Product } from "@/data/mockData";
import type { QtyDiscount } from "@/lib/wholesale/pricing";
import { normalizeToStep, computeLine } from "@/lib/wholesale/pricing";

/**
 * Carrito mayorista que:
 * - Respeta tramos de descuento por cantidad (product.qtyDiscounts)
 * - Usa el precio unitario base mayorista (product.wholesalePrice; si falta, cae a product.price)
 * - Respeta el múltiplo por producto (product.minMultiple; si falta, 6)
 * - Aplica (opcional) un descuento adicional por código al total
 * - Persiste en localStorage (producto + cantidad)
 */

const MINIMUM_ORDER = 300; // S/ 300

/* === Tipos expuestos por el contexto === */
interface WholesaleCartItem {
  product: Product;
  quantity: number;   // normalizada al múltiplo del producto
  unitPrice: number;  // precio c/u aplicado (con tramo por cantidad)
  subtotal: number;   // total sin descuento por tramo (base * qty)
  discount: number;   // ahorro por tramo
  finalPrice: number; // total con tramo (subtotal - discount)
  discountPct: number;// % aplicado por tramo (para mostrar en UI si quieres)
}

interface WholesaleCartContextType {
  items: WholesaleCartItem[];
  subtotal: number;
  totalDiscount: number; // ahorro por tramos + ahorro extra por código
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
  additionalDiscount: number; // 0.05 = 5%
}

const WholesaleCartContext = createContext<WholesaleCartContextType | undefined>(undefined);

export const useWholesaleCart = () => {
  const ctx = useContext(WholesaleCartContext);
  if (!ctx) throw new Error("useWholesaleCart debe usarse dentro de WholesaleCartProvider");
  return ctx;
};

/* === Helpers para leer campos que pueden no existir en Product === */
const getBaseUnit = (p: Product) =>
  Number((p as any).wholesalePrice ?? (p as any).price ?? 0);

const getMinMultiple = (p: Product) =>
  Math.max(1, Number((p as any).minMultiple ?? 6));

const getQtyDiscounts = (p: Product): QtyDiscount[] => {
  const arr = (p as any).qtyDiscounts;
  return Array.isArray(arr) ? (arr as QtyDiscount[]) : [];
};

/* === Estado crudo que guardamos en localStorage === */
type RawItem = { product: Product; quantity: number };

interface WholesaleCartProviderProps {
  children: ReactNode;
}

export const WholesaleCartProvider = ({ children }: WholesaleCartProviderProps) => {
  const [rawItems, setRawItems] = useState<RawItem[]>([]);
  const [discountCode, setDiscountCode] = useState<string | null>(null);
  const [additionalDiscount, setAdditionalDiscount] = useState(0);

  // Cargar desde localStorage (migración simple si venían items "completos")
  useEffect(() => {
    try {
      const saved = localStorage.getItem("wholesaleCart");
      if (!saved) return;
      const parsed = JSON.parse(saved);

      // Si ya era [{product, quantity}] úsalo; si era [{...WholesaleCartItem}] reduce a crudo.
      const normalized: RawItem[] = Array.isArray(parsed)
        ? parsed.map((it: any) =>
            "product" in it && "quantity" in it
              ? { product: it.product, quantity: Number(it.quantity || 0) }
              : null
          ).filter(Boolean)
        : [];

      setRawItems(normalized);
    } catch (e) {
      console.error("Error cargando carrito mayorista:", e);
    }
  }, []);

  // Guardar crudo
  useEffect(() => {
    localStorage.setItem("wholesaleCart", JSON.stringify(rawItems));
  }, [rawItems]);

  const normalizeQty = (p: Product, qty: number) => {
    const step = getMinMultiple(p);
    if (qty <= 0) return 0;
    // redondea hacia arriba al múltiplo
    return normalizeToStep(qty, step);
  };

  const addItem = (product: Product, quantity: number) => {
    const q = normalizeQty(product, quantity);
    if (q <= 0) return;

    setRawItems((prev) => {
      const i = prev.findIndex((r) => r.product.id === product.id);
      if (i >= 0) {
        const next = [...prev];
        next[i] = { ...next[i], quantity: q };
        return next;
      }
      return [...prev, { product, quantity: q }];
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setRawItems((prev) => {
      const i = prev.findIndex((r) => r.product.id === productId);
      if (i < 0) return prev;
      const p = prev[i].product;
      const q = normalizeQty(p, quantity);
      if (q === 0) return prev.filter((r) => r.product.id !== productId);
      const next = [...prev];
      next[i] = { ...next[i], quantity: q };
      return next;
    });
  };

  const removeItem = (productId: string) => {
    setRawItems((prev) => prev.filter((r) => r.product.id !== productId));
  };

  const clearCart = () => {
    setRawItems([]);
    setDiscountCode(null);
    setAdditionalDiscount(0);
  };

  // Construir las líneas calculadas a partir del estado crudo
  const items: WholesaleCartItem[] = useMemo(() => {
    return rawItems.map(({ product, quantity }) => {
      const base = getBaseUnit(product);
      const tiers = getQtyDiscounts(product);
      const { unit, total, savings, discountPct } = computeLine(base, tiers, quantity);

      const subtotal = +(base * quantity).toFixed(2); // sin tramo
      const finalPrice = total;

      return {
        product,
        quantity,
        unitPrice: unit,
        subtotal,
        discount: savings,
        finalPrice,
        discountPct,
      };
    });
  }, [rawItems]);

  // Totales
  const subtotal = useMemo(
    () => items.reduce((acc, it) => acc + it.subtotal, 0),
    [items]
  );
  const volumeDiscount = useMemo(
    () => items.reduce((acc, it) => acc + it.discount, 0),
    [items]
  );
  const cartTotalAfterTiers = useMemo(
    () => items.reduce((acc, it) => acc + it.finalPrice, 0),
    [items]
  );

  const extraSavings = +(cartTotalAfterTiers * additionalDiscount).toFixed(2);
  const finalTotal = +(cartTotalAfterTiers - extraSavings).toFixed(2);

  const itemCount = useMemo(
    () => items.reduce((acc, it) => acc + it.quantity, 0),
    [items]
  );

  const isMinimumMet = finalTotal >= MINIMUM_ORDER;

  // Códigos de descuento (ejemplo)
  const applyDiscountCode = (code: string): boolean => {
    const table: Record<string, number> = {
      MAYORISTA15: 0.15,
      ENERO2024: 0.1,
      NUEVOCLIENTE: 0.2,
    };
    const pct = table[code.trim().toUpperCase()];
    if (!pct) return false;
    setDiscountCode(code.trim().toUpperCase());
    setAdditionalDiscount(pct);
    return true;
  };

  const value: WholesaleCartContextType = {
    items,
    subtotal: +subtotal.toFixed(2),
    totalDiscount: +(volumeDiscount + extraSavings).toFixed(2),
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
    additionalDiscount,
  };

  return (
    <WholesaleCartContext.Provider value={value}>
      {children}
    </WholesaleCartContext.Provider>
  );
};
