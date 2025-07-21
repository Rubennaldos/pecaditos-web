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
  AlertTriangle
} from 'lucide-react';
import { InventoryModule } from '@/components/logistics/InventoryModule';
import { PurchaseOrdersModule } from '@/components/logistics/PurchaseOrdersModule';
import { MovementHistoryModule } from '@/components/logistics/MovementHistoryModule';
import { ReportsModule } from '@/components/logistics/ReportsModule';
import { SettingsModule } from '@/components/logistics/SettingsModule';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const LogisticsPanelContent = () => {
  const { user, logout, isAdminMode, toggleAdminMode } = useLogistics();
  const [activeSection, setActiveSection] = useState('inventory');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) {
    return <LogisticsLogin />;
  }

  const navigationItems = [
    { 
      id: 'inventory', 
      label: 'Inventario', 
      icon: Package, 
      description: 'Gestión de productos e insumos' 
    },
    { 
      id: 'purchase-orders', 
      label: 'Órdenes de Compra', 
      icon: ShoppingCart, 
      description: 'Generar y gestionar compras' 
    },
    { 
      id: 'movement-history', 
      label: 'Historial de Movimientos', 
      icon: History, 
      description: 'Registro de ingresos y egresos' 
    },
    { 
      id: 'reports', 
      label: 'Reportes', 
      icon: BarChart3, 
      description: 'Análisis y estadísticas' 
    },
    { 
      id: 'settings', 
      label: 'Configuración', 
      icon: Settings, 
      description: 'Categorías y proveedores' 
    }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    });
  };

  const renderContent = () => {
    switch (activeSection) {
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
        return <InventoryModule />;
    }
  };

  const currentSection = navigationItems.find(item => item.id === activeSection);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        {/* Sidebar Desktop */}
        <Sidebar className="hidden md:flex w-64 border-r border-border">
          <SidebarContent className="p-4">
            {/* Header */}
            <div className="mb-6 border-b border-border pb-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Logística</h2>
                {user.email === 'admin@pecaditos.com' && (
                  <Button
                    variant={isAdminMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={toggleAdminMode}
                    className="text-xs"
                  >
                    <Shield className="w-3 h-3 mr-1" />
                    {isAdminMode ? 'Admin ON' : 'Admin OFF'}
                  </Button>
                )}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                {user.name} ({user.email})
              </p>
            </div>

            {/* Navigation */}
            <nav className="space-y-2 flex-1">
              {navigationItems.map((item) => (
                <Button
                  key={item.id}
                  variant={activeSection === item.id ? "default" : "ghost"}
                  className="w-full justify-start text-left"
                  onClick={() => setActiveSection(item.id)}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  <div>
                    <div className="font-medium">{item.label}</div>
                    <div className="text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Button>
              ))}
            </nav>

            {/* Logout */}
            <div className="mt-6 pt-4 border-t border-border">
              <Button
                variant="outline"
                className="w-full justify-start"
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
          <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-background">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-0">
                <div className="p-4">
                  {/* Mobile Header */}
                  <div className="mb-6 border-b border-border pb-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-foreground">Logística</h2>
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
                    <p className="text-sm text-muted-foreground mt-1">
                      {user.name}
                    </p>
                  </div>

                  {/* Mobile Navigation */}
                  <nav className="space-y-2">
                    {navigationItems.map((item) => (
                      <Button
                        key={item.id}
                        variant={activeSection === item.id ? "default" : "ghost"}
                        className="w-full justify-start text-left"
                        onClick={() => {
                          setActiveSection(item.id);
                          setSidebarOpen(false);
                        }}
                      >
                        <item.icon className="w-4 h-4 mr-3" />
                        <div>
                          <div className="font-medium">{item.label}</div>
                          <div className="text-xs text-muted-foreground">{item.description}</div>
                        </div>
                      </Button>
                    ))}
                  </nav>

                  {/* Mobile Logout */}
                  <div className="mt-6 pt-4 border-t border-border">
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

            <div className="flex items-center">
              <h1 className="text-lg font-semibold">{currentSection?.label}</h1>
              {user.email === 'admin@pecaditos.com' && isAdminMode && (
                <AlertTriangle className="w-4 h-4 ml-2 text-destructive" />
              )}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 p-4 md:p-6 overflow-auto">
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