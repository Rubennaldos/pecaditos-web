import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { SystemConfiguration } from '@/components/admin/SystemConfiguration';
import MessagesModule from '@/components/admin/MessagesModule';
import { AuditModule } from '@/components/admin/AuditModule';
import ConsolidatedAdminModule from '@/components/admin/ConsolidatedAdminModule';
import { LocationsManagement } from "@/components/admin/LocationsManagement";
import { ClientsManagement } from '@/components/clients/ClientsManagement';
import { ClientsAccessManagement } from '@/components/admin/ClientsAccessManagement';
import { ModuleCard } from '@/components/admin/ModuleCard';
import { Button } from '@/components/ui/button';
import LogisticsModule from './LogisticsModule';
import {
  LogOut,
  BarChart3,
  Package,
  Truck,
  Factory,
  DollarSign,
  Settings,
  Building,
  MapPin,
  MessageSquare,
  UserCog,
  ShoppingBag,
  FileCheck,
} from 'lucide-react';

import OrdersPanel from './OrdersPanel';
import DeliveryPanel from './DeliveryPanel';
import ProductionPanel from './ProductionPanel';
import BillingPanel from './BillingPanel';
import { CatalogModule } from './CatalogModule';

const DashboardContent = () => {
  const { user, perfil, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('modules');

  if (!user) {
    return null;
  }

  const userName = perfil?.nombre || 'Usuario';
  const userModules = (perfil?.accessModules as string[]) || (perfil?.permissions as string[]) || [];

  const hasAccess = (moduleId: string) => {
    // Los usuarios con rol admin o adminGeneral ven todos los módulos del panel
    const isAdminRole =
      perfil?.rol === 'admin' ||
      perfil?.rol === 'adminGeneral' ||
      perfil?.role === 'admin';
    if (isAdminRole) return true;

    if (!userModules || userModules.length === 0) return false;
    // Exact match
    if (userModules.includes(moduleId)) return true;
    // Try base before dash: orders-admin -> orders
    const base = moduleId.split('-')[0];
    if (userModules.includes(base)) return true;
    // Common aliases mapping
    const aliasMap: Record<string, string[]> = {
      'orders-admin': ['orders', 'pedidos'],
      'delivery-admin': ['delivery', 'reparto'],
      'production-admin': ['production', 'produccion'],
      'billing-admin': ['billing', 'cobranzas'],
      'customers-admin': ['locations', 'customers', 'ubicaciones'],
      'catalogs-admin': ['catalogs-admin', 'catalogs', 'catalogo', 'catalog'],
      'dashboard': ['dashboard', 'admin'],
      'clients-access': ['clients-access', 'clients', 'clientes', 'clients-access'],
    };
    const aliases = aliasMap[moduleId] || [];
    for (const a of aliases) if (userModules.includes(a)) return true;
    return false;
  };

  const modules = [
    {
      id: 'dashboard',
      name: 'Dashboard Global',
      icon: BarChart3,
      description: 'Vista completa del sistema',
      color: 'purple',
      stats: [
        { label: 'Pedidos Hoy', value: '24' },
        { label: 'En Proceso', value: '12' },
      ],
    },
    {
      id: 'clients-access',
      name: 'Clientes y Accesos',
      icon: UserCog,
      description: 'Gestión de clientes con usuarios y permisos',
      color: 'rose',
      stats: [
        { label: 'Clientes', value: '-' },
        { label: 'Usuarios', value: '-' },
      ],
    },
    {
      id: 'orders-admin',
      name: 'Módulo Pedidos',
      icon: Package,
      description: 'Control total de pedidos',
      color: 'blue',
      stats: [
        { label: 'Pendientes', value: '8' },
        { label: 'Urgentes', value: '3' },
      ],
    },
    {
      id: 'delivery-admin',
      name: 'Módulo Reparto',
      icon: Truck,
      description: 'Supervisión de entregas',
      color: 'green',
      stats: [
        { label: 'En Ruta', value: '5' },
        { label: 'Entregados', value: '18' },
      ],
    },
    {
      id: 'production-admin',
      name: 'Módulo Producción',
      icon: Factory,
      description: 'Control de inventario',
      color: 'amber',
      stats: [
        { label: 'Stock Bajo', value: '4' },
        { label: 'Productos', value: '47' },
      ],
    },
    {
      id: 'billing-admin',
      name: 'Módulo Cobranzas',
      icon: DollarSign,
      description: 'Supervisión financiera',
      color: 'red',
      stats: [
        { label: 'Por Cobrar', value: 'S/. 12K' },
        { label: 'Vencidas', value: '7' },
      ],
    },
    {
      id: 'customers-admin',
      name: '¿Dónde nos ubicamos?',
      icon: MapPin,
      description: 'Ubicaciones y puntos de venta',
      color: 'blue',
      stats: [
        { label: 'Total', value: '142' },
        { label: 'Activos', value: '98' },
      ],
    },
    {
      id: 'catalogs-admin',
      name: 'Catálogos por Cliente',
      icon: ShoppingBag,
      description: 'Gestión de catálogos personalizados',
      color: 'emerald',
      stats: [
        { label: 'Clientes', value: '-' },
        { label: 'Productos', value: '-' },
      ],
    },
    {
      id: 'business-admin',
      name: 'Administración de Catálogo al por Mayor',
      icon: Building,
      description: 'Catálogos y promociones',
      color: 'teal',
    },
    {
      id: 'logistics',
      name: 'Módulo Logística',
      icon: Truck,
      description: 'Inventario y compras',
      color: 'indigo',
    },
    {
      id: 'system-config',
      name: 'Configuración',
      icon: Settings,
      description: 'Sistema y parámetros',
      color: 'purple',
    },
    {
      id: 'locations',
      name: 'Ubicaciones',
      icon: MapPin,
      description: 'Sedes y puntos de venta',
      color: 'indigo',
    },
    {
      id: 'audit',
      name: 'Auditoría',
      icon: FileCheck,
      description: 'Logs y seguimiento',
      color: 'rose',
    },
    {
      id: 'messages',
      name: 'Mensajes',
      icon: MessageSquare,
      description: 'Comunicación interna',
      color: 'blue',
    },
  ];

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'modules':
        return (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-stone-800 mb-2">Panel de Control</h1>
              <p className="text-stone-600">Selecciona un módulo para empezar a trabajar</p>
            </div>

            {/* Diseño compacto tipo bolitas */}
            <div className="flex flex-wrap gap-4 justify-center max-w-5xl mx-auto">
              {modules.filter((m) => hasAccess(m.id)).map((module) => {
                const Icon = module.icon;
                const colorMap: Record<string, string> = {
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
                  <div key={module.id} className="group relative">
                    <button
                      onClick={() => setActiveSection(module.id)}
                      className={`
                        relative w-20 h-20 rounded-full 
                        ${colorMap[module.color] || colorMap.blue}
                        transition-all duration-300 
                        hover:scale-110 active:scale-95
                        flex items-center justify-center
                        border-2 border-white/20
                      `}
                      aria-label={module.name}
                    >
                      <Icon className="h-8 w-8 text-white drop-shadow-md" />
                      <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/20 transition-all duration-300" />
                    </button>

                    <div className="
                      absolute -bottom-8 left-1/2 -translate-x-1/2
                      opacity-0 group-hover:opacity-100
                      transition-all duration-300
                      pointer-events-none
                      whitespace-nowrap
                      z-10
                    ">
                      <div className="bg-stone-800/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {module.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      case 'dashboard':
        return <AdminDashboard />;
      case 'clients-access':
        return (
          <div className="p-8">
            <Button variant="outline" size="sm" onClick={() => setActiveSection('modules')} className="mb-4">
              Volver a Módulos
            </Button>
            <ClientsAccessManagement />
          </div>
        );
      case 'orders-admin':
        return (
          <div className="relative">
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('modules')}
                className="bg-white"
              >
                Volver a Módulos
              </Button>
            </div>
            <OrdersPanel />
          </div>
        );
      case 'delivery-admin':
        return (
          <div className="relative">
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('modules')}
                className="bg-white"
              >
                Volver a Módulos
              </Button>
            </div>
            <DeliveryPanel />
          </div>
        );
      case 'production-admin':
        return (
          <div className="relative">
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('modules')}
                className="bg-white"
              >
                Volver a Módulos
              </Button>
            </div>
            <ProductionPanel />
          </div>
        );
      case 'billing-admin':
        return (
          <div className="relative">
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('modules')}
                className="bg-white"
              >
                Volver a Módulos
              </Button>
            </div>
            <BillingPanel />
          </div>
        );
      case 'customers-admin':
        return (
          <div className="p-8">
            <Button variant="outline" size="sm" onClick={() => setActiveSection('modules')} className="mb-4">
              Volver a Módulos
            </Button>
            <ClientsManagement />
          </div>
        );
      case 'catalogs-admin':
        return (
          <CatalogModule onBack={() => setActiveSection('modules')} />
        );
      case 'business-admin':
        return (
          <div className="p-8">
            <Button variant="outline" size="sm" onClick={() => setActiveSection('modules')} className="mb-4">
              Volver a Módulos
            </Button>
            <ConsolidatedAdminModule />
          </div>
        );
      case 'system-config':
        return (
          <div className="p-8">
            <Button variant="outline" size="sm" onClick={() => setActiveSection('modules')} className="mb-4">
              Volver a Módulos
            </Button>
            <SystemConfiguration />
          </div>
        );
      case 'locations':
        return (
          <div className="p-8">
            <Button variant="outline" size="sm" onClick={() => setActiveSection('modules')} className="mb-4">
              Volver a Módulos
            </Button>
            <LocationsManagement />
          </div>
        );
      case 'audit':
        return (
          <div className="p-8">
            <Button variant="outline" size="sm" onClick={() => setActiveSection('modules')} className="mb-4">
              Volver a Módulos
            </Button>
            <AuditModule />
          </div>
        );
      case 'messages':
        return (
          <div className="p-8">
            <Button variant="outline" size="sm" onClick={() => setActiveSection('modules')} className="mb-4">
              Volver a Módulos
            </Button>
            <MessagesModule
              usuarioActual={{
                id: user.uid || '',
                rol: (perfil?.rol as 'admin' | 'cliente') || 'cliente',
                email: user.email || '',
              }}
            />
          </div>
        );
      case 'logistics':
        return (
          <div className="relative">
            <div className="absolute top-4 right-4 z-50">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setActiveSection('modules')}
                className="bg-white"
              >
                Volver a Módulos
              </Button>
            </div>
            <LogisticsModule />
          </div>
        );
      default:
        return (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-stone-800 mb-2">Panel de Control</h1>
              <p className="text-stone-600">Selecciona un módulo para empezar a trabajar</p>
            </div>

            {/* Diseño compacto tipo bolitas */}
            <div className="flex flex-wrap gap-4 justify-center max-w-5xl mx-auto">
              {modules.filter((m) => hasAccess(m.id)).map((module) => {
                const Icon = module.icon;
                const colorMap: Record<string, string> = {
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
                  <div key={module.id} className="group relative">
                    <button
                      onClick={() => setActiveSection(module.id)}
                      className={`
                        relative w-20 h-20 rounded-full 
                        ${colorMap[module.color] || colorMap.blue}
                        transition-all duration-300 
                        hover:scale-110 active:scale-95
                        flex items-center justify-center
                        border-2 border-white/20
                      `}
                      aria-label={module.name}
                    >
                      <Icon className="h-8 w-8 text-white drop-shadow-md" />
                      <div className="absolute inset-0 rounded-full bg-white/0 group-hover:bg-white/20 transition-all duration-300" />
                    </button>

                    <div className="
                      absolute -bottom-8 left-1/2 -translate-x-1/2
                      opacity-0 group-hover:opacity-100
                      transition-all duration-300
                      pointer-events-none
                      whitespace-nowrap
                      z-10
                    ">
                      <div className="bg-stone-800/90 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-sm">
                        {module.name}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-purple-50 to-stone-50">
      {/* Top Header */}
      <header className="bg-white border-b border-stone-200 shadow-sm sticky top-0 z-40">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-800">Panel de Control</h1>
                <p className="text-xs text-stone-500">Sistema de gestión integral</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">{userName?.split(' ')[0][0] || 'U'}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">{userName}</p>
                  <p className="text-xs text-purple-600 font-medium">USUARIO</p>
                </div>
              </div>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="min-h-[calc(100vh-80px)]">{renderContent()}</main>
    </div>
  );
};

const AdminPanel = () => {
  return <DashboardContent />;
};

export default AdminPanel;
