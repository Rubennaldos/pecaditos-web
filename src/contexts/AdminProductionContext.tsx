
import { createContext, useContext, useState, ReactNode } from 'react';

interface ProductionRecord {
  id: string;
  productId: string;
  productName: string;
  action: string;
  quantity: number;
  loteId?: string;
  comment?: string;
  performedBy: string;
  timestamp: string;
}

interface ProductionHistory {
  id: string;
  recordId: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details: string;
  oldValue?: any;
  newValue?: any;
}

interface AdminProductionContextValue {
  isAdminMode: boolean;
  setIsAdminMode: (value: boolean) => void;
  editProductionRecord: (recordId: string, updates: Partial<ProductionRecord>) => void;
  deleteProductionRecord: (recordId: string, reason: string) => void;
  restoreProductionRecord: (recordId: string) => void;
  getProductionHistory: (recordId: string) => ProductionHistory[];
  deletedRecords: ProductionRecord[];
  productionHistory: ProductionHistory[];
}

const AdminProductionContext = createContext<AdminProductionContextValue | undefined>(undefined);

export const AdminProductionProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [deletedRecords, setDeletedRecords] = useState<ProductionRecord[]>([]);
  const [productionHistory, setProductionHistory] = useState<ProductionHistory[]>([]);

  const addToHistory = (recordId: string, action: string, performedBy: string, details: string, oldValue?: any, newValue?: any) => {
    const historyEntry: ProductionHistory = {
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      recordId,
      action,
      performedBy,
      timestamp: new Date().toISOString(),
      details,
      oldValue,
      newValue
    };
    
    setProductionHistory(prev => [historyEntry, ...prev]);
    console.log('Production History Added:', historyEntry);
  };

  const editProductionRecord = (recordId: string, updates: Partial<ProductionRecord>) => {
    console.log('Admin editing production record:', recordId, updates);
    
    addToHistory(
      recordId,
      'edit',
      'admin@pecaditos.com',
      `Registro de producción editado por administrador`,
      null,
      updates
    );
    
    window.dispatchEvent(new CustomEvent('adminEditProductionRecord', {
      detail: { recordId, updates }
    }));
  };

  const deleteProductionRecord = (recordId: string, reason: string) => {
    console.log('Admin deleting production record:', recordId, reason);
    
    addToHistory(
      recordId,
      'delete',
      'admin@pecaditos.com',
      `Registro eliminado: ${reason}`
    );
    
    window.dispatchEvent(new CustomEvent('adminDeleteProductionRecord', {
      detail: { recordId, reason }
    }));
  };

  const restoreProductionRecord = (recordId: string) => {
    console.log('Admin restoring production record:', recordId);
    
    addToHistory(
      recordId,
      'restore',
      'admin@pecaditos.com',
      'Registro restaurado desde papelera'
    );
    
    window.dispatchEvent(new CustomEvent('adminRestoreProductionRecord', {
      detail: { recordId }
    }));
  };

  const getProductionHistory = (recordId: string) => {
    return productionHistory.filter(h => h.recordId === recordId);
  };

  return (
    <AdminProductionContext.Provider value={{
      isAdminMode,
      setIsAdminMode,
      editProductionRecord,
      deleteProductionRecord,
      restoreProductionRecord,
      getProductionHistory,
      deletedRecords,
      productionHistory
    }}>
      {children}
    </AdminProductionContext.Provider>
  );
};

export const useAdminProduction = () => {
  const context = useContext(AdminProductionContext);
  if (context === undefined) {
    throw new Error('useAdminProduction must be used within an AdminProductionProvider');
  }
  return context;
};
