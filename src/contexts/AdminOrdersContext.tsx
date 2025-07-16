
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface OrderHistoryEntry {
  id: string;
  orderId: string;
  timestamp: string;
  user: string;
  profile: string;
  action: string;
  details: string;
  previousValue?: any;
  newValue?: any;
}

interface AdminOrdersContextType {
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  deleteOrder: (orderId: string, reason: string) => void;
  editOrder: (orderId: string, changes: any) => void;
  changeOrderStatus: (orderId: string, newStatus: string) => void;
  getOrderHistory: (orderId: string) => OrderHistoryEntry[];
  getAllOrderHistory: () => OrderHistoryEntry[];
  deletedOrders: any[];
  restoreOrder: (orderId: string) => void;
}

const AdminOrdersContext = createContext<AdminOrdersContextType | undefined>(undefined);

// Mock order history data
const mockOrderHistory: OrderHistoryEntry[] = [
  {
    id: "hist-001",
    orderId: "PEC-2024-001",
    timestamp: "2024-01-15T08:30:00",
    user: "Sistema",
    profile: "sistema",
    action: "crear",
    details: "Pedido creado automáticamente"
  },
  {
    id: "hist-002",
    orderId: "PEC-2024-001",
    timestamp: "2024-01-15T09:15:00",
    user: "María García",
    profile: "pedidos",
    action: "aceptar",
    details: "Pedido aceptado para preparación",
    previousValue: "pendiente",
    newValue: "en_preparacion"
  },
  {
    id: "hist-003",
    orderId: "PEC-2024-002",
    timestamp: "2024-01-14T14:20:00",
    user: "Sistema",
    profile: "sistema",
    action: "crear",
    details: "Pedido creado automáticamente"
  },
  {
    id: "hist-004",
    orderId: "PEC-2024-002",
    timestamp: "2024-01-14T15:00:00",
    user: "Carlos López",
    profile: "pedidos",
    action: "aceptar",
    details: "Pedido aceptado para preparación",
    previousValue: "pendiente",
    newValue: "en_preparacion"
  }
];

export const AdminOrdersProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>(mockOrderHistory);
  const [deletedOrders, setDeletedOrders] = useState<any[]>([]);

  const addHistoryEntry = (entry: Omit<OrderHistoryEntry, 'id' | 'timestamp'>) => {
    const newEntry: OrderHistoryEntry = {
      ...entry,
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString()
    };
    setOrderHistory(prev => [...prev, newEntry]);
  };

  const deleteOrder = (orderId: string, reason: string) => {
    console.log(`[ADMIN] Eliminando pedido ${orderId}. Motivo: ${reason}`);
    
    // Add to history
    addHistoryEntry({
      orderId,
      user: "Admin",
      profile: "admin",
      action: "eliminar",
      details: `Pedido eliminado por admin. Motivo: ${reason}`
    });

    // Move to deleted orders (mock implementation)
    const deletedOrder = { id: orderId, deletedAt: new Date().toISOString(), reason };
    setDeletedOrders(prev => [...prev, deletedOrder]);
  };

  const editOrder = (orderId: string, changes: any) => {
    console.log(`[ADMIN] Editando pedido ${orderId}:`, changes);
    
    // Add to history
    addHistoryEntry({
      orderId,
      user: "Admin",
      profile: "admin",
      action: "editar",
      details: `Pedido editado por admin`,
      previousValue: changes.previous,
      newValue: changes.new
    });
  };

  const changeOrderStatus = (orderId: string, newStatus: string) => {
    console.log(`[ORDERS] Cambiando estado del pedido ${orderId} a ${newStatus}`);
    
    // Add to history
    addHistoryEntry({
      orderId,
      user: "Usuario Pedidos",
      profile: "pedidos",
      action: "cambiar_estado",
      details: `Estado cambiado a ${newStatus}`,
      newValue: newStatus
    });

    // Aquí se actualizaría el estado real del pedido en la base de datos
    // Por ahora solo logueamos la acción
  };

  const getOrderHistory = (orderId: string) => {
    return orderHistory.filter(entry => entry.orderId === orderId);
  };

  const getAllOrderHistory = () => {
    return orderHistory.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const restoreOrder = (orderId: string) => {
    console.log(`[ADMIN] Restaurando pedido ${orderId}`);
    
    addHistoryEntry({
      orderId,
      user: "Admin",
      profile: "admin",
      action: "restaurar",
      details: "Pedido restaurado desde papelera"
    });

    setDeletedOrders(prev => prev.filter(order => order.id !== orderId));
  };

  return (
    <AdminOrdersContext.Provider value={{
      isAdminMode,
      setIsAdminMode,
      deleteOrder,
      editOrder,
      changeOrderStatus,
      getOrderHistory,
      getAllOrderHistory,
      deletedOrders,
      restoreOrder
    }}>
      {children}
    </AdminOrdersContext.Provider>
  );
};

export const useAdminOrders = () => {
  const context = useContext(AdminOrdersContext);
  if (context === undefined) {
    throw new Error('useAdminOrders must be used within an AdminOrdersProvider');
  }
  return context;
};
