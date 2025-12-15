/**
 * Índice de hooks personalizados del CRM Pecaditos
 * 
 * Exporta todos los hooks desde un único punto de entrada.
 * 
 * @example
 * import { useDebounce, useLocalStorage, useOnlineStatus } from '@/hooks';
 */

// Hooks de autenticación
export { useAuth, AuthProvider } from './useAuth';

// Hooks de utilidad
export { useDebounce, useDebouncedCallback } from './useDebounce';
export { useLocalStorage } from './useLocalStorage';
export { useOnlineStatus, useIsOnline } from './useOnlineStatus';

// Hooks de UI
export { useMobile } from './use-mobile';
export { useToast, toast } from './use-toast';

// Hooks de negocio
export { useBilling } from './useBilling';
export { useWholesaleCategories } from './useWholesaleCategories';
export { useWholesaleCustomer } from './useWholesaleCustomer';




