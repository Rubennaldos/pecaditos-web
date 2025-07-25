
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertCircle, Gift, MessageSquare } from 'lucide-react';

interface DashboardSummaryProps {
  isMayorista?: boolean;
}

export const DashboardSummary = ({ isMayorista = false }: DashboardSummaryProps) => {
  // Mock data - EDITAR AQUÍ para personalizar los datos del dashboard
  const mockData = {
    recentOrders: isMayorista ? [
      { id: 'ORD-M001', date: '2024-01-15', status: 'En tránsito', total: 450 },
      { id: 'ORD-M002', date: '2024-01-10', status: 'Entregado', total: 320 }
    ] : [
      { id: 'ORD001', date: '2024-01-15', status: 'En tránsito', total: 85 },
      { id: 'ORD002', date: '2024-01-12', status: 'Entregado', total: 65 }
    ],
    notifications: isMayorista ? [
      { type: 'promo', message: '¡Nuevo descuento por volumen disponible!' },
      { type: 'product', message: 'Galletas de quinua ahora disponibles' }
    ] : [
      { type: 'promo', message: '¡Oferta especial: 15% off en combos familiares!' },
      { type: 'product', message: 'Nuevo sabor: Galletas de cúrcuma y jengibre' }
    ]
  };

  const handleSpecialQuote = () => {
    // Aquí se abriría un modal o formulario para cotización especial
    alert('Funcionalidad de cotización especial - Por implementar');
  };

  return (
    <section className="w-full py-8 bg-stone-50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Pedidos Recientes */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5 text-amber-600" />
                Pedidos Recientes
              </CardTitle>
              <CardDescription>
                {isMayorista ? 'Tus últimas compras mayoristas' : 'Tus últimos pedidos'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{order.id}</p>
                    <p className="text-xs text-stone-500">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={order.status === 'Entregado' ? 'default' : 'secondary'} className="text-xs">
                      {order.status}
                    </Badge>
                    <p className="text-sm font-medium mt-1">S/ {order.total}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Notificaciones y Avisos */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600" />
                Avisos
              </CardTitle>
              <CardDescription>
                Promociones y novedades
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockData.notifications.map((notification, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                  <div className="flex-shrink-0">
                    {notification.type === 'promo' ? (
                      <Gift className="h-4 w-4 text-blue-600 mt-0.5" />
                    ) : (
                      <AlertCircle className="h-4 w-4 text-green-600 mt-0.5" />
                    )}
                  </div>
                  <p className="text-sm text-stone-700">{notification.message}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Cotización Especial */}
          <Card className="bg-white shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-green-600" />
                Cotización Especial
              </CardTitle>
              <CardDescription>
                {isMayorista ? 'Pedidos personalizados para tu negocio' : 'Pedidos fuera del catálogo estándar'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-stone-600">
                  {isMayorista 
                    ? '¿Necesitas cantidades especiales o productos personalizados?'
                    : '¿Necesitas grandes cantidades o sabores especiales?'
                  }
                </p>
                <Button 
                  onClick={handleSpecialQuote}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Solicitar Cotización
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </section>
  );
};
