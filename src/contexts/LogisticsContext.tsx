// src/contexts/LogisticsContext.tsx
import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { db } from '@/config/firebase';
import {
  ref,
  onValue,
  runTransaction,
  push,
  set,
  update as rtdbUpdate,
  remove,
} from 'firebase/database';

// =====================
// Tipos del sistema
// =====================
export interface LogisticsUser {
  id: string;
  email: string;
  name: string;
  role: 'logistics' | 'admin';
  permissions: string[];
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  currentQuantity: number;
  minQuantity: number;
  maxQuantity: number;
  needsRefrigeration: boolean;
  suppliers: string[];
  expirationDate?: string;
  cost: number;
  location: string;
  barcode?: string;
  lot?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MovementRecord {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out';
  quantity: number;
  previousQuantity: number;
  newQuantity: number;
  reason: string;
  supplier?: string;
  lot?: string;
  expirationDate?: string;
  userId: string;
  userName: string;
  timestamp: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string; // -> ORD-001, ORD-002, ...
  supplier: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  categories: string[];
}

export interface Alert {
  id: string;
  type: 'low_stock' | 'expiring' | 'expired' | 'out_of_stock';
  itemId: string;
  itemName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  acknowledged: boolean;
}

export interface LogisticsState {
  user: LogisticsUser | null;
  isAdminMode: boolean;
  inventory: InventoryItem[];
  movements: MovementRecord[];
  purchaseOrders: PurchaseOrder[];
  categories: Category[];
  suppliers: Supplier[];
  alerts: Alert[];
  loading: boolean;
  error: string | null;
}

type LogisticsAction =
  | { type: 'LOGIN'; payload: LogisticsUser }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_ADMIN_MODE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_INVENTORY'; payload: InventoryItem[] }
  | { type: 'SET_SUPPLIERS'; payload: Supplier[] }
  | { type: 'SET_PURCHASE_ORDERS'; payload: PurchaseOrder[] }
  | { type: 'ADD_MOVEMENT_LOCAL'; payload: MovementRecord }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'INITIALIZE_DATA'; payload: Partial<LogisticsState> };

// =====================
// Paths en RTDB
// =====================
const PATH = {
  COUNTER_ORD: 'counters/purchaseOrders', // nodo del contador
  PURCHASE_ORDERS: 'purchaseOrders',      // colección de órdenes
  INVENTORY: 'inventory',
  SUPPLIERS: 'suppliers',
};

// =====================
// Utils
// =====================
const pad = (n: number, len = 3) => String(n).padStart(len, '0');

const logisticsReducer = (state: LogisticsState, action: LogisticsAction): LogisticsState => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: action.payload, error: null };
    case 'LOGOUT':
      return { ...state, user: null, isAdminMode: false };
    case 'TOGGLE_ADMIN_MODE':
      return { ...state, isAdminMode: !state.isAdminMode };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_INVENTORY':
      return { ...state, inventory: action.payload };
    case 'SET_SUPPLIERS':
      return { ...state, suppliers: action.payload };
    case 'SET_PURCHASE_ORDERS':
      return { ...state, purchaseOrders: action.payload };

    case 'ADD_MOVEMENT_LOCAL':
      return { ...state, movements: [action.payload, ...state.movements] };

    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map((a) => (a.id === action.payload ? { ...a, acknowledged: true } : a)),
      };

    case 'INITIALIZE_DATA':
      return { ...state, ...action.payload };

    default:
      return state;
  }
};

const initialState: LogisticsState = {
  user: null,
  isAdminMode: false,
  inventory: [],
  movements: [],
  purchaseOrders: [],
  categories: [],
  suppliers: [],
  alerts: [],
  loading: false,
  error: null,
};

const LogisticsContext = createContext<{
  state: LogisticsState;

  // auth/ui
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleAdminMode: () => void;

  // inventory
  addMovement: (movement: Omit<MovementRecord, 'id' | 'timestamp'>) => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateInventoryItem: (item: InventoryItem) => Promise<void>;
  deleteInventoryItem: (id: string) => Promise<void>;

  // purchase orders (RTDB)
  addPurchaseOrder: (
    order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  updatePurchaseOrder: (order: PurchaseOrder) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;

  // categories/suppliers
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  acknowledgeAlert: (alertId: string) => void;

  // estado expuesto
  user: LogisticsUser | null;
  isAdminMode: boolean;
  inventory: InventoryItem[];
  movements: MovementRecord[];
  purchaseOrders: PurchaseOrder[];
  categories: Category[];
  suppliers: Supplier[];
  alerts: Alert[];
  loading: boolean;
  error: string | null;
} | null>(null);

// =====================
// Helper: correlativo RTDB
// =====================
async function getNextOrdNumberRTDB(): Promise<string> {
  const counterRef = ref(db, PATH.COUNTER_ORD);

  const result = await runTransaction(counterRef, (current) => {
    // si no existe, arranca en 0 y luego suma a 1
    if (current === null || current === undefined) return 1;
    if (typeof current !== 'number') return 1;
    return current + 1;
  });

  const nextNum = result.snapshot.val() as number;
  return `ORD-${pad(nextNum, 3)}`;
}

// =====================
// Provider
// =====================
export const LogisticsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(logisticsReducer, initialState);

  // Suscriptores RTDB
  useEffect(() => {
    // inventario
    const invRef = ref(db, PATH.INVENTORY);
    const unsubInv = onValue(invRef, (snap) => {
      const val = snap.val() || {};
      const list: InventoryItem[] = Object.entries(val).map(([id, v]: any) => ({
        ...v,
        id,
      }));
      dispatch({ type: 'SET_INVENTORY', payload: list });
    });

    // proveedores
    const supRef = ref(db, PATH.SUPPLIERS);
    const unsubSup = onValue(supRef, (snap) => {
      const val = snap.val() || {};
      const list: Supplier[] = Object.entries(val).map(([id, v]: any) => ({
        ...v,
        id,
      }));
      dispatch({ type: 'SET_SUPPLIERS', payload: list });
    });

    // órdenes de compra
    const poRef = ref(db, PATH.PURCHASE_ORDERS);
    const unsubPO = onValue(poRef, (snap) => {
      const val = snap.val() || {};
      const list: PurchaseOrder[] = Object.entries(val).map(([id, v]: any) => ({
        ...v,
        id,
      }));
      // opcional: ordenar por fecha desc
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      dispatch({ type: 'SET_PURCHASE_ORDERS', payload: list });
    });

    return () => {
      unsubInv();
      unsubSup();
      unsubPO();
    };
  }, []);

  // Alerts (local) derivadas del inventario
  useEffect(() => {
    const now = new Date();
    const alerts: Alert[] = [];

    state.inventory.forEach((item) => {
      if (item.currentQuantity <= item.minQuantity) {
        alerts.push({
          id: `alert_${item.id}_${Date.now()}`,
          type: item.currentQuantity === 0 ? 'out_of_stock' : 'low_stock',
          itemId: item.id,
          itemName: item.name,
          message:
            item.currentQuantity === 0
              ? `${item.name} está agotado`
              : `${item.name} tiene stock bajo (${item.currentQuantity}/${item.minQuantity})`,
          severity: item.currentQuantity === 0 ? 'critical' : 'high',
          createdAt: now.toISOString(),
          acknowledged: false,
        });
      }

      if (item.expirationDate) {
        const exp = new Date(item.expirationDate);
        const d = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (d < 0) {
          alerts.push({
            id: `alert_exp_${item.id}_${Date.now()}`,
            type: 'expired',
            itemId: item.id,
            itemName: item.name,
            message: `${item.name} ha vencido`,
            severity: 'critical',
            createdAt: now.toISOString(),
            acknowledged: false,
          });
        } else if (d <= 7) {
          alerts.push({
            id: `alert_exp_${item.id}_${Date.now()}`,
            type: 'expiring',
            itemId: item.id,
            itemName: item.name,
            message: `${item.name} vence en ${d} días`,
            severity: d <= 3 ? 'high' : 'medium',
            createdAt: now.toISOString(),
            acknowledged: false,
          });
        }
      }
    });

    dispatch({ type: 'INITIALIZE_DATA', payload: { alerts } });
  }, [state.inventory]);

  // =====================
  // Auth "fake" local
  // =====================
  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await new Promise((r) => setTimeout(r, 600));
      if (email === 'albertonaldos@gmail.com' && password === 'mirojito123') {
        const user: LogisticsUser = {
          id: 'admin_main',
          email,
          name: 'Alberto Naldos - Admin Principal',
          role: 'admin',
          permissions: ['all'],
        };
        dispatch({ type: 'LOGIN', payload: user });
        return true;
      }
      dispatch({ type: 'SET_ERROR', payload: 'Credenciales incorrectas' });
      return false;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const toggleAdminMode = () => {
    if (state.user?.role === 'admin') {
      dispatch({ type: 'TOGGLE_ADMIN_MODE' });
      toast({
        title: state.isAdminMode ? 'Modo admin desactivado' : 'Modo admin activado',
        description: state.isAdminMode ? 'Ahora en modo usuario normal' : 'Acceso completo habilitado',
      });
    }
  };

  // =====================
  // Movimientos (local)
  // =====================
  const addMovement = (movement: Omit<MovementRecord, 'id' | 'timestamp'>) => {
    const newMovement: MovementRecord = {
      ...movement,
      id: `mov_${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    dispatch({ type: 'ADD_MOVEMENT_LOCAL', payload: newMovement });
  };

  // =====================
  // Órdenes de Compra (RTDB con correlativo ORD-###)
  // =====================
  const addPurchaseOrder = async (
    order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>
  ): Promise<void> => {
    // 1) obtener siguiente correlativo atómico en RTDB
    const orderNumber = await getNextOrdNumberRTDB(); // -> "ORD-001"

    // 2) crear ID y guardar en /purchaseOrders/{id}
    const poListRef = ref(db, PATH.PURCHASE_ORDERS);
    const newRef = push(poListRef); // genera key única
    const id = newRef.key as string;

    const payload: PurchaseOrder = {
      ...order,
      id,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await set(newRef, payload);

    toast({
      title: 'Orden creada',
      description: `Se creó la orden ${orderNumber}`,
    });
  };

  const updatePurchaseOrder = async (order: PurchaseOrder): Promise<void> => {
    if (!order.id) return;
    const refOrder = ref(db, `${PATH.PURCHASE_ORDERS}/${order.id}`);
    const payload = { ...order, updatedAt: new Date().toISOString() };
    await rtdbUpdate(refOrder, payload);
    toast({ title: 'Orden actualizada', description: order.orderNumber });
  };

  const deletePurchaseOrder = async (id: string): Promise<void> => {
    const refOrder = ref(db, `${PATH.PURCHASE_ORDERS}/${id}`);
    await remove(refOrder);
    toast({ title: 'Orden eliminada', description: `ID: ${id}` });
  };

  const acknowledgeAlert = (alertId: string) => {
    dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alertId });
  };

  const addInventoryItem = async (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const invRef = ref(db, PATH.INVENTORY);
    const newRef = push(invRef);
    await set(newRef, { ...item, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
  };

  const updateInventoryItem = async (item: InventoryItem) => {
    await rtdbUpdate(ref(db, `${PATH.INVENTORY}/${item.id}`), { ...item, updatedAt: new Date().toISOString() });
  };

  const deleteInventoryItem = async (id: string) => {
    await remove(ref(db, `${PATH.INVENTORY}/${id}`));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    toast({ title: 'Categoría agregada', description: category.name });
  };

  const updateCategory = (category: Category) => {
    toast({ title: 'Categoría actualizada', description: category.name });
  };

  const deleteCategory = (id: string) => {
    toast({ title: 'Categoría eliminada' });
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    toast({ title: 'Proveedor agregado', description: supplier.name });
  };

  const updateSupplier = (supplier: Supplier) => {
    toast({ title: 'Proveedor actualizado', description: supplier.name });
  };

  const deleteSupplier = (id: string) => {
    toast({ title: 'Proveedor eliminado' });
  };

  return (
    <LogisticsContext.Provider
      value={{
        state,
        login,
        logout,
        toggleAdminMode,
        addMovement,
        addInventoryItem,
        updateInventoryItem,
        deleteInventoryItem,

        addPurchaseOrder,
        updatePurchaseOrder,
        deletePurchaseOrder,

        addCategory,
        updateCategory,
        deleteCategory,
        addSupplier,
        updateSupplier,
        deleteSupplier,
        acknowledgeAlert,

        user: state.user,
        isAdminMode: state.isAdminMode,
        inventory: state.inventory,
        movements: state.movements,
        purchaseOrders: state.purchaseOrders,
        categories: state.categories,
        suppliers: state.suppliers,
        alerts: state.alerts,
        loading: state.loading,
        error: state.error,
      }}
    >
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const ctx = useContext(LogisticsContext);
  if (!ctx) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return ctx;
};
