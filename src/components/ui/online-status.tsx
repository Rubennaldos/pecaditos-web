/**
 * Componente OnlineStatus - Indicador de conexión a internet
 * 
 * Muestra un banner cuando el usuario pierde conexión.
 * 
 * @example
 * // En App.tsx o layout
 * <OnlineStatusBanner />
 */

import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { Wifi, WifiOff, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface OnlineStatusBannerProps {
  /** Si debe ocultarse automáticamente después de reconectar */
  autoHide?: boolean;
  /** Tiempo en ms antes de ocultar después de reconectar */
  autoHideDelay?: number;
  /** Posición del banner */
  position?: 'top' | 'bottom';
}

export function OnlineStatusBanner({
  autoHide = true,
  autoHideDelay = 3000,
  position = 'bottom',
}: OnlineStatusBannerProps) {
  const { isOnline, wasOffline } = useOnlineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Mostrar mensaje de reconexión
  useEffect(() => {
    if (isOnline && wasOffline) {
      setShowReconnected(true);
      setDismissed(false);

      if (autoHide) {
        const timer = setTimeout(() => {
          setShowReconnected(false);
        }, autoHideDelay);
        return () => clearTimeout(timer);
      }
    }
  }, [isOnline, wasOffline, autoHide, autoHideDelay]);

  // Resetear dismissed cuando se desconecta
  useEffect(() => {
    if (!isOnline) {
      setDismissed(false);
    }
  }, [isOnline]);

  // No mostrar nada si está online y no hubo desconexión reciente
  if (isOnline && !showReconnected) {
    return null;
  }

  // No mostrar si fue descartado
  if (dismissed) {
    return null;
  }

  const positionClasses = position === 'top' 
    ? 'top-0' 
    : 'bottom-0';

  return (
    <div
      className={cn(
        'fixed left-0 right-0 z-50 px-4 py-2 flex items-center justify-center gap-2 text-sm font-medium transition-all duration-300',
        positionClasses,
        isOnline
          ? 'bg-green-500 text-white animate-in slide-in-from-bottom-2'
          : 'bg-red-500 text-white animate-in slide-in-from-bottom-2'
      )}
    >
      {isOnline ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Conexión restaurada</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Sin conexión a internet</span>
        </>
      )}
      
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 hover:bg-white/20 ml-2"
        onClick={() => setDismissed(true)}
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}

/**
 * Indicador pequeño de estado de conexión
 */
export function OnlineStatusDot({ className }: { className?: string }) {
  const { isOnline } = useOnlineStatus();

  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        isOnline ? 'bg-green-500' : 'bg-red-500 animate-pulse',
        className
      )}
      title={isOnline ? 'Conectado' : 'Sin conexión'}
    />
  );
}

export default OnlineStatusBanner;




