import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, RotateCcw } from 'lucide-react';

import { getAuth } from 'firebase/auth';
import { db } from '@/config/firebase';
import { ref, onValue, query, orderByChild, equalTo } from 'firebase/database';

interface OrderItem {
  name: string;
  quantity: number;
  price: number; // unit price
}

interface Order {
  id: string;            // DB orderId real
  orderNumber?: string;  // MW-XXXXXX
  date: string;          // formateada
  total: number;
  status: 'completado' | 'en-proceso' | 'cancelado' | 'pendiente' | string;
  items: OrderItem[];
}

interface WholesaleOrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onRepeatOrder: (orderId: string) => void;
}

export const WholesaleOrderHistory = ({
  isOpen,
  onClose,
  onRepeatOrder,
}: WholesaleOrderHistoryProps) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const uid = getAuth().currentUser?.uid;
    if (!uid) {
      setOrders([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Pedidos del usuario autenticado
    const q = query(ref(db, 'wholesale/orders'), orderByChild('userId'), equalTo(uid));
    const off = onValue(
      q,
      (snap) => {
        const val = snap.val() || {};
        const list: Order[] = Object.entries(val).map(([id, v]: [string, any]) => {
          // Mapear items a la interfaz esperada: quantity y price unitario
          const items: OrderItem[] = Array.isArray(v?.items)
            ? v.items.map((it: any) => ({
                name: it?.name ?? '-',
                quantity: Number(it?.qty ?? 0),
                price: Number(it?.unit ?? 0),
              }))
            : [];

          return {
            id,
            orderNumber: v?.orderNumber,
            date: v?.createdAt ? new Date(Number(v.createdAt)).toLocaleString('es-PE') : '',
            total: Number(v?.totals?.total ?? 0),
            status: (v?.status as string) || 'pendiente',
            items,
          };
        });

        // Ordenar por fecha (desc)
        list.sort((a, b) => {
          const ta = a.date ? new Date(a.date).getTime() : 0;
          const tb = b.date ? new Date(b.date).getTime() : 0;
          return tb - ta;
        });

        setOrders(list);
        setLoading(false);
      },
      () => {
        setOrders([]);
        setLoading(false);
      }
    );

    return () => off();
  }, [isOpen]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado':
      case 'confirmado':
        return 'bg-green-100 text-green-800';
      case 'en-proceso':
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-600" />
            Historial de Pedidos Mayoristas
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading && (
            <div className="text-center py-12 text-stone-400">Cargando pedidos...</div>
          )}

          {!loading && orders.length === 0 && (
            <div className="text-center py-12 text-stone-400">No hay pedidos aún.</div>
          )}

          {orders.map((order) => (
            <div key={order.id} className="border border-stone-200 rounded-lg p-4 bg-stone-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-stone-800">
                    Pedido #{order.orderNumber ?? order.id}
                  </h3>
                  <p className="text-sm text-stone-600">{order.date}</p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(order.status)}>{order.status}</Badge>
                  <p className="text-lg font-bold text-stone-800 mt-1">
                    S/ {order.total.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-md p-3 mb-3">
                <h4 className="font-medium text-stone-700 mb-2 flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Productos
                </h4>
                <div className="space-y-1">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        S/ {(item.quantity * item.price).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRepeatOrder(order.id)} // enviamos el orderId real
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Repetir Pedido
                </Button>
                <Button variant="ghost" size="sm">Ver Detalles</Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
