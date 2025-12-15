/**
 * Componente ConfirmDialog - Diálogo de confirmación reutilizable
 * 
 * @example
 * <ConfirmDialog
 *   open={showDelete}
 *   onOpenChange={setShowDelete}
 *   title="¿Eliminar pedido?"
 *   description="Esta acción no se puede deshacer."
 *   confirmLabel="Eliminar"
 *   variant="destructive"
 *   onConfirm={handleDelete}
 * />
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ButtonSpinner } from '@/components/ui/loading-spinner';
import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CheckCircle, XCircle } from 'lucide-react';

type DialogVariant = 'default' | 'destructive' | 'warning' | 'success';

interface ConfirmDialogProps {
  /** Si el diálogo está abierto */
  open: boolean;
  /** Callback cuando cambia el estado */
  onOpenChange: (open: boolean) => void;
  /** Título del diálogo */
  title: string;
  /** Descripción o mensaje */
  description?: string;
  /** Texto del botón de confirmar */
  confirmLabel?: string;
  /** Texto del botón de cancelar */
  cancelLabel?: string;
  /** Variante visual */
  variant?: DialogVariant;
  /** Si está procesando (muestra spinner) */
  loading?: boolean;
  /** Callback al confirmar */
  onConfirm: () => void | Promise<void>;
  /** Callback al cancelar (opcional) */
  onCancel?: () => void;
}

const variantConfig: Record<DialogVariant, {
  icon: typeof AlertTriangle;
  iconClass: string;
  buttonClass: string;
}> = {
  default: {
    icon: Info,
    iconClass: 'text-blue-500',
    buttonClass: 'bg-primary hover:bg-primary/90',
  },
  destructive: {
    icon: XCircle,
    iconClass: 'text-red-500',
    buttonClass: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    icon: AlertTriangle,
    iconClass: 'text-amber-500',
    buttonClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  success: {
    icon: CheckCircle,
    iconClass: 'text-green-500',
    buttonClass: 'bg-green-600 hover:bg-green-700 text-white',
  },
};

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  variant = 'default',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const config = variantConfig[variant];
  const Icon = config.icon;

  const handleConfirm = async () => {
    await onConfirm();
    if (!loading) {
      onOpenChange(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:max-w-[425px]">
        <AlertDialogHeader>
          <div className="flex items-start gap-4">
            <div className={cn('rounded-full p-2 bg-muted', config.iconClass)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <AlertDialogTitle className="text-lg">
                {title}
              </AlertDialogTitle>
              {description && (
                <AlertDialogDescription className="mt-2">
                  {description}
                </AlertDialogDescription>
              )}
            </div>
          </div>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-4">
          <AlertDialogCancel 
            onClick={handleCancel}
            disabled={loading}
          >
            {cancelLabel}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={loading}
            className={cn(config.buttonClass)}
          >
            {loading ? (
              <>
                <ButtonSpinner className="mr-2" />
                Procesando...
              </>
            ) : (
              confirmLabel
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/**
 * Hook para usar ConfirmDialog de forma imperativa
 */
import { useState, useCallback } from 'react';

interface UseConfirmOptions {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
}

export function useConfirm(defaultOptions?: UseConfirmOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<UseConfirmOptions>(defaultOptions || { title: '' });
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((customOptions?: Partial<UseConfirmOptions>): Promise<boolean> => {
    setOptions(prev => ({ ...prev, ...customOptions }));
    setIsOpen(true);

    return new Promise<boolean>((resolve) => {
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolveRef?.(true);
    setIsOpen(false);
  }, [resolveRef]);

  const handleCancel = useCallback(() => {
    resolveRef?.(false);
    setIsOpen(false);
  }, [resolveRef]);

  const ConfirmDialogComponent = (
    <ConfirmDialog
      open={isOpen}
      onOpenChange={setIsOpen}
      title={options.title}
      description={options.description}
      confirmLabel={options.confirmLabel}
      cancelLabel={options.cancelLabel}
      variant={options.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, ConfirmDialog: ConfirmDialogComponent };
}

export default ConfirmDialog;




