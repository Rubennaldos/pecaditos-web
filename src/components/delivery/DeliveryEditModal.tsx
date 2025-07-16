
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAdminDelivery } from '@/contexts/AdminDeliveryContext';
import { Save, X } from 'lucide-react';

interface DeliveryEditModalProps {
  delivery: any;
  isOpen: boolean;
  onClose: () => void;
}

export const DeliveryEditModal = ({ delivery, isOpen, onClose }: DeliveryEditModalProps) => {
  const { editDelivery } = useAdminDelivery();
  const [editedDelivery, setEditedDelivery] = useState(delivery || {});
  const [changes, setChanges] = useState<any>({});

  // Don't render if modal is not open or delivery is null
  if (!isOpen || !delivery) return null;

  const handleFieldChange = (field: string, value: any) => {
    setEditedDelivery(prev => ({ ...prev, [field]: value }));
    setChanges(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    editDelivery(delivery.id, {
      ...editedDelivery,
      lastModified: new Date().toISOString(),
      modifiedBy: 'admin@pecaditos.com'
    });
    onClose();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'listo': return 'bg-green-100 text-green-800';
      case 'en_ruta': return 'bg-blue-100 text-blue-800';
      case 'entregado': return 'bg-emerald-100 text-emerald-800';
      case 'rechazado': return 'bg-red-100 text-red-800';
      case 'postergado': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Editar Entrega: {delivery.id}
            <Badge className={getStatusColor(editedDelivery.status || 'listo')}>
              {editedDelivery.status || 'listo'}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label>Cliente</Label>
              <Input
                value={editedDelivery.customerName || ''}
                onChange={(e) => handleFieldChange('customerName', e.target.value)}
              />
            </div>
            
            <div>
              <Label>Teléfono</Label>
              <Input
                value={editedDelivery.customerPhone || ''}
                onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
              />
            </div>
            
            <div>
              <Label>Dirección</Label>
              <Textarea
                value={editedDelivery.customerAddress || ''}
                onChange={(e) => handleFieldChange('customerAddress', e.target.value)}
                rows={2}
              />
            </div>
            
            <div>
              <Label>Distrito</Label>
              <Input
                value={editedDelivery.district || ''}
                onChange={(e) => handleFieldChange('district', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label>Estado</Label>
              <Select
                value={editedDelivery.status || 'listo'}
                onValueChange={(value) => handleFieldChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="listo">Listo</SelectItem>
                  <SelectItem value="en_ruta">En Ruta</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="rechazado">Rechazado</SelectItem>
                  <SelectItem value="postergado">Postergado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Total (S/)</Label>
              <Input
                type="number"
                step="0.01"
                value={editedDelivery.total || 0}
                onChange={(e) => handleFieldChange('total', parseFloat(e.target.value) || 0)}
              />
            </div>
            
            <div>
              <Label>Método de Pago</Label>
              <Select
                value={editedDelivery.paymentMethod || 'contado'}
                onValueChange={(value) => handleFieldChange('paymentMethod', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="contado">Contado</SelectItem>
                  <SelectItem value="credito_15">Crédito 15 días</SelectItem>
                  <SelectItem value="credito_30">Crédito 30 días</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Asignado a</Label>
              <Input
                value={editedDelivery.assignedTo || ''}
                onChange={(e) => handleFieldChange('assignedTo', e.target.value)}
                placeholder="Nombre del repartidor"
              />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Notas</Label>
            <Textarea
              value={editedDelivery.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={2}
            />
          </div>
          
          <div>
            <Label>Notas de Entrega</Label>
            <Textarea
              value={editedDelivery.deliveryNotes || ''}
              onChange={(e) => handleFieldChange('deliveryNotes', e.target.value)}
              rows={2}
            />
          </div>
        </div>

        {Object.keys(changes).length > 0 && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
            <p className="text-sm text-amber-800 font-medium">Cambios detectados:</p>
            <p className="text-xs text-amber-700 mt-1">
              {Object.keys(changes).join(', ')}
            </p>
          </div>
        )}

        <div className="flex gap-2">
          <Button
            onClick={handleSave}
            className="flex-1 bg-green-600 hover:bg-green-700"
            disabled={Object.keys(changes).length === 0}
          >
            <Save className="h-4 w-4 mr-2" />
            Guardar Cambios
          </Button>
          <Button
            onClick={onClose}
            variant="outline"
          >
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
