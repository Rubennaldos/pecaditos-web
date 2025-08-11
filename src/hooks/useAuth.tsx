import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { ref, get, onValue, off, DataSnapshot } from 'firebase/database';
import { auth, db } from '@/config/firebase';
import { loginUser, registerUser, logoutUser, getUserData } from '@/services/firebaseService';
import { User } from '@/data/mockData';

type Perfil = {
  rol?: string;     // es-ES
  role?: string;    // en-US
  activo?: boolean;
  [k: string]: any;
} | null;

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  perfil: Perfil;
  loading: boolean;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  register: (email: string, password: string, additionalData: any) => Promise<FirebaseUser>;
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
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [perfil, setPerfil] = useState<Perfil>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let detachRTDB: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      // Limpia listener anterior si existía
      if (detachRTDB) {
        try { detachRTDB(); } catch {}
        detachRTDB = null;
      }

      if (!firebaseUser) {
        setUserData(null);
        setPerfil(null);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // 1) Intento con tu servicio (si trae rol/role, perfecto)
        let dataFromService: User | null = null;
        try {
          dataFromService = await getUserData(firebaseUser.uid);
        } catch (e) {
          console.warn('getUserData falló o no devolvió datos, continúo con RTDB:', e);
        }
        setUserData(dataFromService);

        const serviceHasRole =
          !!dataFromService &&
          (typeof (dataFromService as any).rol === 'string' || typeof (dataFromService as any).role === 'string');

        if (serviceHasRole) {
          setPerfil(dataFromService as any);
          setLoading(false);
          return;
        }

        // 2) Fallback: buscar perfil en RTDB en rutas conocidas
        const tryPaths = [
          `usuarios/${firebaseUser.uid}`,
          `users/${firebaseUser.uid}`,
          `${firebaseUser.uid}`,
        ];

        let foundPath: string | null = null;
        for (const path of tryPaths) {
          const r = ref(db, path);
          const snap = await get(r);
          if (snap.exists()) {
            foundPath = path;
            setPerfil(snap.val() || null);

            // Suscripción en tiempo real — guardamos el callback para unmount correcto
            const cb = (s: DataSnapshot) => setPerfil(s.val() || null);
            onValue(r, cb);
            detachRTDB = () => off(r, 'value', cb);

            break;
          }
        }

        if (!foundPath) {
          console.warn('useAuth: no encontré perfil en RTDB para uid', firebaseUser.uid);
          setPerfil(null);
        }
      } catch (error) {
        console.error('Error al obtener datos/perfil del usuario:', error);
        setPerfil(null);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (detachRTDB) {
        try { detachRTDB(); } catch {}
      }
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      return user;
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
      const user = await registerUser(email, password, additionalData);
      return user;
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
      await logoutUser();
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
