import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface OrderRejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  onReject: (orderId: string, reason: string) => Promise<void>;
}

export const OrderRejectModal = ({
  isOpen,
  onClose,
  orderId,
  onReject,
}: OrderRejectModalProps) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReject = async () => {
    if (!reason.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onReject(orderId, reason);
      setReason('');
      onClose();
    } catch (error) {
      console.error('Error al rechazar pedido:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setReason('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            ⚠️ Rechazar Pedido
          </DialogTitle>
          <DialogDescription>
            Vas a rechazar el pedido <strong>{orderId}</strong>.
            <br />
            Por favor, indica el motivo del rechazo. Este mensaje será enviado al cliente.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Label htmlFor="reason">Motivo del rechazo *</Label>
          <Textarea
            id="reason"
            placeholder="Ej: No tenemos disponibilidad para la fecha solicitada..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            className="resize-none"
          />
          <p className="text-sm text-stone-500">
            Mínimo 10 caracteres. El cliente recibirá este mensaje.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isLoading || reason.trim().length < 10}
          >
            {isLoading ? 'Rechazando...' : 'Rechazar Pedido'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};