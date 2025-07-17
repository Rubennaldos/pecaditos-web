
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

interface OrderActionButtonsProps {
  orderId: string;
  currentStatus: string;
  onStatusChange: (orderId: string, newStatus: string) => void;
}

export const OrderActionButtons = ({ orderId, currentStatus, onStatusChange }: OrderActionButtonsProps) => {
  const [isLoading, setIsLoading] = useState(false);

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

  const handleMarkReady = async () => {
    setIsLoading(true);
    try {
      // Simular API call
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

  // Botón para pedidos en preparación
  if (currentStatus === 'en_preparacion') {
    return (
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button 
            size="sm" 
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
            disabled={isLoading}
          >
            <Package className="h-4 w-4 mr-1" />
            Marcar Listo
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-600" />
              Confirmar Finalización
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que el pedido <strong>{orderId}</strong> está listo?
              <br />
              El pedido pasará al estado "Listo para Entrega".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleMarkReady}
              className="bg-blue-600 hover:bg-blue-700"
              disabled={isLoading}
            >
              {isLoading ? 'Procesando...' : 'Marcar Listo'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  // No mostrar botones para otros estados
  return null;
};
