import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, User, Lock, AlertCircle } from 'lucide-react';

/**
 * PÁGINA DE LOGIN ÚNICA - DETECCIÓN AUTOMÁTICA DE PERFILES
 * 
 * Sistema unificado para todos los tipos de usuario:
 * - Clientes finales (retail) - OCULTO - Solo admin puede acceder al catálogo
 * - Mayoristas (wholesale) - Activo
 * - Administradores (admin, pedidos, reparto, produccion, cobranzas) - Activo
 * 
 * DETECCIÓN AUTOMÁTICA:
 * - Por dominio de email (@pecaditos.com = admin/staff)
 * - Por patrón de email (mayoristas = @ejemplo.com, distribuidora, minimarket)
 * - Fallback a retail (OCULTO)
 * 
 * REDIRECCIÓN AUTOMÁTICA POR PERFIL:
 * - Admin → /admin
 * - Pedidos → /pedidos  
 * - Reparto → /reparto
 * - Producción → /produccion
 * - Cobranzas → /cobranzas
 * - Mayorista → /mayorista
 * - Retail → / (landing - catálogo oculto)
 */

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
  const searchParams = new URLSearchParams(location.search);
  const loginType = searchParams.get('type');
  
  const { login: retailLogin } = useAuth();
  const { login: wholesaleLogin } = useWholesaleAuth();
  const { login: adminLogin } = useAdmin();

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
      let loginSuccess = false;
      let userType = '';
      let redirectPath = '/';

      const adminProfiles = {
        'admin@pecaditos.com': { type: 'Admin General', path: '/admin' },
        'pedidos@pecaditos.com': { type: 'Pedidos', path: '/pedidos' },
        'reparto@pecaditos.com': { type: 'Reparto', path: '/reparto' },
        'produccion@pecaditos.com': { type: 'Producción', path: '/produccion' },
        'cobranzas@pecaditos.com': { type: 'Cobranzas', path: '/cobranzas' }
      };

      if (adminProfiles[email as keyof typeof adminProfiles]) {
        try {
          const success = await adminLogin(email, password);
          if (success) {
            loginSuccess = true;
            const profile = adminProfiles[email as keyof typeof adminProfiles];
            userType = profile.type;
            redirectPath = profile.path;
          }
        } catch (error) {
          console.log(`No es usuario ${adminProfiles[email as keyof typeof adminProfiles]?.type}:`, error);
        }
      }

      if (!loginSuccess && (
        loginType === 'wholesale' || 
        email.includes('@ejemplo.com') || 
        email.includes('distribuidora') || 
        email.includes('minimarket') ||
        email.includes('mayorista')
      )) {
        try {
          const success = await wholesaleLogin(email, password);
          if (success) {
            loginSuccess = true;
            userType = 'Mayorista';
            redirectPath = '/mayorista';
          }
        } catch (error) {
          console.log('No es usuario mayorista:', error);
        }
      }

      if (!loginSuccess) {
        try {
          const user = await retailLogin(email, password);
          if (user) {
            loginSuccess = true;
            userType = 'Cliente';
            redirectPath = '/';
            toast({
              title: "Catálogo no disponible",
              description: "El catálogo personal está temporalmente fuera de servicio. Contáctanos por WhatsApp.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.log('No es usuario retail:', error);
        }
      }

      if (loginSuccess && redirectPath !== '/') {
        toast({
          title: `Bienvenido`,
          description: `Has iniciado sesión como ${userType}`
        });
        navigate(from !== '/' ? from : redirectPath, { replace: true });
      } else if (loginSuccess && redirectPath === '/') {
        navigate('/', { replace: true });
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
          {/* AVISO CATÁLOGO MINORISTA OCULTO */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-medium mb-1">
                  Catálogo Personal Temporalmente No Disponible
                </p>
                <p className="text-xs text-amber-700">
                  El catálogo minorista está en mantenimiento. Para compras directas, 
                  contáctanos por WhatsApp: +51 999 888 777
                </p>
              </div>
            </div>
          </div>
          
          {/* FORMULARIO DE LOGIN */}
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

          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 transition-all"
            >
              ← Volver a la página de bienvenida
            </Button>
          </div>

          {/* Información de contacto */}
          <div className="mt-6 text-center">
            <p className="text-xs text-stone-500">
              ¿Problemas para acceder? Contáctanos:
            </p>
            <a 
              href="https://wa.me/51999888777" 
              className="text-green-600 hover:text-green-700 text-sm font-medium"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp: +51 999 888 777
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
