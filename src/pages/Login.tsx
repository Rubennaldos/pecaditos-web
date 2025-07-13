
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff, User, Lock, Shield } from 'lucide-react';

/**
 * LOGIN ÚNICO UNIVERSAL - DETECCIÓN AUTOMÁTICA DE PERFILES
 * 
 * PERFILES ACTIVOS (PERFIL SEGUIMIENTO ELIMINADO):
 * - admin@pecaditos.com → /admin (Administrador general)
 * - pedidos@pecaditos.com → /pedidos (Gestión de pedidos)
 * - reparto@pecaditos.com → /reparto (Distribución y entrega)
 * - produccion@pecaditos.com → /produccion (Control de stock)
 * - cobranzas@pecaditos.com → /cobranzas (Facturación y cobros)
 * - mayoristas → /mayorista (Portal mayorista)
 * 
 * CONTRASEÑAS DE PRUEBA:
 * - Administrativos: admin123
 * - Mayoristas: password123
 * 
 * EDITAR AQUÍ:
 * - Para cambiar emails de detección (línea 60-80)
 * - Para cambiar contraseñas de prueba (línea 45-50)
 * - Para cambiar rutas de redirección (línea 85-95)
 */

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  
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

      // PERFILES ADMINISTRATIVOS ESPECÍFICOS
      // EDITAR AQUÍ para cambiar emails o agregar nuevos perfiles
      const adminProfiles = {
        'admin@pecaditos.com': { type: 'Administrador General', path: '/admin' },
        'pedidos@pecaditos.com': { type: 'Gestión de Pedidos', path: '/pedidos' },
        'reparto@pecaditos.com': { type: 'Distribución y Reparto', path: '/reparto' },
        'produccion@pecaditos.com': { type: 'Control de Producción', path: '/produccion' },
        'cobranzas@pecaditos.com': { type: 'Facturación y Cobranzas', path: '/cobranzas' }
        // NOTA: Perfil "seguimiento" ELIMINADO completamente
      };

      // Verificar perfiles administrativos
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
          console.log(`Error login administrativo:`, error);
        }
      }

      // MAYORISTAS
      // EDITAR AQUÍ para cambiar patrones de detección mayorista
      if (!loginSuccess && (
        email.includes('@ejemplo.com') || 
        email.includes('mayorista') || 
        email.includes('distribuidora') || 
        email.includes('minimarket')
      )) {
        try {
          const success = await wholesaleLogin(email, password);
          if (success) {
            loginSuccess = true;
            userType = 'Portal Mayorista';
            redirectPath = '/mayorista';
          }
        } catch (error) {
          console.log('Error login mayorista:', error);
        }
      }

      // CLIENTE FINAL (RETAIL) - COMPLETAMENTE OCULTO
      if (!loginSuccess) {
        try {
          const user = await retailLogin(email, password);
          if (user) {
            loginSuccess = true;
            userType = 'Cliente';
            redirectPath = '/login'; // Redirige a login porque está oculto
            
            toast({
              title: "Catálogo no disponible",
              description: "El catálogo personal está temporalmente fuera de servicio.",
              variant: "destructive"
            });
          }
        } catch (error) {
          console.log('Error login retail:', error);
        }
      }

      if (loginSuccess && redirectPath !== '/login') {
        toast({
          title: `Bienvenido`,
          description: `Acceso autorizado: ${userType}`
        });
        
        navigate(from !== '/' ? from : redirectPath, { replace: true });
      } else if (!loginSuccess) {
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
      <Card className="w-full max-w-md shadow-xl border-0 bg-white">
        <CardHeader className="text-center pb-6">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4 shadow-lg">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <CardTitle className="text-2xl font-bold text-stone-800">
            Acceso al Sistema
          </CardTitle>
          <p className="text-stone-600 mt-2">
            Pecaditos Integrales - Login Unificado
          </p>
        </CardHeader>
        
        <CardContent>
          {/* CREDENCIALES DE PRUEBA */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-800 font-medium mb-3">👤 Usuarios de prueba:</p>
            <div className="space-y-2 text-xs text-blue-700">
              <div className="border-b border-blue-200 pb-2">
                <p className="font-semibold text-blue-800">🔧 PERFILES ADMINISTRATIVOS:</p>
                <p>• <strong>Admin General:</strong> admin@pecaditos.com</p>
                <p>• <strong>Pedidos:</strong> pedidos@pecaditos.com</p>
                <p>• <strong>Reparto:</strong> reparto@pecaditos.com</p>
                <p>• <strong>Producción:</strong> produccion@pecaditos.com</p>
                <p>• <strong>Cobranzas:</strong> cobranzas@pecaditos.com</p>
                <p className="text-blue-600 font-medium">🔑 Contraseña: admin123</p>
              </div>
              <div>
                <p className="font-semibold text-blue-800">🏪 MAYORISTAS:</p>
                <p>• <strong>Distribuidora:</strong> mayorista@ejemplo.com</p>
                <p>• <strong>Minimarket:</strong> minimarket@ejemplo.com</p>
                <p className="text-blue-600 font-medium">🔑 Contraseña: password123</p>
              </div>
            </div>
          </div>

          {/* AVISO SISTEMA ACTUALIZADO */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-green-800 font-medium mb-1">
                  ✨ Sistema Unificado Actualizado
                </p>
                <p className="text-xs text-green-700">
                  • Perfil "seguimiento" eliminado<br/>
                  • Cada usuario accede solo a su área<br/>
                  • Catálogo minorista completamente oculto<br/>
                  • Nueva página "Donde nos ubicamos"
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
                placeholder="Email corporativo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10 bg-white border-stone-200 focus:border-amber-300 focus:ring-amber-200"
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
                className="h-12 pl-10 pr-10 bg-white border-stone-200 focus:border-amber-300 focus:ring-amber-200"
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
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium transition-all duration-200 hover:shadow-lg hover:shadow-amber-200"
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
              ← Volver al inicio
            </Button>
          </div>

          {/* INFORMACIÓN DE CONTACTO */}
          <div className="mt-6 text-center border-t border-stone-200 pt-6">
            <p className="text-xs text-stone-500 mb-2">
              ¿Problemas para acceder?
            </p>
            <a 
              href="https://wa.me/51999888777" 
              className="inline-flex items-center text-green-600 hover:text-green-700 text-sm font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              📱 WhatsApp: +51 999 888 777
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

/*
CONFIGURACIÓN DE LOGIN UNIFICADO:

CAMBIOS REALIZADOS:
❌ Eliminado perfil "seguimiento" completamente
✅ Sistema de detección automática por email
✅ Redirección automática por perfil
✅ Catálogo minorista oculto
✅ Credenciales de prueba organizadas

PERFILES ACTIVOS:
- admin@pecaditos.com → /admin
- pedidos@pecaditos.com → /pedidos  
- reparto@pecaditos.com → /reparto
- produccion@pecaditos.com → /produccion
- cobranzas@pecaditos.com → /cobranzas
- mayoristas → /mayorista

PARA EDITAR:
1. CAMBIAR EMAILS: Línea 60-70 (adminProfiles)
2. CAMBIAR CONTRASEÑAS: Modificar en cada contexto de auth
3. AGREGAR PERFILES: Añadir en adminProfiles + ProtectedRoute.tsx
4. CAMBIAR PATRONES MAYORISTA: Línea 85-90

LISTO PARA FIREBASE:
- Estructura preparada para Firebase Auth
- Mock authentication funcional
- Sistema escalable y modular
*/
