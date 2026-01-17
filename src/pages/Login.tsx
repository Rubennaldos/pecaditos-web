// ...existing code...
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { Eye, EyeOff, User, Lock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

import { signInAndEnsureProfile, formatAuthCredentials } from "@/services/auth";
import { useAuth } from '@/hooks/useAuth';

// Helper: detecta la ruta de dashboard para usuarios con módulos
function getFirstAvailableRoute(perfil: any): string {
  // Si es usuario de Portal Mayorista, siempre redirigir al panel de control
  if (perfil?.portalLoginRuc) {
    console.log('[Login] perfil mayorista detectado → /panel-control');
    return '/panel-control';
  }

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
  // Modo: 'portal' (Mayorista) | 'admin' (Administrativo)
  const [mode, setMode] = useState<'portal' | 'admin'>('portal');

  // Estado para modo Administrativo
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Estado para modo Portal Mayorista
  const [ruc, setRuc] = useState("");
  const [pin, setPin] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || "/";
  const { profile, loading: authLoading } = useAuth();
  const [pendingRedirect, setPendingRedirect] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (mode === 'portal') {
      if (!ruc || !pin) {
        toast({
          title: "Error",
            description: "Ingresa RUC y PIN",
          variant: "destructive",
        });
        return;
      }
      if (pin.trim().length !== 4) {
        toast({
          title: "PIN inválido",
          description: "El PIN debe tener 4 dígitos",
          variant: "destructive",
        });
        return;
      }
    } else {
      if (!email || !password) {
        toast({
          title: "Error",
          description: "Por favor completa todos los campos",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    try {
      let finalEmail: string;
      let finalPassword: string;

      if (mode === 'portal') {
        const creds = formatAuthCredentials(ruc, pin);
        finalEmail = creds.email;
        finalPassword = creds.password;
        console.log('[Login] Credenciales portal normalizadas:', creds);
      } else {
        finalEmail = email.trim();
        finalPassword = password;
      }

      const user = await signInAndEnsureProfile(finalEmail, finalPassword);
      setPendingRedirect(true);
      console.log('[Login] inicio de sesión correcto, esperando a AuthProvider para redirigir');
    } catch (err: any) {
      const code = err?.code || "";
      const msgMap: Record<string, string> = {
        "auth/invalid-credential": "Credenciales inválidas.",
        "auth/user-not-found": "Usuario no registrado.",
        "auth/wrong-password": "Contraseña incorrecta.",
        "auth/too-many-requests": "Demasiados intentos. Intenta luego.",
        "auth/operation-not-allowed": "Método deshabilitado.",
        "auth/network-request-failed": "Error de red. Verifica tu conexión.",
      };
      toast({
        title: "Error de autenticación",
        description: msgMap[code] || err?.message || "Credenciales incorrectas",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!pendingRedirect) return;
    if (authLoading) {
      console.log('[Login] esperando a que useAuth termine de cargar el perfil...');
      return;
    }
    try {
      if (!profile) {
        toast({
          title: 'Perfil no encontrado',
          description: 'Se inició sesión, pero no se encontró el perfil.',
          variant: 'destructive',
        });
        navigate('/', { replace: true });
        return;
      }
      if (profile.activo === false) {
        toast({
          title: 'Acceso denegado',
          description: 'Usuario inactivo. Contacta al administrador.',
          variant: 'destructive',
        });
        navigate('/', { replace: true });
        return;
      }
      // Todos los usuarios admin van al panel de control
      const redirectPath = '/panel-control';
      console.log('🔀 Redirigiendo a:', redirectPath);
      toast({ title: 'Bienvenido', description: `Has iniciado sesión exitosamente` });
      navigate(redirectPath, { replace: true });
    } finally {
      setPendingRedirect(false);
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingRedirect, authLoading, profile]);

  const handleNumpadClick = (num: string) => {
    if (pin.length < 4) {
      setPin(pin + num);
    }
  };

  const handleNumpadDelete = () => {
    setPin(pin.slice(0, -1));
  };

  const renderPortalFields = () => (
    <div className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-400" />
        <Input
          type="text"
          placeholder="RUC"
          value={ruc}
          onChange={(e) => setRuc(e.target.value)}
          className="h-12 pl-10 bg-white border-stone-200 focus:border-amber-300"
          required
        />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-stone-600 text-sm">
          <Lock className="h-4 w-4" />
          <span>PIN (4 dígitos)</span>
        </div>
        <div className="flex justify-center">
          <InputOTP
            maxLength={4}
            value={pin}
            onChange={(value) => setPin(value)}
            pattern="[0-9]*"
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        
        {/* Teclado numérico */}
        <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleNumpadClick(num.toString())}
              className="h-14 bg-white border-2 border-stone-200 hover:border-amber-400 hover:bg-amber-50 rounded-lg text-xl font-semibold text-stone-700 transition-all active:scale-95"
              disabled={isLoading}
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleNumpadDelete}
            className="h-14 bg-white border-2 border-stone-200 hover:border-red-400 hover:bg-red-50 rounded-lg text-stone-700 transition-all active:scale-95 flex items-center justify-center"
            disabled={isLoading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"/>
              <line x1="18" y1="9" x2="12" y2="15"/>
              <line x1="12" y1="9" x2="18" y2="15"/>
            </svg>
          </button>
          <button
            type="button"
            onClick={() => handleNumpadClick('0')}
            className="h-14 bg-white border-2 border-stone-200 hover:border-amber-400 hover:bg-amber-50 rounded-lg text-xl font-semibold text-stone-700 transition-all active:scale-95"
            disabled={isLoading}
          >
            0
          </button>
          <button
            type="button"
            onClick={() => setPin('')}
            className="h-14 bg-white border-2 border-stone-200 hover:border-red-400 hover:bg-red-50 rounded-lg text-sm font-medium text-stone-700 transition-all active:scale-95"
            disabled={isLoading}
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  );

  const renderAdminFields = () => (
    <div className="space-y-4">
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
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <CardTitle className="text-2xl font-bold text-stone-800">
            Iniciar Sesión
          </CardTitle>
          <p className="text-stone-600 mt-2">
            {mode === 'portal' ? 'Acceso Portal Mayorista' : 'Acceso Administrativo'}
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            <Button
              type="button"
              variant={mode === 'portal' ? 'default' : 'outline'}
              className={mode === 'portal'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-white text-stone-700 border-stone-300'}
              onClick={() => setMode('portal')}
              disabled={isLoading}
            >
              Portal Mayorista
            </Button>
            <Button
              type="button"
              variant={mode === 'admin' ? 'default' : 'outline'}
              className={mode === 'admin'
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-white text-stone-700 border-stone-300'}
              onClick={() => setMode('admin')}
              disabled={isLoading}
            >
              Administrativo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {mode === 'portal' ? renderPortalFields() : renderAdminFields()}
            <Button
              type="submit"
              className="w-full h-12 bg-amber-500 hover:bg-amber-600 text-white font-medium transition-all duration-200 hover:shadow-lg"
              disabled={isLoading}
            >
              {isLoading
                ? "Iniciando sesión..."
                : mode === 'portal'
                  ? "Ingresar al Portal"
                  : "Iniciar Sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
// ...existing code...