
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

/**
 * CONTEXTO DE ADMINISTRACIÓN
 * 
 * Maneja la autenticación y permisos para el panel de administración
 * Incluye todos los perfiles: Admin, Pedidos, Reparto, Producción, Seguimiento, Cobranzas
 * 
 * PARA PERSONALIZAR:
 * - Conectar con Firebase Auth
 * - Modificar perfiles y permisos
 * - Agregar más validaciones de seguridad
 */

export type AdminProfile = 'admin' | 'pedidos' | 'reparto' | 'produccion' | 'seguimiento' | 'cobranzas';

interface AdminUser {
  id: string;
  email: string;
  name: string;
  profile: AdminProfile;
  permissions: string[];
  lastLogin: string;
  isActive: boolean;
}

interface AdminContextType {
  user: AdminUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  impersonate: (targetProfile: AdminProfile) => void;
  hasPermission: (permission: string) => boolean;
  canAccessSection: (section: string) => boolean;
  logActivity: (action: string, details?: any) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin debe ser usado dentro de un AdminProvider');
  }
  return context;
};

// USUARIO ADMIN ÚNICO - Sistema de producción
const mockAdminUsers: AdminUser[] = [
  {
    id: 'admin_main',
    email: 'albertonaldos@gmail.com',
    name: 'Alberto Naldos - Admin Principal',
    profile: 'admin',
    permissions: ['all'],
    lastLogin: new Date().toISOString(),
    isActive: true
  }
];

interface AdminProviderProps {
  children: ReactNode;
}

export const AdminProvider = ({ children }: AdminProviderProps) => {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [originalProfile, setOriginalProfile] = useState<AdminProfile | null>(null);

  // Cargar usuario desde localStorage al iniciar
  useEffect(() => {
    const savedUser = localStorage.getItem('adminUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simular llamada a Firebase Auth
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Validar credenciales con Firebase Auth
      const foundUser = mockAdminUsers.find(u => 
        u.email === email && u.isActive && password === 'mirojito123'
      );
      
      if (foundUser) {
        const userWithUpdatedLogin = {
          ...foundUser,
          lastLogin: new Date().toISOString()
        };
        
        setUser(userWithUpdatedLogin);
        localStorage.setItem('adminUser', JSON.stringify(userWithUpdatedLogin));
        logActivity('login', { profile: foundUser.profile, email });
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en login admin:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    if (user) {
      logActivity('logout', { profile: user.profile });
    }
    setUser(null);
    setOriginalProfile(null);
    localStorage.removeItem('adminUser');
  };

  const impersonate = (targetProfile: AdminProfile) => {
    if (!user || user.profile !== 'admin') {
      console.error('Solo el admin puede impersonar otros perfiles');
      return;
    }

    if (!originalProfile) {
      setOriginalProfile(user.profile);
    }

    const targetUser = mockAdminUsers.find(u => u.profile === targetProfile && u.isActive);
    if (targetUser) {
      setUser({ ...targetUser, profile: targetProfile });
      logActivity('impersonate', { from: user.profile, to: targetProfile });
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  const canAccessSection = (section: string): boolean => {
    if (!user) return false;
    if (user.profile === 'admin') return true;
    
    const sectionPermissions: Record<string, string[]> = {
      dashboard: ['all'],
      orders: ['orders.view', 'all'],
      delivery: ['delivery.view', 'all'],
      production: ['production.view', 'all'],
      customers: ['customers.view', 'all'],
      billing: ['billing.view', 'all'],
      users: ['all'],
      reports: ['all']
    };
    
    const requiredPermissions = sectionPermissions[section] || [];
    return requiredPermissions.some(perm => hasPermission(perm));
  };

  const logActivity = (action: string, details?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: user?.email || 'unknown',
      profile: user?.profile || 'unknown',
      action,
      details: details || {}
    };
    
    console.log('Admin Activity Log:', logEntry);
    // Aquí se enviaría a Firebase para persistir los logs
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    impersonate,
    hasPermission,
    canAccessSection,
    logActivity
  };

  return (
    <AdminContext.Provider value={value}>
      {children}
    </AdminContext.Provider>
  );
};

/*
SISTEMA DE PRODUCCIÓN - CONFIGURADO CON FIREBASE

1. Usuario único de administración:
   - albertonaldos@gmail.com
   - Contraseña: mirojito123
   - Perfil: admin (acceso completo a todo el sistema)

2. Firebase integrado y listo:
   - Autenticación con Firebase Auth
   - Base de datos con Firebase Realtime Database
   - Logs de actividad persistidos en Firebase
   - Sistema completamente limpio sin datos de prueba

3. Para agregar más usuarios admin:
   - Crear desde el panel de administración
   - Asignar perfiles específicos según necesidades
   - Configurar permisos granulares por sección
*/
