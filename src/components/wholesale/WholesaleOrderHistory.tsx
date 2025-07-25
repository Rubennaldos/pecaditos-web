import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Package, DollarSign, RotateCcw } from 'lucide-react';

interface Order {
  id: string;
  date: string;
  total: number;
  status: 'completado' | 'en-proceso' | 'cancelado';
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface WholesaleOrderHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  onRepeatOrder: (orderId: string) => void;
}

const mockOrders: Order[] = [
  {
    id: 'WH-2024-001',
    date: '2024-01-15',
    total: 450.00,
    status: 'completado',
    items: [
      { name: 'Alfajor de Chocolate', quantity: 12, price: 15.00 },
      { name: 'Alfajor de Dulce de Leche', quantity: 18, price: 18.00 }
    ]
  },
  {
    id: 'WH-2024-002', 
    date: '2024-01-10',
    total: 320.00,
    status: 'completado',
    items: [
      { name: 'Alfajor de Fresa', quantity: 12, price: 16.00 },
      { name: 'Alfajor Triple', quantity: 6, price: 21.00 }
    ]
  }
];

export const WholesaleOrderHistory = ({ isOpen, onClose, onRepeatOrder }: WholesaleOrderHistoryProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completado': return 'bg-green-100 text-green-800';
      case 'en-proceso': return 'bg-yellow-100 text-yellow-800';
      case 'cancelado': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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
          {mockOrders.map((order) => (
            <div key={order.id} className="border border-stone-200 rounded-lg p-4 bg-stone-50">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-semibold text-stone-800">Pedido #{order.id}</h3>
                  <p className="text-sm text-stone-600">{order.date}</p>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                  <p className="text-lg font-bold text-stone-800 mt-1">S/ {order.total.toFixed(2)}</p>
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
                      <span>{item.name} x{item.quantity}</span>
                      <span className="font-medium">S/ {(item.quantity * item.price).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onRepeatOrder(order.id)}
                  className="flex items-center gap-2"
                >
                  <RotateCcw className="h-4 w-4" />
                  Repetir Pedido
                </Button>
                <Button variant="ghost" size="sm">
                  Ver Detalles
                </Button>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};