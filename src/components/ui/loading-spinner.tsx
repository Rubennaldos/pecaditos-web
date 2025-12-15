/**
 * Componente LoadingSpinner - Indicador de carga reutilizable
 * 
 * @example
 * <LoadingSpinner />
 * <LoadingSpinner size="lg" />
 * <LoadingSpinner size="sm" text="Cargando pedidos..." />
 */

import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface LoadingSpinnerProps {
  /** Tamaño del spinner */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Texto opcional debajo del spinner */
  text?: string;
  /** Si debe ocupar toda la pantalla */
  fullScreen?: boolean;
  /** Clases CSS adicionales */
  className?: string;
}

const sizeClasses = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
  xl: 'h-16 w-16',
};

const textSizeClasses = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
  xl: 'text-lg',
};

export function LoadingSpinner({
  size = 'md',
  text,
  fullScreen = false,
  className,
}: LoadingSpinnerProps) {
  const content = (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <Loader2 
        className={cn(
          'animate-spin text-primary',
          sizeClasses[size]
        )} 
      />
      {text && (
        <p className={cn('text-muted-foreground animate-pulse', textSizeClasses[size])}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}

/**
 * Spinner inline para botones
 */
export function ButtonSpinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn('h-4 w-4 animate-spin', className)} />
  );
}

/**
 * Skeleton de carga para cards
 */
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-4 animate-pulse', className)}>
      <div className="h-4 bg-muted rounded w-3/4 mb-3" />
      <div className="h-3 bg-muted rounded w-1/2 mb-2" />
      <div className="h-3 bg-muted rounded w-2/3" />
    </div>
  );
}

/**
 * Skeleton de carga para listas
 */
export function ListSkeleton({ 
  count = 3,
  className 
}: { 
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn('space-y-3', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export default LoadingSpinner;




