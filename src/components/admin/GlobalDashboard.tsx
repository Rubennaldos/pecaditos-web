import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { 
  BarChart3, 
  Package, 
  Users, 
  Truck, 
  DollarSign, 
  AlertTriangle,
  CreditCard,
  Award,
  ShoppingCart
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';

export const GlobalDashboard = () => {
  const { user } = useAuth();

  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });

  // DATA (vacío, lo integras luego con Firebase o API)
  const globalKPIs = {
    totalOrders: 0,
    activeOrders: 0,
    totalRevenue: 0,
    pendingPayments: 0,
    deliveryCompliance: 0,
    averagePaymentTime: 0,
    overdueInvoices: 0,
    stockAlerts: 0,
    activeClients: 0,
    newClients: 0
  };

  const rankings = {
    topPayers: [],
    topDebtors: [],
    topProducts: []
  };

  const getDisplayedPayers = () => rankings.topPayers.slice(0, 10);
  const getDisplayedDebtors = () => rankings.topDebtors.slice(0, 10);
  const getDisplayedProducts = () => rankings.topProducts.slice(0, 10);

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

      {/* Alertas Críticas */}
      {(globalKPIs.overdueInvoices > 0 || globalKPIs.stockAlerts > 0) && (
        <Card className="border-red-200 bg-red-50">
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
            <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
              Sin variación
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
            <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
              Sin variación
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
            <p className="text-xs text-stone-400 mt-1">Sin facturas vencidas</p>
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
            <p className="text-xs text-stone-400 flex items-center gap-1 mt-1">
              Sin variación
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Buenos Pagadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Top Buenos Pagadores
            </CardTitle>
            <CardDescription>Sin datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-stone-400 text-sm py-6">No hay datos de pagadores</div>
          </CardContent>
        </Card>

        {/* Top Morosos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Top Morosos
            </CardTitle>
            <CardDescription>Sin datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-stone-400 text-sm py-6">No hay datos de morosos</div>
          </CardContent>
        </Card>

        {/* Top Productos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-600" />
              Top Productos
            </CardTitle>
            <CardDescription>Sin datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center text-stone-400 text-sm py-6">No hay datos de productos</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
