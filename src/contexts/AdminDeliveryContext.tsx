
import { createContext, useContext, useState, ReactNode } from 'react';

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  coordinates: { lat: number; lng: number };
  status: string;
  readyAt: string;
  total: number;
  paymentMethod: string;
  notes?: string;
  assignedTo?: string | null;
  takenAt?: string | null;
  deliveredAt?: string;
  deliveryNotes?: string;
}

interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  tempCode: string;
  isActive: boolean;
  lastLogin?: string;
}

interface DeliveryHistory {
  id: string;
  orderId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

interface AdminDeliveryContextValue {
  isAdminMode: boolean;
  setIsAdminMode: (value: boolean) => void;
  editDelivery: (orderId: string, updates: Partial<DeliveryOrder>) => void;
  deleteDelivery: (orderId: string, reason: string) => void;
  restoreDelivery: (orderId: string) => void;
  getDeliveryHistory: (orderId: string) => DeliveryHistory[];
  editDeliveryPerson: (personId: string, updates: Partial<DeliveryPerson>) => void;
  sendMessageToPerson: (personId: string, message: string) => void;
  deletedDeliveries: DeliveryOrder[];
  deliveryHistory: DeliveryHistory[];
}

const AdminDeliveryContext = createContext<AdminDeliveryContextValue | undefined>(undefined);

export const AdminDeliveryProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [deletedDeliveries, setDeletedDeliveries] = useState<DeliveryOrder[]>([]);
  const [deliveryHistory, setDeliveryHistory] = useState<DeliveryHistory[]>([]);

  const addToHistory = (orderId: string, action: string, performedBy: string, details: string, oldValue?: any, newValue?: any) => {
    const historyEntry: DeliveryHistory = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      orderId,
      action,
      performedBy,
      timestamp: new Date().toISOString(),
      details,
      oldValue,
      newValue
    };
    
    setDeliveryHistory(prev => [historyEntry, ...prev]);
    console.log('Delivery History Added:', historyEntry);
  };

  const editDelivery = (orderId: string, updates: Partial<DeliveryOrder>) => {
    console.log('Admin editing delivery:', orderId, updates);
    
    // Add to history
    addToHistory(
      orderId,
      'edit',
      'admin@pecaditos.com',
      `Pedido editado por administrador`,
      null,
      updates
    );
    
    // Dispatch custom event for the delivery panel to update
    window.dispatchEvent(new CustomEvent('adminEditDelivery', {
      detail: { orderId, updates }
    }));
  };

  const deleteDelivery = (orderId: string, reason: string) => {
    console.log('Admin deleting delivery:', orderId, reason);
    
    // Add to history
    addToHistory(
      orderId,
      'delete',
      'admin@pecaditos.com',
      `Pedido eliminado: ${reason}`
    );
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('adminDeleteDelivery', {
      detail: { orderId, reason }
    }));
  };

  const restoreDelivery = (orderId: string) => {
    console.log('Admin restoring delivery:', orderId);
    
    addToHistory(
      orderId,
      'restore',
      'admin@pecaditos.com',
      'Pedido restaurado desde papelera'
    );
    
    window.dispatchEvent(new CustomEvent('adminRestoreDelivery', {
      detail: { orderId }
    }));
  };

  const getDeliveryHistory = (orderId: string) => {
    return deliveryHistory.filter(h => h.orderId === orderId);
  };

  const editDeliveryPerson = (personId: string, updates: Partial<DeliveryPerson>) => {
    console.log('Admin editing delivery person:', personId, updates);
    
    addToHistory(
      `person_${personId}`,
      'edit_person',
      'admin@pecaditos.com',
      `Repartidor editado: ${Object.keys(updates).join(', ')}`
    );
    
    window.dispatchEvent(new CustomEvent('adminEditDeliveryPerson', {
      detail: { personId, updates }
    }));
  };

  const sendMessageToPerson = (personId: string, message: string) => {
    console.log('Admin sending message to delivery person:', personId, message);
    
    addToHistory(
      `person_${personId}`,
      'send_message',
      'admin@pecaditos.com',
      `Mensaje enviado: ${message.substring(0, 50)}...`
    );
    
    // In a real app, this would send the message through a notification system
    alert(`Mensaje enviado al repartidor: ${message}`);
  };

  return (
    <AdminDeliveryContext.Provider value={{
      isAdminMode,
      setIsAdminMode,
      editDelivery,
      deleteDelivery,
      restoreDelivery,
      getDeliveryHistory,
      editDeliveryPerson,
      sendMessageToPerson,
      deletedDeliveries,
      deliveryHistory
    }}>
      {children}
    </AdminDeliveryContext.Provider>
  );
};

export const useAdminDelivery = () => {
  const context = useContext(AdminDeliveryContext);
  if (context === undefined) {
    throw new Error('useAdminDelivery must be used within an AdminDeliveryProvider');
  }
  return context;
};
