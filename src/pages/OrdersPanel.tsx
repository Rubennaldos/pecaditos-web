// src/pages/OrdersPanel.tsx
import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Package,
  QrCode,
  LogOut,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  Smile,
  Edit,
  Trash2,
  History,
  MapPin,
  Phone,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import OrdersDashboard from '@/components/orders/OrdersDashboard';
import QRReaderModal from '@/components/orders/QRReaderModal';
import QROrderDetailModal from '@/components/orders/QROrderDetailModal';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';
import { AdminModeToggle } from '@/components/orders/AdminModeToggle';
import { OrderEditModal } from '@/components/orders/OrderEditModal';
import { OrderHistoryModal } from '@/components/orders/OrderHistoryModal';
import { OrderDeleteModal } from '@/components/orders/OrderDeleteModal';
import { OrderActionButtons } from '@/components/orders/OrderActionButtons';

// FIREBASE
import { db } from '@/config/firebase';
import { ref, onValue, update, push } from 'firebase/database';

type TOrder = {
  id: string;
  orderNumber?: string;
  status: string;
  createdAt?: number;
  acceptedAt?: number;
  readyAt?: number;
  deliveredAt?: number;
  // negocio/sede
  tradeName?: string;
  legalName?: string;
  siteName?: string;
  // contacto
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;
  // items/total
  items: Array<{ product: string; quantity: number; price: number }>;
  total: number;
  notes?: string;
  orderType?: string;
  urgency?: { isExpired: boolean; isUrgent: boolean; hoursLeft: number };
};

const toNumTs = (v: any): number =>
  typeof v === 'number' ? v : Number.isFinite(Date.parse(v ?? '')) ? Date.parse(v) : 0;

/** Normaliza cualquier forma de pedido que venga de RTDB a nuestra forma UI */
const normalizeOrder = (id: string, o: any): TOrder => {
  const rawItems = Array.isArray(o?.items) ? o.items : o?.items ? Object.values(o.items) : [];
  const items = rawItems.map((it: any) => ({
    product: it?.product ?? it?.name ?? '—',
    quantity: it?.quantity ?? it?.qty ?? 0,
    price: it?.price ?? it?.unit ?? 0
  }));

  const computedTotal =
    typeof o?.total === 'number'
      ? o.total
      : typeof o?.totals?.total === 'number'
      ? o.totals.total
      : items.reduce(
          (sum: number, it: any) =>
            sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
          0
        );

  // nombres de negocio / sede desde múltiples posibles caminos
  const tradeName =
    o?.tradeName ||
    o?.commercialName ||
    o?.company?.commercialName ||
    o?.business?.tradeName ||
    o?.store?.tradeName ||
    o?.shopName ||
    o?.nombreComercial ||
    '';

  const legalName =
    o?.legalName ||
    o?.razonSocial ||
    o?.company?.legalName ||
    o?.business?.legalName ||
    o?.store?.legalName ||
    '';

  const siteName =
    o?.site?.name ||
    o?.shipping?.siteName ||
    o?.branch?.name ||
    o?.sede ||
    o?.store?.branchName ||
    '';

  return {
    id: o?.id ?? id,
    orderNumber: o?.orderNumber ?? o?.number ?? undefined,
    status: o?.status ?? 'pendiente',

    // contacto
    customerName:
      o?.customerName ?? o?.clientName ?? o?.shipping?.siteName ?? o?.site?.name ?? '—',
    customerPhone: o?.customerPhone ?? o?.phone ?? o?.contactPhone ?? '',
    customerAddress: o?.customerAddress ?? o?.shipping?.address ?? o?.site?.address ?? '',

    // negocio / sede
    tradeName,
    legalName,
    siteName,

    items,
    total: Number(computedTotal) || 0,

    createdAt: toNumTs(o?.createdAt),
    acceptedAt: o?.acceptedAt ? toNumTs(o.acceptedAt) : undefined,
    readyAt: o?.readyAt ? toNumTs(o.readyAt) : undefined,
    deliveredAt: o?.deliveredAt ? toNumTs(o.deliveredAt) : undefined,

    notes: o?.notes ?? o?.observations ?? '',
    orderType: o?.orderType ?? 'normal'
  };
};

const OrdersPanel = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const { isAdminMode, changeOrderStatus } = useAdminOrders();

  const [selectedTab, setSelectedTab] = useState<
    'dashboard' | 'pendientes' | 'en_preparacion' | 'listos' | 'alertas' | 'todos'
  >('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRReader, setShowQRReader] = useState(false);
  const [qrScannedOrder, setQrScannedOrder] = useState<TOrder | null>(null);

  const [orders, setOrders] = useState<TOrder[]>([]);

  // Admin modals
  const [selectedOrder, setSelectedOrder] = useState<TOrder | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [historyOrderId, setHistoryOrderId] = useState<string | undefined>();

  // Suscripción RTDB
  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const raw = snapshot.val() || {};
      const list = Object.entries(raw).map(([k, v]) => normalizeOrder(k, v));
      // más reciente primero
      list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setOrders(list);
    });
    return () => unsubscribe();
  }, []);

  // Urgencia
  const calculateOrderUrgency = (order: TOrder) => {
    const now = Date.now();
    let reference = order.createdAt ?? 0;
    let timeLimitHrs = 24;

    if (order.status === 'en_preparacion') {
      reference = order.acceptedAt ?? order.createdAt ?? 0;
      timeLimitHrs = 72;
    } else if (order.status === 'listo') {
      reference = order.readyAt ?? order.createdAt ?? 0;
      timeLimitHrs = 48;
    }

    const limit = reference + timeLimitHrs * 60 * 60 * 1000;
    const diff = limit - now;
    const hoursLeft = Math.max(0, Math.floor(diff / (1000 * 60 * 60)));

    return {
      isExpired: diff <= 0,
      isUrgent:
        (order.status === 'en_preparacion' && hoursLeft <= 36) ||
        (order.status === 'pendiente' && hoursLeft <= 6),
      hoursLeft
    };
  };

  const ordersWithUrgency = useMemo(
    () => orders.map((o) => ({ ...o, urgency: calculateOrderUrgency(o) })),
    [orders]
  );

  const stats = useMemo(
    () => ({
      total: orders.length,
      pendientes: orders.filter((o) => o.status === 'pendiente').length,
      enPreparacion: orders.filter((o) => o.status === 'en_preparacion').length,
      listos: orders.filter((o) => o.status === 'listo').length,
      vencidos: ordersWithUrgency.filter((o) => o.urgency?.isExpired).length,
      urgentes: ordersWithUrgency.filter((o) => o.urgency?.isUrgent && !o.urgency?.isExpired).length,
      alertas: ordersWithUrgency.filter((o) => o.urgency?.isExpired || o.urgency?.isUrgent).length
    }),
    [orders, ordersWithUrgency]
  );

  // QR
  const handleQRRead = (code: string) => {
    const orderId = code.replace('PECADITOS-ORDER-', '');
    const order = orders.find((o) => o.id === orderId);
    if (order) setQrScannedOrder({ ...order, urgency: calculateOrderUrgency(order) });
    setShowQRReader(false);
  };

  // Cambio de estado (usa contexto + timestamps RTDB)
  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    await changeOrderStatus(orderId, newStatus);
    const orderRef = ref(db, `orders/${orderId}`);
    const updates: Record<string, any> = { status: newStatus };
    const iso = new Date().toISOString();
    if (newStatus === 'en_preparacion') updates.acceptedAt = iso;
    else if (newStatus === 'listo') updates.readyAt = iso;
    else if (newStatus === 'entregado') updates.deliveredAt = iso;
    await update(orderRef, updates);
  };

  const updateOrderStatusFromQR = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    setQrScannedOrder(null);
  };

  // Nueva orden para faltantes
  const createNewOrderForMissingItems = (originalOrderId: string, incompleteItems: any[]) => {
    const original = orders.find((o) => o.id === originalOrderId);
    if (!original) return;

    const newKey = push(ref(db, 'orders')).key;
    if (!newKey) return;

    const newOrder = {
      ...original,
      id: newKey,
      orderNumber: undefined,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      items: incompleteItems.map((it: any) => ({
        product: it.product,
        quantity: it.requestedQuantity - it.sentQuantity,
        price: it.price
      })),
      total: incompleteItems.reduce(
        (sum: number, it: any) => sum + (it.requestedQuantity - it.sentQuantity) * it.price,
        0
      ),
      notes: `Orden de reposición del pedido ${originalOrderId}`,
      orderType: 'reposicion'
    };

    update(ref(db, `orders/${newKey}`), newOrder);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch {}
  };

  const handleEditOrder = (order: TOrder) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleDeleteOrder = (order: TOrder) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleViewHistory = (orderId?: string) => {
    setHistoryOrderId(orderId);
    setShowHistoryModal(true);
  };

  const matchesSearch = (o: TOrder, q: string) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return (
      o.tradeName?.toLowerCase().includes(t) ||
      o.legalName?.toLowerCase().includes(t) ||
      o.siteName?.toLowerCase().includes(t) ||
      o.customerName?.toLowerCase().includes(t) ||
      o.orderNumber?.toLowerCase?.().includes(t) ||
      o.id?.toLowerCase().includes(t) ||
      String(o.customerPhone ?? '').includes(q)
    );
  };

  // Render de lista
  const renderOrderList = (list: TOrder[]) => (
    <div className="space-y-4">
      {list.map((order) => (
        <Card key={order.id} className="hover:shadow-lg transition-all">
          <CardContent className="p-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                {/* NOMBRE COMERCIAL */}
                <h3 className="text-xl md:text-2xl font-bold text-brown-900">
                  {order.tradeName || '—'}
                </h3>

                {/* Razón social + Sede */}
                <div className="flex flex-wrap gap-x-3 text-sm text-stone-600">
                  {order.legalName && <span>R. Social: {order.legalName}</span>}
                  {order.siteName && (
                    <span className="inline-flex items-center gap-1">
                      • <MapPin className="h-3 w-3" />
                      {order.siteName}
                    </span>
                  )}
                </div>

                {/* Contacto y fecha */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-stone-500 mt-2">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{order.customerPhone || '—'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Creado:{' '}
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : '—'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
                  <MapPin className="h-4 w-4" />
                  <span className="truncate">{order.customerAddress}</span>
                </div>
              </div>

              <div className="text-right min-w-[200px]">
                {/* Código / Número de orden */}
                <div className="text-xs text-stone-500 mb-1">
                  {order.orderNumber ? (
                    <>
                      <span className="font-semibold text-stone-700">Orden:</span>{' '}
                      {order.orderNumber}
                    </>
                  ) : (
                    <>
                      <span className="font-semibold text-stone-700">ID:</span> {order.id}
                    </>
                  )}
                </div>

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

            {/* Resumen de productos */}
            <div className="mb-4 p-3 bg-stone-50 rounded">
              <div className="space-y-1">
                {order.items?.slice(0, 2).map((item, idx) => (
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

            {/* Acciones */}
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
    return ordersWithUrgency.filter((o) => matchesSearch(o, q));
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
            {/* Búsqueda y tabs */}
            <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
              <Input
                className="md:w-72"
                placeholder="Buscar por cliente, empresa, sede, pedido o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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

            {/* Contenidos por tab */}
            {selectedTab === 'dashboard' && (
              <OrdersDashboard stats={stats} orders={ordersWithUrgency} />
            )}

            {selectedTab === 'pendientes' &&
              renderOrderList(
                ordersWithUrgency.filter(
                  (o) => o.status === 'pendiente' && matchesSearch(o, searchTerm)
                )
              )}

            {selectedTab === 'en_preparacion' &&
              renderOrderList(
                ordersWithUrgency.filter(
                  (o) => o.status === 'en_preparacion' && matchesSearch(o, searchTerm)
                )
              )}

            {selectedTab === 'listos' &&
              renderOrderList(
                ordersWithUrgency.filter(
                  (o) => o.status === 'listo' && matchesSearch(o, searchTerm)
                )
              )}

            {selectedTab === 'alertas' &&
              renderOrderList(
                ordersWithUrgency.filter(
                  (o) =>
                    (o.urgency?.isUrgent || o.urgency?.isExpired) &&
                    matchesSearch(o, searchTerm)
                )
              )}

            {selectedTab === 'todos' && renderOrderList(filtered)}
          </div>
        </div>
      </div>

      {/* MODALES */}
      <OrderEditModal
        order={selectedOrder as any}
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
        order={selectedOrder as any}
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
