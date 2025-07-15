
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  X, 
  CheckCircle, 
  AlertCircle, 
  Phone, 
  MessageSquare,
  Filter,
  Calendar
} from 'lucide-react';

export const BillingOrders = () => {
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterClient, setFilterClient] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Mock orders data
  const orders = [
    {
      id: "PEC-2024-001",
      client: "Distribuidora El Sol SAC",
      amount: 450.00,
      date: "2024-01-15",
      status: "pending_payment",
      paymentMethod: "credito_30",
      dueDate: "2024-02-14"
    },
    {
      id: "PEC-2024-002",
      client: "Minimarket Los Andes",
      amount: 780.00,
      date: "2024-01-14",
      status: "payment_overdue",
      paymentMethod: "credito_15",
      dueDate: "2024-01-29"
    },
    {
      id: "PEC-2024-003",
      client: "Bodega Don Carlos",
      amount: 320.00,
      date: "2024-01-16",
      status: "paid",
      paymentMethod: "contado",
      dueDate: "2024-01-16"
    }
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente de Pago' };
      case 'payment_overdue':
        return { color: 'bg-red-100 text-red-800', text: 'Pago Vencido' };
      case 'paid':
        return { color: 'bg-green-100 text-green-800', text: 'Pagado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  const handleRejectOrder = () => {
    if (!rejectReason.trim()) {
      alert('Debe ingresar el motivo del rechazo');
      return;
    }
    
    console.log(`Rechazando pedido ${selectedOrder?.id} por: ${rejectReason}`);
    setShowRejectModal(false);
    setSelectedOrder(null);
    setRejectReason('');
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'todos' || order.status === filterStatus;
    const matchesClient = !filterClient || order.client.toLowerCase().includes(filterClient.toLowerCase());
    return matchesStatus && matchesClient;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Gestión de Pedidos</h2>
        <p className="text-stone-600">Control de estados de pago de todos los pedidos</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pending_payment">Pendiente de Pago</SelectItem>
                <SelectItem value="payment_overdue">Pago Vencido</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Buscar cliente..."
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-stone-500" />
              <Input type="date" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.map((order) => {
          const statusInfo = getStatusInfo(order.status);
          const isOverdue = order.status === 'payment_overdue';
          
          return (
            <Card 
              key={order.id} 
              className={`hover:shadow-lg transition-all ${isOverdue ? 'animate-pulse border-red-300 bg-red-50' : ''}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {order.id}
                      <Badge className={statusInfo.color}>
                        {statusInfo.text}
                      </Badge>
                    </CardTitle>
                    <p className="text-stone-600 mt-1">{order.client}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">S/ {order.amount.toFixed(2)}</div>
                    <div className="text-sm text-stone-500">
                      Vence: {new Date(order.dueDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Fecha:</span> {new Date(order.date).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Método:</span> {order.paymentMethod}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    {order.status === 'pending_payment' && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar Pagado
                      </Button>
                    )}
                    {(order.status === 'pending_payment' || order.status === 'payment_overdue') && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowRejectModal(true);
                        }}
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Rechazar
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Reject Modal */}
      {showRejectModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-800">Rechazar Pedido</CardTitle>
              <p className="text-stone-600">
                Pedido: {selectedOrder.id} - {selectedOrder.client}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo del rechazo *</label>
                <Textarea
                  placeholder="Explica el motivo del rechazo (será visible para todos los perfiles)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-20"
                />
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  <strong>Atención:</strong> Este rechazo será visible para todos los perfiles 
                  y el pedido no podrá ser procesado hasta resolver el problema.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRejectOrder}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Rechazar Pedido
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
