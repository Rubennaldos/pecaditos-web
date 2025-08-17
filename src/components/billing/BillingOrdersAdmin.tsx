import { useEffect, useMemo, useState } from 'react';
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
  Search,
  Filter
} from 'lucide-react';
import { ref, onValue, off, update, push } from 'firebase/database';
import { db } from '../../config/firebase'         // ✅
import { toast } from '@/hooks/use-toast';
import { useAdminBilling } from '@/contexts/AdminBillingContext';
import { BillingOrderEditModal } from './BillingOrderEditModal';
import { BillingOrderDeleteModal } from './BillingOrderDeleteModal';

type RawOrder = any;

type ViewOrder = {
  id: string;
  code: string;
  client: string;
  comercialName?: string;
  ruc?: string;
  amount: number;
  date?: number | string;
  dueDate?: number | string;
  phone?: string;
  whatsapp?: string;
  // estado visual de cobranzas
  status: 'pending_payment' | 'payment_overdue' | 'paid' | 'rejected';
  // crudo completo por si lo necesitan los modales
  _raw: RawOrder;
};

const ORDERS_PATH = 'pedidos';            // <-- AJUSTA si usas 'orders'
const BILLING_MOVEMENTS = 'billingMovements';

// --------- Helpers ----------
const toDate = (v?: number | string) => {
  if (!v) return undefined;
  const d = typeof v === 'number' ? new Date(v) : new Date(String(v));
  return isNaN(d.getTime()) ? undefined : d;
};

const sanitizePhone = (p?: string) => (p ? p.replace(/\D/g, '') : '');

const getStatusInfo = (status: ViewOrder['status']) => {
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

// Mapea el pedido de tu BD a lo que muestra la UI.
// Ajusta aquí si tus campos reales tienen otros nombres.
const mapToView = (id: string, o: RawOrder): ViewOrder | null => {
  const estado = String(o?.estado || o?.status || '').toLowerCase();

  // Consideramos estos como "entregados / listos para cobrar"
  const deliveredLike = ['entregado', 'delivered', 'por_cobrar', 'ready_for_billing'];
  if (!deliveredLike.includes(estado)) return null;

  const amount = Number(o?.total ?? o?.amount ?? 0);
  const client =
    o?.cliente?.nombre ||
    o?.customer?.name ||
    o?.clienteNombre ||
    '—';
  const comercialName = o?.cliente?.comercial || o?.customer?.tradeName || o?.comercialName;
  const ruc = o?.cliente?.ruc || o?.customer?.taxId || o?.ruc;
  const phone = o?.cliente?.telefono || o?.customer?.phone || o?.phone;
  const code = o?.codigo || id;
  const date = o?.createdAt || o?.fecha;
  const dueDate = o?.billing?.dueDate || o?.dueDate;

  // estado de cobranzas en base al billing/status y vencimiento
  const billingStatus = String(o?.billing?.status || '').toLowerCase();
  let status: ViewOrder['status'] = 'pending_payment';

  if (billingStatus === 'pagado' || billingStatus === 'paid') status = 'paid';
  else if (billingStatus === 'rechazado' || billingStatus === 'rejected') status = 'rejected';
  else {
    const due = toDate(dueDate);
    if (due && due.getTime() < Date.now()) status = 'payment_overdue';
  }

  return {
    id,
    code,
    client,
    comercialName,
    ruc,
    amount,
    date,
    dueDate,
    phone,
    whatsapp: phone,
    status,
    _raw: o,
  };
};

// ------------------------------------------------------

export const BillingOrdersAdmin = () => {
  const { isAdminMode } = useAdminBilling();
  const [filterStatus, setFilterStatus] = useState<'todos' | ViewOrder['status']>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const [orders, setOrders] = useState<ViewOrder[]>([]);

  // Suscripción a pedidos reales
  useEffect(() => {
    const r = ref(db, ORDERS_PATH);
    const cb = (snap: any) => {
      const data = snap.val() || {};
      const arr: ViewOrder[] = [];
      for (const [id, value] of Object.entries<any>(data)) {
        const mapped = mapToView(id, value);
        if (mapped && mapped.status !== 'paid') arr.push(mapped);
      }
      // ordena desc por fecha de creación
      arr.sort((a, b) => {
        const A = toDate(a.date)?.getTime() || 0;
        const B = toDate(b.date)?.getTime() || 0;
        return B - A;
      });
      setOrders(arr);
    };
    onValue(r, cb);
    return () => off(r, 'value', cb);
  }, []);

  // Acciones
  const handleAcceptOrder = async (order: ViewOrder) => {
    try {
      await update(ref(db, `${ORDERS_PATH}/${order.id}`), {
        billing: {
          ...(order._raw?.billing || {}),
          status: 'pagado',
          paidAt: new Date().toISOString(),
        },
      });

      await push(ref(db, BILLING_MOVEMENTS), {
        type: 'payment_received',
        orderId: order.id,
        client: order.client,
        amount: order.amount || 0,
        timestamp: Date.now(),
        details: `Pago de ${order.code}`,
        user: 'cobranzas',
      });

      toast({ title: 'Pago registrado', description: `Se marcó como pagado ${order.code}` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo registrar el pago', variant: 'destructive' });
    }
  };

  const handleRejectOrder = async (order: ViewOrder) => {
    const reason = prompt('Motivo del rechazo / observación:');
    if (!reason) return;
    try {
      await update(ref(db, `${ORDERS_PATH}/${order.id}`), {
        billing: {
          ...(order._raw?.billing || {}),
          status: 'rechazado',
          rejectedAt: new Date().toISOString(),
          reason,
        },
      });

      await push(ref(db, BILLING_MOVEMENTS), {
        type: 'invoice_rejected',
        orderId: order.id,
        client: order.client,
        amount: order.amount || 0,
        timestamp: Date.now(),
        details: reason,
        user: 'cobranzas',
      });

      toast({ title: 'Rechazo registrado', description: `Se registró rechazo para ${order.code}` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error', description: 'No se pudo registrar el rechazo', variant: 'destructive' });
    }
  };

  const handleCallClient = (phone?: string) => {
    if (!phone) return;
    window.open(`tel:${sanitizePhone(phone)}`, '_blank');
  };

  const handleWhatsAppClient = (phone?: string) => {
    if (!phone) return;
    window.open(`https://wa.me/${sanitizePhone(phone)}`, '_blank');
  };

  // Filtros
  const filteredOrders = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return orders.filter(o => {
      const byStatus = filterStatus === 'todos' || o.status === filterStatus;
      const bySearch =
        !q ||
        o.code.toLowerCase().includes(q) ||
        (o.ruc || '').toLowerCase().includes(q) ||
        o.client.toLowerCase().includes(q);
      return byStatus && bySearch;
    });
  }, [orders, filterStatus, searchTerm]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Gestión de Pedidos</h2>
        <p className="text-stone-600">Control y validación de todos los pedidos del sistema</p>
      </div>

      {/* Filtros */}
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
            <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
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

      {/* Lista */}
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
                      {order.code}
                      <Badge className={statusInfo.color}>{statusInfo.text}</Badge>
                    </CardTitle>
                    <div className="mt-1 space-y-1">
                      <p className="text-stone-800 font-medium">{order.client}</p>
                      {order.comercialName && (
                        <p className="text-stone-600 text-sm">Comercial: {order.comercialName}</p>
                      )}
                      {order.ruc && <p className="text-stone-500 text-xs">RUC: {order.ruc}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">S/ {(order.amount || 0).toFixed(2)}</div>
                    {order.dueDate && (
                      <div className="text-sm text-stone-500">
                        Vence: {toDate(order.dueDate)?.toLocaleDateString('es-PE')}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    {order.date && (
                      <div className="text-sm">
                        <span className="font-medium">Fecha:</span>{' '}
                        {toDate(order.date)?.toLocaleDateString('es-PE')}
                      </div>
                    )}
                    {order.phone && (
                      <div className="text-sm">
                        <span className="font-medium">Teléfono:</span> {order.phone}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCallClient(order.phone)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      disabled={!order.phone}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {order.phone || 'Llamar'}
                    </Button>

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleWhatsAppClient(order.whatsapp)}
                      className="text-green-600 border-green-300 hover:bg-green-50"
                      disabled={!order.whatsapp}
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>

                    {/* Acciones */}
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
                          onClick={() => handleRejectOrder(order)}
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Rechazar
                        </Button>
                      </>
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
                          onClick={() => {
                            // Aquí puedes abrir tu historial por orderId
                            // o navegar a /cobranzas/historial?orderId=...
                          }}
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

      {/* Modales */}
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
