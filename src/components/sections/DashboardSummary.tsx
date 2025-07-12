
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Gift, MessageSquare, Bell } from 'lucide-react';

export const DashboardSummary = () => {
  // Mock data - en producción vendría de Firebase
  const recentOrders = [
    { id: 'ORD001', status: 'En camino', items: 6 },
    { id: 'ORD002', status: 'Entregado', items: 12 }
  ];

  const notifications = [
    '¡Nuevo sabor de quinua disponible!',
    'Descuento especial este fin de semana',
    'Tu pedido anterior fue calificado ⭐⭐⭐⭐⭐'
  ];

  return (
    <section className="py-6 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-800">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-3 gap-4 max-w-6xl mx-auto">
          
          {/* Pedidos Recientes */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Clock className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-foreground">Tus Pedidos Recientes</h3>
              </div>
              <div className="space-y-2">
                {recentOrders.length > 0 ? (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{order.id}</span>
                      <span className="font-medium text-foreground">{order.status}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No tienes pedidos recientes</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notificaciones */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <Bell className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-foreground">Novedades</h3>
              </div>
              <div className="space-y-1">
                {notifications.slice(0, 2).map((notification, index) => (
                  <p key={index} className="text-xs text-muted-foreground line-clamp-2">
                    {notification}
                  </p>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Cotización Especial */}
          <Card className="hover:shadow-lg transition-shadow duration-300 bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 mb-3">
                <MessageSquare className="h-5 w-5 text-amber-600" />
                <h3 className="font-semibold text-foreground">¿Pedido Especial?</h3>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                ¿Necesitas un sabor personalizado o cantidad especial?
              </p>
              <Button 
                size="sm" 
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                onClick={() => console.log('Abrir formulario cotización')}
              >
                Solicitar Cotización
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
