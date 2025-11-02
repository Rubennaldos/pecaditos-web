import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Eye, EyeOff, Loader2, TrendingUp, AlertTriangle } from 'lucide-react';
import { useLogistics } from '@/contexts/LogisticsContext';
import { toast } from '@/hooks/use-toast';

export const LogisticsLogin = () => {
  const { login, loading } = useLogistics();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast({
        title: "Error",
        description: "Por favor ingresa email y contraseña",
        variant: "destructive"
      });
      return;
    }

    const success = await login(email, password);
    
    if (!success) {
      toast({
        title: "Error de autenticación",
        description: "Email o contraseña incorrectos",
        variant: "destructive"
      });
    } else {
      toast({
        title: "¡Bienvenido al Sistema de Logística!",
        description: "Acceso exitoso - Cargando datos del inventario...",
      });
    }
  };

  const fillCredentials = (userType: 'logistics' | 'admin') => {
    if (userType === 'logistics') {
      setEmail('logistica@pecaditos.com');
      setPassword('logistica123');
    } else {
      setEmail('admin@pecaditos.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-green-50 p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Panel izquierdo - Información del sistema */}
        <div className="space-y-6">
          <div className="text-center lg:text-left">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Sistema de <span className="text-blue-600">Logística</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Gestiona inventarios, compras y control de productos de manera eficiente
            </p>
          </div>

          {/* Características principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-6 w-6 text-blue-500" />
                <h3 className="font-semibold">Control de Inventario</h3>
              </div>
              <p className="text-sm text-gray-600">
                Monitoreo en tiempo real de stock, alertas automáticas y gestión de vencimientos
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="h-6 w-6 text-green-500" />
                <h3 className="font-semibold">Órdenes Automáticas</h3>
              </div>
              <p className="text-sm text-gray-600">
                Generación automática de órdenes de compra basadas en niveles mínimos
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-6 w-6 text-amber-500" />
                <h3 className="font-semibold">Alertas Inteligentes</h3>
              </div>
              <p className="text-sm text-gray-600">
                Notificaciones automáticas por WhatsApp para stock bajo y vencimientos
              </p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border">
              <div className="flex items-center gap-3 mb-2">
                <Package className="h-6 w-6 text-purple-500" />
                <h3 className="font-semibold">Reportes Avanzados</h3>
              </div>
              <p className="text-sm text-gray-600">
                Análisis de consumo, rotación de productos y estadísticas detalladas
              </p>
            </div>
          </div>

          {/* Estados de ejemplo */}
          <div className="bg-gradient-to-r from-blue-500 to-green-500 p-6 rounded-lg text-white">
            <h3 className="text-lg font-semibold mb-3">Estado Actual del Sistema</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold">6</div>
                <div className="text-sm opacity-90">Productos en Stock</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-200">2</div>
                <div className="text-sm opacity-90">Alertas Críticas</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-200">1</div>
                <div className="text-sm opacity-90">Orden Pendiente</div>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Formulario de login */}
        <Card className="w-full max-w-md mx-auto shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center">
              <Package className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-600">
              Ingresa tus credenciales para acceder al sistema de logística
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="albertonaldos@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="h-11"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700">Contraseña</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Ingresa tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="h-11 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-11 px-3 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-medium"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verificando credenciales...
                  </>
                ) : (
                  'Acceder al Sistema'
                )}
              </Button>
            </form>
            
            {/* Credenciales de prueba */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
              <h4 className="text-sm font-medium mb-3 text-center text-gray-800">
                💡 Credenciales de Demostración
              </h4>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start bg-white hover:bg-blue-50"
                  onClick={() => fillCredentials('logistics')}
                  disabled={loading}
                >
                  <Package className="w-3 h-3 mr-2 text-blue-500" />
                  Responsable de Logística
                  <span className="ml-auto text-blue-600 font-mono">logistica@pecaditos.com</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs justify-start bg-white hover:bg-green-50"
                  onClick={() => fillCredentials('admin')}
                  disabled={loading}
                >
                  <AlertTriangle className="w-3 h-3 mr-2 text-green-500" />
                  Administrador General
                  <span className="ml-auto text-green-600 font-mono">admin@pecaditos.com</span>
                </Button>
              </div>
              <p className="text-xs text-gray-500 mt-3 text-center">
                Sistema con datos de ejemplo listos para demostrar funcionalidades
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-xs text-gray-500">
                🔒 Sistema seguro con autenticación local<br />
                📊 Datos de ejemplo incluidos para pruebas
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};