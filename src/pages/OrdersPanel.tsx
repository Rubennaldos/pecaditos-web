// src/pages/OrdersPanel.tsx
import { useState, useEffect, useMemo, useRef } from 'react';
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
  Building2,
  Calendar,
  IdCard,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import OrdersDashboard from '@/components/orders/OrdersDashboard';
import QRReaderModal from '@/components/orders/QRReaderModal';
import QROrderDetailModal from '@/components/orders/QROrderDetailModal';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';

import { OrderEditModal } from '@/components/orders/OrderEditModal';
import { OrderHistoryModal } from '@/components/orders/OrderHistoryModal';
import { OrderDeleteModal } from '@/components/orders/OrderDeleteModal';
import { OrderActionButtons } from '@/components/orders/OrderActionButtons';
import AIImportOrderModal from '@/components/orders/AIImportOrderModal';
import { QuickOrderButton } from '@/components/orders/QuickOrderButton';
import { db } from '@/config/firebase';
import { ref, onValue, update, push, runTransaction } from 'firebase/database';

// --------- Tipos locales súper permisivos (coinciden con tu RTDB) ----------
type OrderRT = {
  id: string;
  status?: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | 'rechazado' | string;
  createdAt?: string | number;
  acceptedAt?: string | number;
  readyAt?: string | number;
  deliveredAt?: string | number;
  rejectedReason?: string;

  orderNumber?: string;
  number?: string;

  total?: number;
  items?: Array<{ name?: string; product?: string; title?: string; quantity?: number; price?: number }>;

  client?: {
    name?: string;
    legalName?: string;
    commercialName?: string;
    ruc?: string;
  };

  shipping?: { siteName?: string; address?: string };
  site?: { name?: string; address?: string };
  siteName?: string;
  customerName?: string;
  customerPhone?: string;
  customerAddress?: string;

  legalName?: string;
  ruc?: string;

  notes?: string;
};

type Urgency = { isExpired: boolean; isUrgent: boolean; hoursLeft: number };
type OrderWithUrgency = OrderRT & { urgency: Urgency };

// -------------------------------------------------------------------------
const pad3 = (n: number) => String(n).padStart(3, '0');

const ensureOrderNumber = async (orderId: string) => {
  // contador global en RTDB
  const seqRef = ref(db, 'meta/orderSeq');
  const res = await runTransaction(seqRef, (curr) => (typeof curr !== 'number' ? 1 : curr + 1));
  const seq = res.snapshot?.val() ?? 1;
  const orderNumber = `ORD-${pad3(seq)}`;
  await update(ref(db, `orders/${orderId}`), { orderNumber });
  return orderNumber;
};

const OrdersPanel = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isAdminMode, changeOrderStatus } = useAdminOrders();

  const [selectedTab, setSelectedTab] = useState<
    'dashboard' | 'pendientes' | 'en_preparacion' | 'listos' | 'entregados' | 'alertas' | 'rechazados' | 'todos'
  >('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [showQRReader, setShowQRReader] = useState(false);
  const [qrScannedOrder, setQrScannedOrder] = useState<OrderWithUrgency | null>(null);

  const [orders, setOrders] = useState<OrderRT[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderRT | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [historyOrderId, setHistoryOrderId] = useState<string | undefined>();
  const [showAIImport, setShowAIImport] = useState(false);

  // Evitar backfill duplicado
  const backfilledRef = useRef<Set<string>>(new Set());

  const ts = (v: any): number => {
    if (typeof v === 'number') return v;
    const n = Date.parse(v ?? '');
    return Number.isFinite(n) ? n : 0;
  };

  // Suscripción a RTDB (conservar id)
  useEffect(() => {
    const ordersRef = ref(db, 'orders');
    const unsubscribe = onValue(ordersRef, (snapshot) => {
      const raw = snapshot.val() as Record<string, any> | null;
      if (!raw) {
        setOrders([]);
        return;
      }
      const arr: OrderRT[] = Object.entries(raw).map(([id, o]) => ({ id, ...(o as any) }));
      arr.sort((a, b) => ts(b.createdAt) - ts(a.createdAt));
      setOrders(arr);
    });
    return () => unsubscribe();
  }, []);

  // Backfill de correlativo si falta
  useEffect(() => {
    orders.forEach(async (o) => {
      if (!o.id || o.orderNumber || backfilledRef.current.has(o.id)) return;
      backfilledRef.current.add(o.id);
      try {
        await ensureOrderNumber(o.id);
  } catch { /* no-op */ }
    });
  }, [orders]);

  const calculateOrderUrgency = (order: OrderRT): Urgency => {
    const now = Date.now();
    let reference = 0;
    let timeLimitHrs = 0;

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

  const ordersWithUrgency = useMemo<OrderWithUrgency[]>(
    () => orders.map((o) => ({ ...o, urgency: calculateOrderUrgency(o) })),
    [orders]
  );

  const stats = useMemo(
    () => ({
      total: orders.length,
      pendientes: orders.filter((o) => o.status === 'pendiente').length,
      enPreparacion: orders.filter((o) => o.status === 'en_preparacion').length,
      listos: orders.filter((o) => o.status === 'listo').length,
      entregados: orders.filter((o) => o.status === 'entregado').length,
      rechazados: orders.filter((o) => o.status === 'rechazado').length,
      vencidos: ordersWithUrgency.filter((o) => o.urgency.isExpired).length,
      urgentes: ordersWithUrgency.filter((o) => o.urgency.isUrgent && !o.urgency.isExpired).length,
      alertas: ordersWithUrgency.filter((o) => o.urgency.isExpired || o.urgency.isUrgent).length,
    }),
    [orders, ordersWithUrgency]
  );

  const getSiteName = (o: OrderRT) => o.site?.name || o.shipping?.siteName || o.siteName || '';
  const getAddress = (o: OrderRT) => o.site?.address || o.shipping?.address || o.customerAddress || '';
  const getOrderCode = (o: OrderRT) => o.orderNumber || o.number || o.id;
  const getLegalName = (o: OrderRT) => o.client?.legalName || o.legalName || '';
  const getRuc = (o: OrderRT) => o.client?.ruc || o.ruc || '';
  const getTitle = (o: OrderRT) =>
    o.client?.commercialName ||
    o.customerName ||
    o.client?.name ||
    o.client?.legalName ||
    getSiteName(o) ||
    '—';

  const getBlinkClass = (o: OrderRT) => {
    if (o.status !== 'pendiente') return '';
    const createdMs = ts(o.createdAt);
    const ageMs = Date.now() - createdMs;
    const isOver24h = ageMs >= 24 * 60 * 60 * 1000;
    return isOver24h ? 'blink-red' : 'blink-yellow';
  };

  const handleQRRead = (code: string) => {
    const orderId = code.replace('PECADITOS-ORDER-', '');
    const found = orders.find((o) => o.id === orderId);
    if (found) setQrScannedOrder({ ...found, urgency: calculateOrderUrgency(found) });
    setShowQRReader(false);
  };

  const updateOrderStatus = async (
    orderId: string,
    newStatus: string,
    extra?: { reason?: string }
  ) => {
    await changeOrderStatus(orderId, newStatus);
    const orderRef = ref(db, `orders/${orderId}`);
    const updates: Record<string, any> = { status: newStatus };
    if (newStatus === 'en_preparacion') updates.acceptedAt = new Date().toISOString();
    else if (newStatus === 'listo') updates.readyAt = new Date().toISOString();
    else if (newStatus === 'entregado') updates.deliveredAt = new Date().toISOString();
    else if (newStatus === 'rechazado') {
      updates.rejectedAt = new Date().toISOString();
      if (extra?.reason) updates.rejectedReason = extra.reason;
    }
    await update(orderRef, updates);
  };

  const updateOrderStatusFromQR = async (orderId: string, newStatus: string) => {
    await updateOrderStatus(orderId, newStatus);
    setQrScannedOrder(null);
  };

  const createNewOrderForMissingItems = (originalOrderId: string, incompleteItems: any[]) => {
    const original = orders.find((o) => o.id === originalOrderId);
    if (!original) return;

    const newKey = push(ref(db, 'orders')).key;
    if (!newKey) return;

    const newOrder: OrderRT = {
      ...original,
      id: newKey,
      status: 'pendiente',
      createdAt: new Date().toISOString(),
      items: incompleteItems.map((it) => ({
        product: it.product,
        quantity: it.requestedQuantity - it.sentQuantity,
        price: it.price,
      })),
      total: incompleteItems.reduce(
        (sum, it) => sum + (it.requestedQuantity - it.sentQuantity) * it.price,
        0
      ),
      notes: `Orden de reposición del pedido ${originalOrderId}`,
    };

    update(ref(db, `orders/${newKey}`), newOrder).then(async () => {
      await ensureOrderNumber(newKey);
    });
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
  } catch { /* no-op */ }
  };

  const handleEditOrder = (order: OrderRT) => {
    setSelectedOrder(order);
    setShowEditModal(true);
  };

  const handleDeleteOrder = (order: OrderRT) => {
    setSelectedOrder(order);
    setShowDeleteModal(true);
  };

  const handleViewHistory = (orderId?: string) => {
    setHistoryOrderId(orderId);
    setShowHistoryModal(true);
  };

  const matchesSearch = (o: OrderRT, q: string) => {
    if (!q) return true;
    const t = q.toLowerCase();
    return (
      getTitle(o).toLowerCase().includes(t) ||
      getSiteName(o).toLowerCase().includes(t) ||
      String(getOrderCode(o)).toLowerCase().includes(t) ||
      String(o.customerPhone ?? '').includes(q)
    );
  };

  const renderOrderList = (list: OrderWithUrgency[]) => (
    <div className="space-y-4">
      {list.map((order) => {
        const title = getTitle(order);
        const site = getSiteName(order);
        const legal = getLegalName(order);
        const ruc = getRuc(order);
        const addr = getAddress(order);
        const oc = getOrderCode(order);
        const showSiteChip = site && site !== title;
        const blinkClass = getBlinkClass(order);

        return (
          <Card key={order.id} className="hover:shadow-lg transition-all">
            <CardContent className="p-4">
              {/* Header */}
              <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between mb-2">
                <div className="flex items-center gap-2">
                  {blinkClass && <span className={`inline-block h-2.5 w-2.5 rounded-full ${blinkClass}`} />}
                  <h3 className="text-lg md:text-xl font-semibold text-brown-900">{title}</h3>
                  {showSiteChip && (
                    <div className="hidden md:flex items-center gap-1 text-stone-600">
                      <span className="mx-1">•</span>
                      <Building2 className="h-4 w-4" />
                      <span className="font-medium">{site}</span>
                    </div>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-stone-500">
                    <span className="font-medium">Orden:</span>{' '}
                    <span className="font-semibold">{oc}</span>
                  </div>
                  <Badge
                    className={`mt-1 ${
                      order.status === 'pendiente'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'en_preparacion'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'listo'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'rechazado'
                        ? 'bg-red-100 text-red-700'
                        : order.status === 'entregado'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    {order.status === 'pendiente'
                      ? 'Pendiente'
                      : order.status === 'en_preparacion'
                      ? 'En Preparación'
                      : order.status === 'listo'
                      ? 'Listo'
                      : order.status === 'entregado'
                      ? 'Entregado'
                      : order.status === 'rechazado'
                      ? 'Rechazado'
                      : order.status}
                  </Badge>
                  <div className="mt-1 font-bold text-lg">S/ {Number(order.total ?? 0).toFixed(2)}</div>
                  <div className="text-xs text-stone-500">{order.items?.length ?? 0} productos</div>
                </div>
              </div>

              {/* Meta */}
              <div className="flex flex-col gap-2 text-sm text-stone-700 mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-stone-500" />
                  <span>
                    <span className="text-stone-500">Creado:</span>{' '}
                    {order.createdAt ? new Date(ts(order.createdAt)).toLocaleString() : '—'}
                  </span>
                </div>
                {addr ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-stone-500" />
                    <span>{addr}</span>
                  </div>
                ) : null}
                {(legal || ruc) && (
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    {legal ? (
                      <div className="flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-stone-500" />
                        <span className="text-stone-500">Razón social:</span>
                        <span className="font-medium">{legal}</span>
                      </div>
                    ) : null}
                    {ruc ? (
                      <div className="flex items-center gap-2">
                        <IdCard className="h-4 w-4 text-stone-500" />
                        <span className="text-stone-500">RUC:</span>
                        <span className="font-medium">{ruc}</span>
                      </div>
                    ) : null}
                  </div>
                )}
                {order.status === 'rechazado' && order.rejectedReason && (
                  <div className="text-xs text-red-700 bg-red-50 p-2 rounded">
                    <strong>Motivo rechazo:</strong> {order.rejectedReason}
                  </div>
                )}
              </div>

              {/* Ítems */}
              <div className="mb-4 p-3 bg-stone-50 rounded">
                <div className="space-y-1">
                  {order.items?.slice(0, 2).map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span>{item.name ?? item.product ?? item.title ?? 'Producto'}</span>
                      <span>
                        {item.quantity} x S/ {item.price}
                      </span>
                    </div>
                  ))}
                  {order.items && order.items.length > 2 && (
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
                  currentStatus={order.status ?? 'pendiente'}
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
                      Rechazar
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
        );
      })}
    </div>
  );

  const filtered = useMemo(() => {
    const q = searchTerm.trim();
    return ordersWithUrgency.filter((o) => matchesSearch(o, q));
  }, [ordersWithUrgency, searchTerm]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sand-50 via-white to-sand-50">
      {/* Estilos locales para parpadeo */}
      <style>{`
        @keyframes pulseYellow { 0%,100% { opacity:.25 } 50% { opacity:1 } }
        @keyframes pulseRed { 0%,100% { opacity:.25 } 50% { opacity:1 } }
        .blink-yellow { background:#f59e0b; animation:pulseYellow 1s infinite; }
        .blink-red { background:#ef4444; animation:pulseRed .7s infinite; }
      `}</style>

      

      {/* Header */}
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
                  {isAdminMode && <Badge className="ml-2 bg-purple-600 text-white">MODO ADMIN</Badge>}
                </h1>
                <p className="text-brown-700">Gestión y preparación de pedidos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isAdminMode && (
                <Button onClick={() => handleViewHistory()} className="bg-amber-600 hover:bg-amber-700 text-white">
                  <History className="h-4 w-4 mr-2" />
                  Historial Global
                </Button>
              )}
              <QuickOrderButton />
              <Button onClick={() => setShowQRReader(true)} className="bg-purple-600 hover:bg-purple-700 text-white">
                <QrCode className="h-4 w-4 mr-2" />
                Leer QR
              </Button>
              <Button onClick={() => setShowAIImport(true)} className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white">
                ✨ Importar Pedido IA
              </Button>
              <Button variant="outline" onClick={handleLogout} className="text-brown-700 border-sand-300 hover:bg-sand-50">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0">
            {/* Filtros + Tabs */}
            <div className="flex flex-col md:flex-row items-start gap-4 mb-6">
              <Input
                className="md:w-72"
                placeholder="Buscar por cliente, sede, orden o teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <div className="flex flex-wrap gap-2 justify-start w-full md:w-auto">
                <Button size="sm" variant={selectedTab === 'dashboard' ? 'default' : 'outline'} onClick={() => setSelectedTab('dashboard')}>
                  <BarChart3 className="h-4 w-4 mr-1" />
                  Dashboard
                </Button>
                <Button size="sm" variant={selectedTab === 'pendientes' ? 'default' : 'outline'} onClick={() => setSelectedTab('pendientes')}>
                  <Clock className="h-4 w-4 mr-1" />
                  Pendientes
                  <Badge className="ml-1">{stats.pendientes}</Badge>
                </Button>
                <Button size="sm" variant={selectedTab === 'en_preparacion' ? 'default' : 'outline'} onClick={() => setSelectedTab('en_preparacion')}>
                  <Smile className="h-4 w-4 mr-1" />
                  En preparación
                  <Badge className="ml-1">{stats.enPreparacion}</Badge>
                </Button>
                <Button size="sm" variant={selectedTab === 'listos' ? 'default' : 'outline'} onClick={() => setSelectedTab('listos')}>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Listos
                  <Badge className="ml-1">{stats.listos}</Badge>
                </Button>
                <Button size="sm" variant={selectedTab === 'entregados' ? 'default' : 'outline'} onClick={() => setSelectedTab('entregados')}>
                  Entregados
                  <Badge className="ml-1">{stats.entregados}</Badge>
                </Button>
                <Button size="sm" variant={selectedTab === 'alertas' ? 'default' : 'outline'} onClick={() => setSelectedTab('alertas')}>
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Urgentes/Vencidos
                  <Badge className="ml-1">{stats.alertas}</Badge>
                </Button>
                <Button size="sm" variant={selectedTab === 'rechazados' ? 'default' : 'outline'} onClick={() => setSelectedTab('rechazados')}>
                  Rechazados
                  <Badge className="ml-1">{stats.rechazados}</Badge>
                </Button>
                <Button size="sm" variant={selectedTab === 'todos' ? 'default' : 'outline'} onClick={() => setSelectedTab('todos')}>
                  Todos
                  <Badge className="ml-1">{stats.total}</Badge>
                </Button>
              </div>
            </div>

            {selectedTab === 'dashboard' && <OrdersDashboard stats={stats} orders={ordersWithUrgency} />}

            {selectedTab === 'pendientes' &&
              renderOrderList(ordersWithUrgency.filter((o) => o.status === 'pendiente' && matchesSearch(o, searchTerm)))}

            {selectedTab === 'en_preparacion' &&
              renderOrderList(ordersWithUrgency.filter((o) => o.status === 'en_preparacion' && matchesSearch(o, searchTerm)))}

            {selectedTab === 'listos' &&
              renderOrderList(ordersWithUrgency.filter((o) => o.status === 'listo' && matchesSearch(o, searchTerm)))}

            {selectedTab === 'entregados' &&
              renderOrderList(ordersWithUrgency.filter((o) => o.status === 'entregado' && matchesSearch(o, searchTerm)))}

            {selectedTab === 'rechazados' &&
              renderOrderList(ordersWithUrgency.filter((o) => o.status === 'rechazado' && matchesSearch(o, searchTerm)))}

            {selectedTab === 'alertas' &&
              renderOrderList(
                ordersWithUrgency.filter((o) => (o.urgency.isUrgent || o.urgency.isExpired) && matchesSearch(o, searchTerm))
              )}

            {selectedTab === 'todos' && renderOrderList(filtered)}
          </div>
        </div>
      </div>

      {/* Modales */}
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
      <QRReaderModal isOpen={showQRReader} onClose={() => setShowQRReader(false)} onQRRead={handleQRRead} />
      <AIImportOrderModal isOpen={showAIImport} onClose={() => setShowAIImport(false)} />
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
