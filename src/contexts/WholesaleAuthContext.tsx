
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/data/mockData';

/**
 * CONTEXTO DE AUTENTICACIÓN MAYORISTA
 * 
 * Maneja el login exclusivo para mayoristas con:
 * - Usuario y contraseña asignados por la empresa
 * - Cambio de contraseña desde perfil
 * - Recuperación de contraseña
 * - Datos del perfil mayorista
 * 
 * PARA PERSONALIZAR:
 * - Conectar con Firebase Auth
 * - Modificar datos del perfil mayorista
 * - Agregar más validaciones de seguridad
 */

interface WholesaleUser extends User {
  businessName: string;
  ruc: string;
  legalName: string;
  lastPurchase?: string;
  pendingPayments: number;
  recentOrders: string[];
  isWholesaler: true;
}

interface WholesaleAuthContextType {
  user: WholesaleUser | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
}

const WholesaleAuthContext = createContext<WholesaleAuthContextType | undefined>(undefined);

export const useWholesaleAuth = () => {
  const context = useContext(WholesaleAuthContext);
  if (context === undefined) {
    throw new Error('useWholesaleAuth debe ser usado dentro de un WholesaleAuthProvider');
  }
  return context;
};

// DATOS DE PRUEBA - Reemplazar con Firebase Auth
const mockWholesaleUsers: WholesaleUser[] = [
  {
    id: 'wholesale_001',
    email: 'distribuidora@ejemplo.com',
    name: 'María González',
    phone: '+51 999 888 777',
    address: 'Av. Comercial 123, San Borja, Lima',
    orderHistory: ['WHS001', 'WHS002', 'WHS003'],
    createdAt: '2024-01-01T10:00:00Z',
    businessName: 'Distribuidora Lima Norte',
    ruc: '20123456789',
    legalName: 'Distribuidora Lima Norte S.A.C.',
    lastPurchase: '2024-01-10T15:30:00Z',
    pendingPayments: 0,
    recentOrders: ['WHS003', 'WHS002'],
    isWholesaler: true
  },
  {
    id: 'wholesale_002',
    email: 'minimarket@ejemplo.com',
    name: 'Carlos Ruiz',
    phone: '+51 888 777 666',
    address: 'Jr. Los Comerciantes 456, Miraflores, Lima',
    orderHistory: ['WHS004', 'WHS005'],
    createdAt: '2024-01-05T14:00:00Z',
    businessName: 'Minimarket San Pedro',
    ruc: '20987654321',
    legalName: 'Minimarket San Pedro E.I.R.L.',
    lastPurchase: '2024-01-08T10:15:00Z',
    pendingPayments: 1,
    recentOrders: ['WHS005'],
    isWholesaler: true
  }
];

interface WholesaleAuthProviderProps {
  children: ReactNode;
}

export const WholesaleAuthProvider = ({ children }: WholesaleAuthProviderProps) => {
  const [user, setUser] = useState<WholesaleUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('wholesaleUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    // Simular llamada a Firebase Auth
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validar credenciales con datos de prueba
      const foundUser = mockWholesaleUsers.find(u => 
        u.email === username && password === 'password123' // Contraseña de prueba
      );
      
      if (foundUser) {
        setUser(foundUser);
        localStorage.setItem('wholesaleUser', JSON.stringify(foundUser));
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en login mayorista:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('wholesaleUser');
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    // Simular cambio de contraseña con Firebase
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Validar contraseña actual
      if (oldPassword !== 'password123') {
        return false;
      }
      
      // Aquí iría la lógica real de Firebase Auth
      console.log('Contraseña cambiada exitosamente');
      return true;
    } catch (error) {
      console.error('Error al cambiar contraseña:', error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    // Simular reset de contraseña
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const userExists = mockWholesaleUsers.find(u => u.email === email);
      if (userExists) {
        console.log('Email de recuperación enviado');
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error al enviar email de recuperación:', error);
      return false;
    }
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    changePassword,
    resetPassword
  };

  return (
    <WholesaleAuthContext.Provider value={value}>
      {children}
    </WholesaleAuthContext.Provider>
  );
};

/*
INSTRUCCIONES PARA USAR:

1. Credenciales de prueba:
   - Usuario: distribuidora@ejemplo.com o minimarket@ejemplo.com
   - Contraseña: password123

2. Para conectar con Firebase:
   - Reemplazar mockWholesaleUsers con consultas a Firebase
   - Usar signInWithEmailAndPassword para login
   - Usar updatePassword para cambio de contraseña
   - Usar sendPasswordResetEmail para recuperación

3. Personalizar datos mayorista:
   - Modificar interface WholesaleUser
   - Agregar campos adicionales según necesidades
   - Actualizar mock data con información real
*/
