import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/config/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/data/mockData';

type Perfil = {
  rol?: string;
  role?: string;
  activo?: boolean;
  [k: string]: any;
} | null;

interface AuthContextType {
  user: SupabaseUser | null;
  userData: User | null;
  perfil: Perfil;
  loading: boolean;
  login: (email: string, password: string) => Promise<SupabaseUser>;
  register: (email: string, password: string, additionalData: any) => Promise<SupabaseUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    console.error('useAuth fue llamado fuera del AuthProvider. Verifica que el componente esté dentro del provider.');
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil>(null);
  const [loading, setLoading] = useState(true);

  // Helper: usuarios con rol admin tienen acceso a TODOS los módulos automáticamente
  const ensureAllModulesForAdmin = (p: any) => {
    if (!p) return p;
    const isAdminRole =
      p.rol === 'admin' ||
      p.rol === 'adminGeneral' ||
      p.role === 'admin';
    
    if (!isAdminRole) return p;

    // Lista completa de módulos disponibles en el sistema
    const allModules = [
      'dashboard',
      'catalog',
      'catalogs-admin',
      'orders',
      'tracking',
      'delivery',
      'production',
      'billing',
      'logistics',
      'locations',
      'reports',
      'wholesale'
    ];

    // Asignar todos los módulos a usuarios admin
    return {
      ...p,
      accessModules: allModules,
      permissions: allModules,
    };
  };

  useEffect(() => {
    // Cargar sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        loadUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadUserProfile(session.user.id);
      } else {
        setUserData(null);
        setPerfil(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      setLoading(true);
      
      // Cargar perfil desde tabla usuarios
      const { data: profileData, error } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[useAuth] Error al cargar perfil:', error);
        setPerfil(null);
        setUserData(null);
        return;
      }

      if (profileData) {
        // Convertir formato de Supabase a formato esperado
        const userDataConverted: User = {
          id: profileData.id,
          email: profileData.email || '',
          name: profileData.nombre || '',
          phone: profileData.telefono || '',
          address: profileData.direccion || '',
        };

        const perfilConverted = {
          ...profileData,
          rol: profileData.rol,
          activo: profileData.activo,
          accessModules: profileData.access_modules || [],
          permissions: Array.isArray(profileData.permissions) ? profileData.permissions : [],
        };

        setUserData(userDataConverted);
        setPerfil(ensureAllModulesForAdmin(perfilConverted));
        
        console.log('[useAuth] Perfil cargado:', {
          rol: perfilConverted.rol,
          modules: perfilConverted.accessModules?.length || 0
        });
      } else {
        console.warn('[useAuth] No se encontró perfil para el usuario:', userId);
        setPerfil(null);
        setUserData(null);
      }
    } catch (error) {
      console.error('[useAuth] Error al obtener datos del usuario:', error);
      setPerfil(null);
      setUserData(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data.user) throw new Error('No se pudo iniciar sesión');

      return data.user;
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, additionalData: any) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: additionalData,
        },
      });

      if (error) throw error;
      if (!data.user) throw new Error('No se pudo registrar el usuario');

      return data.user;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error en logout:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    userData,
    perfil,
    loading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
