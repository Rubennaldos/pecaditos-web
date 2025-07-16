
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Trash2, AlertTriangle } from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';

interface BillingOrderDeleteModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export const BillingOrderDeleteModal = ({ order, isOpen, onClose }: BillingOrderDeleteModalProps) => {
  const { deleteOrder } = useAdminBilling();
  const [reason, setReason] = useState('');

  const handleDelete = () => {
    if (!reason.trim()) {
      alert('Debe especificar el motivo de eliminación');
      return;
    }
    deleteOrder(order.id, reason);
    onClose();
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Eliminar Pedido
          </CardTitle>
          <Badge className="bg-red-100 text-red-800 w-fit">
            Acción Irreversible
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-800">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              <strong>¿Está seguro?</strong> Esta acción eliminará permanentemente el pedido {order.id} del cliente {order.client}.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Motivo de eliminación *</label>
            <Textarea
              placeholder="Especifique el motivo de la eliminación..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="min-h-20"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white flex-1"
              disabled={!reason.trim()}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Confirmar Eliminación
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
