
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  MapPin, 
  Building2, 
  Printer, 
  ChevronRight,
  Clock,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import OrderDetailModal from './OrderDetailModal';
import PrintModal from './PrintModal';

interface CompactOrderListProps {
  orders: any[];
  showTimer?: boolean;
  showActions?: boolean;
  showAlerts?: boolean;
  timeLimit?: number; // 24h para pendientes, 72h para preparación
  onStatusUpdate?: (orderId: string, newStatus: string) => void;
  onPrint?: (order: any, format: string, editedData: any) => void;
}

const CompactOrderList = ({ 
  orders, 
  showTimer = false, 
  showActions = false,
  showAlerts = true,
  timeLimit = 24,
  onStatusUpdate,
  onPrint 
}: CompactOrderListProps) => {
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [printOrder, setPrintOrder] = useState<any>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Actualizar tiempo cada minuto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const getTimerColor = (hours: number, isExpired: boolean, status: string) => {
    if (isExpired) return 'text-red-600 animate-pulse';
    
    if (status === 'en_preparacion') {
      // 72h límite: Verde >36h, Amarillo 12-36h, Rojo <12h
      if (hours > 36) return 'text-green-600';
      if (hours > 12) return 'text-yellow-600';
      return 'text-red-500';
    } else {
      // 24h límite: Verde >12h, Amarillo 6-12h, Rojo <6h
      if (hours > 12) return 'text-green-600';
      if (hours > 6) return 'text-yellow-600';
      return 'text-red-500';
    }
  };

  const getCardClasses = (order: any, timeLeft: any) => {
    let baseClasses = "hover:shadow-md transition-all cursor-pointer border-l-4";
    
    // Lógica para indicadores visuales adicionales
    const now = Date.now();
    const createdAt = order.createdAt || now;
    const orderAge = now - createdAt;
    const hoursSinceCreated = orderAge / (1000 * 60 * 60);
    const isNewOrder = hoursSinceCreated < 0.5;
    
    if (timeLeft?.isExpired) {
      baseClasses += " border-l-red-500 bg-red-50 animate-pulse shadow-lg shadow-red-200";
    } else if (isNewOrder && order.status === 'pendiente') {
      baseClasses += " border-l-green-500 bg-green-50 animate-pulse shadow-lg shadow-green-200";
    } else if (timeLeft?.hours !== undefined) {
      if (order.status === 'en_preparacion') {
        if (timeLeft.hours <= 12) {
          baseClasses += " border-l-red-500 bg-red-50";
        } else if (timeLeft.hours <= 36) {
          baseClasses += " border-l-yellow-500 bg-yellow-50";
        } else {
          baseClasses += " border-l-green-500";
        }
      } else {
        if (timeLeft.hours <= 6) {
          baseClasses += " border-l-red-500 bg-red-50";
        } else if (timeLeft.hours <= 12) {
          baseClasses += " border-l-yellow-500 bg-yellow-50";
        } else {
          baseClasses += " border-l-green-500";
        }
      }
    } else {
      baseClasses += " border-l-blue-500";
    }
    
    return baseClasses;
  };

  const calculateTimeLeft = (order: any) => {
    let referenceDate: Date;

    switch (order.status) {
      case 'pendiente':
        referenceDate = new Date(order.createdAt);
        break;
      case 'en_preparacion':
        referenceDate = order.acceptedAt ? new Date(order.acceptedAt) : new Date(order.createdAt);
        break;
      case 'listo':
        referenceDate = order.readyAt ? new Date(order.readyAt) : new Date(order.createdAt);
        break;
      default:
        referenceDate = new Date(order.createdAt);
    }

    const limitDate = new Date(referenceDate.getTime() + (timeLimit * 60 * 60 * 1000));
    const difference = limitDate.getTime() - currentTime.getTime();
    const hours = Math.floor(difference / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));

    return {
      hours: Math.max(0, hours),
      minutes: Math.max(0, minutes),
      isExpired: difference <= 0
    };
  };

  const handlePrint = (order: any) => {
    setPrintOrder(order);
    setShowPrintModal(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pendiente':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'en_preparacion':
        return <Badge className="bg-blue-100 text-blue-800">En Preparación</Badge>;
      case 'listo':
        return <Badge className="bg-green-100 text-green-800">Listo</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-3">
        {orders.map((order) => {
          const timeLeft = showTimer ? calculateTimeLeft(order) : null;
          
          return (
            <Card 
              key={order.id} 
              className={getCardClasses(order, timeLeft)}
              onClick={() => setSelectedOrder(order)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    {/* Primera línea: ID y estado */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-lg text-brown-900">{order.id}</span>
                        {getStatusBadge(order.status)}
                        {showAlerts && timeLeft?.isExpired && (
                          <Badge variant="destructive" className="animate-pulse">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            VENCIDO
                          </Badge>
                        )}
                        {(() => {
                          const now = Date.now();
                          const createdAt = order.createdAt || now;
                          const orderAge = now - createdAt;
                          const hoursSinceCreated = orderAge / (1000 * 60 * 60);
                          const isNewOrder = hoursSinceCreated < 0.5;
                          
                          return isNewOrder && order.status === 'pendiente' && (
                            <Badge className="bg-green-500 text-white animate-pulse">
                              ● NUEVO
                            </Badge>
                          );
                        })()}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrint(order);
                          }}
                          className="h-6 w-6 p-0 text-stone-500 hover:text-stone-700"
                        >
                          <Printer className="h-3 w-3" />
                        </Button>
                        <ChevronRight className="h-4 w-4 text-stone-400" />
                      </div>
                    </div>

                    {/* Segunda línea: Cliente y sede */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-stone-500" />
                        <span className="font-semibold text-brown-800">{order.customerName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-stone-500" />
                        <span className="text-sm text-stone-600 truncate max-w-48">
                          {order.customerAddress}
                        </span>
                      </div>
                    </div>

                    {/* Tercera línea: Fechas */}
                    <div className="flex items-center gap-4 text-sm text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Creado: {new Date(order.createdAt).toLocaleDateString()}</span>
                      </div>
                      {order.status === 'listo' && order.readyAt && (
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span>Listo: {new Date(order.readyAt).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Timer mejorado */}
                    {showTimer && timeLeft && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-stone-500" />
                        <span className={`text-sm font-medium ${getTimerColor(timeLeft.hours, timeLeft.isExpired, order.status)}`}>
                          {timeLeft.isExpired ? 
                            'TIEMPO VENCIDO' : 
                            `${timeLeft.hours}h ${timeLeft.minutes}m restantes`
                          }
                        </span>
                        {order.status === 'en_preparacion' && timeLeft.isExpired && (
                          <Badge variant="destructive" className="animate-pulse ml-2">
                            CRÍTICO
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal de detalle */}
      {selectedOrder && (
        <OrderDetailModal
          order={selectedOrder}
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={onStatusUpdate}
          showActions={showActions}
        />
      )}

      {/* Modal de impresión */}
      {printOrder && (
        <PrintModal
          order={printOrder}
          isOpen={showPrintModal}
          onClose={() => {
            setShowPrintModal(false);
            setPrintOrder(null);
          }}
          onPrint={onPrint || (() => {})}
        />
      )}
    </>
  );
};

export default CompactOrderList;
