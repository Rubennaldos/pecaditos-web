
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, User, Lock } from 'lucide-react';

/**
 * PÁGINA DE LOGIN UNIFICADA
 * 
 * Maneja el login para todos los tipos de usuario:
 * - Clientes finales (retail) - ACTUALMENTE OCULTO
 * - Mayoristas (wholesale)
 * - Administradores (admin)
 * 
 * Detecta automáticamente el tipo de usuario por email/credenciales
 * y redirige a la página correspondiente después del login exitoso.
 */

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Hooks de autenticación
  const { login: retailLogin } = useAuth();
  const { login: wholesaleLogin } = useWholesaleAuth();
  const { login: adminLogin } = useAdmin();

  // Página a la que redirigir después del login exitoso
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
      // DETECCIÓN AUTOMÁTICA DEL TIPO DE USUARIO POR EMAIL
      let loginSuccess = false;
      let userType = '';
      let redirectPath = '/';

      // 1. Intentar login como ADMIN (detectar por dominio @pecaditos.com)
      if (email.includes('@pecaditos.com')) {
        try {
          const success = await adminLogin(email, password);
          if (success) {
            loginSuccess = true;
            userType = 'Administrador';
            redirectPath = '/admin';
          }
        } catch (error) {
          console.log('No es usuario admin');
        }
      }

      // 2. Si no es admin, intentar login como MAYORISTA
      if (!loginSuccess && (email.includes('@ejemplo.com') || email.includes('distribuidora') || email.includes('minimarket'))) {
        try {
          const success = await wholesaleLogin(email, password);
          if (success) {
            loginSuccess = true;
            userType = 'Mayorista';
            redirectPath = '/mayorista';
          }
        } catch (error) {
          console.log('No es usuario mayorista');
        }
      }

      // 3. CLIENTE FINAL - ACTUALMENTE OCULTO
      // Para reactivar: descomentar el siguiente bloque
      /*
      if (!loginSuccess) {
        try {
          const user = await retailLogin(email, password);
          if (user) {
            loginSuccess = true;
            userType = 'Cliente';
            redirectPath = '/catalogo';
          }
        } catch (error) {
          console.log('No es usuario retail');
        }
      }
      */

      if (loginSuccess) {
        toast({
          title: `Bienvenido`,
          description: `Has iniciado sesión como ${userType}`
        });
        
        // Redirigir a la página solicitada o a la página por defecto del usuario
        navigate(from !== '/' ? from : redirectPath, { replace: true });
      } else {
        throw new Error('Credenciales inválidas');
      }

    } catch (error) {
      toast({
        title: "Error de autenticación",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <CardTitle className="text-2xl font-bold text-stone-800">
            Iniciar Sesión
          </CardTitle>
          <p className="text-stone-600">
            Accede con tus credenciales
          </p>
        </CardHeader>
        
        <CardContent>
          {/* CREDENCIALES DE PRUEBA */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800 font-medium mb-2">Usuarios de prueba:</p>
            <div className="space-y-1 text-xs text-blue-700">
              <p><strong>Admin:</strong> admin@pecaditos.com / admin123</p>
              <p><strong>Mayorista:</strong> distribuidora@ejemplo.com / password123</p>
              {/* Retail login oculto - descomentar para reactivar */}
              {/* <p><strong>Cliente:</strong> cliente@ejemplo.com / cliente123</p> */}
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10"
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
                className="h-12 pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-12 bg-amber-500 hover:bg-amber-600"
              disabled={isLoading}
            >
              {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-amber-600 hover:text-amber-700"
            >
              Volver al inicio
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

/*
INSTRUCCIONES PARA REACTIVAR CLIENTE FINAL (RETAIL):

1. Descomentar el bloque de código marcado como "CLIENTE FINAL - ACTUALMENTE OCULTO"
2. Agregar las credenciales de prueba en la sección de credenciales
3. Asegurar que ProtectedRoute permita acceso a CATALOG_RETAIL

PERSONALIZACIÓN:

1. Para cambiar la detección de tipos de usuario:
   - Modificar las condiciones en los if (email.includes(...))
   - Agregar más patrones de detección

2. Para cambiar rutas de redirección:
   - Modificar las variables redirectPath

3. Para personalizar mensajes:
   - Editar los toast y textos mostrados
*/
