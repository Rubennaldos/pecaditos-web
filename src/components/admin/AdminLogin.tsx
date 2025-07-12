
import { useState } from 'react';
import { Eye, EyeOff, Shield, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';
import { toast } from '@/components/ui/use-toast';

/**
 * COMPONENTE DE LOGIN ADMINISTRATIVO
 * 
 * Login único para todos los perfiles del panel de administración
 * Detecta automáticamente el perfil del usuario y redirige a su panel
 * 
 * PARA PERSONALIZAR:
 * - Modificar estilos y colores
 * - Cambiar validaciones
 * - Personalizar mensajes de error
 */

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAdmin();

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

    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión correctamente"
      });
      onLoginSuccess();
    } else {
      toast({
        title: "Error de autenticación",
        description: "Email o contraseña incorrectos",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold text-stone-800">
            Panel de Administración
          </CardTitle>
          <p className="text-stone-600">
            Acceso exclusivo para personal autorizado
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Credenciales de prueba - Eliminar en producción */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800 font-medium mb-2">Datos de prueba (eliminar en producción):</p>
            <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Admin:</strong> admin@pecaditos.com</p>
              <p><strong>Pedidos:</strong> pedidos@pecaditos.com</p>
              <p><strong>Reparto:</strong> reparto@pecaditos.com</p>
              <p><strong>Producción:</strong> produccion@pecaditos.com</p>
              <p><strong>Seguimiento:</strong> seguimiento@pecaditos.com</p>
              <p><strong>Cobranzas:</strong> cobranzas@pecaditos.com</p>
              <p><strong>Contraseña para todos:</strong> admin123</p>
            </div>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <Input
                type="email"
                placeholder="Email corporativo"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-10"
              />
            </div>
            
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-10 pr-10"
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
              {isLoading ? 'Iniciando sesión...' : 'Acceder al Panel'}
            </Button>
          </form>

          <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-amber-800 font-medium mb-1">
                  Acceso Restringido
                </p>
                <p className="text-xs text-amber-700">
                  Este panel es exclusivo para personal autorizado de Pecaditos Integrales.
                  Todas las acciones son registradas y monitoreadas.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
