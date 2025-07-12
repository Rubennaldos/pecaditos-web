
import { Bell, FileText, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

/**
 * DASHBOARD RESUMEN DEL USUARIO
 * 
 * Mini-dashboard que muestra:
 * - Pedidos recientes del usuario
 * - Avisos de promociones y novedades
 * - Botón para cotización especial
 * 
 * PARA PERSONALIZAR:
 * - Conectar con datos reales del usuario desde Firebase
 * - Modificar avisos y notificaciones
 * - Personalizar formulario de cotización
 */

export const DashboardSummary = () => {
  // TODO: Obtener datos reales del usuario logueado desde Firebase
  const userOrders = []; // Simular sin pedidos por ahora
  const hasUnreadNotifications = true;

  return (
    <section className="py-6 bg-stone-50 border-b border-stone-200">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-3 gap-4">
          {/* Pedidos recientes */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-stone-800">Mis Pedidos</h3>
              </div>
              
              {userOrders.length > 0 ? (
                <div className="space-y-2">
                  {/* TODO: Mostrar pedidos reales */}
                  <p className="text-sm text-stone-600">Pedido #ORD001 - En camino</p>
                  <p className="text-sm text-stone-600">Pedido #ORD002 - Entregado</p>
                </div>
              ) : (
                <p className="text-sm text-stone-500">
                  Aún no tienes pedidos. ¡Haz tu primer pedido!
                </p>
              )}
              
              <Button variant="outline" size="sm" className="w-full mt-3">
                Ver historial
              </Button>
            </CardContent>
          </Card>

          {/* Avisos y notificaciones */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-amber-100 rounded-lg relative">
                  <Bell className="h-5 w-5 text-amber-600" />
                  {hasUnreadNotifications && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                  )}
                </div>
                <h3 className="font-semibold text-stone-800">Avisos</h3>
              </div>
              
              <div className="space-y-2">
                <div className="p-2 bg-amber-50 rounded-lg">
                  <p className="text-sm font-medium text-amber-800">¡Nuevo sabor disponible!</p>
                  <p className="text-xs text-amber-700">Galletas de maracuyá ya disponibles</p>
                </div>
                <div className="p-2 bg-green-50 rounded-lg">
                  <p className="text-sm font-medium text-green-800">Descuento activo</p>
                  <p className="text-xs text-green-700">10% OFF en combos familiares</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cotización especial */}
          <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageCircle className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-stone-800">Pedido Especial</h3>
              </div>
              
              <p className="text-sm text-stone-600 mb-3">
                ¿Necesitas algo personalizado? Solicita una cotización especial.
              </p>
              
              <Button 
                className="w-full bg-purple-500 hover:bg-purple-600 text-white"
                onClick={() => {
                  // TODO: Abrir modal de cotización especial
                  alert('Próximamente: Formulario de cotización especial');
                }}
              >
                Solicitar cotización
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
