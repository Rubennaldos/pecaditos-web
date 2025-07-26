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
  ChevronRight,
  Settings,
  Store,
  Megaphone,
  MessageSquare,
  MapPin,
  Boxes
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-picker';
import { DateRange } from 'react-day-picker';
import { ConsolidatedAdminModule } from './ConsolidatedAdminModule';
import { MessagesModule } from './MessagesModule';
import { LogisticsAdminModule } from './LogisticsAdminModule';

export const GlobalDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date()
  });

  const [showMorePayers, setShowMorePayers] = useState(false);
  const [showMoreDebtors, setShowMoreDebtors] = useState(false);
  const [showMoreProducts, setShowMoreProducts] = useState(false);

  // *** LIMPIO - Sin datos de ejemplo ***
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

  const getDisplayedPayers = () => showMorePayers ? rankings.topPayers : rankings.topPayers.slice(0, 10);
  const getDisplayedDebtors = () => showMoreDebtors ? rankings.topDebtors : rankings.topDebtors.slice(0, 10);
  const getDisplayedProducts = () => showMoreProducts ? rankings.topProducts : rankings.topProducts.slice(0, 10);

  const adminTabs = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'gestioner', name: 'Gestión Integrada', icon: Settings },
    { id: 'logistics', name: 'Logística', icon: Boxes },
    { id: 'messages', name: 'Mensajes', icon: MessageSquare },
    { id: 'locations', name: 'Puntos de Venta', icon: MapPin }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'gestioner':
        return <ConsolidatedAdminModule />;
      case 'logistics':
        return <LogisticsAdminModule />;
      case 'messages':
        return <MessagesModule />;
      case 'locations':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Puntos de Venta</h1>
              <p className="text-stone-600 mt-1">Gestiona los puntos donde vendes tus productos</p>
            </div>
            <Card>
              <CardContent className="p-8 text-center">
                <Store className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Puntos de Venta</h3>
                <p className="text-gray-500 mb-4">
                  Gestiona las tiendas y distribuidores donde tus productos están disponibles.<br />
                  Estos puntos aparecerán en la página "Dónde nos ubicamos" para los clientes.
                </p>
                <Button>
                  <Store className="h-4 w-4 mr-2" />
                  Administrar Puntos de Venta
                </Button>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return renderDashboard();
    }
  };

  const renderDashboard = () => (
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
              {/* Sin datos históricos */}
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
              {/* Sin nuevos clientes */}
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
            <div className="space-y-3">
              {getDisplayedPayers().length === 0 ? (
                <div className="text-center text-stone-400 text-sm py-6">No hay datos de pagadores</div>
              ) : (
                getDisplayedPayers().map((payer, index) => (
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
                ))
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
            <CardDescription>Sin datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getDisplayedDebtors().length === 0 ? (
                <div className="text-center text-stone-400 text-sm py-6">No hay datos de morosos</div>
              ) : (
                getDisplayedDebtors().map((debtor, index) => (
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
                ))
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
            <CardDescription>Sin datos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getDisplayedProducts().length === 0 ? (
                <div className="text-center text-stone-400 text-sm py-6">No hay datos de productos</div>
              ) : (
                getDisplayedProducts().map((product, index) => (
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="border-b border-stone-200">
        <nav className="flex space-x-8">
          {adminTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-1 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-amber-500 text-amber-600'
                    : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
                }`}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.name}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
};
