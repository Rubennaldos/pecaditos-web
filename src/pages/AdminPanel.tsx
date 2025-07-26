import { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { SystemConfiguration } from '@/components/admin/SystemConfiguration';
import { MessagesModule } from '@/components/admin/MessagesModule';
import { AuditModule } from '@/components/admin/AuditModule';
import { ConsolidatedAdminModule } from '@/components/admin/ConsolidatedAdminModule';
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
  X,
  Shield,
  Building,
  Gift,
  MapPin,
  Database,
  Eye,
  Edit,
  MessageSquare
} from 'lucide-react';

// Import the complete module components
import OrdersPanel from './OrdersPanel';
import DeliveryPanel from './DeliveryPanel';
import ProductionPanel from './ProductionPanel';
import BillingPanel from './BillingPanel';
import { ClientsManagement } from '@/components/clients/ClientsManagement';

const AdminPanelContent = () => {
  const { user, logout, canAccessSection } = useAdmin();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user) {
    // Mostrar un loader, o simplemente null. El acceso está protegido por ProtectedRoute
    return null;
  }

  const navigationItems = [
    {
      id: 'dashboard',
      name: 'Dashboard Global',
      icon: BarChart3,
      section: 'dashboard',
      description: 'Vista completa del sistema'
    },
    {
      id: 'orders-admin',
      name: 'Pedidos (Admin)',
      icon: Package,
      section: 'orders',
      description: 'Control total de pedidos',
      superAdmin: true
    },
    {
      id: 'delivery-admin',
      name: 'Reparto (Admin)',
      icon: Truck,
      section: 'delivery',
      description: 'Supervisión de entregas',
      superAdmin: true
    },
    {
      id: 'production-admin',
      name: 'Producción (Admin)',
      icon: Factory,
      section: 'production',
      description: 'Control de inventario',
      superAdmin: true
    },
    {
      id: 'billing-admin',
      name: 'Cobranzas (Admin)',
      icon: DollarSign,
      section: 'billing',
      description: 'Supervisión financiera',
      superAdmin: true
    },
    {
      id: 'customers-admin',
      name: 'Clientes (Admin)',
      icon: Users,
      section: 'customers',
      description: 'Gestión de clientes',
      superAdmin: true
    },
    {
      id: 'business-admin',
      name: 'Gestión Comercial',
      icon: Building,
      section: 'business',
      description: 'Catálogos, mayoristas y promociones'
    },
    {
      id: 'system-config',
      name: 'Configuración',
      icon: Settings,
      section: 'users',
      description: 'Sistema, usuarios y parámetros'
    },
    {
      id: 'locations',
      name: 'Ubicaciones',
      icon: MapPin,
      section: 'locations',
      description: 'Sedes y puntos de venta'
    },
    {
      id: 'audit',
      name: 'Auditoría',
      icon: Shield,
      section: 'audit',
      description: 'Logs y seguimiento'
    },
    {
      id: 'messages',
      name: 'Mensajes',
      icon: MessageSquare,
      section: 'messages',
      description: 'Comunicación interna'
    }
  ];

  const visibleItems = navigationItems.filter(item => 
    user.profile === 'admin' && (canAccessSection(item.section) || item.superAdmin)
  );

  const handleLogout = () => {
    logout();
    // Redirigir a página de bienvenida (landing)
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'orders-admin':
        return (
          <div className="relative">
            <div className="absolute top-4 right-4 z-50">
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Modo SuperAdmin
              </div>
            </div>
            <OrdersPanel />
          </div>
        );
      case 'delivery-admin':
        return (
          <div className="relative">
            <div className="absolute top-4 right-4 z-50">
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Modo SuperAdmin
              </div>
            </div>
            <DeliveryPanel />
          </div>
        );
      case 'production-admin':
        return (
          <div className="relative">
            <div className="absolute top-4 right-4 z-50">
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Modo SuperAdmin
              </div>
            </div>
            <ProductionPanel />
          </div>
        );
      case 'billing-admin':
        return (
          <div className="relative">
            <div className="absolute top-4 right-4 z-50">
              <div className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                <Shield className="h-3 w-3" />
                Modo SuperAdmin
              </div>
            </div>
            <BillingPanel />
          </div>
        );
      case 'customers-admin':
        return <ClientsManagement />;
      case 'business-admin':
        return <ConsolidatedAdminModule />;
      case 'system-config':
        return <SystemConfiguration />;
      case 'locations':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Gestión de Ubicaciones</h1>
              <p className="text-stone-600 mt-1">Administra puntos de venta y sedes</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-amber-50 rounded-lg">
                <h3 className="font-medium mb-2">Sede Principal</h3>
                <p className="text-sm text-stone-500 mb-4">Av. Principal 123, Lima</p>
                <Button>Editar Sede</Button>
              </div>
              <div className="p-6 bg-purple-50 rounded-lg">
                <h3 className="font-medium mb-2">Puntos de Venta</h3>
                <p className="text-sm text-stone-500 mb-4">3 ubicaciones activas</p>
                <Button variant="outline">Gestionar Puntos</Button>
              </div>
            </div>
          </div>
        );
      case 'audit':
        return <AuditModule />;
      case 'messages':
        return <MessagesModule />;
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
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h2 className="text-lg font-bold text-stone-800">SuperAdmin</h2>
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
                    ? 'bg-purple-50 text-purple-700 border border-purple-200'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-stone-800'
                }`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-xs text-stone-400 truncate">{item.description}</p>
                </div>
                {item.superAdmin && (
                  <Shield className="h-3 w-3 text-purple-500" />
                )}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-stone-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold text-purple-600">
                {user.name?.split(' ')[0][0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-800 truncate">{user.name}</p>
              <p className="text-xs text-purple-600 font-medium">SUPERADMIN</p>
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
          <h1 className="text-lg font-semibold text-stone-800">Panel SuperAdmin</h1>
          <div></div>
        </header>

        {/* Page content */}
        <main className="flex-1">
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
  return <AdminPanelContent />;
};

export default AdminPanel;
