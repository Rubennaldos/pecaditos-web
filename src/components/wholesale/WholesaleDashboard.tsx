
import { useState } from 'react';
import { 
  Package, 
  Clock, 
  AlertTriangle, 
  FileText, 
  User, 
  LogOut,
  MessageSquare,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { toast } from '@/components/ui/use-toast';
import { RepeatOrderModal } from './RepeatOrderModal';

/**
 * DASHBOARD MAYORISTA
 * 
 * Panel superior que muestra:
 * - Pedidos recientes y pendientes
 * - Última compra
 * - Avisos y notificaciones
 * - Datos del perfil
 * - Botón cotización especial
 * 
 * PARA PERSONALIZAR:
 * - Modificar métricas mostradas
 * - Cambiar colores de notificaciones
 * - Agregar más datos del negocio
 */

export const WholesaleDashboard = () => {
  const { user, logout } = useWholesaleAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showRepeatOrderModal, setShowRepeatOrderModal] = useState(false);

  if (!user) return null;

  const handleSpecialQuote = () => {
    toast({
      title: "Cotización Especial",
      description: "Te contactaremos pronto para tu cotización personalizada"
    });
    
    // Abrir WhatsApp con mensaje predefinido
    const message = encodeURIComponent(
      `Hola, soy ${user.businessName} (RUC: ${user.ruc}). Necesito una cotización especial para un pedido personalizado.`
    );
    const whatsappUrl = `https://wa.me/51999888777?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white border-b border-stone-200 p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header del Dashboard */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 mb-1">
              ¡Bienvenido, {user.businessName}!
            </h1>
            <p className="text-stone-600">
              RUC: {user.ruc} • {user.legalName}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(!showProfile)}
              className="hidden lg:flex"
            >
              <User className="h-4 w-4 mr-2" />
              Mi Perfil
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="text-stone-600 hover:text-red-600"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Perfil expandible (móvil y desktop cuando se activa) */}
        {showProfile && (
          <Card className="mb-6 lg:hidden">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Información del Perfil
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-stone-600">Nombre Comercial</p>
                <p className="font-medium">{user.businessName}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600">Razón Social</p>
                <p className="font-medium">{user.legalName}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600">Email</p>
                <p className="font-medium">{user.email}</p>
              </div>
              <div>
                <p className="text-sm text-stone-600">Teléfono</p>
                <p className="font-medium">{user.phone}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Grid de métricas y avisos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Pedidos Confirmados */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600 mb-1">Pedidos Confirmados</p>
                  <p className="text-2xl font-bold text-green-700">
                    {user.recentOrders.filter((_, i) => i % 2 === 0).length}
                  </p>
                  <Badge variant="default" className="text-xs mt-1 bg-green-100 text-green-800">
                    Listos para entrega
                  </Badge>
                </div>
                <Package className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Pedidos Pendientes Confirmación */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600 mb-1">Pendientes Confirmación</p>
                  <p className="text-2xl font-bold text-amber-700">
                    {Math.ceil(user.recentOrders.length / 2)}
                  </p>
                  <Badge variant="secondary" className="text-xs mt-1 bg-amber-100 text-amber-800">
                    Máximo 2 horas
                  </Badge>
                </div>
                <Clock className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          {/* Última Compra */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600 mb-1">Última Compra</p>
                  <p className="text-sm font-medium text-stone-800">
                    {user.lastPurchase ? formatDate(user.lastPurchase) : 'Sin compras'}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          {/* Repetir Pedido */}
          <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => setShowRepeatOrderModal(true)}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600 mb-1">Pedidos</p>
                  <p className="text-sm font-medium text-green-600">
                    Repetir Pedido
                  </p>
                </div>
                <FileText className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Avisos y Notificaciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Avisos Importantes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Avisos Importantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.pendingPayments > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-red-800 mb-1">
                    Tienes {user.pendingPayments} pago(s) pendiente(s)
                  </p>
                  <p className="text-xs text-red-600">
                    Contacta con atención al cliente para regularizar tu cuenta
                  </p>
                </div>
              )}
              
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm font-medium text-amber-800 mb-1">
                  🍪 ¡Nuevo sabor disponible!
                </p>
                <p className="text-xs text-amber-600">
                  Prueba nuestras galletas de Maracuyá con descuento especial
                </p>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm font-medium text-green-800 mb-1">
                  🎉 Promoción Enero 2024
                </p>
                <p className="text-xs text-green-600">
                  15% de descuento adicional en pedidos mayores a S/ 500
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pedidos Recientes Detalle */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Actividad Reciente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {user.recentOrders.length > 0 ? (
                user.recentOrders.map((orderId, index) => (
                  <div key={orderId} className="flex items-center justify-between p-2 bg-stone-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-stone-800">
                        Pedido #{orderId}
                      </p>
                      <p className="text-xs text-stone-600">
                        {index === 0 ? 'Hace 3 días' : index === 1 ? 'Hace 1 semana' : 'Hace 2 semanas'}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {index === 0 ? 'Entregado' : 'En tránsito'}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-stone-600 text-center py-4">
                  No hay pedidos recent es
                </p>
              )}
              
              {/* Botón Repetir Pedido Destacado */}
              <Button
                onClick={() => setShowRepeatOrderModal(true)}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Repetir Pedido Anterior
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Modal Repetir Pedido */}
        <RepeatOrderModal 
          isOpen={showRepeatOrderModal}
          onClose={() => setShowRepeatOrderModal(false)}
        />
      </div>
    </div>
  );
};
