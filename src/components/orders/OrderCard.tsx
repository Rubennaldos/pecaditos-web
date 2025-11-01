
import { Clock, MapPin, Phone, Eye, Edit, Trash2, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderActionButtons } from './OrderActionButtons';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';
import { useAuth } from '@/hooks/useAuth';

interface OrderCardProps {
  order: {
    id: string;
    customer: string;
    address: string;
    phone: string;
    items: Array<{ name: string; quantity: number; price: number }>;
    total: number;
    status: string;
    priority: 'normal' | 'urgent';
    estimatedTime: string;
    paymentMethod: string;
    notes?: string;
    createdAt?: number;
    readyAt?: number;
    acceptedAt?: number;
  };
  onView: (order: any) => void;
  onEdit?: (order: any) => void;
  onDelete?: (orderId: string) => void;
  onHistory?: (orderId: string) => void;
  onStatusChange?: (orderId: string, newStatus: string) => void;
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'en_preparacion': return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'listo': return 'bg-green-100 text-green-800 border-green-300';
    case 'en_camino': return 'bg-purple-100 text-purple-800 border-purple-300';
    case 'entregado': return 'bg-stone-100 text-stone-800 border-stone-300';
    default: return 'bg-stone-100 text-stone-800 border-stone-300';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'pendiente': return 'Pendiente';
    case 'en_preparacion': return 'En Preparación';
    case 'listo': return 'Listo';
    case 'en_camino': return 'En Camino';
    case 'entregado': return 'Entregado';
    default: return status;
  }
};

export const OrderCard = ({ 
  order, 
  onView, 
  onEdit, 
  onDelete, 
  onHistory,
  onStatusChange = () => {}
}: OrderCardProps) => {
  const { perfil } = useAuth();
  const { isAdminMode } = useAdminOrders();
  
  // Verificar si tiene acceso al dashboard para mostrar controles especiales
  const rol = perfil?.rol || perfil?.role;
  const hasAdminAccess = rol === 'admin' || rol === 'adminGeneral' || perfil?.accessModules?.includes('dashboard');
  const showAdminControls = hasAdminAccess && isAdminMode;
  
  // Lógica para indicadores visuales
  const now = Date.now();
  const createdAt = order.createdAt || now;
  const orderAge = now - createdAt;
  const hoursSinceCreated = orderAge / (1000 * 60 * 60);
  
  // Luz verde parpadeante para pedidos nuevos (menos de 30 minutos)
  const isNewOrder = hoursSinceCreated < 0.5 && order.status === 'pendiente';
  // Color rojo para pedidos después de 24 horas  
  const isExpired = hoursSinceCreated > 24;
  
  // Clases de animación
  const getOrderIndicatorClasses = () => {
    if (isExpired) {
      return "border-red-500 bg-red-50 shadow-lg shadow-red-200";
    }
    if (isNewOrder && order.status === 'pendiente') {
      return "border-green-500 bg-green-50 shadow-lg shadow-green-200 animate-pulse";
    }
    return "";
  };

  return (
    <Card className={`relative ${order.priority === 'urgent' ? 'border-red-300 bg-red-50/30' : ''} ${getOrderIndicatorClasses()}`}>
      {/* Indicadores de estado */}
      {order.priority === 'urgent' && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
          URGENTE
        </div>
      )}
      
      {isNewOrder && order.status === 'pendiente' && (
        <div className="absolute -top-2 -left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">
          ● NUEVO
        </div>
      )}
      
      {isExpired && (
        <div className="absolute -top-2 -left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full animate-bounce">
          ⚠ +24H
        </div>
      )}
      
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-stone-800">
              {order.id}
            </CardTitle>
            <p className="text-stone-600 font-medium">{order.customer}</p>
          </div>
          <Badge className={`${getStatusColor(order.status)} border`}>
            {getStatusText(order.status)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-stone-600">
          <MapPin className="h-4 w-4" />
          <span className="truncate">{order.address}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-stone-600">
          <Phone className="h-4 w-4" />
          <span>{order.phone}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-stone-600">
          <Clock className="h-4 w-4" />
          <span>Tiempo estimado: {order.estimatedTime}</span>
        </div>

        <div className="pt-2 border-t border-stone-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-600">
              {order.items.length} productos
            </span>
            <span className="font-bold text-lg text-stone-800">
              S/ {order.total.toFixed(2)}
            </span>
          </div>
          
          <div className="text-xs text-stone-500">
            {order.paymentMethod}
          </div>
        </div>

        {/* Botones de Acción del Flujo Normal */}
        <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-200">
          <Button onClick={() => onView(order)} size="sm" variant="outline">
            <Eye className="h-4 w-4 mr-1" />
            Ver
          </Button>

          {/* Botones de Aceptar/Listo según el estado */}
          <OrderActionButtons
            orderId={order.id}
            currentStatus={order.status}
            onStatusChange={onStatusChange}
            order={order}
          />

          {/* Controles Admin (solo para Admin General en modo admin) */}
          {showAdminControls && (
            <>
              {onEdit && (
                <Button onClick={() => onEdit(order)} size="sm" variant="outline" className="text-blue-600">
                  <Edit className="h-4 w-4 mr-1" />
                  Editar
                </Button>
              )}
              
              {onDelete && (
                <Button onClick={() => onDelete(order.id)} size="sm" variant="outline" className="text-red-600">
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </Button>
              )}
              
              {onHistory && (
                <Button onClick={() => onHistory(order.id)} size="sm" variant="outline" className="text-amber-600">
                  <History className="h-4 w-4 mr-1" />
                  Historial
                </Button>
              )}
            </>
          )}
        </div>

        {order.notes && (
          <div className="pt-2 border-t border-stone-200">
            <p className="text-xs text-stone-500">
              <strong>Notas:</strong> {order.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
