
import { useState } from 'react';
import { Eye, EyeOff, Lock, User, AlertCircle, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { toast } from '@/components/ui/use-toast';

/**
 * COMPONENTE DE LOGIN MAYORISTA
 * 
 * Login exclusivo para mayoristas con:
 * - Usuario y contraseña asignados
 * - Opción "Olvidé mi contraseña"
 * - Contacto con soporte
 * - Validaciones de seguridad
 * 
 * PARA PERSONALIZAR:
 * - Modificar estilos y colores
 * - Cambiar validaciones
 * - Personalizar mensajes de error
 */

interface WholesaleLoginProps {
  onLoginSuccess: () => void;
}

export const WholesaleLogin = ({ onLoginSuccess }: WholesaleLoginProps) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { login, resetPassword, isLoading } = useWholesaleAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos",
        variant: "destructive"
      });
      return;
    }

    const success = await login(username, password);
    
    if (success) {
      toast({
        title: "Bienvenido",
        description: "Has iniciado sesión correctamente"
      });
      onLoginSuccess();
    } else {
      toast({
        title: "Error de autenticación",
        description: "Usuario o contraseña incorrectos",
        variant: "destructive"
      });
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resetEmail) {
      toast({
        title: "Error",
        description: "Por favor ingresa tu email",
        variant: "destructive"
      });
      return;
    }

    const success = await resetPassword(resetEmail);
    
    if (success) {
      toast({
        title: "Email enviado",
        description: "Revisa tu bandeja de entrada para recuperar tu contraseña"
      });
      setShowForgotPassword(false);
      setResetEmail('');
    } else {
      toast({
        title: "Usuario no encontrado",
        description: "El email ingresado no está registrado como mayorista",
        variant: "destructive"
      });
    }
  };

  const contactSupport = () => {
    // Abrir WhatsApp con mensaje predefinido
    const message = encodeURIComponent('Hola, necesito ayuda para recuperar mi contraseña de mayorista');
    const whatsappUrl = `https://wa.me/51999888777?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-stone-800">
              Recuperar Contraseña
            </CardTitle>
            <p className="text-stone-600">
              Ingresa tu email para recuperar tu contraseña
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="Email corporativo"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  className="h-12"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-12 bg-amber-500 hover:bg-amber-600"
                disabled={isLoading}
              >
                {isLoading ? 'Enviando...' : 'Enviar email de recuperación'}
              </Button>
              
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-12"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Volver al login
                </Button>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-amber-800 font-medium mb-1">
                        ¿No puedes recuperar tu contraseña?
                      </p>
                      <p className="text-xs text-amber-700 mb-2">
                        Contáctanos por WhatsApp y te ayudaremos
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={contactSupport}
                        className="text-amber-700 border-amber-300 hover:bg-amber-100"
                      >
                        <MessageCircle className="h-4 w-4 mr-2" />
                        Contactar Soporte
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">P</span>
          </div>
          <CardTitle className="text-2xl font-bold text-stone-800">
            Portal Mayorista
          </CardTitle>
          <p className="text-stone-600">
            Ingresa con tu usuario y contraseña asignados
          </p>
        </CardHeader>
        
        <CardContent>
          {/* Credenciales de prueba - Eliminar en producción */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-blue-800 font-medium mb-1">Datos de prueba:</p>
            <p className="text-xs text-blue-700">Usuario: distribuidora@ejemplo.com</p>
            <p className="text-xs text-blue-700">Contraseña: password123</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-stone-400" />
              <Input
                type="email"
                placeholder="Email corporativo"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 pl-10"
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
            
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="w-full text-sm text-amber-600 hover:text-amber-700 underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
