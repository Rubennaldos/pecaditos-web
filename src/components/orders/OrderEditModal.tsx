
import { useState } from 'react';
import { Edit, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';

interface OrderEditModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderEditModal = ({ order, isOpen, onClose }: OrderEditModalProps) => {
  const { editOrder } = useAdminOrders();
  const [editedOrder, setEditedOrder] = useState(order || {});
  const [changes, setChanges] = useState<any>({});

  // Don't render if modal is not open or order is null
  if (!isOpen || !order) return null;

  const handleSave = () => {
    editOrder(order.id, {
      previous: order,
      new: editedOrder,
      changes: Object.keys(changes)
    });
    onClose();
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditedOrder(prev => ({ ...prev, [field]: value }));
    setChanges(prev => ({ ...prev, [field]: { from: order[field], to: value } }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <Edit className="h-5 w-5" />
            Editar Pedido - {order.id}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Cliente</label>
              <Input
                value={editedOrder.customerName || ''}
                onChange={(e) => handleFieldChange('customerName', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <Input
                value={editedOrder.customerPhone || ''}
                onChange={(e) => handleFieldChange('customerPhone', e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Dirección</label>
            <Input
              value={editedOrder.customerAddress || ''}
              onChange={(e) => handleFieldChange('customerAddress', e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Estado</label>
              <Select
                value={editedOrder.status || 'pendiente'}
                onValueChange={(value) => handleFieldChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_preparacion">En Preparación</SelectItem>
                  <SelectItem value="listo">Listo</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Total</label>
              <Input
                type="number"
                step="0.01"
                value={editedOrder.total || 0}
                onChange={(e) => handleFieldChange('total', parseFloat(e.target.value))}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Notas</label>
            <Textarea
              value={editedOrder.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              rows={3}
            />
          </div>

          {Object.keys(changes).length > 0 && (
            <div className="bg-amber-50 p-3 rounded-lg">
              <p className="text-sm font-medium text-amber-800 mb-2">Cambios pendientes:</p>
              <ul className="text-xs text-amber-700 space-y-1">
                {Object.entries(changes).map(([field, change]: [string, any]) => (
                  <li key={field}>
                    • {field}: "{change.from}" → "{change.to}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
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
