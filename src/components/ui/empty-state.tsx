/**
 * Componente EmptyState - Para mostrar cuando no hay datos
 * 
 * @example
 * <EmptyState
 *   icon={Package}
 *   title="No hay pedidos"
 *   description="Los pedidos aparecerán aquí"
 *   action={{ label: "Crear pedido", onClick: handleCreate }}
 * />
 */

import { cn } from '@/lib/utils';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateAction {
  label: string;
  onClick: () => void;
  variant?: 'default' | 'outline' | 'secondary';
}

interface EmptyStateProps {
  /** Icono a mostrar (de lucide-react) */
  icon?: LucideIcon;
  /** Título principal */
  title: string;
  /** Descripción secundaria */
  description?: string;
  /** Acción opcional (botón) */
  action?: EmptyStateAction;
  /** Acción secundaria opcional */
  secondaryAction?: EmptyStateAction;
  /** Clases CSS adicionales */
  className?: string;
  /** Tamaño del componente */
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    container: 'py-8',
    icon: 'h-10 w-10',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12',
    icon: 'h-12 w-12',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16',
    icon: 'h-16 w-16',
    title: 'text-xl',
    description: 'text-base',
  },
};

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  secondaryAction,
  className,
  size = 'md',
}: EmptyStateProps) {
  const config = sizeConfig[size];

  return (
    <div 
      className={cn(
        'flex flex-col items-center justify-center text-center',
        config.container,
        className
      )}
    >
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className={cn('text-muted-foreground', config.icon)} />
      </div>
      
      <h3 className={cn('font-semibold text-foreground mb-1', config.title)}>
        {title}
      </h3>
      
      {description && (
        <p className={cn('text-muted-foreground max-w-sm mb-4', config.description)}>
          {description}
        </p>
      )}

      {(action || secondaryAction) && (
        <div className="flex items-center gap-3 mt-2">
          {action && (
            <Button
              onClick={action.onClick}
              variant={action.variant || 'default'}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant || 'outline'}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Variante para búsquedas sin resultados
 */
export function NoResults({
  searchQuery,
  onClear,
}: {
  searchQuery: string;
  onClear?: () => void;
}) {
  return (
    <EmptyState
      title="Sin resultados"
      description={`No encontramos nada para "${searchQuery}"`}
      action={onClear ? { label: 'Limpiar búsqueda', onClick: onClear, variant: 'outline' } : undefined}
      size="sm"
    />
  );
}

/**
 * Variante para errores de carga
 */
export function LoadError({
  onRetry,
  message = 'Ocurrió un error al cargar los datos',
}: {
  onRetry?: () => void;
  message?: string;
}) {
  return (
    <EmptyState
      title="Error"
      description={message}
      action={onRetry ? { label: 'Reintentar', onClick: onRetry } : undefined}
      size="sm"
    />
  );
}

export default EmptyState;




