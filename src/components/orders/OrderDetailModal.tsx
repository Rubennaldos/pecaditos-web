
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Package,
  CreditCard,
  MessageSquare,
  Check,
  X,
  Clock,
  AlertTriangle
} from 'lucide-react';

interface OrderDetailModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
  showActions?: boolean;
}

const OrderDetailModal = ({ 
  order, 
  isOpen, 
  onClose, 
  onStatusUpdate,
  showActions = false 
}: OrderDetailModalProps) => {
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [postponeDate, setPostponeDate] = useState('');
  const [postponeReason, setPostponeReason] = useState('');
  const [showPostponeForm, setShowPostponeForm] = useState(false);

  const handleAcceptOrder = () => {
    onStatusUpdate?.(order.id, 'en_preparacion');
    onClose();
  };

  const handleRejectOrder = () => {
    if (!rejectionReason.trim()) return;
    console.log(`Rechazando pedido ${order.id}: ${rejectionReason}`);
    onStatusUpdate?.(order.id, 'rechazado');
    onClose();
  };

  const handlePostponeOrder = () => {
    if (!postponeDate || !postponeReason.trim()) return;
    console.log(`Postergando pedido ${order.id} hasta ${postponeDate}: ${postponeReason}`);
    // TODO: Implementar lógica de postergación
    onClose();
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendiente':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente de Aceptación' };
      case 'en_preparacion':
        return { color: 'bg-blue-100 text-blue-800', text: 'En Preparación' };
      case 'listo':
        return { color: 'bg-green-100 text-green-800', text: 'Listo para Entrega' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Detalle del Pedido {order.id}</span>
            <Badge className={statusInfo.color}>
              {statusInfo.text}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del cliente */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h3 className="font-semibold text-brown-900 border-b pb-2">Información del Cliente</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-stone-500" />
                  <span className="font-medium">{order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-stone-500" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-stone-500 mt-0.5" />
                  <span className="text-sm">{order.customerAddress}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-brown-900 border-b pb-2">Detalles del Pedido</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-stone-500" />
                  <span>Creado: {new Date(order.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-stone-500" />
                  <span>Pago: {order.paymentMethod}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-stone-500" />
                  <span>Tipo: {order.orderType}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Productos */}
          <div className="space-y-3">
            <h3 className="font-semibold text-brown-900 border-b pb-2">Productos</h3>
            <div className="space-y-2">
              {order.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-center p-3 bg-sand-50 rounded-md">
                  <div>
                    <span className="font-medium">{item.product}</span>
                    <span className="text-stone-600 ml-2">x{item.quantity}</span>
                  </div>
                  <span className="font-semibold">S/ {(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 border-t font-bold">
                <span>Total:</span>
                <span>S/ {order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Observaciones */}
          {order.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-brown-900 border-b pb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Observaciones
              </h3>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-amber-800">{order.notes}</p>
              </div>
            </div>
          )}

          {/* Acciones para pedidos pendientes */}
          {showActions && order.status === 'pendiente' && (
            <div className="space-y-4 pt-4 border-t">
              <h3 className="font-semibold text-brown-900 flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                Acciones Requeridas
              </h3>
              
              {!showRejectionForm && !showPostponeForm && (
                <div className="flex gap-3">
                  <Button 
                    onClick={handleAcceptOrder}
                    className="bg-green-600 hover:bg-green-700 text-white flex-1"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Aceptar Pedido
                  </Button>
                  <Button 
                    onClick={() => setShowRejectionForm(true)}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button 
                    onClick={() => setShowPostponeForm(true)}
                    variant="outline"
                    className="flex-1"
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Postergar
                  </Button>
                </div>
              )}

              {/* Formulario de rechazo */}
              {showRejectionForm && (
                <div className="space-y-3 p-4 bg-red-50 border border-red-200 rounded-md">
                  <h4 className="font-medium text-red-800">Motivo del Rechazo</h4>
                  <Select onValueChange={setRejectionReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar motivo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no_stock">No hay stock disponible</SelectItem>
                      <SelectItem value="error_datos">Error en los datos del pedido</SelectItem>
                      <SelectItem value="duplicado">Pedido duplicado</SelectItem>
                      <SelectItem value="otro">Otro motivo</SelectItem>
                    </SelectContent>
                  </Select>
                  {rejectionReason === 'otro' && (
                    <Textarea 
                      placeholder="Especificar motivo..." 
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  )}
                  <div className="flex gap-2">
                    <Button onClick={handleRejectOrder} variant="destructive">
                      Confirmar Rechazo
                    </Button>
                    <Button onClick={() => setShowRejectionForm(false)} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Formulario de postergación */}
              {showPostponeForm && (
                <div className="space-y-3 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                  <h4 className="font-medium text-yellow-800">Postergar Pedido</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Nueva fecha:</label>
                      <input 
                        type="date" 
                        className="w-full p-2 border rounded-md"
                        value={postponeDate}
                        onChange={(e) => setPostponeDate(e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Motivo:</label>
                      <Textarea 
                        placeholder="Explicar motivo..." 
                        value={postponeReason}
                        onChange={(e) => setPostponeReason(e.target.value)}
                        className="min-h-[40px]"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handlePostponeOrder} className="bg-yellow-600 hover:bg-yellow-700">
                      Confirmar Postergación
                    </Button>
                    <Button onClick={() => setShowPostponeForm(false)} variant="outline">
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OrderDetailModal;
