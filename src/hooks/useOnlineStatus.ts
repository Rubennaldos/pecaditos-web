/**
 * Hook useOnlineStatus - Detecta el estado de conexión a internet
 * 
 * Útil para mostrar indicadores de conexión y manejar
 * operaciones offline.
 * 
 * @example
 * const { isOnline, wasOffline } = useOnlineStatus();
 * 
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 */

import { useState, useEffect, useCallback } from 'react';

interface OnlineStatus {
  /** Si el navegador tiene conexión a internet */
  isOnline: boolean;
  /** Si estuvo offline anteriormente (útil para mostrar mensaje de reconexión) */
  wasOffline: boolean;
  /** Timestamp de la última vez que cambió el estado */
  lastChanged: Date | null;
}

export function useOnlineStatus(): OnlineStatus {
  const [status, setStatus] = useState<OnlineStatus>({
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
    wasOffline: false,
    lastChanged: null,
  });

  const handleOnline = useCallback(() => {
    setStatus(prev => ({
      isOnline: true,
      wasOffline: !prev.isOnline ? true : prev.wasOffline,
      lastChanged: new Date(),
    }));
  }, []);

  const handleOffline = useCallback(() => {
    setStatus(prev => ({
      ...prev,
      isOnline: false,
      lastChanged: new Date(),
    }));
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline]);

  return status;
}

/**
 * Hook simplificado que solo retorna boolean
 */
export function useIsOnline(): boolean {
  const { isOnline } = useOnlineStatus();
  return isOnline;
}

export default useOnlineStatus;



