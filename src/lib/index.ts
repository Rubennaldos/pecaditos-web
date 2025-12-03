/**
 * Índice de utilidades y helpers del CRM Pecaditos
 * 
 * Exporta todas las utilidades desde un único punto de entrada.
 * 
 * @example
 * import { formatRelativeTime, logger, cardHover } from '@/lib';
 */

// Utilidades generales
export { cn } from './utils';

// Logger configurable
export { logger } from './logger';

// Constantes del panel admin
export {
  ADMIN_MODULES,
  MODULE_COLOR_MAP,
  MODULE_ALIAS_MAP,
  hasModuleAccess,
  getModuleColorClass,
  type AdminModule,
  type ModuleColor,
  type ModuleStat,
} from './adminConstants';

// Utilidades de fecha
export {
  formatRelativeTime,
  formatDate,
  formatDateShort,
  formatDateTime,
  formatTime,
  getDayName,
  isToday,
  isYesterday,
  isOverdue,
  daysUntil,
  formatDateRange,
  startOfDay,
  endOfDay,
} from './dateUtils';

// Animaciones
export {
  fadeIn,
  fadeOut,
  cardHover,
  buttonAnimation,
  stateAnimations,
  staggerDelay,
  getStaggerClass,
  pageTransition,
  modalAnimation,
} from './animations';

// Lazy loading de módulos
export {
  LazyOrdersPanel,
  LazyDeliveryPanel,
  LazyProductionPanel,
  LazyBillingPanel,
  LazyLogisticsModule,
  LazyWholesalePortal,
  LazyCatalog,
  LazyAdminDashboard,
  LazySystemConfig,
  LazyAuditModule,
  preloadModule,
} from './lazyModules';
