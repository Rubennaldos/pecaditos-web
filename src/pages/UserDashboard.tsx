import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  Package, 
  ShoppingCart, 
  TruckIcon, 
  Factory,
  MapPin,
  BarChart3,
  DollarSign
} from 'lucide-react';

// Definición de módulos disponibles
const AVAILABLE_MODULES = [
  {
    id: 'dashboard',
    name: 'Dashboard Global',
    description: 'Vista completa del sistema',
    icon: BarChart3,
  route: '/panel-control',
    color: 'purple'
  },
  {
    id: 'catalog',
    name: 'Catálogo de Productos',
    description: 'Explora nuestros productos',
    icon: ShoppingCart,
    route: '/catalogo',
    color: 'blue'
  },
  {
    id: 'catalogs-admin',
    name: 'Catálogo por Cliente',
    description: 'Gestión de catálogos personalizados',
    icon: Package,
    route: '/catalogo-clientes',
    color: 'emerald'
  },
  {
    id: 'orders',
    name: 'Gestión de Pedidos',
    description: 'Administra pedidos y ventas',
    icon: Package,
    route: '/pedidos',
    color: 'blue'
  },
  {
    id: 'delivery',
    name: 'Control de Reparto',
    description: 'Gestiona entregas y rutas',
    icon: TruckIcon,
    route: '/reparto',
    color: 'green'
  },
  {
    id: 'production',
    name: 'Producción',
    description: 'Control de producción y stock',
    icon: Factory,
    route: '/produccion',
    color: 'amber'
  },
  {
    id: 'billing',
    name: 'Cobranzas',
    description: 'Gestión de pagos y facturas',
    icon: DollarSign,
    route: '/cobranzas',
    color: 'red'
  },
  {
    id: 'logistics',
    name: 'Logística',
    description: 'Control de inventario y almacén',
    icon: TruckIcon,
    route: '/logistica',
    color: 'indigo'
  },
  {
    id: 'locations',
    name: 'Ubicaciones',
    description: 'Puntos de venta',
    icon: MapPin,
    route: '/donde-nos-ubicamos',
    color: 'indigo'
  },
  {
    id: 'reports',
    name: 'Reportes',
    description: 'Reportes y estadísticas',
    icon: BarChart3,
    route: '/reportes',
    color: 'purple'
  }
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const { perfil, user } = useAuth() as {
    user: { uid: string } | null;
    perfil?: { 
      nombre?: string;
      rol?: string;
      accessModules?: string[];
      permissions?: string[];
    } | null;
  };

  console.log('=== UserDashboard Debug ===');
  console.log('User UID:', user?.uid);
  console.log('Perfil completo:', JSON.stringify(perfil, null, 2));
  console.log('rol:', perfil?.rol);
  console.log('accessModules:', perfil?.accessModules);
  console.log('permissions:', (perfil as any)?.permissions);

  // Determinar qué módulos mostrar - Ya no hay concepto de "admin"
  const userModules = perfil?.accessModules || (perfil as any)?.permissions || [];
  
  console.log('userModules calculado:', userModules);
  console.log('========================');
  
  const visibleModules = AVAILABLE_MODULES.filter(module => userModules.includes(module.id));

  console.log('visibleModules:', visibleModules.map(m => m.id));

  const handleModuleClick = (route: string) => {
    navigate(route);
  };

  const colorClasses = {
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200 border-purple-200',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 border-blue-200',
    green: 'bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 border-green-200',
    amber: 'bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-amber-200',
    red: 'bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 border-red-200',
    teal: 'bg-gradient-to-br from-teal-50 to-teal-100 hover:from-teal-100 hover:to-teal-200 border-teal-200',
    indigo: 'bg-gradient-to-br from-indigo-50 to-indigo-100 hover:from-indigo-100 hover:to-indigo-200 border-indigo-200',
    rose: 'bg-gradient-to-br from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 border-rose-200',
    emerald: 'bg-gradient-to-br from-emerald-50 to-emerald-100 hover:from-emerald-100 hover:to-emerald-200 border-emerald-200',
  };

  const iconColorClasses = {
    purple: 'text-purple-600',
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    red: 'text-red-600',
    teal: 'text-teal-600',
    indigo: 'text-indigo-600',
    rose: 'text-rose-600',
    emerald: 'text-emerald-600',
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-purple-50 to-stone-50">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Encabezado de bienvenida */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-stone-800 mb-2">
              Bienvenido, {perfil?.nombre || 'Usuario'}
            </h1>
            <p className="text-stone-600">Selecciona un módulo para continuar</p>
          </div>

          {/* Grid de módulos disponibles */}
          {visibleModules.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleModules.map((module) => {
                const Icon = module.icon;
                const color = module.color as keyof typeof colorClasses;
                
                return (
                  <Card
                    key={module.id}
                    className={`cursor-pointer transition-all duration-300 border-2 ${colorClasses[color]}`}
                    onClick={() => handleModuleClick(module.route)}
                  >
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
                          <Icon className={`h-8 w-8 ${iconColorClasses[color]}`} />
                        </div>
                      </div>

                      <h3 className="text-lg font-bold text-stone-800 mb-1">{module.name}</h3>
                      <p className="text-sm text-stone-600">{module.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-stone-600 text-lg mb-4">
                No tienes módulos habilitados
              </p>
              <p className="text-sm text-stone-500">
                Contacta al administrador para solicitar acceso
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;
