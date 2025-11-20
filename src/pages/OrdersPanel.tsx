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
  Edit,
  Trash2,
  History,
  MapPin,
  Building2,
  Calendar,
  IdCard,
  Search,
  Zap,
  ChevronDown,
  Menu,
  X,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
    <div className="space-y-3">
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
          <Card 
            key={order.id} 
            className="border border-neutral-200 hover:border-neutral-300 transition-all duration-200 hover:shadow-sm bg-white"
          >
            <CardContent className="p-4">
              {/* Compact Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {blinkClass && <span className={`inline-block h-2 w-2 rounded-full ${blinkClass}`} />}
                    <h3 className="text-base font-semibold text-neutral-900 truncate">{title}</h3>
                  </div>
                  {showSiteChip && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-600">
                      <Building2 className="h-3.5 w-3.5" />
                      <span className="truncate">{site}</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-col items-end gap-1.5 ml-3">
                  <Badge
                    className={`text-xs px-2 py-0.5 ${
                      order.status === 'pendiente'
                        ? 'bg-amber-100 text-amber-900 border-amber-200'
                        : order.status === 'en_preparacion'
                        ? 'bg-blue-100 text-blue-900 border-blue-200'
                        : order.status === 'listo'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        : order.status === 'rechazado'
                        ? 'bg-red-100 text-red-900 border-red-200'
                        : order.status === 'entregado'
                        ? 'bg-neutral-100 text-neutral-900 border-neutral-200'
                        : 'bg-neutral-100 text-neutral-800 border-neutral-200'
                    }`}
                  >
                    {order.status === 'pendiente'
                      ? 'Pendiente'
                      : order.status === 'en_preparacion'
                      ? 'Preparando'
                      : order.status === 'listo'
                      ? 'Listo'
                      : order.status === 'entregado'
                      ? 'Entregado'
                      : order.status === 'rechazado'
                      ? 'Rechazado'
                      : order.status}
                  </Badge>
                  <div className="text-xs text-neutral-500 font-medium">{oc}</div>
                </div>
              </div>

              {/* Precio y productos - Más compacto */}
              <div className="flex items-center justify-between mb-3 py-2 px-3 bg-neutral-50 rounded-lg">
                <div>
                  <div className="text-xl font-bold text-neutral-900">S/ {Number(order.total ?? 0).toFixed(2)}</div>
                  <div className="text-xs text-neutral-500">{order.items?.length ?? 0} items</div>
                </div>
                {order.items && order.items.length > 0 && (
                  <div className="text-xs text-right text-neutral-600 max-w-[180px]">
                    <div className="truncate">{order.items[0].name ?? order.items[0].product ?? 'Producto'}</div>
                    {order.items.length > 1 && (
                      <div className="text-neutral-400">+{order.items.length - 1} más</div>
                    )}
                  </div>
                )}
              </div>

              {/* Info compacta */}
              <div className="space-y-1.5 text-xs text-neutral-600 mb-3">
                {addr && (
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{addr}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                  <span className="truncate">
                    {order.createdAt ? new Date(ts(order.createdAt)).toLocaleDateString('es-ES', { 
                      day: '2-digit', 
                      month: 'short', 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    }) : '—'}
                  </span>
                </div>
                {ruc && (
                  <div className="flex items-center gap-1.5">
                    <IdCard className="h-3.5 w-3.5 text-neutral-400 flex-shrink-0" />
                    <span className="truncate">{ruc}</span>
                  </div>
                )}
              </div>

              {order.status === 'rechazado' && order.rejectedReason && (
                <div className="text-xs text-red-700 bg-red-50 border border-red-100 p-2 rounded-lg mb-3">
                  <strong>Motivo:</strong> {order.rejectedReason}
                </div>
              )}

              {/* Acciones - Mobile optimized */}
              <div className="flex flex-wrap gap-2 pt-3 border-t border-neutral-100">
                <OrderActionButtons
                  orderId={order.id}
                  currentStatus={order.status ?? 'pendiente'}
                  onStatusChange={updateOrderStatus}
                  order={order}
                  onCreateNewOrder={createNewOrderForMissingItems}
                />

                {isAdminMode && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditOrder(order)}
                      className="text-neutral-700 border-neutral-300 hover:bg-neutral-100 h-8 px-3"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewHistory(order.id)}
                      className="text-neutral-700 border-neutral-300 hover:bg-neutral-100 h-8 px-3"
                    >
                      <History className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDeleteOrder(order)}
                      className="text-red-600 border-red-300 hover:bg-red-50 h-8 px-3"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </>
                )}
              </div>

              {order.notes && (
                <div className="pt-3 mt-3 border-t border-neutral-100">
                  <p className="text-xs text-neutral-600">
                    <strong className="text-neutral-700">Notas:</strong> {order.notes}
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
    <div className="min-h-screen bg-neutral-50">
      {/* Estilos locales para parpadeo */}
      <style>{`
        @keyframes pulseYellow { 0%,100% { opacity:.25 } 50% { opacity:1 } }
        @keyframes pulseRed { 0%,100% { opacity:.25 } 50% { opacity:1 } }
        .blink-yellow { background:#f59e0b; animation:pulseYellow 1s infinite; }
        .blink-red { background:#ef4444; animation:pulseRed .7s infinite; }
      `}</style>

      {/* Header minimalista y sticky */}
      <div className="sticky top-0 z-50 bg-white border-b border-neutral-200 backdrop-blur-sm bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo y título compacto */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-neutral-900 rounded-xl flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-semibold text-neutral-900">
                  Pedidos
                  {isAdminMode && <Badge className="ml-2 bg-neutral-800 text-white text-xs">ADMIN</Badge>}
                </h1>
              </div>
            </div>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-2">
              {isAdminMode && (
                <Button 
                  onClick={() => handleViewHistory()} 
                  variant="ghost" 
                  size="sm"
                  className="text-neutral-700 hover:bg-neutral-100"
                >
                  <History className="h-4 w-4 mr-2" />
                  Historial
                </Button>
              )}
              <QuickOrderButton />
              <Button 
                onClick={() => setShowQRReader(true)} 
                variant="ghost" 
                size="sm"
                className="text-neutral-700 hover:bg-neutral-100"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Escanear
              </Button>
              <Button 
                onClick={() => setShowAIImport(true)} 
                className="bg-neutral-900 hover:bg-neutral-800 text-white"
                size="sm"
              >
                <Zap className="h-4 w-4 mr-2" />
                Importar IA
              </Button>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout} 
                className="text-neutral-700 hover:bg-neutral-100"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>

            {/* Mobile menu button */}
            <Button 
              variant="ghost" 
              size="sm"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile menu dropdown */}
          {mobileMenuOpen && (
            <div className="lg:hidden pb-4 space-y-2 border-t border-neutral-200 pt-4">
              <QuickOrderButton />
              <Button 
                onClick={() => { setShowQRReader(true); setMobileMenuOpen(false); }} 
                variant="outline" 
                className="w-full justify-start"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Escanear QR
              </Button>
              <Button 
                onClick={() => { setShowAIImport(true); setMobileMenuOpen(false); }} 
                className="w-full justify-start bg-neutral-900 text-white"
              >
                <Zap className="h-4 w-4 mr-2" />
                Importar con IA
              </Button>
              {isAdminMode && (
                <Button 
                  onClick={() => { handleViewHistory(); setMobileMenuOpen(false); }} 
                  variant="outline"
                  className="w-full justify-start"
                >
                  <History className="h-4 w-4 mr-2" />
                  Historial Global
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleLogout} 
                className="w-full justify-start text-red-600 border-red-200 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
        {/* Search bar con estilo moderno */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              className="pl-10 bg-white border-neutral-200 focus-visible:ring-neutral-900 h-11"
              placeholder="Buscar pedidos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs horizontales con scroll en mobile */}
        <div className="mb-4 -mx-4 sm:mx-0">
          <div className="overflow-x-auto px-4 sm:px-0 scrollbar-hide">
            <div className="flex gap-2 min-w-max sm:min-w-0 pb-2">
              <Button 
                size="sm" 
                variant={selectedTab === 'dashboard' ? 'default' : 'outline'} 
                onClick={() => setSelectedTab('dashboard')}
                className={selectedTab === 'dashboard' 
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }
              >
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                Panel
              </Button>
              <Button 
                size="sm" 
                variant={selectedTab === 'pendientes' ? 'default' : 'outline'} 
                onClick={() => setSelectedTab('pendientes')}
                className={selectedTab === 'pendientes' 
                  ? 'bg-amber-500 text-white hover:bg-amber-600' 
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }
              >
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Pendientes
                {stats.pendientes > 0 && <Badge className="ml-1.5 bg-white/20 text-white">{stats.pendientes}</Badge>}
              </Button>
              <Button 
                size="sm" 
                variant={selectedTab === 'en_preparacion' ? 'default' : 'outline'} 
                onClick={() => setSelectedTab('en_preparacion')}
                className={selectedTab === 'en_preparacion' 
                  ? 'bg-blue-500 text-white hover:bg-blue-600' 
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }
              >
                Preparando
                {stats.enPreparacion > 0 && <Badge className="ml-1.5 bg-white/20 text-white">{stats.enPreparacion}</Badge>}
              </Button>
              <Button 
                size="sm" 
                variant={selectedTab === 'listos' ? 'default' : 'outline'} 
                onClick={() => setSelectedTab('listos')}
                className={selectedTab === 'listos' 
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600' 
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }
              >
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                Listos
                {stats.listos > 0 && <Badge className="ml-1.5 bg-white/20 text-white">{stats.listos}</Badge>}
              </Button>
              <Button 
                size="sm" 
                variant={selectedTab === 'entregados' ? 'default' : 'outline'} 
                onClick={() => setSelectedTab('entregados')}
                className={selectedTab === 'entregados' 
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }
              >
                Entregados
                {stats.entregados > 0 && <Badge className="ml-1.5 bg-white/20 text-white">{stats.entregados}</Badge>}
              </Button>
              {stats.alertas > 0 && (
                <Button 
                  size="sm" 
                  variant={selectedTab === 'alertas' ? 'default' : 'outline'} 
                  onClick={() => setSelectedTab('alertas')}
                  className={selectedTab === 'alertas' 
                    ? 'bg-red-500 text-white hover:bg-red-600' 
                    : 'border-red-300 text-red-700 hover:bg-red-50'
                  }
                >
                  <AlertTriangle className="h-3.5 w-3.5 mr-1.5" />
                  Urgentes
                  <Badge className="ml-1.5 bg-white/20 text-white">{stats.alertas}</Badge>
                </Button>
              )}
              <Button 
                size="sm" 
                variant={selectedTab === 'todos' ? 'default' : 'outline'} 
                onClick={() => setSelectedTab('todos')}
                className={selectedTab === 'todos' 
                  ? 'bg-neutral-900 text-white hover:bg-neutral-800' 
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100'
                }
              >
                Todos
              </Button>
            </div>
          </div>
        </div>

        {/* Contenido */}
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
