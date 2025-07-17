import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminDeliveryProvider, useAdminDelivery } from '@/contexts/AdminDeliveryContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Truck, 
  Package, 
  CheckCircle, 
  QrCode, 
  MapPin, 
  Phone,
  User,
  LogOut,
  Clock,
  RotateCcw,
  CreditCard,
  AlertTriangle,
  X,
  Calendar,
  Printer,
  FileText,
  Edit,
  History,
  Trash2
} from 'lucide-react';

import DeliveryPersonLogin from '@/components/delivery/DeliveryPersonLogin';
import DeliveryQRReader from '@/components/delivery/DeliveryQRReader';
import DeliveryTimer from '@/components/delivery/DeliveryTimer';
import PrintModal from '@/components/orders/PrintModal';

// Import admin components
import { AdminModeToggle } from '@/components/delivery/AdminModeToggle';
import { DeliveryHistory } from '@/components/delivery/DeliveryHistory';
import { DeliveryEditModal } from '@/components/delivery/DeliveryEditModal';
import { DeliveryHistoryModal } from '@/components/delivery/DeliveryHistoryModal';
import { DeliveryDeleteModal } from '@/components/delivery/DeliveryDeleteModal';
import { DeliveryPersonsModal } from '@/components/delivery/DeliveryPersonsModal';
import { SendMessageModal } from '@/components/delivery/SendMessageModal';

// Mock data
const deliveryPersons = [
  { id: "1", name: "Carlos Mendoza", phone: "+51 999 111 111", tempCode: "1234" },
  { id: "2", name: "María López", phone: "+51 999 222 222", tempCode: "5678" },
  { id: "3", name: "José Ramírez", phone: "+51 999 333 333", tempCode: "9012" },
  { id: "4", name: "Ana Torres", phone: "+51 999 444 444", tempCode: "3456" }
];

interface DeliveryOrder {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  district: string;
  coordinates: { lat: number; lng: number };
  status: string;
  readyAt: string;
  total: number;
  paymentMethod: string;
  notes?: string;
  assignedTo?: string | null;
  takenAt?: string | null;
  deliveredAt?: string;
  deliveryNotes?: string;
}

const mockOrders: DeliveryOrder[] = [
  {
    id: "PEC-2024-003",
    customerName: "Bodega Don Carlos",
    customerPhone: "+51 999 555 666",
    customerAddress: "Calle Santa Rosa 789, San Borja",
    district: "San Borja",
    coordinates: { lat: -12.1004, lng: -76.9967 },
    status: "listo",
    readyAt: "2024-01-14T16:30:00",
    total: 225.00,
    paymentMethod: "credito_15",
    notes: "Incluir material promocional",
    assignedTo: null,
    takenAt: null
  },
  {
    id: "PEC-2024-004",
    customerName: "Minimarket Fresh",
    customerPhone: "+51 999 777 888",
    customerAddress: "Av. El Sol 321, Independencia",
    district: "Independencia",
    coordinates: { lat: -11.9892, lng: -77.0561 },
    status: "en_ruta",
    readyAt: "2024-01-14T14:00:00",
    assignedTo: "Carlos Mendoza",
    takenAt: "2024-01-14T17:00:00",
    total: 480.00,
    paymentMethod: "contado",
    notes: "Horario preferido: 2-6 PM"
  },
  {
    id: "PEC-2024-002",
    customerName: "Distribuidora Los Andes",
    customerPhone: "+51 999 333 444",
    customerAddress: "Jr. Las Flores 456, Miraflores",
    district: "Miraflores",
    coordinates: { lat: -12.1196, lng: -77.0282 },
    status: "entregado",
    readyAt: "2024-01-13T11:00:00",
    deliveredAt: "2024-01-14T10:30:00",
    assignedTo: "María López",
    takenAt: "2024-01-14T08:00:00",
    total: 345.00,
    paymentMethod: "contado",
    deliveryNotes: "Entregado correctamente. Recibido por Sr. García."
  }
];

const DeliveryPanelContent = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const { isAdminMode } = useAdminDelivery();
  const [currentUser, setCurrentUser] = useState<string>('');
  const [showLogin, setShowLogin] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pendientes');
  const [showQRReader, setShowQRReader] = useState(false);
  const [orders, setOrders] = useState<DeliveryOrder[]>(mockOrders);
  
  // Admin modals state
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showPersonsModal, setShowPersonsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  
  // Delivery confirmation modal
  const [showDeliveryModal, setShowDeliveryModal] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // Filtrar pedidos según estado
  const pendingOrders = orders.filter(o => o.status === 'listo' && !o.assignedTo);
  const inRouteOrders = orders.filter(o => o.status === 'en_ruta' && o.assignedTo === currentUser);
  const deliveredOrders = orders.filter(o => o.status === 'entregado' && o.assignedTo === currentUser);

  // Admin puede ver todos los pedidos si está en modo admin
  const adminPendingOrders = isAdminMode ? orders.filter(o => o.status === 'listo') : pendingOrders;
  const adminInRouteOrders = isAdminMode ? orders.filter(o => o.status === 'en_ruta') : inRouteOrders;
  const adminDeliveredOrders = isAdminMode ? orders.filter(o => o.status === 'entregado') : deliveredOrders;

  // Filtrar entregas solo del día actual para el módulo "Entregados"
  const todayDeliveredOrders = adminDeliveredOrders.filter(order => {
    if (!order.deliveredAt) return false;
    const deliveryDate = new Date(order.deliveredAt).toDateString();
    const today = new Date().toDateString();
    return deliveryDate === today;
  });

  // Listen for admin events
  useEffect(() => {
    const handleAdminEdit = (event: any) => {
      const { orderId, updates } = event.detail;
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, ...updates } : order
      ));
    };

    const handleAdminDelete = (event: any) => {
      const { orderId } = event.detail;
      setOrders(prev => prev.filter(order => order.id !== orderId));
    };

    window.addEventListener('adminEditDelivery', handleAdminEdit);
    window.addEventListener('adminDeleteDelivery', handleAdminDelete);

    return () => {
      window.removeEventListener('adminEditDelivery', handleAdminEdit);
      window.removeEventListener('adminDeleteDelivery', handleAdminDelete);
    };
  }, []);

  const handleLogin = (personId: string) => {
    const person = deliveryPersons.find(p => p.id === personId);
    if (person) {
      setCurrentUser(person.name);
      setShowLogin(false);
    }
  };

  const takeOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'en_ruta', assignedTo: currentUser, takenAt: new Date().toISOString() }
        : order
    ));
  };

  const handleDeliveryConfirm = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'entregado',
            deliveredAt: new Date().toISOString(),
            deliveryNotes: deliveryNotes
          }
        : order
    ));
    
    setDeliveryNotes('');
    setShowDeliveryModal(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  if (showLogin) {
    return (
      <DeliveryPersonLogin
        deliveryPersons={deliveryPersons}
        onLogin={handleLogin}
        onCancel={() => navigate('/')}
      />
    );
  }

  const renderOrderCard = (order: any, showAdminActions = false, showDeliveryButton = false) => (
    <Card key={order.id} className={`hover:shadow-lg transition-all ${showAdminActions && isAdminMode ? 'relative group' : ''}`}>
      {
      showAdminActions && isAdminMode && (
        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowEditModal(order.id);
            }}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-blue-100 hover:bg-blue-200 text-blue-600"
          >
            <Edit className="h-3 w-3" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowHistoryModal(order.id);
            }}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-green-100 hover:bg-green-200 text-green-600"
          >
            <History className="h-3 w-3" />
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteModal(order.id);
            }}
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 bg-red-100 hover:bg-red-200 text-red-600"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )
    }
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            {order.id}
            <Badge className="bg-green-100 text-green-800">
              {order.status === 'listo' ? 'Listo para entrega' : order.status === 'en_ruta' ? 'En Ruta' : 'Entregado'}
            </Badge>
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-stone-400" />
              <span className="font-medium">{order.customerName}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Phone className="h-4 w-4 text-stone-400" />
              <a href={`tel:${order.customerPhone}`} className="text-blue-600 hover:text-blue-700">
                {order.customerPhone}
              </a>
            </div>
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="h-4 w-4 text-stone-400 mt-0.5" />
              <div>
                <div>{order.customerAddress}</div>
                <div className="text-stone-500">{order.district}</div>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="text-sm">
              <span className="font-medium">Total: S/ {order.total.toFixed(2)}</span>
            </div>
            <div className="text-sm">
              <span>Pago: {order.paymentMethod}</span>
            </div>
            
            {/* Botón Tomar Pedido - solo en Pedidos Listos */}
            {order.status === 'listo' && !order.assignedTo && (
              <Button
                onClick={() => takeOrder(order.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Truck className="h-4 w-4 mr-2" />
                Tomar Pedido
              </Button>
            )}
            
            {/* Botón Entregado - solo en En Ruta */}
            {showDeliveryButton && order.status === 'en_ruta' && (
              <Button
                onClick={() => setShowDeliveryModal(order.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar Entregado
              </Button>
            )}
          </div>
        </div>
        
        {/* Mostrar notas de entrega si está entregado */}
        {order.status === 'entregado' && order.deliveryNotes && (
          <div className="mt-3 pt-3 border-t border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Observaciones de entrega:</strong> {order.deliveryNotes}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Entregado: {new Date(order.deliveredAt!).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Panel de Reparto</h1>
                <p className="text-stone-600">Repartidor: {currentUser}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => setShowQRReader(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white"
              >
                <QrCode className="h-4 w-4 mr-2" />
                Leer QR
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowLogin(true)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <User className="h-4 w-4 mr-2" />
                Cambiar Usuario
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-stone-600 border-stone-300 hover:bg-stone-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Salir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex max-w-7xl mx-auto">
        {/* Menú lateral izquierdo */}
        <div className="w-64 bg-white shadow-sm min-h-screen">
          <div className="p-4">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} orientation="vertical">
              <TabsList className="grid w-full grid-rows-4 h-auto">
                <TabsTrigger value="pendientes" className="justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Pedidos Listos ({adminPendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="en_ruta" className="justify-start">
                  <Truck className="h-4 w-4 mr-2" />
                  En Ruta ({adminInRouteOrders.length})
                </TabsTrigger>
                <TabsTrigger value="entregados" className="justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Entregados Hoy ({todayDeliveredOrders.length})
                </TabsTrigger>
                <TabsTrigger value="historial" className="justify-start">
                  <History className="h-4 w-4 mr-2" />
                  Historial
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            {/* PEDIDOS PENDIENTES (LISTOS) */}
            <TabsContent value="pendientes" className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">
                Pedidos Listos para Entrega
              </h2>
              {adminPendingOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-800 mb-2">
                    No hay pedidos listos
                  </h3>
                  <p className="text-stone-600">
                    Los pedidos aparecerán aquí cuando estén listos para entrega
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminPendingOrders.map((order) => renderOrderCard(order, true, false))}
                </div>
              )}
            </TabsContent>

            {/* PEDIDOS EN RUTA */}
            <TabsContent value="en_ruta" className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">
                Pedidos En Ruta
              </h2>
              {adminInRouteOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-800 mb-2">
                    No hay pedidos en ruta
                  </h3>
                  <p className="text-stone-600">
                    Toma pedidos de la lista de "Pedidos Listos"
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {adminInRouteOrders.map((order) => renderOrderCard(order, true, true))}
                </div>
              )}
            </TabsContent>

            {/* PEDIDOS ENTREGADOS HOY */}
            <TabsContent value="entregados" className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">
                Entregas del Día
              </h2>
              {todayDeliveredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-800 mb-2">
                    No hay entregas completadas hoy
                  </h3>
                  <p className="text-stone-600">
                    Aquí aparecerán los pedidos que hayas entregado hoy
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {todayDeliveredOrders.map((order) => renderOrderCard(order, true, false))}
                </div>
              )}
            </TabsContent>

            {/* HISTORIAL */}
            <TabsContent value="historial" className="space-y-4">
              <DeliveryHistory />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Admin Mode Toggle - Solo para Admin General */}
      <AdminModeToggle
        onEditDelivery={(orderId) => setShowEditModal(orderId)}
        onViewHistory={(orderId) => setShowHistoryModal(orderId)}
        onDeleteDelivery={(orderId) => setShowDeleteModal(orderId)}
        onManagePersons={() => setShowPersonsModal(true)}
        onSendMessage={() => setShowMessageModal(true)}
        totalDeliveries={orders.length}
        totalPersons={deliveryPersons.length}
      />

      {/* Modal de confirmación de entrega */}
      <Dialog open={!!showDeliveryModal} onOpenChange={() => setShowDeliveryModal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Entrega</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Observaciones de la entrega (opcional)</Label>
              <Textarea
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="Ej: Entregado correctamente, recibido por..."
                rows={3}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeliveryModal(null)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => showDeliveryModal && handleDeliveryConfirm(showDeliveryModal)}
                className="bg-green-600 hover:bg-green-700"
              >
                Confirmar Entrega
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modales Admin - Solo visibles para Admin General */}
      {showEditModal && (
        <DeliveryEditModal
          delivery={orders.find(o => o.id === showEditModal)}
          isOpen={!!showEditModal}
          onClose={() => setShowEditModal(null)}
        />
      )}

      {showHistoryModal && (
        <DeliveryHistoryModal
          delivery={orders.find(o => o.id === showHistoryModal)}
          isOpen={!!showHistoryModal}
          onClose={() => setShowHistoryModal(null)}
        />
      )}

      {showDeleteModal && (
        <DeliveryDeleteModal
          delivery={orders.find(o => o.id === showDeleteModal)}
          isOpen={!!showDeleteModal}
          onClose={() => setShowDeleteModal(null)}
        />
      )}

      <DeliveryPersonsModal
        persons={deliveryPersons}
        isOpen={showPersonsModal}
        onClose={() => setShowPersonsModal(false)}
      />

      <SendMessageModal
        persons={deliveryPersons}
        isOpen={showMessageModal}
        onClose={() => setShowMessageModal(false)}
      />

      {/* QR Reader */}
      <DeliveryQRReader
        isOpen={showQRReader}
        onClose={() => setShowQRReader(false)}
        availableOrders={pendingOrders}
        onOrderUpdate={() => {}}
      />
    </div>
  );
};

const DeliveryPanel = () => {
  return (
    <AdminDeliveryProvider>
      <DeliveryPanelContent />
    </AdminDeliveryProvider>
  );
};

export default DeliveryPanel;
