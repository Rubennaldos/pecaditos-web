import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signInWithEmailAndPassword, signOut, User as FirebaseUser } from 'firebase/auth';
import { ref, get } from 'firebase/database';
import { auth, db } from '../config/firebase';

export type AdminProfile =
  | 'admin'
  | 'adminGeneral'
  | 'pedidos'
  | 'reparto'
  | 'produccion'
  | 'seguimiento'
  | 'cobranzas';

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

  // Mantener sincronizado el contexto con Firebase Auth
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const adminData = await getAdminProfile(firebaseUser);
        if (adminData) {
          setUser(adminData);
          localStorage.setItem('adminUser', JSON.stringify(adminData));
        }
      } else {
        setUser(null);
        localStorage.removeItem('adminUser');
      }
    });
    return unsubscribe;
  }, []);

  // ----------- LOGIN CON FIREBASE AUTH + PERFIL EN REALTIME DATABASE -----------
  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;
      const adminData = await getAdminProfile(firebaseUser);
      if (adminData && adminData.isActive) {
        setUser(adminData);
        localStorage.setItem('adminUser', JSON.stringify(adminData));
        logActivity('login', { profile: adminData.profile, email });
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

  // ----------- TRAER PERFIL ADMIN DESDE REALTIME DATABASE -----------
  const getAdminProfile = async (firebaseUser: FirebaseUser): Promise<AdminUser | null> => {
    try {
      // Evita consultar la DB si aún no hay uid (previene "Permission denied" en login)
      if (!firebaseUser?.uid) return null;

      const userRef = ref(db, `usuarios/${firebaseUser.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const data = snapshot.val();

        // Mapea tus campos: correo, nombre, rol, activo
        const profile: AdminProfile =
          (data.rol as AdminProfile) && ['admin', 'adminGeneral', 'pedidos', 'reparto', 'produccion', 'seguimiento', 'cobranzas'].includes(data.rol)
            ? (data.rol as AdminProfile)
            : 'adminGeneral';

        return {
          id: firebaseUser.uid,
          email: data.correo || firebaseUser.email || '',
          name: data.nombre || '',
          profile,
          permissions: Array.isArray(data.permissions) ? data.permissions : ['all'],
          lastLogin: new Date().toISOString(),
          isActive: data.activo !== false,
        };
      }

      return null;
    } catch (e) {
      console.error('No se pudo traer el perfil admin:', e);
      return null;
    }
  };

  const logout = () => {
    if (user) {
      logActivity('logout', { profile: user.profile });
    }
    setUser(null);
    setOriginalProfile(null);
    localStorage.removeItem('adminUser');
    signOut(auth);
  };

  // Impersonate (solo si el perfil actual es 'admin' o 'adminGeneral')
  const impersonate = (targetProfile: AdminProfile) => {
    if (!user || !['admin', 'adminGeneral'].includes(user.profile)) {
      console.error('Solo el admin o adminGeneral puede impersonar otros perfiles');
      return;
    }
    if (!originalProfile) {
      setOriginalProfile(user.profile);
    }
    setUser({ ...user, profile: targetProfile });
    logActivity('impersonate', { from: user.profile, to: targetProfile });
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.permissions.includes('all')) return true;
    return user.permissions.includes(permission);
  };

  const canAccessSection = (section: string): boolean => {
    if (!user) return false;
    // 'admin' y 'adminGeneral' ven todo
    if (user.profile === 'admin' || user.profile === 'adminGeneral') return true;

    const sectionPermissions: Record<string, string[]> = {
      dashboard: ['all'],
      orders: ['orders.view', 'all'],
      delivery: ['delivery.view', 'all'],
      production: ['production.view', 'all'],
      customers: ['customers.view', 'all'],
      billing: ['billing.view', 'all'],
      users: ['all'],
      reports: ['all'],
    };

    const requiredPermissions = sectionPermissions[section] || [];
    return requiredPermissions.some((perm) => hasPermission(perm));
  };

  const logActivity = (action: string, details?: any) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      user: user?.email || 'unknown',
      profile: user?.profile || 'unknown',
      action,
      details: details || {},
    };
    console.log('Admin Activity Log:', logEntry);
    // Aquí podrías guardar en Realtime DB si quieres
  };

  const value = {
    user,
    isLoading,
    login,
    logout,
    impersonate,
    hasPermission,
    canAccessSection,
    logActivity,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};
