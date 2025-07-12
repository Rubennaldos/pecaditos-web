
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/config/firebase';
import { loginUser, registerUser, logoutUser, getUserData } from '@/services/firebaseService';
import { User } from '@/data/mockData';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<FirebaseUser>;
  register: (email: string, password: string, additionalData: any) => Promise<FirebaseUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        // Obtener datos adicionales del usuario desde Firebase
        try {
          const additionalUserData = await getUserData(firebaseUser.uid);
          setUserData(additionalUserData);
        } catch (error) {
          console.error('Error al obtener datos del usuario:', error);
        }
      } else {
        setUserData(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const user = await loginUser(email, password);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, additionalData: any) => {
    setLoading(true);
    try {
      const user = await registerUser(email, password, additionalData);
      return user;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await logoutUser();
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    userData,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/*
INSTRUCCIONES DE USO:

1. Envolver la app con AuthProvider en main.tsx o App.tsx:
   <AuthProvider>
     <App />
   </AuthProvider>

2. Usar en cualquier componente:
   const { user, userData, login, register, logout, loading } = useAuth();

3. Ejemplo de login:
   const handleLogin = async () => {
     try {
       await login(email, password);
       // Usuario logueado exitosamente
     } catch (error) {
       // Manejar error
     }
   };

4. Verificar si usuario está logueado:
   if (user) {
     // Usuario logueado
   } else {
     // Usuario no logueado
   }
*/
