
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Edit, Save, X, AlertTriangle } from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';

interface BillingOrderEditModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
}

export const BillingOrderEditModal = ({ order, isOpen, onClose }: BillingOrderEditModalProps) => {
  const { editOrder } = useAdminBilling();
  const [editData, setEditData] = useState({
    client: order?.client || '',
    amount: order?.amount || 0,
    status: order?.status || '',
    dueDate: order?.dueDate || '',
    paymentMethod: order?.paymentMethod || '',
    notes: ''
  });

  const handleSave = () => {
    editOrder(order.id, editData);
    onClose();
  };

  if (!isOpen || !order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <Edit className="h-5 w-5" />
            Editar Pedido - {order.id}
          </CardTitle>
          <Badge className="bg-orange-100 text-orange-800 w-fit">
            Modo Administrador
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <p className="text-sm text-orange-800">
              <AlertTriangle className="h-4 w-4 inline mr-2" />
              <strong>Advertencia:</strong> Los cambios se registrarán en el historial de auditoría.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Cliente</label>
              <Input
                value={editData.client}
                onChange={(e) => setEditData({...editData, client: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Monto</label>
              <Input
                type="number"
                value={editData.amount}
                onChange={(e) => setEditData({...editData, amount: parseFloat(e.target.value)})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <Select value={editData.status} onValueChange={(value) => setEditData({...editData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="accepted">Aceptado</SelectItem>
                  <SelectItem value="rejected">Rechazado</SelectItem>
                  <SelectItem value="paid">Pagado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Fecha de Vencimiento</label>
              <Input
                type="date"
                value={editData.dueDate}
                onChange={(e) => setEditData({...editData, dueDate: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Método de Pago</label>
            <Select value={editData.paymentMethod} onValueChange={(value) => setEditData({...editData, paymentMethod: value})}>
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Notas de Edición</label>
            <Textarea
              placeholder="Motivo de la edición..."
              value={editData.notes}
              onChange={(e) => setEditData({...editData, notes: e.target.value})}
              className="min-h-20"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
