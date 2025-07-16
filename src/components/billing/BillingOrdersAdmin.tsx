
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  X,
  Edit,
  Trash2,
  History,
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';
import { BillingOrderEditModal } from './BillingOrderEditModal';
import { BillingOrderDeleteModal } from './BillingOrderDeleteModal';

export const BillingOrdersAdmin = () => {
  const { isAdminMode } = useAdminBilling();
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Mock orders data with phone numbers displayed
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
      case 'rejected':
        return { color: 'bg-gray-100 text-gray-800', text: 'Rechazado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  const handleAcceptOrder = (order: any) => {
    console.log(`Aceptando pedido ${order.id} automáticamente`);
    // TODO: Process order acceptance with proper status change
  };

  const handleCallClient = (phone: string) => {
    console.log(`Iniciando llamada a ${phone}`);
    // TODO: Integrate with phone system
  };

  const handleWhatsAppClient = (phone: string) => {
    console.log(`Abriendo WhatsApp para ${phone}`);
    // TODO: Open WhatsApp with phone number
  };

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'todos' || order.status === filterStatus;
    const matchesSearch = !searchTerm || 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.ruc.includes(searchTerm) ||
      order.client.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Gestión de Pedidos</h2>
        <p className="text-stone-600">Control y validación de todos los pedidos del sistema</p>
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
                      <p className="text-stone-600 text-sm">Comercial: {order.comercialName}</p>
                      <p className="text-stone-500 text-xs">RUC: {order.ruc}</p>
                    </div>
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
                      <span className="font-medium">Teléfono:</span> {order.phone}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCallClient(order.phone)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {order.phone}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWhatsAppClient(order.whatsapp)}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    
                    {order.status !== 'paid' && order.status !== 'rejected' && (
                      <Button
                        size="sm"
                        onClick={() => handleAcceptOrder(order)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aceptar
                      </Button>
                    )}

                    {/* Admin Controls */}
                    {isAdminMode && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowEditModal(true);
                          }}
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowDeleteModal(true);
                          }}
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-300 hover:bg-purple-50"
                        >
                          <History className="h-4 w-4 mr-2" />
                          Historial
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

      {/* Modals */}
      <BillingOrderEditModal
        order={selectedOrder}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrder(null);
        }}
      />

      <BillingOrderDeleteModal
        order={selectedOrder}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrder(null);
        }}
      />
    </div>
  );
};
