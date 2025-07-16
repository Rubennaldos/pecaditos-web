
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
  Star,
  ShoppingCart,
  Building,
  CreditCard,
  Award,
  ChevronRight
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

  const [showMorePayers, setShowMorePayers] = useState(false);
  const [showMoreDebtors, setShowMoreDebtors] = useState(false);
  const [showMoreProducts, setShowMoreProducts] = useState(false);

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
      { name: 'Comercial 123', score: 4, amount: 6800 },
      { name: 'Empresa Delta', score: 5, amount: 6200 },
      { name: 'Negocio Alpha', score: 4, amount: 5800 },
      { name: 'Comercial Beta', score: 4, amount: 5400 },
      { name: 'Distribuidora Gamma', score: 5, amount: 5100 },
      { name: 'Empresa Theta', score: 4, amount: 4900 },
      { name: 'Negocio Omega', score: 3, amount: 4600 },
      { name: 'Comercial Sigma', score: 4, amount: 4300 },
      { name: 'Extra Cliente 1', score: 3, amount: 4000 },
      { name: 'Extra Cliente 2', score: 4, amount: 3800 }
    ],
    topDebtors: [
      { name: 'Cliente Moroso 1', debt: 2500, days: 45 },
      { name: 'Cliente Moroso 2', debt: 1800, days: 32 },
      { name: 'Cliente Moroso 3', debt: 1200, days: 28 },
      { name: 'Cliente Moroso 4', debt: 1100, days: 25 },
      { name: 'Cliente Moroso 5', debt: 980, days: 22 },
      { name: 'Cliente Moroso 6', debt: 850, days: 20 },
      { name: 'Cliente Moroso 7', debt: 750, days: 18 },
      { name: 'Cliente Moroso 8', debt: 650, days: 15 },
      { name: 'Cliente Moroso 9', debt: 580, days: 12 },
      { name: 'Cliente Moroso 10', debt: 520, days: 10 },
      { name: 'Extra Moroso 1', debt: 450, days: 8 },
      { name: 'Extra Moroso 2', debt: 380, days: 6 }
    ],
    topProducts: [
      { name: 'Galletas Chocochips', sold: 245, revenue: 3675 },
      { name: 'Combo Familiar', sold: 89, revenue: 5785 },
      { name: 'Galletas de Avena', sold: 178, revenue: 2314 },
      { name: 'Pack Premium', sold: 156, revenue: 4680 },
      { name: 'Galletas Integrales', sold: 134, revenue: 2010 },
      { name: 'Mix Especial', sold: 112, revenue: 3360 },
      { name: 'Galletas Clásicas', sold: 98, revenue: 1470 },
      { name: 'Combo Infantil', sold: 87, revenue: 2610 },
      { name: 'Pack Ejecutivo', sold: 76, revenue: 2280 },
      { name: 'Galletas Artesanales', sold: 65, revenue: 1950 },
      { name: 'Extra Producto 1', sold: 54, revenue: 1620 },
      { name: 'Extra Producto 2', sold: 43, revenue: 1290 }
    ]
  };

  const getDisplayedPayers = () => showMorePayers ? rankings.topPayers : rankings.topPayers.slice(0, 10);
  const getDisplayedDebtors = () => showMoreDebtors ? rankings.topDebtors : rankings.topDebtors.slice(0, 10);
  const getDisplayedProducts = () => showMoreProducts ? rankings.topProducts : rankings.topProducts.slice(0, 10);

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

      {/* Rankings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Buenos Pagadores */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Top Buenos Pagadores
            </CardTitle>
            <CardDescription>Los {getDisplayedPayers().length} mejores clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getDisplayedPayers().map((payer, index) => (
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
              {rankings.topPayers.length > 10 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowMorePayers(!showMorePayers)}
                >
                  {showMorePayers ? 'Ver menos' : 'Ver más'}
                  <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showMorePayers ? 'rotate-90' : ''}`} />
                </Button>
              )}
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
            <CardDescription>Los {getDisplayedDebtors().length} que más deben</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getDisplayedDebtors().map((debtor, index) => (
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
              {rankings.topDebtors.length > 10 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowMoreDebtors(!showMoreDebtors)}
                >
                  {showMoreDebtors ? 'Ver menos' : 'Ver más'}
                  <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showMoreDebtors ? 'rotate-90' : ''}`} />
                </Button>
              )}
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
            <CardDescription>Los {getDisplayedProducts().length} más vendidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getDisplayedProducts().map((product, index) => (
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
              {rankings.topProducts.length > 10 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowMoreProducts(!showMoreProducts)}
                >
                  {showMoreProducts ? 'Ver menos' : 'Ver más'}
                  <ChevronRight className={`h-4 w-4 ml-1 transition-transform ${showMoreProducts ? 'rotate-90' : ''}`} />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
