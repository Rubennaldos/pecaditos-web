import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

import { signInWithEmailAndPassword } from "firebase/auth";
import { ref, get } from "firebase/database";
import { auth, db } from "../config/firebase"; // RUTA RELATIVA

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from?.pathname || '/';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // 1. Login en Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Buscar el perfil en Realtime Database
      const userRef = ref(db, `usuarios/${user.uid}`);
      const snapshot = await get(userRef);

      if (!snapshot.exists()) {
        toast({
          title: "Perfil no encontrado",
          description: "No se encontró un perfil para este usuario.",
          variant: "destructive"
        });
        setIsLoading(false);
        return navigate("/", { replace: true });
      }

      const userData = snapshot.val();
      let redirectPath = "/";

      // 3. Redirigir según el campo "rol"
      switch (userData.rol) {
        case "adminGeneral":
          redirectPath = "/admin";
          break;
        case "adminPedidos":
          redirectPath = "/pedidos";
          break;
        case "adminReparto":
          redirectPath = "/reparto";
          break;
        case "adminProduccion":
          redirectPath = "/produccion";
          break;
        case "adminCobranzas":
          redirectPath = "/cobranzas";
          break;
        case "adminLogistica":
          redirectPath = "/logistica";
          break;
        // agrega más casos según tus roles
        default:
          redirectPath = "/";
      }

      toast({
        title: "Bienvenido",
        description: `Has iniciado sesión como ${userData.rol}`
      });

      navigate(from !== "/" ? from : redirectPath, { replace: true });

    } catch (error: any) {
      toast({
        title: "Error de autenticación",
        description: error.message || "Usuario o contraseña incorrectos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

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
          <p className="text-stone-600 mt-2">
            Accede con tus credenciales
          </p>
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
                type={showPassword ? 'text' : 'password'}
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
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
