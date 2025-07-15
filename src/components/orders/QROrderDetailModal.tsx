
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Package,
  CheckCircle,
  Clock,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

interface QROrderDetailModalProps {
  order: any;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: string, reason?: string) => void;
}

const QROrderDetailModal = ({ order, isOpen, onClose, onStatusUpdate }: QROrderDetailModalProps) => {
  const [delayReason, setDelayReason] = useState('');
  const [showDelayForm, setShowDelayForm] = useState(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendiente':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente', icon: Clock };
      case 'en_preparacion':
        return { color: 'bg-blue-100 text-blue-800', text: 'En Preparación', icon: Package };
      case 'listo':
        return { color: 'bg-green-100 text-green-800', text: 'Listo', icon: CheckCircle };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status, icon: Package };
    }
  };

  const getUrgencyColor = (urgency: any) => {
    if (urgency.isExpired) return 'text-red-600';
    if (urgency.isUrgent) return 'text-yellow-600';
    return 'text-green-600';
  };

  const statusInfo = getStatusInfo(order.status);
  const StatusIcon = statusInfo.icon;

  const handleStatusUpdate = (newStatus: string) => {
    onStatusUpdate(order.id, newStatus);
  };

  const handleDelaySubmit = () => {
    if (delayReason.trim()) {
      onStatusUpdate(order.id, 'retrasado', delayReason);
      setDelayReason('');
      setShowDelayForm(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="text-brown-900">Pedido Escaneado: {order.id}</span>
            <Badge className={statusInfo.color}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusInfo.text}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Estado y urgencia */}
          {order.urgency && (
            <Card className={`${order.urgency.isExpired ? 'border-red-200 bg-red-50' : 
                              order.urgency.isUrgent ? 'border-yellow-200 bg-yellow-50' : 
                              'border-green-200 bg-green-50'}`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span className={`font-medium ${getUrgencyColor(order.urgency)}`}>
                    {order.urgency.isExpired ? 
                      'TIEMPO VENCIDO' : 
                      `${order.urgency.hoursLeft}h restantes`
                    }
                  </span>
                  {order.urgency.isExpired && (
                    <Badge variant="destructive" className="animate-pulse">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      URGENTE
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Información del cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Información del Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-stone-500" />
                <span className="font-semibold">{order.customerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-stone-500" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-stone-500 mt-0.5" />
                <span className="text-sm">{order.customerAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-stone-500" />
                <span className="text-sm">
                  Creado: {new Date(order.createdAt).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Productos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Detalle de Productos</CardTitle>
            </CardHeader>
            <CardContent>
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
                <div className="flex justify-between items-center pt-2 border-t font-bold text-lg">
                  <span>Total:</span>
                  <span>S/ {order.total.toFixed(2)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {order.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Observaciones
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <p className="text-amber-800">{order.notes}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Acciones rápidas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actualizar Estado</CardTitle>
            </CardHeader>
            <CardContent>
              {!showDelayForm ? (
                <div className="grid grid-cols-2 gap-3">
                  {order.status === 'pendiente' && (
                    <Button 
                      onClick={() => handleStatusUpdate('en_preparacion')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Package className="h-4 w-4 mr-2" />
                      En Preparación
                    </Button>
                  )}
                  
                  {order.status === 'en_preparacion' && (
                    <Button 
                      onClick={() => handleStatusUpdate('listo')}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar Listo
                    </Button>
                  )}

                  {order.status === 'listo' && (
                    <Button 
                      onClick={() => handleStatusUpdate('entregado')}
                      className="bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Entregado
                    </Button>
                  )}

                  <Button 
                    onClick={() => setShowDelayForm(true)}
                    variant="outline"
                    className="border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Reportar Retraso
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-medium text-yellow-800">Motivo del Retraso</h4>
                  <Textarea 
                    placeholder="Especifique el motivo del retraso..." 
                    value={delayReason}
                    onChange={(e) => setDelayReason(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="flex gap-2">
                    <Button 
                      onClick={handleDelaySubmit}
                      disabled={!delayReason.trim()}
                      className="bg-yellow-600 hover:bg-yellow-700"
                    >
                      Confirmar Retraso
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowDelayForm(false);
                        setDelayReason('');
                      }}
                      variant="outline"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QROrderDetailModal;
