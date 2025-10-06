import { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { SystemConfiguration } from '@/components/admin/SystemConfiguration';
import MessagesModule from '@/components/admin/MessagesModule';
import { AuditModule } from '@/components/admin/AuditModule';
import ConsolidatedAdminModule from '@/components/admin/ConsolidatedAdminModule';
import { LocationsManagement } from "@/components/admin/LocationsManagement";
import { AccessManagement } from '@/components/admin/AccessManagement';
import { ModuleCard } from '@/components/admin/ModuleCard';
import { Button } from '@/components/ui/button';
import LogisticsModule from './LogisticsModule';
import {
  LogOut,
  BarChart3,
  Package,
  Truck,
  Factory,
  Users,
  DollarSign,
  Settings,
  Shield,
  Building,
  MapPin,
  MessageSquare,
  UserCog,
} from 'lucide-react';

import OrdersPanel from './OrdersPanel';
import DeliveryPanel from './DeliveryPanel';
import ProductionPanel from './ProductionPanel';
import BillingPanel from './BillingPanel';
import { ClientsManagement } from '@/components/clients/ClientsManagement';

const ADMIN_PROFILES = ['admin', 'adminGeneral'];

const AdminPanelContent = () => {
  const { user, logout } = useAdmin();
  const [activeSection, setActiveSection] = useState('modules');

  if (!user || !ADMIN_PROFILES.includes(user.profile)) {
    return null;
  }

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
      id: 'access-management',
      name: 'Gestión de Accesos',
      icon: UserCog,
      description: 'Administrar usuarios y permisos',
      color: 'rose',
      isSuperAdmin: true,
    },
    {
      id: 'orders-admin',
      name: 'Módulo Pedidos',
      icon: Package,
      description: 'Control total de pedidos',
      color: 'blue',
      isSuperAdmin: true,
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
      isSuperAdmin: true,
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
      isSuperAdmin: true,
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
      isSuperAdmin: true,
      stats: [
        { label: 'Por Cobrar', value: 'S/. 12K' },
        { label: 'Vencidas', value: '7' },
      ],
    },
    {
      id: 'customers-admin',
      name: 'Módulo Clientes',
      icon: Users,
      description: 'Gestión de clientes',
      color: 'blue',
      stats: [
        { label: 'Total', value: '142' },
        { label: 'Activos', value: '98' },
      ],
    },
    {
      id: 'business-admin',
      name: 'Gestión Comercial',
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
      icon: Shield,
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

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'modules':
        return (
          <div className="p-8 space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-stone-800 mb-2">Panel de Administración</h1>
              <p className="text-stone-600">Selecciona un módulo para empezar a trabajar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  {...module}
                  isActive={activeSection === module.id}
                  onClick={() => setActiveSection(module.id)}
                />
              ))}
            </div>
          </div>
        );
      case 'dashboard':
        return <AdminDashboard />;
      case 'access-management':
        return (
          <div className="p-8">
            <AccessManagement />
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
                id: user.id || '',
                rol: (user as any).rol || 'cliente',
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
              <h1 className="text-4xl font-bold text-stone-800 mb-2">Panel de Administración</h1>
              <p className="text-stone-600">Selecciona un módulo para empezar a trabajar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {modules.map((module) => (
                <ModuleCard
                  key={module.id}
                  {...module}
                  isActive={activeSection === module.id}
                  onClick={() => setActiveSection(module.id)}
                />
              ))}
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
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-stone-800">SuperAdmin Panel</h1>
                <p className="text-xs text-stone-500">Sistema de gestión integral</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-8 h-8 bg-purple-200 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-purple-600">{user.name?.split(' ')[0][0]}</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-stone-800">{user.name}</p>
                  <p className="text-xs text-purple-600 font-medium">SUPERADMIN</p>
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
  return <AdminPanelContent />;
};

export default AdminPanel;
