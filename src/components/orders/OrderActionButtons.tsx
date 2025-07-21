
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Package, AlertCircle } from 'lucide-react';
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

interface OrderActionButtonsProps {
  orderId: string;
  currentStatus: string;
  onStatusChange: (orderId: string, newStatus: string) => void;
  order?: any; // Datos completos del pedido para el modal
}

export const OrderActionButtons = ({ orderId, currentStatus, onStatusChange, order }: OrderActionButtonsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  const handleAcceptOrder = async () => {
    setIsLoading(true);
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onStatusChange(orderId, 'en_preparacion');
      
      toast({
        title: "✅ Pedido Aceptado",
        description: `El pedido ${orderId} ha sido aceptado y está en preparación.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo aceptar el pedido. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkReady = () => {
    if (order) {
      setShowCompletionModal(true);
    } else {
      // Fallback para cuando no hay datos del pedido
      handleDirectMarkReady();
    }
  };

  const handleDirectMarkReady = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onStatusChange(orderId, 'listo');
      toast({
        title: "✅ Pedido Listo",
        description: `El pedido ${orderId} está listo para entrega.`,
      });
    } catch (error) {
      toast({
        title: "❌ Error",
        description: "No se pudo marcar el pedido como listo. Intenta nuevamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOrderCompletion = (orderId: string, completedItems: any[], incompleteItems?: any[]) => {
    if (incompleteItems && incompleteItems.length > 0) {
      // Crear nueva orden para productos faltantes
      const newOrderId = `${orderId}-R${Date.now().toString().slice(-4)}`;
      console.log('🔄 Nueva orden creada para productos faltantes:', {
        originalOrder: orderId,
        newOrder: newOrderId,
        incompleteItems: incompleteItems.length,
        customerAlert: true
      });
      
      // Aquí se debería agregar la nueva orden al estado global
      // Por ahora solo logging para debug
      toast({
        title: "Nueva orden creada",
        description: `Se creó la orden ${newOrderId} para ${incompleteItems.length} productos faltantes`,
      });
    }
    
    onStatusChange(orderId, 'listo');
    setShowCompletionModal(false);
  };

  // Botón para pedidos pendientes
  if (currentStatus === 'pendiente') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            size="sm" 
            className="bg-green-600 hover:bg-green-700 text-white font-medium"
            disabled={isLoading}
          >
            <Check className="h-4 w-4 mr-1" />
            Aceptar Pedido
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
              El pedido pasará al estado "En Preparación".
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
    );
  }

  // Botón para pedidos en preparación - Con modal avanzado
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

        {/* Modal avanzado de completación */}
        <OrderCompletionModal
          isOpen={showCompletionModal}
          onClose={() => setShowCompletionModal(false)}
          order={order}
          onComplete={handleOrderCompletion}
        />
      </>
    );
  }

  // No mostrar botones para otros estados
  return null;
};
