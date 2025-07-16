
import { useState } from 'react';
import { AdminProvider, useAdmin } from '@/contexts/AdminContext';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { SystemConfiguration } from '@/components/admin/SystemConfiguration';
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
      id: 'system-config',
      name: 'Configuración',
      icon: Settings,
      section: 'users',
      description: 'Sistema, usuarios y parámetros'
    },
    {
      id: 'promotions',
      name: 'Promociones',
      icon: Gift,
      section: 'promotions',
      description: 'Campañas y ofertas'
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
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'system-config':
        return <SystemConfiguration />;
      case 'promotions':
        return (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-stone-800">Gestión de Promociones</h1>
              <p className="text-stone-600 mt-1">Administra campañas y promociones mayoristas</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-6 bg-blue-50 rounded-lg">
                <h3 className="font-medium mb-2">Campañas Activas</h3>
                <p className="text-sm text-stone-500 mb-4">0 campañas en curso</p>
                <Button>Crear Nueva Campaña</Button>
              </div>
              <div className="p-6 bg-green-50 rounded-lg">
                <h3 className="font-medium mb-2">Promociones Programadas</h3>
                <p className="text-sm text-stone-500 mb-4">0 promociones pendientes</p>
                <Button variant="outline">Ver Programadas</Button>
              </div>
            </div>
          </div>
        );
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
      case 'orders-admin':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Gestión de Pedidos (SuperAdmin)</h2>
                <p className="text-stone-600">Control total con privilegios de edición</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver como Usuario
                </Button>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Modo Edición
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800">Privilegios Admin</h3>
                <ul className="text-sm text-blue-600 mt-2 space-y-1">
                  <li>• Editar cualquier pedido</li>
                  <li>• Revertir cambios</li>
                  <li>• Ver historial completo</li>
                  <li>• Enviar mensajes</li>
                </ul>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-medium text-amber-800">Acciones Rápidas</h3>
                <div className="space-y-2 mt-2">
                  <Button variant="outline" size="sm" className="w-full">Aceptar Todos Pendientes</Button>
                  <Button variant="outline" size="sm" className="w-full">Exportar Reporte</Button>
                </div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800">Estado Actual</h3>
                <p className="text-sm text-green-600 mt-2">Sistema funcionando correctamente</p>
              </div>
            </div>
            <p className="text-stone-600">Interfaz de pedidos con privilegios de administrador - Por implementar vista completa</p>
          </div>
        );
      case 'delivery-admin':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Control de Reparto (SuperAdmin)</h2>
                <p className="text-stone-600">Supervisión completa de entregas</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  Vista Repartidor
                </Button>
                <Button variant="outline" size="sm">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar Mensaje
                </Button>
              </div>
            </div>
            <p className="text-stone-600">Módulo de reparto con privilegios administrativos - Por implementar</p>
          </div>
        );
      case 'production-admin':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Control de Producción (SuperAdmin)</h2>
                <p className="text-stone-600">Gestión completa de inventario</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Editar Parámetros
                </Button>
                <Button variant="outline" size="sm">
                  <Database className="h-4 w-4 mr-2" />
                  Historial Completo
                </Button>
              </div>
            </div>
            <p className="text-stone-600">Módulo de producción con privilegios administrativos - Por implementar</p>
          </div>
        );
      case 'billing-admin':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Supervisión de Cobranzas (SuperAdmin)</h2>
                <p className="text-stone-600">Control financiero completo</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Corregir Pagos
                </Button>
                <Button variant="outline" size="sm">
                  <Shield className="h-4 w-4 mr-2" />
                  Revertir Cambios
                </Button>
              </div>
            </div>
            <p className="text-stone-600">Módulo de cobranzas con privilegios administrativos - Por implementar</p>
          </div>
        );
      case 'customers-admin':
        return (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">Gestión de Clientes (SuperAdmin)</h2>
                <p className="text-stone-600">Administración completa de clientes</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar Datos
                </Button>
                <Button variant="outline" size="sm">
                  <Gift className="h-4 w-4 mr-2" />
                  Promociones
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-blue-800">Clientes Activos</h3>
                <p className="text-2xl font-bold text-blue-600 mt-2">89</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-green-800">Buenos Pagadores</h3>
                <p className="text-2xl font-bold text-green-600 mt-2">67</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg">
                <h3 className="font-medium text-amber-800">En Seguimiento</h3>
                <p className="text-2xl font-bold text-amber-600 mt-2">15</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <h3 className="font-medium text-red-800">Morosos</h3>
                <p className="text-2xl font-bold text-red-600 mt-2">7</p>
              </div>
            </div>
            <p className="text-stone-600">Gestión avanzada de clientes - Por implementar vista completa</p>
          </div>
        );
      case 'audit':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Sistema de Auditoría</h2>
            <p className="text-stone-600">Registro completo de actividades del sistema - Por implementar</p>
          </div>
        );
      case 'messages':
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Centro de Mensajes</h2>
            <p className="text-stone-600">Comunicación interna con todos los perfiles - Por implementar</p>
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
                {user.name.split(' ')[0][0]}
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
