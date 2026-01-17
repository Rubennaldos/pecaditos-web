// AUTH SYSTEM - SIN RPC, SOLO QUERIES DIRECTAS
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/config/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  nombre: string;
  rol: string;
  activo: boolean;
  access_modules: string[];
}

interface AuthContextType {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
};

const ALL_MODULES = [
  'dashboard', 'catalog', 'catalogs-admin', 'orders', 'tracking',
  'delivery', 'production', 'billing', 'logistics', 'locations',
  'reports', 'wholesale'
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async (userId: string) => {
    setLoading(true);
    try {
      console.log('[AUTH] 🔍 Iniciando carga de perfil:', userId);
      console.log('[AUTH] 🔑 ANON_KEY:', import.meta.env.VITE_SUPABASE_ANON_KEY?.substring(0, 20) + '...');
      console.log('[AUTH] 🌐 URL:', import.meta.env.VITE_SUPABASE_URL);
      
      // Query usando FETCH directo (igual que el test HTML que funcionó)
      console.log('[AUTH] ⏱️ Usando fetch directo...');
      const url = `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/usuarios?id=eq.${userId}&select=*`;
      const headers = {
        'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };
      
      console.log('[AUTH] 📡 URL:', url);
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Query timeout después de 8 segundos')), 8000)
      );
      
      const fetchPromise = fetch(url, { headers }).then(r => r.json());
      
      const result = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      console.log('[AUTH] ✅ Respuesta recibida:', result);
      
      const data = Array.isArray(result) ? result[0] : result;
      const error = result?.error || null;
      
      console.log('[AUTH] ✅ Respuesta recibida:', { data, error });

      if (error || !data) {
        console.error('[AUTH] Error:', error);
        throw new Error('Perfil no encontrado');
      }

      // Verificar que esté activo
      if (data.activo !== true) {
        console.warn('[AUTH] Usuario inactivo');
        throw new Error('Usuario inactivo');
      }

      // Validar rol
      const validRoles = ['admin', 'adminGeneral', 'pedidos', 'reparto', 'produccion', 'cobranzas', 'logistica'];
      if (!data.rol || !validRoles.includes(data.rol)) {
        console.warn('[AUTH] Rol inv?lido:', data.rol);
        throw new Error('Sin permisos administrativos');
      }

      // Admin = todos los m?dulos
      const isAdmin = data.rol === 'admin' || data.rol === 'adminGeneral';
      const modules = isAdmin ? ALL_MODULES : (data.access_modules || []);

      const profileData: UserProfile = {
        id: data.id,
        email: data.email,
        nombre: data.nombre,
        rol: data.rol,
        activo: data.activo,
        access_modules: modules,
      };

      setProfile(profileData);
      console.log('[AUTH] ? Perfil OK:', profileData.rol, 'M?dulos:', modules.length);
      
    } catch (error: any) {
      console.error('[AUTH] ERROR:', error);
      await supabase.auth.signOut();
      setUser(null);
      setProfile(null);
      window.location.href = '/';
      alert(error.message || 'Error al cargar perfil');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log('[AUTH] Iniciando...');
    
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        console.log('[AUTH] Sesi?n activa');
        setUser(session.user);
        loadProfile(session.user.id);
      } else {
        console.log('[AUTH] Sin sesi?n');
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[AUTH] Evento:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        await loadProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      if (!data.user) throw new Error('Login fallido');

    } catch (error: any) {
      console.error('[AUTH] Error login:', error);
      setLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    window.location.href = '/';
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
