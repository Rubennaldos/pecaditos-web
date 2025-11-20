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
    purple: 'bg-gradient-to-br from-purple-500/90 to-violet-600/90 hover:from-purple-600 hover:to-violet-700 shadow-lg shadow-purple-500/30 hover:shadow-purple-600/50',
    blue: 'bg-gradient-to-br from-sky-500/90 to-blue-600/90 hover:from-sky-600 hover:to-blue-700 shadow-lg shadow-sky-500/30 hover:shadow-sky-600/50',
    green: 'bg-gradient-to-br from-emerald-500/90 to-green-600/90 hover:from-emerald-600 hover:to-green-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/50',
    amber: 'bg-gradient-to-br from-amber-500/90 to-orange-600/90 hover:from-amber-600 hover:to-orange-700 shadow-lg shadow-amber-500/30 hover:shadow-amber-600/50',
    red: 'bg-gradient-to-br from-rose-500/90 to-red-600/90 hover:from-rose-600 hover:to-red-700 shadow-lg shadow-rose-500/30 hover:shadow-rose-600/50',
    teal: 'bg-gradient-to-br from-teal-500/90 to-cyan-600/90 hover:from-teal-600 hover:to-cyan-700 shadow-lg shadow-teal-500/30 hover:shadow-teal-600/50',
    indigo: 'bg-gradient-to-br from-indigo-500/90 to-blue-600/90 hover:from-indigo-600 hover:to-blue-700 shadow-lg shadow-indigo-500/30 hover:shadow-indigo-600/50',
    rose: 'bg-gradient-to-br from-pink-500/90 to-rose-600/90 hover:from-pink-600 hover:to-rose-700 shadow-lg shadow-pink-500/30 hover:shadow-pink-600/50',
    emerald: 'bg-gradient-to-br from-emerald-500/90 to-teal-600/90 hover:from-emerald-600 hover:to-teal-700 shadow-lg shadow-emerald-500/30 hover:shadow-emerald-600/50',
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

          {/* Grid de módulos disponibles - Diseño compacto tipo bolitas */}
          {visibleModules.length > 0 ? (
            <div className="flex flex-wrap gap-4 justify-center max-w-4xl mx-auto">
              {visibleModules.map((module) => {
                const Icon = module.icon;
                const color = module.color as keyof typeof colorClasses;
                
                return (
                  <div
                    key={module.id}
                    className="group relative"
                  >
                    {/* Botón circular principal */}
                    <button
                      onClick={() => handleModuleClick(module.route)}
                      className={`
                        relative w-20 h-20 rounded-full 
                        ${colorClasses[color]}
                        transition-all duration-300 
                        hover:scale-110 active:scale-95
                        flex items-center justify-center
                        border-2 border-white/20
                      `}
                      aria-label={module.name}
                    >
                      <Icon className="h-8 w-8 text-white drop-shadow-md" />
                      
                      {/* Efecto de brillo al hover */}
                      <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/20 transition-all duration-300" />
                    </button>

                    {/* Etiqueta con el nombre - aparece al hover */}
                    <div className="
                      absolute -bottom-8 left-1/2 -translate-x-1/2
                      opacity-0 group-hover:opacity-100
                      transition-all duration-300
                      pointer-events-none
                      whitespace-nowrap
                    ">
                      <div className="bg-stone-800/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {module.name}
                      </div>
                    </div>
                  </div>
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
