
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
  Calendar,
  QrCode,
  Search
} from 'lucide-react';

export const BillingOrders = () => {
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterClient, setFilterClient] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);

  // Mock orders data with enhanced information
  const orders = [
    {
      id: "PEC-2024-001",
      client: "Distribuidora El Sol SAC",
      comercialName: "El Sol Distribuciones",
      ruc: "20123456789",
      amount: 450.00,
      date: "2024-01-15",
      status: "pending_payment",
      paymentMethod: "credito_30",
      dueDate: "2024-02-14",
      phone: "+51 999 111 222",
      whatsapp: "+51 999 111 222"
    },
    {
      id: "PEC-2024-002",
      client: "Minimarket Los Andes",
      comercialName: "Los Andes Market",
      ruc: "20555666777",
      amount: 780.00,
      date: "2024-01-14",
      status: "payment_overdue",
      paymentMethod: "credito_15",
      dueDate: "2024-01-29",
      phone: "+51 999 333 444",
      whatsapp: "+51 999 333 444"
    },
    {
      id: "PEC-2024-003",
      client: "Bodega Don Carlos",
      comercialName: "Bodega Carlos",
      ruc: "20777888999",
      amount: 320.00,
      date: "2024-01-16",
      status: "paid",
      paymentMethod: "contado",
      dueDate: "2024-01-16",
      phone: "+51 999 555 666",
      whatsapp: "+51 999 555 666"
    }
  ];

  const rejectReasons = [
    "Cliente no tiene fondos suficientes",
    "Producto no disponible en stock",
    "Error en el pedido del cliente",
    "Cliente canceló la orden",
    "Problemas de logística/entrega",
    "Otro motivo (especificar en observaciones)"
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending_payment':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente de Pago' };
      case 'payment_overdue':
        return { color: 'bg-red-100 text-red-800', text: 'Pago Vencido' };
      case 'paid':
        return { color: 'bg-green-100 text-green-800', text: 'Pagado' };
      case 'rejected':
        return { color: 'bg-gray-100 text-gray-800', text: 'Rechazado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  const handleRejectOrder = () => {
    if (!rejectReason.trim()) {
      alert('Debe seleccionar el motivo del rechazo');
      return;
    }
    
    console.log(`Rechazando pedido ${selectedOrder?.id}:`, {
      reason: rejectReason,
      timestamp: new Date().toISOString(),
      user: 'cobranzas@pecaditos.com'
    });
    
    // TODO: This rejection will be visible to all profiles and the client
    
    setShowRejectModal(false);
    setSelectedOrder(null);
    setRejectReason('');
  };

  const handleAcceptOrder = (order: any) => {
    console.log(`Aceptando pedido ${order.id} automáticamente`);
    // TODO: Process order acceptance
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
    // TODO: Implement QR scanner functionality
    console.log('Abriendo escáner QR...');
  };

  // Intelligent search filtering
  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'todos' || order.status === filterStatus;
    const matchesClient = !filterClient || 
      order.client.toLowerCase().includes(filterClient.toLowerCase()) ||
      order.comercialName.toLowerCase().includes(filterClient.toLowerCase());
    const matchesSearch = !searchTerm || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.ruc.includes(searchTerm) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.comercialName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesClient && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Gestión de Pedidos</h2>
        <p className="text-stone-600">Control y validación de todos los pedidos del sistema</p>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Inteligentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar pedido, RUC, cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pending_payment">Pendiente de Pago</SelectItem>
                <SelectItem value="payment_overdue">Pago Vencido</SelectItem>
                <SelectItem value="paid">Pagado</SelectItem>
                <SelectItem value="rejected">Rechazado</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Filtrar por cliente..."
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            />
            <Button
              onClick={handleQRScan}
              variant="outline"
              className="text-blue-600 border-blue-300 hover:bg-blue-50"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Escanear QR
            </Button>
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
                    <div className="mt-1 space-y-1">
                      <p className="text-stone-800 font-medium">{order.client}</p>
                      <p className="text-stone-600 text-sm">Nombre Comercial: {order.comercialName}</p>
                      <p className="text-stone-500 text-xs">RUC: {order.ruc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">S/ {order.amount.toFixed(2)}</div>
                    <div className="text-sm text-stone-500">
                      Vence: {new Date(order.dueDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-stone-400">
                      {order.paymentMethod}
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
                    <div className="text-sm flex items-center gap-4">
                      <span><span className="font-medium">Tel:</span> {order.phone}</span>
                      <span><span className="font-medium">WhatsApp:</span> {order.whatsapp}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
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
                    {order.status !== 'paid' && order.status !== 'rejected' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => handleAcceptOrder(order)}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Aceptar
                        </Button>
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
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Enhanced Reject Modal */}
      {showRejectModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-800">Rechazar Pedido</CardTitle>
              <div className="text-stone-600 space-y-1">
                <p><strong>Pedido:</strong> {selectedOrder.id}</p>
                <p><strong>Cliente:</strong> {selectedOrder.client}</p>
                <p><strong>Monto:</strong> S/ {selectedOrder.amount.toFixed(2)}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo del rechazo *</label>
                <Select value={rejectReason} onValueChange={setRejectReason}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar motivo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {rejectReasons.map((reason, index) => (
                      <SelectItem key={index} value={reason}>
                        {reason}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {rejectReason === "Otro motivo (especificar en observaciones)" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Observaciones adicionales</label>
                  <Textarea
                    placeholder="Especifique el motivo..."
                    className="min-h-20"
                  />
                </div>
              )}

              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  <strong>Importante:</strong> Este rechazo será visible para todos los perfiles 
                  y el cliente recibirá una notificación automática.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={handleRejectOrder}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                  disabled={!rejectReason}
                >
                  <X className="h-4 w-4 mr-2" />
                  Confirmar Rechazo
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Scanner Modal */}
      {showQRScanner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Escáner QR</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <QrCode className="h-16 w-16 mx-auto text-stone-400 mb-4" />
                <p className="text-stone-600">Funcionalidad de escáner QR</p>
                <p className="text-sm text-stone-500 mt-2">Se implementará con la cámara del dispositivo</p>
              </div>
              <Button
                onClick={() => setShowQRScanner(false)}
                variant="outline"
                className="w-full"
              >
                Cerrar
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
