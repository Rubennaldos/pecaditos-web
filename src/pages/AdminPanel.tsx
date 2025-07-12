
import { useState } from 'react';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { Button } from '@/components/ui/button';
import { 
  LogOut, 
  BarChart3, 
  Package, 
  Truck, 
  Factory, 
  Users, 
  DollarSign,
  Settings,
  Menu,
  X
} from 'lucide-react';

/**
 * PÁGINA PRINCIPAL DEL PANEL DE ADMINISTRACIÓN
 * 
 * Ruta: /admin
 * 
 * Incluye:
 * - Login único para todos los perfiles
 * - Navegación lateral adaptativa según permisos
 * - Dashboard principal con métricas
 * - Secciones especializadas por perfil
 * 
 * PARA PERSONALIZAR:
 * - Modificar rutas y navegación
 * - Agregar más secciones
 * - Personalizar permisos por perfil
 */

const AdminPanelContent = () => {
  const { user, logout, canAccessSection } = useAdmin();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    return <AdminLogin onLoginSuccess={() => {}} />;
  }

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard',
      icon: BarChart3,
      section: 'dashboard',
      description: 'Métricas y resumen general'
    },
    {
      id: 'orders',
      name: 'Pedidos',
      icon: Package,
      section: 'orders',
      description: 'Gestión de pedidos y estados'
    },
    {
      id: 'delivery',
      name: 'Reparto',
      icon: Truck,
      section: 'delivery',
      description: 'Control de entregas'
    },
    {
      id: 'production',
      name: 'Producción',
      icon: Factory,
      section: 'production',
      description: 'Control de inventario y stock'
    },
    {
      id: 'customers',
      name: 'Clientes',
      icon: Users,
      section: 'customers',
      description: 'Seguimiento de clientes'
    },
    {
      id: 'billing',
      name: 'Cobranzas',
      icon: DollarSign,
      section: 'billing',
      description: 'Facturación y pagos'
    },
    {
      id: 'settings',
      name: 'Configuración',
      icon: Settings,
      section: 'users',
      description: 'Usuarios y configuración'
    }
  ];

  const visibleItems = navigationItems.filter(item => canAccessSection(item.section));

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'orders':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Gestión de Pedidos</h2>
            <p className="text-stone-600">Módulo de pedidos - Por implementar</p>
          </div>
        );
      case 'delivery':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Control de Reparto</h2>
            <p className="text-stone-600">Módulo de reparto - Por implementar</p>
          </div>
        );
      case 'production':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Control de Producción</h2>
            <p className="text-stone-600">Módulo de producción - Por implementar</p>
          </div>
        );
      case 'customers':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Seguimiento de Clientes</h2>
            <p className="text-stone-600">Módulo de clientes - Por implementar</p>
          </div>
        );
      case 'billing':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Gestión de Cobranzas</h2>
            <p className="text-stone-600">Módulo de cobranzas - Por implementar</p>
          </div>
        );
      case 'settings':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Configuración del Sistema</h2>
            <p className="text-stone-600">Módulo de configuración - Por implementar</p>
          </div>
        );
      default:
        return <AdminDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-stone-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <h2 className="text-lg font-bold text-stone-800">Admin Panel</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {visibleItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-stone-400 truncate">{item.description}</p>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-stone-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-stone-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-stone-600">
                {user.name.split(' ')[0][0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{user.name}</p>
              <p className="text-xs text-stone-500 capitalize">{user.profile}</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="h-16 bg-white border-b border-stone-200 flex items-center justify-between px-6 lg:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-semibold text-stone-800">Panel de Administración</h1>
          <div></div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {renderContent()}
        </main>
      </div>

      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

const AdminPanel = () => {
  return (
    <AdminProvider>
      <AdminPanelContent />
    </AdminProvider>
  );
};

export default AdminPanel;
