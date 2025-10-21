import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  TruckIcon, 
  Factory, 
  Wallet, 
  PackageSearch,
  Users,
  MapPin,
  ArrowRight
} from 'lucide-react';

// Definición de módulos disponibles
const AVAILABLE_MODULES = [
  {
    id: 'dashboard',
    name: 'Panel de Administración',
    description: 'Gestión completa del sistema',
    icon: LayoutDashboard,
    route: '/admin',
    color: 'from-blue-500 to-blue-600',
    hoverColor: 'hover:border-blue-200',
    bgGradient: 'from-white to-blue-50'
  },
  {
    id: 'catalog',
    name: 'Catálogo de Productos',
    description: 'Explora nuestros productos',
    icon: Package,
    route: '/catalogo',
    color: 'from-green-500 to-green-600',
    hoverColor: 'hover:border-green-200',
    bgGradient: 'from-white to-green-50'
  },
  {
    id: 'orders',
    name: 'Gestión de Pedidos',
    description: 'Administra pedidos y ventas',
    icon: ShoppingCart,
    route: '/pedidos',
    color: 'from-orange-500 to-orange-600',
    hoverColor: 'hover:border-orange-200',
    bgGradient: 'from-white to-orange-50'
  },
  {
    id: 'delivery',
    name: 'Control de Reparto',
    description: 'Gestiona entregas y rutas',
    icon: TruckIcon,
    route: '/reparto',
    color: 'from-purple-500 to-purple-600',
    hoverColor: 'hover:border-purple-200',
    bgGradient: 'from-white to-purple-50'
  },
  {
    id: 'production',
    name: 'Producción',
    description: 'Control de producción y stock',
    icon: Factory,
    route: '/produccion',
    color: 'from-red-500 to-red-600',
    hoverColor: 'hover:border-red-200',
    bgGradient: 'from-white to-red-50'
  },
  {
    id: 'billing',
    name: 'Cobranzas',
    description: 'Gestión de pagos y facturas',
    icon: Wallet,
    route: '/cobranzas',
    color: 'from-teal-500 to-teal-600',
    hoverColor: 'hover:border-teal-200',
    bgGradient: 'from-white to-teal-50'
  },
  {
    id: 'logistics',
    name: 'Logística',
    description: 'Control de inventario y almacén',
    icon: PackageSearch,
    route: '/logistica',
    color: 'from-indigo-500 to-indigo-600',
    hoverColor: 'hover:border-indigo-200',
    bgGradient: 'from-white to-indigo-50'
  },
  {
    id: 'wholesale',
    name: 'Portal Mayorista',
    description: 'Compras al por mayor',
    icon: Users,
    route: '/mayorista',
    color: 'from-pink-500 to-pink-600',
    hoverColor: 'hover:border-pink-200',
    bgGradient: 'from-white to-pink-50'
  },
  {
    id: 'locations',
    name: 'Ubicaciones',
    description: 'Puntos de venta',
    icon: MapPin,
    route: '/donde-nos-ubicamos',
    color: 'from-yellow-500 to-yellow-600',
    hoverColor: 'hover:border-yellow-200',
    bgGradient: 'from-white to-yellow-50'
  }
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const { perfil, user } = useAuth() as {
    user: { uid: string } | null;
    perfil?: { 
      nombre?: string;
      isAdmin?: boolean;
      rol?: string;
      accessModules?: string[];
    } | null;
  };

  // Determinar qué módulos mostrar
  const isAdmin = perfil?.isAdmin || perfil?.rol === 'admin' || perfil?.rol === 'adminGeneral';
  const userModules = perfil?.accessModules || [];
  
  const visibleModules = isAdmin 
    ? AVAILABLE_MODULES 
    : AVAILABLE_MODULES.filter(module => userModules.includes(module.id));

  const handleModuleClick = (route: string) => {
    navigate(route);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Encabezado de bienvenida */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Bienvenido, {perfil?.nombre || 'Usuario'}
            </h1>
            <p className="text-muted-foreground text-lg">
              Selecciona un módulo para continuar
            </p>
          </div>

          {/* Grid de módulos disponibles */}
          {visibleModules.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {visibleModules.map((module) => {
                const Icon = module.icon;
                return (
                  <div
                    key={module.id}
                    className="group cursor-pointer"
                    onClick={() => handleModuleClick(module.route)}
                  >
                    {/* Mobile: Circular design */}
                    <div className="md:hidden flex flex-col items-center gap-3">
                      <div className={`w-20 h-20 bg-gradient-to-br ${module.color} rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300`}>
                        <Icon className="h-9 w-9 text-white" />
                      </div>
                      <span className="text-sm font-medium text-foreground text-center leading-tight px-1">
                        {module.name}
                      </span>
                    </div>

                    {/* Desktop: Compact card */}
                    <Card className="hidden md:block group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1 border hover:border-primary/30 bg-card/50 backdrop-blur-sm">
                      <CardHeader className="p-4 text-center space-y-3">
                        <div className={`mx-auto w-12 h-12 bg-gradient-to-br ${module.color} rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-md`}>
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <CardTitle className="text-sm font-semibold text-foreground leading-tight">
                          {module.name}
                        </CardTitle>
                      </CardHeader>
                    </Card>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg mb-4">
                No tienes módulos habilitados
              </p>
              <p className="text-sm text-muted-foreground">
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
