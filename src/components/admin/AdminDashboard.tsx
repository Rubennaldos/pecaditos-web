
import { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  Truck, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * DASHBOARD PRINCIPAL DEL ADMIN
 * 
 * Muestra métricas, gráficos y resúmenes ejecutivos
 * Personalizable según el perfil del usuario
 * 
 * PARA PERSONALIZAR:
 * - Conectar con datos reales de Firebase
 * - Modificar métricas mostradas
 * - Agregar más gráficos y visualizaciones
 */

export const AdminDashboard = () => {
  const { user } = useAdmin();
  
  // Mock data - EDITAR AQUÍ para conectar con datos reales
  const mockStats = {
    todayOrders: 24,
    todayRevenue: 1850,
    pendingOrders: 8,
    deliveredOrders: 16,
    activeProducts: 12,
    totalCustomers: 145,
    lowStockProducts: 3,
    pendingPayments: 5
  };

  const recentOrders = [
    { id: 'ORD-001', customer: 'María García', total: 85, status: 'En preparación', time: '10:30' },
    { id: 'ORD-002', customer: 'Carlos López', total: 120, status: 'En reparto', time: '09:45' },
    { id: 'ORD-003', customer: 'Ana Silva', total: 65, status: 'Entregado', time: '09:15' },
    { id: 'ORD-004', customer: 'Luis Mendoza', total: 95, status: 'En preparación', time: '08:50' }
  ];

  const topProducts = [
    { name: 'Galletas Chocochips', sold: 45, revenue: 562.5 },
    { name: 'Combo Familiar', sold: 12, revenue: 780 },
    { name: 'Galletas de Avena', sold: 38, revenue: 418 },
    { name: 'Galletas de Maracuyá', sold: 22, revenue: 297 }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'entregado': return 'text-green-600 bg-green-50';
      case 'en reparto': return 'text-blue-600 bg-blue-50';
      case 'en preparación': return 'text-amber-600 bg-amber-50';
      default: return 'text-stone-600 bg-stone-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Dashboard</h1>
          <p className="text-stone-600 mt-1">
            Bienvenido, {user?.name} - Panel {user?.profile.toUpperCase()}
          </p>
        </div>
        <div className="mt-4 md:mt-0 text-sm text-stone-500">
          Último acceso: {user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pedidos Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{mockStats.todayOrders}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +12% vs ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ventas Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">S/ {mockStats.todayRevenue}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8% vs ayer
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pedidos Pendientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{mockStats.pendingOrders}</div>
            <p className="text-xs text-stone-500 mt-1">En preparación/reparto</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Completados Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{mockStats.deliveredOrders}</div>
            <p className="text-xs text-stone-500 mt-1">Entregados exitosamente</p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas y notificaciones */}
      {mockStats.lowStockProducts > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Importantes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm text-amber-700">
                • {mockStats.lowStockProducts} productos con stock bajo
              </p>
              <p className="text-sm text-amber-700">
                • {mockStats.pendingPayments} facturas pendientes de cobro
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pedidos recientes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Pedidos Recientes
            </CardTitle>
            <CardDescription>Últimos pedidos del día</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{order.id}</p>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 mt-1">{order.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">S/ {order.total}</p>
                    <p className="text-xs text-stone-500">{order.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Productos más vendidos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Top Productos
            </CardTitle>
            <CardDescription>Más vendidos esta semana</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-amber-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-stone-500">{product.sold} unidades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">S/ {product.revenue}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
