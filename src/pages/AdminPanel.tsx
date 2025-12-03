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
import { Button } from '@/components/ui/button';
import { ArrowLeft, LogOut, BarChart3 } from 'lucide-react';
import LogisticsModule from './LogisticsModule';
import OrdersPanel from './OrdersPanel';
import DeliveryPanel from './DeliveryPanel';
import ProductionPanel from './ProductionPanel';
import BillingPanel from './BillingPanel';
import { CatalogModule } from './CatalogModule';

// Constantes centralizadas para evitar duplicación
import { 
  ADMIN_MODULES, 
  hasModuleAccess,
  getModuleColorClass 
} from '@/lib/adminConstants';

const DashboardContent = () => {
  const { user, perfil, logout } = useAuth();
  const [activeSection, setActiveSection] = useState('modules');

  if (!user) {
    return null;
  }

  const userName = perfil?.nombre || 'Usuario';
  const userModules = (perfil?.accessModules as string[]) || (perfil?.permissions as string[]) || [];

  // Verificar si es usuario administrador
  const isAdminRole =
    perfil?.rol === 'admin' ||
    perfil?.rol === 'adminGeneral' ||
    perfil?.role === 'admin';

  // Usar función centralizada para verificar acceso
  const hasAccess = (moduleId: string) => hasModuleAccess(moduleId, userModules, isAdminRole);

  // Usar módulos desde constantes centralizadas
  const modules = ADMIN_MODULES;

  const handleLogout = async () => {
    await logout();
    window.location.href = '/';
  };

  /**
   * Botón consistente para volver al selector de módulos
   * Usa el mismo estilo que BackToPanelButton para consistencia
   */
  const BackToModulesButton = () => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => setActiveSection('modules')}
      className="fixed top-4 left-4 z-[100] bg-white/95 backdrop-blur-sm hover:bg-white border border-stone-200 shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
      title="Volver a Módulos"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      <span className="hidden sm:inline font-medium">Volver a Módulos</span>
    </Button>
  );

  // Componente reutilizable para el grid de módulos (evita duplicación)
  const ModulesGrid = () => (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-4xl font-bold text-stone-800 mb-2">Panel de Control</h1>
        <p className="text-stone-600">Selecciona un módulo para empezar a trabajar</p>
      </div>

      {/* Diseño compacto tipo bolitas */}
      <div className="flex flex-wrap gap-6 justify-center max-w-5xl mx-auto">
        {modules.filter((m) => hasAccess(m.id)).map((module) => {
          const Icon = module.icon;
          return (
            <div key={module.id} className="group flex flex-col items-center gap-2">
              <button
                onClick={() => setActiveSection(module.id)}
                className={`
                  relative w-20 h-20 rounded-full 
                  ${getModuleColorClass(module.color)}
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

              {/* Nombre siempre visible */}
              <p className="text-xs font-medium text-stone-700 text-center max-w-[100px] leading-tight">
                {module.name}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'modules':
        return <ModulesGrid />;
      case 'dashboard':
        return (
          <>
            <BackToModulesButton />
            <AdminDashboard />
          </>
        );
      case 'clients-access':
        return (
          <>
            <BackToModulesButton />
            <div className="p-8">
              <ClientsAccessManagement />
            </div>
          </>
        );
      case 'orders-admin':
        return (
          <>
            <BackToModulesButton />
            <OrdersPanel embedded />
          </>
        );
      case 'delivery-admin':
        return (
          <>
            <BackToModulesButton />
            <DeliveryPanel embedded />
          </>
        );
      case 'production-admin':
        return (
          <>
            <BackToModulesButton />
            <ProductionPanel embedded />
          </>
        );
      case 'billing-admin':
        return (
          <>
            <BackToModulesButton />
            <BillingPanel embedded />
          </>
        );
      case 'customers-admin':
        return (
          <>
            <BackToModulesButton />
            <div className="p-8">
              <ClientsManagement />
            </div>
          </>
        );
      case 'catalogs-admin':
        return (
          <>
            <BackToModulesButton />
            <CatalogModule onBack={() => setActiveSection('modules')} />
          </>
        );
      case 'business-admin':
        return (
          <>
            <BackToModulesButton />
            <div className="p-8">
              <ConsolidatedAdminModule />
            </div>
          </>
        );
      case 'system-config':
        return (
          <>
            <BackToModulesButton />
            <div className="p-8">
              <SystemConfiguration />
            </div>
          </>
        );
      case 'locations':
        return (
          <>
            <BackToModulesButton />
            <div className="p-8">
              <LocationsManagement />
            </div>
          </>
        );
      case 'audit':
        return (
          <>
            <BackToModulesButton />
            <div className="p-8">
              <AuditModule />
            </div>
          </>
        );
      case 'messages':
        return (
          <>
            <BackToModulesButton />
            <div className="p-8">
              <MessagesModule
                usuarioActual={{
                  id: user.uid || '',
                  rol: (perfil?.rol as 'admin' | 'cliente') || 'cliente',
                  email: user.email || '',
                }}
              />
            </div>
          </>
        );
      case 'logistics':
        return (
          <>
            <BackToModulesButton />
            <LogisticsModule embedded />
          </>
        );
      default:
        // Reutiliza el mismo componente para el caso default
        return <ModulesGrid />;
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
