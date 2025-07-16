
import { useState } from 'react';
import { Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';

interface OrderDeleteModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderDeleteModal = ({ order, isOpen, onClose }: OrderDeleteModalProps) => {
  const { deleteOrder } = useAdminOrders();
  const [reason, setReason] = useState('');
  const [confirmed, setConfirmed] = useState(false);

  if (!isOpen) return null;

  const handleDelete = () => {
    if (!reason.trim()) {
      alert('Debe especificar el motivo de eliminación');
      return;
    }
    
    deleteOrder(order.id, reason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <Trash2 className="h-5 w-5" />
            Eliminar Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="font-medium text-red-800">¡Acción Irreversible!</span>
            </div>
            <p className="text-sm text-red-700">
              Esta acción eliminará permanentemente el pedido y será registrada en el historial de auditoría.
            </p>
          </div>

          <div className="space-y-2">
            <p><strong>Pedido:</strong> {order.id}</p>
            <p><strong>Cliente:</strong> {order.customerName}</p>
            <p><strong>Estado:</strong> 
              <Badge className="ml-2" variant="outline">
                {order.status}
              </Badge>
            </p>
            <p><strong>Total:</strong> S/ {order.total?.toFixed(2)}</p>
          </div>

          <div>
            <label className="text-sm font-medium text-red-800">
              Motivo de eliminación (requerido):
            </label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Especifique el motivo de la eliminación..."
              rows={3}
              className="mt-1"
            />
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Nota:</strong> El pedido se moverá a la papelera y podrá ser restaurado si es necesario.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="confirm-delete"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="confirm-delete" className="text-sm">
              Confirmo que deseo eliminar este pedido
            </label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleDelete}
              disabled={!confirmed || !reason.trim()}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar Pedido
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
