import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Package, AlertCircle, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { OrderCompletionModal } from './OrderCompletionModal';
import { OrderRejectModal } from './OrderRejectModal';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';

interface OrderActionButtonsProps {
  orderId: string;
  currentStatus: string;
  /** callback opcional: se invoca además del contexto para no romper integraciones existentes */
  onStatusChange?: (orderId: string, newStatus: string) => void;
  order?: any; // Datos completos del pedido para el modal
  onCreateNewOrder?: (orderId: string, incompleteItems: any[]) => void; // Crear nueva orden con faltantes
}

export const OrderActionButtons = ({
  orderId,
  currentStatus,
  onStatusChange,
  order,
  onCreateNewOrder,
}: OrderActionButtonsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // usar el contexto para cambiar estado en RTDB
  const { changeOrderStatus, rejectOrder } = useAdminOrders();

  const notifyStatus = (newStatus: string, msg: { title: string; description: string }) => {
    // llamar callback si fue provista (compatibilidad)
    onStatusChange?.(orderId, newStatus);
    toast({ title: msg.title, description: msg.description });
  };

  const handleAcceptOrder = async () => {
    setIsLoading(true);
    try {
      await changeOrderStatus(orderId, 'en_preparacion');
      notifyStatus('en_preparacion', {
        title: '✅ Pedido Aceptado',
        description: `El pedido ${orderId} ha sido aceptado y está en preparación.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: '❌ Error',
        description: 'No se pudo aceptar el pedido. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDirectMarkReady = async () => {
    setIsLoading(true);
    try {
      await changeOrderStatus(orderId, 'listo');
      notifyStatus('listo', {
        title: '✅ Pedido Listo',
        description: `El pedido ${orderId} está listo para entrega.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: '❌ Error',
        description: 'No se pudo marcar el pedido como listo. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkReady = () => {
    if (order) {
      setShowCompletionModal(true);
    } else {
      // Fallback cuando no tenemos los ítems del pedido
      handleDirectMarkReady();
    }
  };

  const handleOrderCompletion = async (
    orderIdFromModal: string,
    completedItems: any[],
    incompleteItems?: any[]
  ) => {
    try {
      if (incompleteItems && incompleteItems.length > 0 && onCreateNewOrder) {
        onCreateNewOrder(orderIdFromModal, incompleteItems);
        toast({
          title: 'Nueva orden creada',
          description: `Se creó una nueva orden para ${incompleteItems.length} producto(s) faltante(s).`,
        });
      }

      await changeOrderStatus(orderIdFromModal, 'listo');
      onStatusChange?.(orderIdFromModal, 'listo');
      toast({
        title: '✅ Pedido Listo',
        description: `El pedido ${orderIdFromModal} está listo para entrega.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: '❌ Error',
        description: 'No se pudo completar el pedido. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setShowCompletionModal(false);
    }
  };

  const handleRejectOrder = async (orderId: string, reason: string) => {
    setIsLoading(true);
    try {
      await rejectOrder(orderId, reason);
      notifyStatus('rechazado', {
        title: '❌ Pedido Rechazado',
        description: `El pedido ${orderId} ha sido rechazado. El cliente será notificado.`,
      });
    } catch (error) {
      console.error(error);
      toast({
        title: '❌ Error',
        description: 'No se pudo rechazar el pedido. Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Botones para pedidos pendientes
  if (currentStatus === 'pendiente') {
    return (
      <div className="flex gap-2">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white font-medium"
              disabled={isLoading}
            >
              <Check className="h-4 w-4 mr-1" />
              Aceptar
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-600" />
                Confirmar Aceptación
              </AlertDialogTitle>
              <AlertDialogDescription>
                ¿Estás seguro de que deseas aceptar el pedido <strong>{orderId}</strong>?
                <br />
                El pedido pasará al estado <strong>"En Preparación"</strong>.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleAcceptOrder}
                className="bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Procesando...' : 'Aceptar Pedido'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button
          size="sm"
          variant="destructive"
          onClick={() => setShowRejectModal(true)}
          disabled={isLoading}
        >
          <X className="h-4 w-4 mr-1" />
          Rechazar
        </Button>

        <OrderRejectModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          orderId={orderId}
          onReject={handleRejectOrder}
        />
      </div>
    );
  }

  // Botón para pedidos en preparación - con modal avanzado
  if (currentStatus === 'en_preparacion') {
    return (
      <>
        <Button
          onClick={handleMarkReady}
          size="sm"
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
          disabled={isLoading}
        >
          <Package className="h-4 w-4 mr-1" />
          {isLoading ? 'Procesando...' : 'Marcar Listo'}
        </Button>

        <OrderCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          order={order}
          onComplete={handleOrderCompletion}
        />
      </>
    );
  }

  // Otros estados: no mostramos botones
  return null;
};
