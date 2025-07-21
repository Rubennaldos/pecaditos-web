import { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

// Types for Logistics System
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

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  status: 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  totalAmount: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
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

type LogisticsAction = 
  | { type: 'LOGIN'; payload: LogisticsUser }
  | { type: 'LOGOUT' }
  | { type: 'TOGGLE_ADMIN_MODE' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'UPDATE_INVENTORY_ITEM'; payload: InventoryItem }
  | { type: 'DELETE_INVENTORY_ITEM'; payload: string }
  | { type: 'ADD_MOVEMENT'; payload: MovementRecord }
  | { type: 'ADD_PURCHASE_ORDER'; payload: PurchaseOrder }
  | { type: 'UPDATE_PURCHASE_ORDER'; payload: PurchaseOrder }
  | { type: 'DELETE_PURCHASE_ORDER'; payload: string }
  | { type: 'ADD_CATEGORY'; payload: Category }
  | { type: 'UPDATE_CATEGORY'; payload: Category }
  | { type: 'DELETE_CATEGORY'; payload: string }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'ACKNOWLEDGE_ALERT'; payload: string }
  | { type: 'INITIALIZE_DATA'; payload: Partial<LogisticsState> };

// DATOS DE EJEMPLO REALISTAS PARA EL SISTEMA DE LOGÍSTICA
const mockInventory: InventoryItem[] = [
  {
    id: 'inv_001',
    name: 'Harina Integral',
    category: 'Insumos Básicos',
    currentQuantity: 15,
    minQuantity: 10,
    maxQuantity: 50,
    needsRefrigeration: false,
    suppliers: ['Makro', 'Parada'],
    cost: 3.50,
    location: 'Almacén A - Estante 1',
    lot: 'HI-2024-001',
    createdAt: '2024-07-15',
    updatedAt: '2024-07-21'
  },
  {
    id: 'inv_002',
    name: 'Chocolate Premium',
    category: 'Insumos Especiales',
    currentQuantity: 5,
    minQuantity: 8,
    maxQuantity: 30,
    needsRefrigeration: true,
    suppliers: ['Makro'],
    expirationDate: '2024-08-15',
    cost: 12.00,
    location: 'Refrigerador 1',
    lot: 'CH-2024-002',
    createdAt: '2024-07-10',
    updatedAt: '2024-07-20'
  },
  {
    id: 'inv_003',
    name: 'Avena Orgánica',
    category: 'Cereales',
    currentQuantity: 25,
    minQuantity: 15,
    maxQuantity: 60,
    needsRefrigeration: false,
    suppliers: ['Productores', 'Parada'],
    cost: 2.80,
    location: 'Almacén A - Estante 2',
    lot: 'AV-2024-003',
    createdAt: '2024-07-12',
    updatedAt: '2024-07-19'
  },
  {
    id: 'inv_004',
    name: 'Miel de Abeja',
    category: 'Endulzantes',
    currentQuantity: 3,
    minQuantity: 5,
    maxQuantity: 20,
    needsRefrigeration: false,
    suppliers: ['Productores'],
    expirationDate: '2025-01-30',
    cost: 18.00,
    location: 'Almacén B - Estante 1',
    lot: 'MI-2024-004',
    createdAt: '2024-07-08',
    updatedAt: '2024-07-18'
  },
  {
    id: 'inv_005',
    name: 'Aceite de Coco',
    category: 'Aceites',
    currentQuantity: 0,
    minQuantity: 6,
    maxQuantity: 24,
    needsRefrigeration: false,
    suppliers: ['Makro', 'Mercado de frutas'],
    expirationDate: '2024-12-20',
    cost: 8.50,
    location: 'Almacén B - Estante 3',
    lot: 'AC-2024-005',
    createdAt: '2024-07-05',
    updatedAt: '2024-07-21'
  },
  {
    id: 'inv_006',
    name: 'Nueces Pecanas',
    category: 'Frutos Secos',
    currentQuantity: 12,
    minQuantity: 8,
    maxQuantity: 40,
    needsRefrigeration: true,
    suppliers: ['Productores'],
    expirationDate: '2024-07-25',
    cost: 25.00,
    location: 'Refrigerador 2',
    lot: 'NP-2024-006',
    createdAt: '2024-07-01',
    updatedAt: '2024-07-16'
  }
];

const mockCategories: Category[] = [
  { id: 'insumos-basicos', name: 'Insumos Básicos', description: 'Harinas, aceites, azúcar básico', color: '#3B82F6' },
  { id: 'insumos-especiales', name: 'Insumos Especiales', description: 'Chocolate premium, ingredientes gourmet', color: '#8B5CF6' },
  { id: 'cereales', name: 'Cereales y Granos', description: 'Avena, quinua, semillas variadas', color: '#10B981' },
  { id: 'endulzantes', name: 'Endulzantes', description: 'Miel, stevia, azúcar orgánica', color: '#F59E0B' },
  { id: 'aceites', name: 'Aceites y Grasas', description: 'Aceite de coco, mantequilla, ghee', color: '#EF4444' },
  { id: 'frutos-secos', name: 'Frutos Secos', description: 'Nueces, almendras, pistachos', color: '#06B6D4' }
];

const mockSuppliers: Supplier[] = [
  {
    id: 'makro',
    name: 'Makro',
    contact: 'Juan Pérez',
    email: 'compras@makro.pe',
    phone: '+51 999 888 777',
    address: 'Av. Industrial 123, Lima',
    categories: ['insumos-basicos', 'insumos-especiales', 'aceites']
  },
  {
    id: 'parada',
    name: 'Parada',
    contact: 'María García',
    email: 'ventas@parada.com.pe',
    phone: '+51 888 777 666',
    address: 'Jr. Comercio 456, Lima',
    categories: ['insumos-basicos', 'cereales']
  },
  {
    id: 'productores',
    name: 'Productores Locales',
    contact: 'Carlos Rodríguez',
    email: 'info@productoreslocales.pe',
    phone: '+51 777 666 555',
    address: 'Mercado de Productores, Surco',
    categories: ['cereales', 'endulzantes', 'frutos-secos']
  },
  {
    id: 'mercado-frutas',
    name: 'Mercado de Frutas',
    contact: 'Ana López',
    email: 'ventas@mercadofrutas.pe',
    phone: '+51 666 555 444',
    address: 'Mercado Central de Frutas, La Victoria',
    categories: ['aceites', 'frutos-secos']
  }
];

const mockMovements: MovementRecord[] = [
  {
    id: 'mov_001',
    itemId: 'inv_005',
    itemName: 'Aceite de Coco',
    type: 'out',
    quantity: 6,
    previousQuantity: 6,
    newQuantity: 0,
    reason: 'Producción galletas premium',
    userId: 'logistica_001',
    userName: 'Responsable de Logística',
    timestamp: '2024-07-21 09:30:00',
    notes: 'Último stock para pedido urgente'
  },
  {
    id: 'mov_002',
    itemId: 'inv_002',
    itemName: 'Chocolate Premium',
    type: 'out',
    quantity: 3,
    previousQuantity: 8,
    newQuantity: 5,
    reason: 'Producción lote especial',
    userId: 'logistica_001',
    userName: 'Responsable de Logística',
    timestamp: '2024-07-20 14:15:00'
  },
  {
    id: 'mov_003',
    itemId: 'inv_001',
    itemName: 'Harina Integral',
    type: 'in',
    quantity: 10,
    previousQuantity: 5,
    newQuantity: 15,
    reason: 'Compra de reposición',
    supplier: 'Makro',
    lot: 'HI-2024-001',
    userId: 'admin_001',
    userName: 'Administrador General',
    timestamp: '2024-07-19 11:00:00'
  }
];

const mockPurchaseOrders: PurchaseOrder[] = [
  {
    id: 'po_001',
    orderNumber: 'ORD-2024-001',
    supplier: 'Makro',
    status: 'sent',
    items: [
      { itemId: 'inv_005', itemName: 'Aceite de Coco', quantity: 12, unitCost: 8.50, totalCost: 102.00 },
      { itemId: 'inv_002', itemName: 'Chocolate Premium', quantity: 10, unitCost: 12.00, totalCost: 120.00 }
    ],
    totalAmount: 222.00,
    createdBy: 'logistica@pecaditos.com',
    createdAt: '2024-07-21',
    updatedAt: '2024-07-21',
    notes: 'Orden urgente por stock crítico'
  }
];

const initialState: LogisticsState = {
  user: null,
  isAdminMode: false,
  inventory: mockInventory,
  movements: mockMovements,
  purchaseOrders: mockPurchaseOrders,
  categories: mockCategories,
  suppliers: mockSuppliers,
  alerts: [],
  loading: false,
  error: null
};

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
    
    case 'ADD_INVENTORY_ITEM':
      return { 
        ...state, 
        inventory: [...state.inventory, action.payload]
      };
    
    case 'UPDATE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.map(item => 
          item.id === action.payload.id ? action.payload : item
        )
      };
    
    case 'DELETE_INVENTORY_ITEM':
      return {
        ...state,
        inventory: state.inventory.filter(item => item.id !== action.payload)
      };
    
    case 'ADD_MOVEMENT':
      return {
        ...state,
        movements: [action.payload, ...state.movements]
      };
    
    case 'ADD_PURCHASE_ORDER':
      return {
        ...state,
        purchaseOrders: [...state.purchaseOrders, action.payload]
      };
    
    case 'UPDATE_PURCHASE_ORDER':
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.map(order => 
          order.id === action.payload.id ? action.payload : order
        )
      };
    
    case 'DELETE_PURCHASE_ORDER':
      return {
        ...state,
        purchaseOrders: state.purchaseOrders.filter(order => order.id !== action.payload)
      };
    
    case 'ADD_CATEGORY':
      return {
        ...state,
        categories: [...state.categories, action.payload]
      };
    
    case 'UPDATE_CATEGORY':
      return {
        ...state,
        categories: state.categories.map(cat => 
          cat.id === action.payload.id ? action.payload : cat
        )
      };
    
    case 'DELETE_CATEGORY':
      return {
        ...state,
        categories: state.categories.filter(cat => cat.id !== action.payload)
      };
    
    case 'ADD_SUPPLIER':
      return {
        ...state,
        suppliers: [...state.suppliers, action.payload]
      };
    
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map(sup => 
          sup.id === action.payload.id ? action.payload : sup
        )
      };
    
    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter(sup => sup.id !== action.payload)
      };
    
    case 'ACKNOWLEDGE_ALERT':
      return {
        ...state,
        alerts: state.alerts.map(alert => 
          alert.id === action.payload ? { ...alert, acknowledged: true } : alert
        )
      };
    
    case 'INITIALIZE_DATA':
      return { ...state, ...action.payload };
    
    default:
      return state;
  }
};

const LogisticsContext = createContext<{
  state: LogisticsState;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  toggleAdminMode: () => void;
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  addMovement: (movement: Omit<MovementRecord, 'id' | 'timestamp'>) => void;
  addPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => void;
  updatePurchaseOrder: (order: PurchaseOrder) => void;
  deletePurchaseOrder: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, 'id'>) => void;
  updateSupplier: (supplier: Supplier) => void;
  deleteSupplier: (id: string) => void;
  generateAlerts: () => void;
  acknowledgeAlert: (alertId: string) => void;
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

export const LogisticsProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(logisticsReducer, initialState);

  // Generate alerts based on inventory status
  const generateAlerts = () => {
    const newAlerts: Alert[] = [];
    const now = new Date();

    state.inventory.forEach(item => {
      // Low stock alert
      if (item.currentQuantity <= item.minQuantity) {
        newAlerts.push({
          id: `alert_${item.id}_${Date.now()}`,
          type: item.currentQuantity === 0 ? 'out_of_stock' : 'low_stock',
          itemId: item.id,
          itemName: item.name,
          message: item.currentQuantity === 0 
            ? `${item.name} está agotado`
            : `${item.name} tiene stock bajo (${item.currentQuantity}/${item.minQuantity})`,
          severity: item.currentQuantity === 0 ? 'critical' : 'high',
          createdAt: now.toISOString(),
          acknowledged: false
        });
      }

      // Expiration alerts
      if (item.expirationDate) {
        const expirationDate = new Date(item.expirationDate);
        const daysUntilExpiration = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        if (daysUntilExpiration < 0) {
          newAlerts.push({
            id: `alert_exp_${item.id}_${Date.now()}`,
            type: 'expired',
            itemId: item.id,
            itemName: item.name,
            message: `${item.name} ha vencido`,
            severity: 'critical',
            createdAt: now.toISOString(),
            acknowledged: false
          });
        } else if (daysUntilExpiration <= 7) {
          newAlerts.push({
            id: `alert_exp_${item.id}_${Date.now()}`,
            type: 'expiring',
            itemId: item.id,
            itemName: item.name,
            message: `${item.name} vence en ${daysUntilExpiration} días`,
            severity: daysUntilExpiration <= 3 ? 'high' : 'medium',
            createdAt: now.toISOString(),
            acknowledged: false
          });
        }
      }
    });

    dispatch({ type: 'INITIALIZE_DATA', payload: { alerts: newAlerts } });
  };

  // Check alerts when inventory changes
  useEffect(() => {
    generateAlerts();
  }, [state.inventory]);

  const login = async (email: string, password: string): Promise<boolean> => {
    dispatch({ type: 'SET_LOADING', payload: true });
    
    try {
      // Simulación de autenticación local (sin Firebase por ahora)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (email === 'logistica@pecaditos.com' && password === 'logistica123') {
        const user: LogisticsUser = {
          id: 'logistica_001',
          email: 'logistica@pecaditos.com',
          name: 'Responsable de Logística',
          role: 'logistics',
          permissions: ['view_inventory', 'edit_inventory', 'view_reports']
        };
        dispatch({ type: 'LOGIN', payload: user });
        return true;
      } else if (email === 'admin@pecaditos.com' && password === 'admin123') {
        const user: LogisticsUser = {
          id: 'admin_001',
          email: 'admin@pecaditos.com',
          name: 'Administrador General',
          role: 'admin',
          permissions: ['all']
        };
        dispatch({ type: 'LOGIN', payload: user });
        return true;
      }
      
      dispatch({ type: 'SET_ERROR', payload: 'Credenciales incorrectas' });
      return false;
    } catch (error) {
      console.error('Error en login:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Error de conexión' });
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
        title: state.isAdminMode ? "Modo admin desactivado" : "Modo admin activado",
        description: state.isAdminMode ? "Ahora en modo usuario normal" : "Acceso completo habilitado",
      });
    }
  };

  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newItem: InventoryItem = {
      ...item,
      id: `inv_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_INVENTORY_ITEM', payload: newItem });
  };

  const updateInventoryItem = (item: InventoryItem) => {
    const updatedItem = { ...item, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_INVENTORY_ITEM', payload: updatedItem });
  };

  const deleteInventoryItem = (id: string) => {
    dispatch({ type: 'DELETE_INVENTORY_ITEM', payload: id });
  };

  const addMovement = (movement: Omit<MovementRecord, 'id' | 'timestamp'>) => {
    const newMovement: MovementRecord = {
      ...movement,
      id: `mov_${Date.now()}`,
      timestamp: new Date().toLocaleString()
    };
    dispatch({ type: 'ADD_MOVEMENT', payload: newMovement });
  };

  const addPurchaseOrder = (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const newOrder: PurchaseOrder = {
      ...order,
      id: `po_${Date.now()}`,
      orderNumber: `ORD-${new Date().getFullYear()}-${String(state.purchaseOrders.length + 1).padStart(3, '0')}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    dispatch({ type: 'ADD_PURCHASE_ORDER', payload: newOrder });
  };

  const updatePurchaseOrder = (order: PurchaseOrder) => {
    const updatedOrder = { ...order, updatedAt: new Date().toISOString() };
    dispatch({ type: 'UPDATE_PURCHASE_ORDER', payload: updatedOrder });
  };

  const deletePurchaseOrder = (id: string) => {
    dispatch({ type: 'DELETE_PURCHASE_ORDER', payload: id });
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: category.name.toLowerCase().replace(/\s+/g, '-')
    };
    dispatch({ type: 'ADD_CATEGORY', payload: newCategory });
  };

  const updateCategory = (category: Category) => {
    dispatch({ type: 'UPDATE_CATEGORY', payload: category });
  };

  const deleteCategory = (id: string) => {
    dispatch({ type: 'DELETE_CATEGORY', payload: id });
  };

  const addSupplier = (supplier: Omit<Supplier, 'id'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: supplier.name.toLowerCase().replace(/\s+/g, '-')
    };
    dispatch({ type: 'ADD_SUPPLIER', payload: newSupplier });
  };

  const updateSupplier = (supplier: Supplier) => {
    dispatch({ type: 'UPDATE_SUPPLIER', payload: supplier });
  };

  const deleteSupplier = (id: string) => {
    dispatch({ type: 'DELETE_SUPPLIER', payload: id });
  };

  const acknowledgeAlert = (alertId: string) => {
    dispatch({ type: 'ACKNOWLEDGE_ALERT', payload: alertId });
  };

  return (
    <LogisticsContext.Provider value={{
      state,
      login,
      logout,
      toggleAdminMode,
      addInventoryItem,
      updateInventoryItem,
      deleteInventoryItem,
      addMovement,
      addPurchaseOrder,
      updatePurchaseOrder,
      deletePurchaseOrder,
      addCategory,
      updateCategory,
      deleteCategory,
      addSupplier,
      updateSupplier,
      deleteSupplier,
      generateAlerts,
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
      error: state.error
    }}>
      {children}
    </LogisticsContext.Provider>
  );
};

export const useLogistics = () => {
  const context = useContext(LogisticsContext);
  if (!context) {
    throw new Error('useLogistics must be used within a LogisticsProvider');
  }
  return context;
};