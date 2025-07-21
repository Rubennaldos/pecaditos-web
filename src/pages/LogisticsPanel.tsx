import { useState } from 'react';
import { LogisticsProvider } from '@/contexts/LogisticsContext';
import { LogisticsLogin } from '@/components/logistics/LogisticsLogin';
import { useLogistics } from '@/contexts/LogisticsContext';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Package, 
  ShoppingCart, 
  History, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu,
  Shield,
  AlertTriangle,
  Boxes,
  TrendingUp,
  Users,
  Bell
} from 'lucide-react';
import { InventoryModule } from '@/components/logistics/InventoryModule';
import { PurchaseOrdersModule } from '@/components/logistics/PurchaseOrdersModule';
import { MovementHistoryModule } from '@/components/logistics/MovementHistoryModule';
import { ReportsModule } from '@/components/logistics/ReportsModule';
import { SettingsModule } from '@/components/logistics/SettingsModule';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

const LogisticsPanelContent = () => {
  const { user, logout, isAdminMode, toggleAdminMode, inventory, alerts } = useLogistics();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return <LogisticsLogin />;
  }

  // Calcular estadísticas rápidas
  const lowStockItems = inventory.filter(item => item.currentQuantity <= item.minQuantity);
  const outOfStockItems = inventory.filter(item => item.currentQuantity === 0);
  const expiringItems = inventory.filter(item => {
    if (!item.expirationDate) return false;
    const expDate = new Date(item.expirationDate);
    const today = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 3600 * 24));
    return daysUntilExpiration <= 7 && daysUntilExpiration > 0;
  });

  const navigationItems = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: BarChart3, 
      description: 'Vista general del sistema',
      alertCount: alerts.length
    },
    { 
      id: 'inventory', 
      label: 'Inventario', 
      icon: Package, 
      description: 'Gestión de productos e insumos',
      alertCount: lowStockItems.length + outOfStockItems.length
    },
    { 
      id: 'purchase-orders', 
      label: 'Órdenes de Compra', 
      icon: ShoppingCart, 
      description: 'Generar y gestionar compras',
      alertCount: 0
    },
    { 
      id: 'movement-history', 
      label: 'Historial', 
      icon: History, 
      description: 'Registro de movimientos',
      alertCount: 0
    },
    { 
      id: 'reports', 
      label: 'Reportes', 
      icon: TrendingUp, 
      description: 'Análisis y estadísticas',
      alertCount: 0
    },
    { 
      id: 'settings', 
      label: 'Configuración', 
      icon: Settings, 
      description: 'Categorías y proveedores',
      alertCount: 0
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Sesión cerrada",
      description: "Has salido del sistema de logística correctamente.",
    });
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard de Logística</h1>
          <p className="text-gray-600 mt-1">Panel de control y monitoreo del inventario</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline" className="gap-2">
            <Bell className="h-4 w-4" />
            {alerts.length} Alertas
          </Button>
        </div>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Productos</p>
              <p className="text-3xl font-bold text-gray-900">{inventory.length}</p>
            </div>
            <Boxes className="h-10 w-10 text-blue-500" />
          </div>
          <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Inventario activo
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Stock Bajo</p>
              <p className="text-3xl font-bold text-amber-600">{lowStockItems.length}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-amber-500" />
          </div>
          <p className="text-sm text-amber-600 mt-2">
            Requieren reposición
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Agotados</p>
              <p className="text-3xl font-bold text-red-600">{outOfStockItems.length}</p>
            </div>
            <Package className="h-10 w-10 text-red-500" />
          </div>
          <p className="text-sm text-red-600 mt-2">
            Crítico - Sin stock
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Por Vencer</p>
              <p className="text-3xl font-bold text-orange-600">{expiringItems.length}</p>
            </div>
            <AlertTriangle className="h-10 w-10 text-orange-500" />
          </div>
          <p className="text-sm text-orange-600 mt-2">
            Próximos 7 días
          </p>
        </div>
      </div>

      {/* Alertas críticas */}
      {(lowStockItems.length > 0 || outOfStockItems.length > 0 || expiringItems.length > 0) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-6 w-6 text-red-500 mt-1" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-800 mb-3">Alertas Críticas del Inventario</h3>
              <div className="space-y-2">
                {outOfStockItems.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded border-l-4 border-red-500">
                    <p className="font-medium text-red-800">🚫 {item.name} - AGOTADO</p>
                    <p className="text-sm text-red-600">Stock: 0 unidades (Mínimo: {item.minQuantity})</p>
                  </div>
                ))}
                {lowStockItems.filter(item => item.currentQuantity > 0).map(item => (
                  <div key={item.id} className="bg-white p-3 rounded border-l-4 border-amber-500">
                    <p className="font-medium text-amber-800">⚠️ {item.name} - STOCK BAJO</p>
                    <p className="text-sm text-amber-600">Stock: {item.currentQuantity} unidades (Mínimo: {item.minQuantity})</p>
                  </div>
                ))}
                {expiringItems.map(item => (
                  <div key={item.id} className="bg-white p-3 rounded border-l-4 border-orange-500">
                    <p className="font-medium text-orange-800">⏰ {item.name} - PRÓXIMO A VENCER</p>
                    <p className="text-sm text-orange-600">Fecha de vencimiento: {item.expirationDate}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex gap-3">
                <Button 
                  size="sm" 
                  onClick={() => setActiveSection('purchase-orders')}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Generar Orden de Compra
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setActiveSection('inventory')}
                >
                  Ver Inventario Completo
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resumen de productos más críticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-500" />
            Productos Críticos
          </h3>
          <div className="space-y-3">
            {[...outOfStockItems, ...lowStockItems].slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${item.currentQuantity === 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    {item.currentQuantity} / {item.minQuantity}
                  </p>
                  <p className="text-xs text-gray-500">Stock / Mínimo</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Productos con Stock Saludable
          </h3>
          <div className="space-y-3">
            {inventory.filter(item => item.currentQuantity > item.minQuantity).slice(0, 5).map(item => (
              <div key={item.id} className="flex items-center justify-between p-3 bg-green-50 rounded">
                <div>
                  <p className="font-medium text-gray-900">{item.name}</p>
                  <p className="text-sm text-gray-600">{item.category}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{item.currentQuantity} / {item.maxQuantity}</p>
                  <p className="text-xs text-gray-500">Stock / Máximo</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Acceso rápido */}
      <div className="bg-gradient-to-r from-blue-500 to-green-500 rounded-lg p-6 text-white">
        <h3 className="text-xl font-semibold mb-4">Acciones Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="secondary" 
            className="justify-start h-auto p-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => setActiveSection('inventory')}
          >
            <Package className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Gestionar Inventario</div>
              <div className="text-sm opacity-80">Agregar/editar productos</div>
            </div>
          </Button>
          <Button 
            variant="secondary" 
            className="justify-start h-auto p-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => setActiveSection('purchase-orders')}
          >
            <ShoppingCart className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Nueva Orden</div>
              <div className="text-sm opacity-80">Crear orden de compra</div>
            </div>
          </Button>
          <Button 
            variant="secondary" 
            className="justify-start h-auto p-4 bg-white/20 hover:bg-white/30 text-white border-white/30"
            onClick={() => setActiveSection('reports')}
          >
            <BarChart3 className="h-5 w-5 mr-3" />
            <div className="text-left">
              <div className="font-medium">Ver Reportes</div>
              <div className="text-sm opacity-80">Análisis y estadísticas</div>
            </div>
          </Button>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return renderDashboard();
      case 'inventory':
        return <InventoryModule />;
      case 'purchase-orders':
        return <PurchaseOrdersModule />;
      case 'movement-history':
        return <MovementHistoryModule />;
      case 'reports':
        return <ReportsModule />;
      case 'settings':
        return <SettingsModule />;
      default:
        return renderDashboard();
    }
  };

  const currentSection = navigationItems.find(item => item.id === activeSection);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        {/* Sidebar Desktop */}
        <Sidebar className="hidden md:flex w-72 border-r border-gray-200 bg-white">
          <SidebarContent className="p-6">
            {/* Header */}
            <div className="mb-8 border-b border-gray-200 pb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                    <Boxes className="w-6 h-6 text-white" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Logística</h2>
                </div>
                {user.email === 'admin@pecaditos.com' && (
                  <Button
                    variant={isAdminMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleAdminMode}
                    className="text-xs"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {isAdminMode ? 'Admin' : 'User'}
                  </Button>
                )}
              </div>
              <div className="text-sm text-gray-600">
                <p className="font-medium">{user.name}</p>
                <p className="text-xs">{user.email}</p>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-medium truncate">{item.label}</span>
                      {item.alertCount > 0 && (
                        <Badge variant="destructive" className="text-xs px-1.5 py-0.5 ml-2">
                          {item.alertCount}
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{item.description}</div>
                  </div>
                </Button>
              ))}
            </nav>

            {/* Logout */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <Button
                variant="outline"
                className="w-full justify-start text-gray-600 hover:text-gray-900"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-3" />
                Cerrar Sesión
              </Button>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar - Mobile */}
          <div className="md:hidden flex items-center justify-between p-4 border-b border-gray-200 bg-white">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-6">
                  {/* Mobile Header */}
                  <div className="mb-6 border-b border-gray-200 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center">
                          <Boxes className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Logística</h2>
                      </div>
                      {user.email === 'admin@pecaditos.com' && (
                        <Button
                          variant={isAdminMode ? "destructive" : "outline"}
                          size="sm"
                          onClick={toggleAdminMode}
                          className="text-xs"
                        >
                          <Shield className="w-3 h-3 mr-1" />
                          {isAdminMode ? 'Admin' : 'User'}
                        </Button>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{user.name}</p>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={activeSection === item.id ? "default" : "ghost"}
                        className="w-full justify-start text-left h-auto p-3"
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                      >
                        <item.icon className="w-5 h-5 mr-3" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{item.label}</span>
                            {item.alertCount > 0 && (
                              <Badge variant="destructive" className="text-xs">
                                {item.alertCount}
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </Button>
                    ))}
                  </nav>

                  {/* Mobile Logout */}
                  <div className="mt-6 pt-4 border-t border-gray-200">
                    <Button
                      variant="outline"
                      className="w-full justify-start"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-3" />
                      Cerrar Sesión
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900">{currentSection?.label}</h1>
              {user.email === 'admin@pecaditos.com' && isAdminMode && (
                <Badge variant="destructive" className="text-xs">Admin</Badge>
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-6 overflow-auto">
            {renderContent()}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

const LogisticsPanel = () => {
  return (
    <LogisticsProvider>
      <LogisticsPanelContent />
    </LogisticsProvider>
  );
};

export default LogisticsPanel;