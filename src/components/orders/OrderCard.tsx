
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  Printer, 
  AlertTriangle,
  Clock
} from 'lucide-react';
import OrderTimer from './OrderTimer';
import PrintModal from './PrintModal';

interface OrderCardProps {
  order: any;
  onStatusUpdate: (orderId: string, newStatus: string) => void;
  onPrint: (order: any, format: string, editedData: any) => void;
}

const OrderCard = ({ order, onStatusUpdate, onPrint }: OrderCardProps) => {
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Calcular si el pedido está vencido o próximo a vencer
  const getOrderUrgency = () => {
    const now = new Date();
    let referenceDate: Date;
    let timeLimit: number;

    switch (order.status) {
      case 'pendiente':
        referenceDate = new Date(order.createdAt);
        timeLimit = 24;
        break;
      case 'en_preparacion':
        referenceDate = order.acceptedAt ? new Date(order.acceptedAt) : new Date(order.createdAt);
        timeLimit = 48;
        break;
      case 'listo':
        referenceDate = order.readyAt ? new Date(order.readyAt) : new Date(order.createdAt);
        timeLimit = 48;
        break;
      default:
        return { isExpired: false, isUrgent: false, hoursLeft: 0 };
    }

    const limitDate = new Date(referenceDate.getTime() + (timeLimit * 60 * 60 * 1000));
    const difference = limitDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(difference / (1000 * 60 * 60));

    return {
      isExpired: difference <= 0,
      isUrgent: hoursLeft <= 6 && hoursLeft > 0,
      hoursLeft: Math.max(0, hoursLeft)
    };
  };

  const urgency = getOrderUrgency();

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendiente':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' };
      case 'en_preparacion':
        return { color: 'bg-blue-100 text-blue-800', text: 'En Preparación' };
      case 'listo':
        return { color: 'bg-green-100 text-green-800', text: 'Listo' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  const statusInfo = getStatusInfo(order.status);

  // Determinar clases CSS para highlighting
  const getCardClasses = () => {
    let baseClasses = "hover:shadow-lg transition-all";
    
    if (urgency.isExpired) {
      baseClasses += " ring-2 ring-red-500 bg-red-50 border-red-200";
    } else if (urgency.isUrgent) {
      baseClasses += " ring-2 ring-yellow-500 bg-yellow-50 border-yellow-200";
    }
    
    return baseClasses;
  };

  return (
    <>
      <Card className={getCardClasses()}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {order.id}
                  {urgency.isExpired && (
                    <Badge variant="destructive" className="animate-pulse">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      VENCIDO
                    </Badge>
                  )}
                  {urgency.isUrgent && !urgency.isExpired && (
                    <Badge className="bg-yellow-500 text-white animate-pulse">
                      <Clock className="h-3 w-3 mr-1" />
                      URGENTE
                    </Badge>
                  )}
                </CardTitle>
                <div className={`text-lg font-bold ${urgency.isExpired || urgency.isUrgent ? 'text-lg' : ''}`}>
                  {order.customerName}
                </div>
              </div>
            </div>
            <Badge className={statusInfo.color}>
              {statusInfo.text}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Información del cliente */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-stone-400" />
                <span className={urgency.isExpired || urgency.isUrgent ? 'font-semibold' : ''}>
                  {order.customerName}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-stone-400" />
                <span>{order.customerPhone}</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-stone-400 mt-0.5" />
                <span>{order.customerAddress}</span>
              </div>
            </div>

            {/* Información del pedido */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-stone-400" />
                <span>{new Date(order.createdAt).toLocaleString()}</span>
              </div>
              <div className="text-sm">
                <span className="font-medium">Total: S/ {order.total.toFixed(2)}</span>
              </div>
              <div className="text-sm">
                <span>Tipo: {order.orderType}</span>
              </div>
              
              {/* Timer visual */}
              <OrderTimer
                status={order.status}
                createdAt={order.createdAt}
                acceptedAt={order.acceptedAt}
                readyAt={order.readyAt}
                orderType={order.orderType}
              />
            </div>

            {/* Acciones */}
            <div className="flex flex-col gap-2">
              <Button
                size="sm"
                onClick={() => setShowPrintModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Printer className="h-4 w-4 mr-2" />
                Imprimir
              </Button>
              <Select onValueChange={(value) => onStatusUpdate(order.id, value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Cambiar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pendiente">Pendiente</SelectItem>
                  <SelectItem value="en_preparacion">En Preparación</SelectItem>
                  <SelectItem value="listo">Listo</SelectItem>
                  <SelectItem value="entregado">Entregado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Observaciones */}
          {order.notes && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-sm text-amber-800">
                <strong>Observaciones:</strong> {order.notes}
              </p>
            </div>
          )}

          {/* Productos */}
          <div className="mt-4 space-y-1">
            <h4 className="font-medium text-sm text-stone-700">Productos:</h4>
            {order.items?.map((item: any, index: number) => (
              <div key={index} className="flex justify-between text-sm text-stone-600">
                <span>{item.product} x{item.quantity}</span>
                <span>S/ {(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de impresión */}
      <PrintModal
        order={order}
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        onPrint={onPrint}
      />
    </>
  );
};

export default OrderCard;
