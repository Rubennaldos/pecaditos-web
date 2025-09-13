import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Package, QrCode, LogOut, BarChart3, Clock, CheckCircle, AlertTriangle, Smile,
  Edit, Trash2, History, MapPin, Phone
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import OrdersDashboard from '@/components/orders/OrdersDashboard';
import QRReaderModal from '@/components/orders/QRReaderModal';
import QROrderDetailModal from '@/components/orders/QROrderDetailModal';
import { useAdminOrders } from '@/contexts/AdminOrdersContext'; // ⬅️ usar provider global
import { AdminModeToggle } from '@/components/orders/AdminModeToggle';
import { OrderEditModal } from '@/components/orders/OrderEditModal';
import { OrderHistoryModal } from '@/components/orders/OrderHistoryModal';
import { OrderDeleteModal } from '@/components/orders/OrderDeleteModal';
import { OrderActionButtons } from '@/components/orders/OrderActionButtons';

// FIREBASE
import { db } from '@/config/firebase';
import { ref, onValue, update, push } from 'firebase/database';

const OrdersPanel = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const { isAdminMode, changeOrderStatus } = useAdminOrders();

  const [selectedTab, setSelectedTab] = useState<'dashboard' | 'pendientes' | 'en_preparacion' | 'listos' | 'alertas' | 'todos'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRReader, setShowQRReader] = useState(false);
  const [qrScannedOrder, setQrScannedOrder] = useState<any>(null);

  // Estado de pedidos
  const [orders, setOrders] = useState<any[]>([]);

  // Admin modals state
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [historyOrderId, setHistoryOrderId] = useState<string | undefined>();

  // Normaliza timestamp (número o ISO) -> number
  const ts = (v: any): number => {
    if (typeof v === 'number') return v;
    const n = Date.parse(v ?? '');
    return Number.isFinite(n) ? n : 0;
  };

  // Escucha en tiempo real
  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setOrders([]);
        return;
      }
      const ordersArray = Object.values(data) as any[];
      ordersArray.sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
      setOrders(ordersArray);
    });
    return () => unsubscribe();
  }, []);

  // Urgencia
  const calculateOrderUrgency = (order: any) => {
    const now = Date.now();
    let reference: number;
    let timeLimitHrs: number;

    switch (order.status) {
      case 'pendiente':
        reference = ts(order.createdAt);
        timeLimitHrs = 24;
        break;
      case 'en_preparacion':
        reference = ts(order.acceptedAt) || ts(order.createdAt);
        timeLimitHrs = 72;
        break;
      case 'listo':
        reference = ts(order.readyAt) || ts(order.createdAt);
        timeLimitHrs = 48;
        break;
      default:
        return { isExpired: false, isUrgent: false, hoursLeft: 0 };
    }

    const limit = reference + timeLimitHrs * 60 * 60 * 1000;
    const diff = limit - now;
    const hoursLeft = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));

    return {
      isExpired: diff <= 0,
      isUrgent:
        (order.status === 'en_preparacion' && hoursLeft <= 36) ||
        (order.status === 'pendiente' && hoursLeft <= 6),
      hoursLeft,
    };
  };

  const ordersWithUrgency = useMemo(
    () => orders.map(o => ({ ...o, urgency: calculateOrderUrgency(o) })),
    [orders]
  );

  const stats = useMemo(() => ({
    total: orders.length,
    pendientes: orders.filter(o => o.status === 'pendiente').length,
    enPreparacion: orders.filter(o => o.status === 'en_preparacion').length,
    listos: orders.filter(o => o.status === 'listo').length,
    vencidos: ordersWithUrgency.filter(o => o.urgency.isExpired).length,
    urgentes: ordersWithUrgency.filter(o => o.urgency.isUrgent && !o.urgency.isExpired).length,
    alertas: ordersWithUrgency.filter(o => o.urgency.isExpired || o.urgency.isUrgent).length,
  }), [orders, ordersWithUrgency]);

  // QR/Acciones
  const handleQRRead = (code: string) => {
    const orderId = code.replace('PECADITOS-ORDER-', '');
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const orderWithUrgency = { ...order, urgency: calculateOrderUrgency(order) };
      setQrScannedOrder(orderWithUrgency);
    }
    setShowQRReader(false);
  };

  // Actualiza estado (centralizado en contexto)
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await changeOrderStatus(orderId, newStatus);
    // Además, marca timestamps en RTDB para consistencia con paneles
    const orderRef = ref(db, `orders/${orderId}`);
    const updates: Record<string, any> = { status: newStatus };
    if (newStatus === 'en_preparacion') updates.acceptedAt = new Date().toISOString();
    else if (newStatus === 'listo') updates.readyAt = new Date().toISOString();
    else if (newStatus === 'entregado') updates.deliveredAt = new Date().toISOString();
    await update(orderRef, updates);
  };

  // Para QR
  const updateOrderStatusFromQR = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    setQrScannedOrder(null);
  };

  // Crea pedido de reposición (usa RTDB directo)
  const createNewOrderForMissingItems = (originalOrderId: string, incompleteItems: any[]) => {
    const originalOrder = orders.find(o => o.id === originalOrderId);
    if (!originalOrder) return;

    const newKey = push(ref(db, 'orders')).key;
    if (!newKey) return;

    const newOrder = {
      ...originalOrder,
      id: newKey,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      items: incompleteItems.map(item => ({
        product: item.product,
        quantity: item.requestedQuantity - item.sentQuantity,
        price: item.price,
      })),
      total: incompleteItems.reduce(
        (sum, item) => sum + (item.requestedQuantity - item.sentQuantity) * item.price,
        0
      ),
      notes: `Orden de reposición del pedido ${originalOrderId}`,
      orderType: 'reposicion',
    };

    update(ref(db, `orders/${newKey}`), newOrder);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {}
  };

  const handleEditOrder = (order: any) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleDeleteOrder = (order: any) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleViewHistory = (orderId?: string) => {
    setHistoryOrderId(orderId);
    setShowHistoryModal(true);
  };

  const matchesSearch = (o: any, q: string) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return (
      o.customerName?.toLowerCase().includes(t) ||
      o.id?.toLowerCase().includes(t) ||
      String(o.customerPhone ?? '').includes(q)
    );
  };

  // Renderiza la lista de pedidos
  const renderOrderList = (list: any[]) => (
    <div className="space-y-4">
      {list.map(order => (
        <Card key={order.id} className="hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{order.id}</h3>
                <p className="text-stone-600 font-medium">{order.customerName}</p>
                <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
                  <Phone className="h-4 w-4" />
                  <span>{order.customerPhone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{order.customerAddress}</span>
                </div>
              </div>
              <div className="text-right">
                <Badge
                  className={`mb-2 ${
                    order.status === 'pendiente'
                      ? 'bg-yellow-100 text-yellow-800'
                      : order.status === 'en_preparacion'
                      ? 'bg-blue-100 text-blue-800'
                      : order.status === 'listo'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-stone-100 text-stone-800'
                  }`}
                >
                  {order.status === 'pendiente'
                    ? 'Pendiente'
                    : order.status === 'en_preparacion'
                    ? 'En Preparación'
                    : order.status === 'listo'
                    ? 'Listo'
                    : order.status}
                </Badge>
                <p className="font-bold text-lg">S/ {Number(order.total ?? 0).toFixed(2)}</p>
                <p className="text-sm text-stone-500">{order.items?.length} productos</p>
              </div>
            </div>

            <div className="mb-4 p-3 bg-stone-50 rounded">
              <div className="space-y-1">
                {order.items?.slice(0, 2).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span>{item.product}</span>
                    <span>
                      {item.quantity} x S/ {item.price}
                    </span>
                  </div>
                ))}
                {order.items?.length > 2 && (
                  <p className="text-xs text-stone-500">
                    y {order.items.length - 2} producto(s) más...
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-3 border-t border-stone-200">
              <OrderActionButtons
                orderId={order.id}
                currentStatus={order.status}
                onStatusChange={updateOrderStatus}
                order={order}
                onCreateNewOrder={createNewOrderForMissingItems}
              />

              {isAdminMode && (
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditOrder(order)}
                    className="text-purple-600 border-purple-300 hover:bg-purple-50"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewHistory(order.id)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <History className="h-3 w-3 mr-1" />
                    Historial
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteOrder(order)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Eliminar
                  </Button>
                </div>
              )}
            </div>

            {order.notes && (
              <div className="pt-2 border-t border-stone-200 mt-2">
                <p className="text-xs text-stone-500">
                  <strong>Notas:</strong> {order.notes}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim();
    return ordersWithUrgency.filter(o => matchesSearch(o, q));
  }, [ordersWithUrgency, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand-50 via-white to-sand-50">
      <AdminModeToggle />
      <div className="bg-white shadow-sm border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brown-900">
                  Panel de Pedidos
                  {isAdminMode && (
                    <Badge className="ml-2 bg-purple-600 text-white">MODO ADMIN</Badge>
                  )}
                </h1>
                <p className="text-brown-700">Gestión y preparación de pedidos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isAdminMode && (
                <Button
                  onClick={() => handleViewHistory()}
                  className="bg-amber-600 hover:bg-amber-700 text-white"
                >
                  <History className="h-4 w-4 mr-2" />
                  Historial Global
                </Button>
              )}
              <Button
                onClick={() => setShowQRReader(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Leer QR
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-brown-700 border-sand-300 hover:bg-sand-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* CONTENIDO PRINCIPAL */}
          <div className="flex-1 min-w-0">
            {/* Barra de búsqueda y tabs */}
            <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
              <Input
                className="md:w-72"
                placeholder="Buscar por cliente, pedido o teléfono..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 justify-start w-full md:w-auto">
                <Button
                  size="sm"
                  variant={selectedTab === 'dashboard' ? 'default' : 'outline'}
                  onClick={() => setSelectedTab('dashboard')}
                >
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
                <Button
                  size="sm"
                  variant={selectedTab === 'pendientes' ? 'default' : 'outline'}
                  onClick={() => setSelectedTab('pendientes')}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  Pendientes
                  <Badge className="ml-1">{stats.pendientes}</Badge>
                </Button>
                <Button
                  size="sm"
                  variant={selectedTab === 'en_preparacion' ? 'default' : 'outline'}
                  onClick={() => setSelectedTab('en_preparacion')}
                >
                  <Smile className="h-4 w-4 mr-1" />
                  En preparación
                  <Badge className="ml-1">{stats.enPreparacion}</Badge>
                </Button>
                <Button
                  size="sm"
                  variant={selectedTab === 'listos' ? 'default' : 'outline'}
                  onClick={() => setSelectedTab('listos')}
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Listos
                  <Badge className="ml-1">{stats.listos}</Badge>
                </Button>
                <Button
                  size="sm"
                  variant={selectedTab === 'alertas' ? 'default' : 'outline'}
                  onClick={() => setSelectedTab('alertas')}
                >
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Urgentes/Vencidos
                  <Badge className="ml-1">{stats.alertas}</Badge>
                </Button>
                <Button
                  size="sm"
                  variant={selectedTab === 'todos' ? 'default' : 'outline'}
                  onClick={() => setSelectedTab('todos')}
                >
                  Todos
                  <Badge className="ml-1">{stats.total}</Badge>
                </Button>
              </div>
            </div>

            {/* Dashboard, listado o alertas según el tab */}
            {selectedTab === 'dashboard' && (
              <OrdersDashboard stats={stats} orders={ordersWithUrgency} />
            )}

            {selectedTab === 'pendientes' &&
              renderOrderList(
                ordersWithUrgency.filter(
                  o => o.status === 'pendiente' && matchesSearch(o, searchTerm)
                )
              )}

            {selectedTab === 'en_preparacion' &&
              renderOrderList(
                ordersWithUrgency.filter(
                  o => o.status === 'en_preparacion' && matchesSearch(o, searchTerm)
                )
              )}

            {selectedTab === 'listos' &&
              renderOrderList(
                ordersWithUrgency.filter(
                  o => o.status === 'listo' && matchesSearch(o, searchTerm)
                )
              )}

            {selectedTab === 'alertas' &&
              renderOrderList(
                ordersWithUrgency.filter(
                  o =>
                    (o.urgency.isUrgent || o.urgency.isExpired) &&
                    matchesSearch(o, searchTerm)
                )
              )}

            {selectedTab === 'todos' && renderOrderList(filtered)}
          </div>
        </div>
      </div>

      {/* MODALES */}
      <OrderEditModal
        order={selectedOrder}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedOrder(null);
        }}
      />
      <OrderHistoryModal
        orderId={historyOrderId}
        isOpen={showHistoryModal}
        onClose={() => {
          setShowHistoryModal(false);
          setHistoryOrderId(undefined);
        }}
      />
      <OrderDeleteModal
        order={selectedOrder}
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedOrder(null);
        }}
      />
      <QRReaderModal
        isOpen={showQRReader}
        onClose={() => setShowQRReader(false)}
        onQRRead={handleQRRead}
      />
      {qrScannedOrder && (
        <QROrderDetailModal
          order={qrScannedOrder}
          isOpen={!!qrScannedOrder}
          onClose={() => setQrScannedOrder(null)}
          onStatusUpdate={updateOrderStatusFromQR}
        />
      )}
    </div>
  );
};

export default OrdersPanel;
