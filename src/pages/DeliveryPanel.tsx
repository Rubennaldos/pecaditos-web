
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  AlertTriangle
} from 'lucide-react';

import DeliveryPersonLogin from '@/components/delivery/DeliveryPersonLogin';
import DeliveryQRReader from '@/components/delivery/DeliveryQRReader';
import DeliveryTimer from '@/components/delivery/DeliveryTimer';

// *** MOCK DATA DE REPARTIDORES CON CÓDIGOS TEMPORALES ***
const deliveryPersons = [
  { id: "1", name: "Carlos Mendoza", phone: "+51 999 111 111", tempCode: "1234" },
  { id: "2", name: "María López", phone: "+51 999 222 222", tempCode: "5678" },
  { id: "3", name: "José Ramírez", phone: "+51 999 333 333", tempCode: "9012" },
  { id: "4", name: "Ana Torres", phone: "+51 999 444 444", tempCode: "3456" }
];

// *** MOCK DATA DE PEDIDOS ***
const mockOrders = [
  {
    id: "PEC-2024-003",
    customerName: "Bodega Don Carlos",
    customerPhone: "+51 999 555 666",
    customerAddress: "Calle Santa Rosa 789, San Borja",
    district: "San Borja",
    coordinates: { lat: -12.1004, lng: -76.9967 },
    status: "listo", // Viene del módulo de pedidos
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

const DeliveryPanel = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [currentUser, setCurrentUser] = useState<string>('');
  const [showLogin, setShowLogin] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pendientes');
  const [showQRReader, setShowQRReader] = useState(false);
  const [orders, setOrders] = useState(mockOrders);
  const [showDeliveryForm, setShowDeliveryForm] = useState<string | null>(null);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [paymentReceived, setPaymentReceived] = useState<string>('');

  // *** FILTRAR PEDIDOS SEGÚN ESTADO ***
  const pendingOrders = orders.filter(o => o.status === 'listo' && !o.assignedTo);
  const inRouteOrders = orders.filter(o => o.status === 'en_ruta' && o.assignedTo === currentUser);
  const deliveredOrders = orders.filter(o => o.status === 'entregado' && o.assignedTo === currentUser);

  // *** MANEJAR LOGIN ***
  const handleLogin = (personId: string) => {
    const person = deliveryPersons.find(p => p.id === personId);
    if (person) {
      setCurrentUser(person.name);
      setShowLogin(false);
    }
  };

  // *** TOMAR PEDIDO ***
  const takeOrder = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'en_ruta', assignedTo: currentUser, takenAt: new Date().toISOString() }
        : order
    ));
  };

  // *** DEVOLVER PEDIDO A PENDIENTES ***
  const returnOrderToPending = (orderId: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { ...order, status: 'listo', assignedTo: null, takenAt: null }
        : order
    ));
  };

  // *** ACTUALIZAR ESTADO DE PEDIDO ***
  const updateOrderStatus = (orderId: string, newStatus: string, notes?: string) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: newStatus,
            deliveryNotes: notes || order.deliveryNotes,
            deliveredAt: newStatus === 'entregado' ? new Date().toISOString() : order.deliveredAt
          }
        : order
    ));
  };

  // *** MANEJAR ENTREGA ***
  const handleDelivery = (orderId: string) => {
    updateOrderStatus(orderId, 'entregado', deliveryNotes);
    setShowDeliveryForm(null);
    setDeliveryNotes('');
    setPaymentReceived('');
  };

  // *** CERRAR SESIÓN ***
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
              <TabsList className="grid w-full grid-rows-3 h-auto">
                <TabsTrigger value="pendientes" className="justify-start">
                  <Package className="h-4 w-4 mr-2" />
                  Pedidos Listos ({pendingOrders.length})
                </TabsTrigger>
                <TabsTrigger value="en_ruta" className="justify-start">
                  <Truck className="h-4 w-4 mr-2" />
                  En Ruta ({inRouteOrders.length})
                </TabsTrigger>
                <TabsTrigger value="entregados" className="justify-start">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Entregados ({deliveredOrders.length})
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
              {pendingOrders.length === 0 ? (
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
                  {pendingOrders.map((order) => (
                    <Card key={order.id} className="hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {order.id}
                            <Badge className="bg-green-100 text-green-800">
                              Listo para entrega
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
                            <Button
                              onClick={() => takeOrder(order.id)}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              <Truck className="h-4 w-4 mr-2" />
                              Tomar Pedido
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* PEDIDOS EN RUTA */}
            <TabsContent value="en_ruta" className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">
                Pedidos En Ruta
              </h2>
              {inRouteOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Truck className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-800 mb-2">
                    No tienes pedidos en ruta
                  </h3>
                  <p className="text-stone-600">
                    Toma pedidos de la lista de "Pedidos Listos"
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {inRouteOrders.map((order) => (
                    <Card key={order.id} className="border-blue-200 hover:shadow-lg transition-all">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            {order.id}
                            <Badge className="bg-blue-100 text-blue-800">
                              En Ruta
                            </Badge>
                            {order.takenAt && (
                              <DeliveryTimer takenAt={order.takenAt} />
                            )}
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
                          <div className="space-y-2">
                            <Button
                              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.coordinates.lat},${order.coordinates.lng}`, '_blank')}
                              variant="outline"
                              className="w-full border-green-500 text-green-600 hover:bg-green-50"
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Abrir en Google Maps
                            </Button>
                            <Button
                              onClick={() => setShowDeliveryForm(order.id)}
                              className="w-full bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como Entregado
                            </Button>
                            <Button
                              onClick={() => returnOrderToPending(order.id)}
                              variant="outline"
                              className="w-full border-orange-500 text-orange-600 hover:bg-orange-50"
                            >
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Devolver a Pendientes
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* PEDIDOS ENTREGADOS */}
            <TabsContent value="entregados" className="space-y-4">
              <h2 className="text-xl font-semibold text-stone-800 mb-4">
                Pedidos Entregados
              </h2>
              {deliveredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-stone-800 mb-2">
                    No hay entregas completadas
                  </h3>
                  <p className="text-stone-600">
                    Aquí aparecerán los pedidos que hayas entregado
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {deliveredOrders.map((order) => (
                    <Card key={order.id} className="border-green-200">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          {order.id}
                          <Badge className="bg-green-100 text-green-800">
                            Entregado
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-sm">
                              <User className="h-4 w-4 text-stone-400" />
                              <span className="font-medium">{order.customerName}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <Clock className="h-4 w-4 text-stone-400" />
                              <span>Entregado: {new Date(order.deliveredAt || '').toLocaleString()}</span>
                            </div>
                          </div>
                          <div>
                            {order.deliveryNotes && (
                              <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                                <p className="text-sm text-green-800">
                                  <strong>Observaciones:</strong> {order.deliveryNotes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Modal de entrega */}
      {showDeliveryForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Confirmar Entrega</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Método de pago:</label>
                <Select value={paymentReceived} onValueChange={setPaymentReceived}>
                  <SelectTrigger>
                    <SelectValue placeholder="¿Cómo pagó el cliente?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="efectivo">Efectivo</SelectItem>
                    <SelectItem value="transferencia">Transferencia</SelectItem>
                    <SelectItem value="credito">Crédito</SelectItem>
                    <SelectItem value="no_pago">No pagó</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Observaciones:</label>
                <Textarea
                  placeholder="Ej: Entregado a recepcionista, sin contacto con cliente, etc."
                  value={deliveryNotes}
                  onChange={(e) => setDeliveryNotes(e.target.value)}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleDelivery(showDeliveryForm)}
                  className="bg-green-600 hover:bg-green-700 flex-1"
                >
                  Confirmar Entrega
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDeliveryForm(null)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Reader */}
      <DeliveryQRReader
        isOpen={showQRReader}
        onClose={() => setShowQRReader(false)}
        availableOrders={pendingOrders}
        onOrderUpdate={updateOrderStatus}
      />
    </div>
  );
};

export default DeliveryPanel;
