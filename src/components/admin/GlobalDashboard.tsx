import { useState } from 'react';
import { 
  BarChart3, 
  Package, 
  Users, 
  Truck, 
  DollarSign, 
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Calendar,
  Star,
  ShoppingCart,
  Building,
  CreditCard,
  Award
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';

export const GlobalDashboard = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });

  // Mock global data - integrar con base de datos real
  const globalKPIs = {
    totalOrders: 156,
    activeOrders: 24,
    totalRevenue: 45680,
    pendingPayments: 12500,
    deliveryCompliance: 94.5,
    averagePaymentTime: 12,
    overdueInvoices: 8,
    stockAlerts: 3,
    activeClients: 89,
    newClients: 12
  };

  const rankings = {
    topPayers: [
      { name: 'Corporación ABC', score: 5, amount: 8500 },
      { name: 'Distribuidora XYZ', score: 5, amount: 7200 },
      { name: 'Comercial 123', score: 4, amount: 6800 }
    ],
    topDebtors: [
      { name: 'Cliente Moroso 1', debt: 2500, days: 45 },
      { name: 'Cliente Moroso 2', debt: 1800, days: 32 },
      { name: 'Cliente Moroso 3', debt: 1200, days: 28 }
    ],
    topProducts: [
      { name: 'Galletas Chocochips', sold: 245, revenue: 3675 },
      { name: 'Combo Familiar', sold: 89, revenue: 5785 },
      { name: 'Galletas de Avena', sold: 178, revenue: 2314 }
    ]
  };

  const chartData = {
    monthlyRevenue: [
      { month: 'Ene', revenue: 32000, orders: 120 },
      { month: 'Feb', revenue: 38000, orders: 145 },
      { month: 'Mar', revenue: 45680, orders: 156 }
    ],
    paymentStatus: [
      { status: 'Pagado', value: 75, color: '#22c55e' },
      { status: 'Pendiente', value: 20, color: '#f59e0b' },
      { status: 'Vencido', value: 5, color: '#ef4444' }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Dashboard Global</h1>
          <p className="text-stone-600 mt-1">Vista general de todas las operaciones</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-4">
          <DatePickerWithRange 
            date={dateRange} 
            setDate={setDateRange}
            className="w-fit"
          />
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* KPIs Globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Pedidos Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{globalKPIs.activeOrders}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +15% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ingresos Mes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">S/ {globalKPIs.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +8% vs mes anterior
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Por Cobrar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">S/ {globalKPIs.pendingPayments.toLocaleString()}</div>
            <p className="text-xs text-amber-600 mt-1">{globalKPIs.overdueInvoices} facturas vencidas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Cumplimiento
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{globalKPIs.deliveryCompliance}%</div>
            <p className="text-xs text-stone-500 mt-1">Entregas a tiempo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-stone-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Clientes Activos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-stone-800">{globalKPIs.activeClients}</div>
            <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
              <TrendingUp className="h-3 w-3" />
              +{globalKPIs.newClients} nuevos
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alertas Críticas */}
      {(globalKPIs.overdueInvoices > 0 || globalKPIs.stockAlerts > 0) && (
        <Card className="border-red-200 bg-red-50 animate-pulse">
          <CardHeader className="pb-3">
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Alertas Críticas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {globalKPIs.overdueInvoices > 0 && (
                <p className="text-sm text-red-700">
                  • {globalKPIs.overdueInvoices} facturas vencidas requieren atención inmediata
                </p>
              )}
              {globalKPIs.stockAlerts > 0 && (
                <p className="text-sm text-red-700">
                  • {globalKPIs.stockAlerts} productos con stock crítico
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Buenos Pagadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Top Buenos Pagadores
            </CardTitle>
            <CardDescription>Clientes más puntuales</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.topPayers.map((payer, index) => (
                <div key={payer.name} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-green-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{payer.name}</p>
                      <div className="flex items-center gap-1">
                        {[...Array(payer.score)].map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">S/ {payer.amount.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Morosos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Top Morosos
            </CardTitle>
            <CardDescription>Requieren seguimiento</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.topDebtors.map((debtor, index) => (
                <div key={debtor.name} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-red-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{debtor.name}</p>
                      <p className="text-xs text-red-500">{debtor.days} días vencido</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-red-600">S/ {debtor.debt.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Productos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Top Productos
            </CardTitle>
            <CardDescription>Más vendidos del mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {rankings.topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-blue-500">{product.sold} unidades</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">S/ {product.revenue.toLocaleString()}</p>
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
