
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminDelivery } from '@/contexts/AdminDeliveryContext';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface DeliveryDeleteModalProps {
  delivery: any;
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryDeleteModal = ({ delivery, isOpen, onClose }: DeliveryDeleteModalProps) => {
  const { deleteDelivery } = useAdminDelivery();
  const [deleteReason, setDeleteReason] = useState('');
  const [customReason, setCustomReason] = useState('');

  if (!isOpen || !delivery) return null;

  const handleDelete = () => {
    const finalReason = deleteReason === 'otro' ? customReason : deleteReason;
    if (!finalReason.trim()) {
      alert('Por favor especifica el motivo de eliminación');
      return;
    }

    deleteDelivery(delivery.id, finalReason);
    onClose();
  };

  const resetForm = () => {
    setDeleteReason('');
    setCustomReason('');
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Eliminar Entrega
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Entrega:</strong> {delivery.id}
            </p>
            <p className="text-sm text-red-800">
              <strong>Cliente:</strong> {delivery.customerName}
            </p>
            <p className="text-sm text-red-800 mt-2">
              Esta acción enviará la entrega a la papelera. Podrá ser restaurada posteriormente.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Motivo de eliminación *</Label>
            <Select value={deleteReason} onValueChange={setDeleteReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un motivo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="error_sistema">Error del sistema</SelectItem>
                <SelectItem value="pedido_duplicado">Pedido duplicado</SelectItem>
                <SelectItem value="cancelado_cliente">Cancelado por cliente</SelectItem>
                <SelectItem value="datos_incorrectos">Datos incorrectos</SelectItem>
                <SelectItem value="problema_inventario">Problema de inventario</SelectItem>
                <SelectItem value="fraude">Posible fraude</SelectItem>
                <SelectItem value="otro">Otro motivo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {deleteReason === 'otro' && (
            <div className="space-y-2">
              <Label>Especifica el motivo</Label>
              <Textarea
                placeholder="Describe el motivo de eliminación..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                rows={3}
              />
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleDelete}
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={!deleteReason || (deleteReason === 'otro' && !customReason.trim())}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Confirmar Eliminación
            </Button>
            <Button
              onClick={handleClose}
              variant="outline"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
