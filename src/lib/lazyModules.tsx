/**
 * Módulos con carga diferida (lazy loading)
 * 
 * Estos componentes se cargan solo cuando se necesitan,
 * mejorando el tiempo de carga inicial de la aplicación.
 * 
 * @example
 * import { LazyOrdersPanel } from '@/lib/lazyModules';
 * 
 * <Suspense fallback={<LoadingSpinner />}>
 *   <LazyOrdersPanel />
 * </Suspense>
 */

import { lazy, Suspense, ComponentType } from 'react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ErrorBoundary } from '@/components/ui/error-boundary';

/**
 * HOC para envolver componentes lazy con Suspense y ErrorBoundary
 */
function withLazyLoading<P extends object>(
  LazyComponent: ComponentType<P>,
  loadingText?: string
) {
  return function LazyWrapper(props: P) {
    return (
      <ErrorBoundary>
        <Suspense fallback={<LoadingSpinner fullScreen text={loadingText} />}>
          <LazyComponent {...props} />
        </Suspense>
      </ErrorBoundary>
    );
  };
}

// =====================================================
// PANELES PRINCIPALES (carga diferida)
// =====================================================

/** Panel de Pedidos - Carga diferida */
const LazyOrdersPanelComponent = lazy(() => import('@/pages/OrdersPanel'));
export const LazyOrdersPanel = withLazyLoading(
  LazyOrdersPanelComponent,
  'Cargando módulo de pedidos...'
);

/** Panel de Delivery - Carga diferida */
const LazyDeliveryPanelComponent = lazy(() => import('@/pages/DeliveryPanel'));
export const LazyDeliveryPanel = withLazyLoading(
  LazyDeliveryPanelComponent,
  'Cargando módulo de reparto...'
);

/** Panel de Producción - Carga diferida */
const LazyProductionPanelComponent = lazy(() => import('@/pages/ProductionPanel'));
export const LazyProductionPanel = withLazyLoading(
  LazyProductionPanelComponent,
  'Cargando módulo de producción...'
);

/** Panel de Cobranzas - Carga diferida */
const LazyBillingPanelComponent = lazy(() => import('@/pages/BillingPanel'));
export const LazyBillingPanel = withLazyLoading(
  LazyBillingPanelComponent,
  'Cargando módulo de cobranzas...'
);

/** Panel de Logística - Carga diferida */
const LazyLogisticsModuleComponent = lazy(() => import('@/pages/LogisticsModule'));
export const LazyLogisticsModule = withLazyLoading(
  LazyLogisticsModuleComponent,
  'Cargando módulo de logística...'
);

/** Portal Mayorista - Carga diferida */
const LazyWholesalePortalComponent = lazy(() => import('@/pages/WholesalePortal'));
export const LazyWholesalePortal = withLazyLoading(
  LazyWholesalePortalComponent,
  'Cargando portal mayorista...'
);

/** Catálogo - Carga diferida */
const LazyCatalogComponent = lazy(() => import('@/pages/Catalog'));
export const LazyCatalog = withLazyLoading(
  LazyCatalogComponent,
  'Cargando catálogo...'
);

// =====================================================
// COMPONENTES ADMIN (carga diferida)
// =====================================================

/** Dashboard Admin - Carga diferida */
const LazyAdminDashboardComponent = lazy(() => 
  import('@/components/admin/AdminDashboard').then(m => ({ default: m.AdminDashboard }))
);
export const LazyAdminDashboard = withLazyLoading(
  LazyAdminDashboardComponent,
  'Cargando dashboard...'
);

/** Configuración del Sistema - Carga diferida */
const LazySystemConfigComponent = lazy(() => 
  import('@/components/admin/SystemConfiguration').then(m => ({ default: m.SystemConfiguration }))
);
export const LazySystemConfig = withLazyLoading(
  LazySystemConfigComponent,
  'Cargando configuración...'
);

/** Módulo de Auditoría - Carga diferida */
const LazyAuditModuleComponent = lazy(() => 
  import('@/components/admin/AuditModule').then(m => ({ default: m.AuditModule }))
);
export const LazyAuditModule = withLazyLoading(
  LazyAuditModuleComponent,
  'Cargando auditoría...'
);

// =====================================================
// UTILIDADES
// =====================================================

/**
 * Precargar un módulo antes de que se necesite
 * Útil para mejorar UX al hacer hover sobre un link
 * 
 * @example
 * <Link 
 *   to="/pedidos" 
 *   onMouseEnter={() => preloadModule('orders')}
 * >
 *   Pedidos
 * </Link>
 */
export const preloadModule = (module: 'orders' | 'delivery' | 'production' | 'billing' | 'logistics' | 'wholesale') => {
  const loaders: Record<string, () => Promise<any>> = {
    orders: () => import('@/pages/OrdersPanel'),
    delivery: () => import('@/pages/DeliveryPanel'),
    production: () => import('@/pages/ProductionPanel'),
    billing: () => import('@/pages/BillingPanel'),
    logistics: () => import('@/pages/LogisticsModule'),
    wholesale: () => import('@/pages/WholesalePortal'),
  };

  const loader = loaders[module];
  if (loader) {
    loader().catch(() => {
      // Ignorar errores de precarga
    });
  }
};




