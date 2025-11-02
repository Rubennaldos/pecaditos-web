// src/pages/Login.tsx
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, User, Lock } from "lucide-react";

import { ref, get } from "firebase/database";
import { auth, db } from "@/config/firebase";
import { signInAndEnsureProfile } from "@/services/auth";
import { useAuth } from '@/hooks/useAuth';

// Helper: detecta la ruta de dashboard para usuarios con módulos
function getFirstAvailableRoute(perfil: any): string {
  // Simplificado: si el usuario tiene CUALQUIER módulo → /panel-control
  const userModules: string[] = perfil?.accessModules || perfil?.permissions || [];
  console.log('[Login] getFirstAvailableRoute => userModules:', userModules);

  if (userModules.length > 0) {
    console.log('[Login] usuario con módulos → /panel-control');
    return '/panel-control';
  }

  console.log('[Login] usuario sin módulos → /');
  return '/';
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";
  const { perfil, loading: authLoading } = useAuth() as any;
  const [pendingRedirect, setPendingRedirect] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // 1) Login + asegurar perfil en RTDB
      const user = await signInAndEnsureProfile(email, password);

      // Marcamos que, tras el login, esperaremos a que AuthProvider termine de
      // cargar y parchear el perfil (ensureDashboardForAdmin). La redirección
      // se hará en el useEffect que escucha authLoading/perfil.
      setPendingRedirect(true);
      console.log('[Login] inicio de sesión correcto, esperando a AuthProvider para redirigir', user.uid);
    } catch (err: any) {
      const code = err?.code || "";
      const msgMap: Record<string, string> = {
        "auth/invalid-credential": "Correo o contraseña inválidos.",
        "auth/user-not-found": "El correo no está registrado.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/too-many-requests":
          "Demasiados intentos. Vuelve a intentar en unos minutos.",
        "auth/operation-not-allowed":
          "El método Email/Password está deshabilitado.",
        "auth/network-request-failed": "Error de red. Verifica tu conexión.",
      };
      toast({
        title: "Error de autenticación",
        description: msgMap[code] || err?.message || "Usuario o contraseña incorrectos",
        variant: "destructive",
      });
    } finally {
      // No forzamos isLoading=false aquí porque esperamos al redirect flow.
      // isLoading seguirá activo hasta que la redirección se complete.
    }
  };

  // Effect: cuando hay un pendingRedirect, espera a que authLoading sea false
  // y luego usa el perfil cargado por AuthProvider para decidir la ruta.
  useEffect(() => {
    if (!pendingRedirect) return;

    // Mientras el provider esté cargando, no hacer nada
    if (authLoading) {
      console.log('[Login] esperando a que useAuth termine de cargar el perfil...');
      return;
    }

    // Ya no está cargando — evaluar perfil
    try {
      if (!perfil) {
        toast({
          title: 'Perfil no encontrado',
          description: 'Tu cuenta inició sesión, pero no se encontró el perfil. Contacta al administrador.',
          variant: 'destructive',
        });
        navigate('/', { replace: true });
        return;
      }

      if (perfil.activo === false) {
        toast({
          title: 'Acceso denegado',
          description: 'Tu usuario está inactivo. Contacta al administrador.',
          variant: 'destructive',
        });
        navigate('/', { replace: true });
        return;
      }

      const redirectPath = getFirstAvailableRoute(perfil);
      console.log('🔀 Ruta de redirección (post-auth):', redirectPath);

      toast({ title: 'Bienvenido', description: `Has iniciado sesión exitosamente` });

      navigate(from !== '/' ? from : redirectPath, { replace: true });
    } finally {
      setPendingRedirect(false);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRedirect, authLoading, perfil]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <CardTitle className="text-2xl font-bold text-stone-800">
            Iniciar Sesión
          </CardTitle>
          <p className="text-stone-600 mt-2">Accede con tus credenciales</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10 bg-white border-stone-200 focus:border-amber-300"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-10 pr-10 bg-white border-stone-200 focus:border-amber-300"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-medium transition-all duration-200 hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
