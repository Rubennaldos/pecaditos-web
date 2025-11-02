import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { AdminDeliveryProvider, useAdminDelivery } from '@/contexts/AdminDeliveryContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Truck, Package, CheckCircle, QrCode, MapPin, Phone, User, LogOut,
  History, Edit, Trash2
} from 'lucide-react';

import DeliveryPersonLogin from '@/components/delivery/DeliveryPersonLogin';
import DeliveryQRReader from '@/components/delivery/DeliveryQRReader';

import { DeliveryHistory } from '@/components/delivery/DeliveryHistory';
import { DeliveryEditModal } from '@/components/delivery/DeliveryEditModal';
import { DeliveryHistoryModal } from '@/components/delivery/DeliveryHistoryModal';
import { DeliveryDeleteModal } from '@/components/delivery/DeliveryDeleteModal';
import { DeliveryPersonsModal } from '@/components/delivery/DeliveryPersonsModal';
import { SendMessageModal } from '@/components/delivery/SendMessageModal';

// INTEGRACIÓN CON FIREBASE:
// Descomenta e implementa según tu tipo de base de datos
// import { database } from '@/firebase';
// import { ref, onValue } from "firebase/database";

const DeliveryPanelContent = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const { isAdminMode } = useAdminDelivery();
  const [currentUser, setCurrentUser] = useState<string>('');
  const [showLogin, setShowLogin] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pendientes');
  const [showQRReader, setShowQRReader] = useState(false);

  // Vacío, para poblar desde Firebase
  const [deliveryPersons, setDeliveryPersons] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);

  // Modals
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null);
  const [showPersonsModal, setShowPersonsModal] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);

  const [showDeliveryModal, setShowDeliveryModal] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');

  // --------------------------
  // INTEGRACIÓN FIREBASE AQUÍ:
  // --------------------------
  // Descomenta y ajusta según tu base
  /*
  useEffect(() => {
    // Ejemplo con Realtime Database
    const personsRef = ref(database, "deliveryPersons");
    onValue(personsRef, (snapshot) => {
      const data = snapshot.val();
      setDeliveryPersons(data ? Object.values(data) : []);
    });

    const ordersRef = ref(database, "deliveryOrders");
    onValue(ordersRef, (snapshot) => {
      const data = snapshot.val();
      setOrders(data ? Object.values(data) : []);
    });
  }, []);
  */

  // Filtros
  const pendingOrders = orders.filter(o => o.status === 'listo' && !o.assignedTo);
  const inRouteOrders = orders.filter(o => o.status === 'en_ruta' && o.assignedTo === currentUser);
  const deliveredOrders = orders.filter(o => o.status === 'entregado' && o.assignedTo === currentUser);

  const adminPendingOrders = isAdminMode ? orders.filter(o => o.status === 'listo') : pendingOrders;
  const adminInRouteOrders = isAdminMode ? orders.filter(o => o.status === 'en_ruta') : inRouteOrders;
  const adminDeliveredOrders = isAdminMode ? orders.filter(o => o.status === 'entregado') : deliveredOrders;

  // Solo entregas de hoy
  const todayDeliveredOrders = adminDeliveredOrders.filter(order => {
    if (!order.deliveredAt) return false;
    const deliveryDate = new Date(order.deliveredAt).toDateString();
    const today = new Date().toDateString();
    return deliveryDate === today;
  });

  const handleLogin = (personId: string) => {
    const person = deliveryPersons.find(p => p.id === personId);
    if (person) {
      setCurrentUser(person.name);
      setShowLogin(false);
    }
  };

  // Toma de pedidos (puedes reemplazarlo por tu lógica de update en Firebase)
  const takeOrder = (orderId: string) => {
    // Aquí tu update en la base
    // Actualizar en Firebase, luego refrescar
    setOrders(prev => prev.map(order =>
      order.id === orderId
        ? { ...order, status: 'en_ruta', assignedTo: currentUser, takenAt: new Date().toISOString() }
        : order
    ));
  };

  const handleDeliveryConfirm = (orderId: string) => {
    // Aquí tu update en la base
    // Actualizar en Firebase, luego refrescar
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
      {showAdminActions && isAdminMode && (
        <div className="absolute top-2 right-2 flex gap-1 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button onClick={(e) => { e.stopPropagation(); setShowEditModal(order.id); }}
            variant="ghost" size="sm" className="h-8 w-8 p-0 bg-blue-100 hover:bg-blue-200 text-blue-600"
          ><Edit className="h-3 w-3" /></Button>
          <Button onClick={(e) => { e.stopPropagation(); setShowHistoryModal(order.id); }}
            variant="ghost" size="sm" className="h-8 w-8 p-0 bg-green-100 hover:bg-green-200 text-green-600"
          ><History className="h-3 w-3" /></Button>
          <Button onClick={(e) => { e.stopPropagation(); setShowDeleteModal(order.id); }}
            variant="ghost" size="sm" className="h-8 w-8 p-0 bg-red-100 hover:bg-red-200 text-red-600"
          ><Trash2 className="h-3 w-3" /></Button>
        </div>
      )}
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
              <span className="font-medium">Total: S/ {order.total?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="text-sm">
              <span>Pago: {order.paymentMethod}</span>
            </div>
            {order.status === 'listo' && !order.assignedTo && (
              <Button onClick={() => takeOrder(order.id)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <Truck className="h-4 w-4 mr-2" />
                Tomar Pedido
              </Button>
            )}
            {showDeliveryButton && order.status === 'en_ruta' && (
              <Button onClick={() => setShowDeliveryModal(order.id)}
                className="w-full bg-green-600 hover:bg-green-700 text-white">
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar Entregado
              </Button>
            )}
          </div>
        </div>
        {order.status === 'entregado' && order.deliveryNotes && (
          <div className="mt-3 pt-3 border-t border-stone-200">
            <p className="text-sm text-stone-600">
              <strong>Observaciones de entrega:</strong> {order.deliveryNotes}
            </p>
            <p className="text-xs text-stone-500 mt-1">
              Entregado: {order.deliveredAt ? new Date(order.deliveredAt).toLocaleString() : ''}
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
              <Button onClick={() => setShowQRReader(true)}
                className="bg-purple-600 hover:bg-purple-700 text-white">
                <QrCode className="h-4 w-4 mr-2" />
                Leer QR
              </Button>
              <Button variant="outline" onClick={() => setShowLogin(true)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50">
                <User className="h-4 w-4 mr-2" />
                Cambiar Usuario
              </Button>
              <Button variant="outline" onClick={handleLogout}
                className="text-stone-600 border-stone-300 hover:bg-stone-50">
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

      {/* Modales Admin */}
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

const DeliveryPanel = () => (
  <AdminDeliveryProvider>
    <DeliveryPanelContent />
  </AdminDeliveryProvider>
);

export default DeliveryPanel;
