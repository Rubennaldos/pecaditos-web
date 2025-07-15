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
  FileText
} from 'lucide-react';

import DeliveryPersonLogin from '@/components/delivery/DeliveryPersonLogin';
import DeliveryQRReader from '@/components/delivery/DeliveryQRReader';
import DeliveryTimer from '@/components/delivery/DeliveryTimer';
import PrintModal from '@/components/orders/PrintModal';

// *** MOCK DATA DE REPARTIDORES CON CÓDIGOS TEMPORALES ***
const deliveryPersons = [
  { id: "1", name: "Carlos Mendoza", phone: "+51 999 111 111", tempCode: "1234" },
  { id: "2", name: "María López", phone: "+51 999 222 222", tempCode: "5678" },
  { id: "3", name: "José Ramírez", phone: "+51 999 333 333", tempCode: "9012" },
  { id: "4", name: "Ana Torres", phone: "+51 999 444 444", tempCode: "3456" }
];

// *** DEFINIR TIPOS DE PEDIDOS ***
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

// *** MOCK DATA DE PEDIDOS ***
const mockOrders: DeliveryOrder[] = [
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
  const [orders, setOrders] = useState<DeliveryOrder[]>(mockOrders);
  
  // New state for delivery actions
  const [showDeliveryModal, setShowDeliveryModal] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState<string | null>(null);
  const [showPostponeModal, setShowPostponeModal] = useState<string | null>(null);
  const [showPrintModal, setShowPrintModal] = useState<string | null>(null);
  
  // Form states
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [rejectReason, setRejectReason] = useState('');
  const [customRejectReason, setCustomRejectReason] = useState('');
  const [postponeDate, setPostponeDate] = useState('');
  const [postponeReason, setPostponeReason] = useState('');

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
  const handleDeliveryConfirm = (orderId: string) => {
    if (!invoiceNumber.trim()) {
      alert('Por favor ingrese el número de factura/boleta');
      return;
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'entregado',
            deliveredAt: new Date().toISOString(),
            deliveryNotes: `Factura/Boleta: ${invoiceNumber}${deliveryNotes ? ` - ${deliveryNotes}` : ''}`
          }
        : order
    ));
    
    // Reset form and close modal
    setInvoiceNumber('');
    setDeliveryNotes('');
    setShowDeliveryModal(null);
  };

  // *** RECHAZAR PEDIDO ***
  const handleRejectOrder = (orderId: string) => {
    const finalReason = rejectReason === 'otro' ? customRejectReason : rejectReason;
    if (!finalReason.trim()) {
      alert('Por favor seleccione o ingrese un motivo de rechazo');
      return;
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'rechazado',
            deliveryNotes: `Rechazado: ${finalReason}`,
            assignedTo: null
          }
        : order
    ));
    
    // Reset form and close modal
    setRejectReason('');
    setCustomRejectReason('');
    setShowRejectModal(null);
  };

  // *** POSTERGAR PEDIDO ***
  const handlePostponeOrder = (orderId: string) => {
    if (!postponeDate || !postponeReason.trim()) {
      alert('Por favor complete la nueva fecha y el motivo');
      return;
    }

    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            status: 'postergado',
            deliveryNotes: `Postergado para ${postponeDate}: ${postponeReason}`,
            assignedTo: null
          }
        : order
    ));
    
    // Reset form and close modal
    setPostponeDate('');
    setPostponeReason('');
    setShowPostponeModal(null);
  };

  // *** IMPRIMIR PEDIDO ***
  const handlePrintOrder = (order: any, format: string, editedData: any) => {
    // Implementation for printing - can be enhanced based on requirements
    console.log('Printing order:', order.id, 'in format:', format);
    window.print(); // Basic print functionality
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

            {/* PEDIDOS EN RUTA - ENHANCED */}
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowPrintModal(order.id)}
                            className="text-stone-500 hover:text-stone-700"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
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
                            <div className="text-sm">
                              <span className="font-medium">Total: S/ {order.total.toFixed(2)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            {/* Google Maps Button */}
                            <Button
                              onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.coordinates.lat},${order.coordinates.lng}`, '_blank')}
                              variant="outline"
                              className="w-full border-green-500 text-green-600 hover:bg-green-50"
                            >
                              <MapPin className="h-4 w-4 mr-2" />
                              Abrir en Google Maps
                            </Button>
                            
                            {/* Main Action Buttons */}
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => setShowDeliveryModal(order.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Entregado
                              </Button>
                              <Button
                                onClick={() => setShowRejectModal(order.id)}
                                variant="destructive"
                                className="bg-red-600 hover:bg-red-700"
                              >
                                <X className="h-4 w-4 mr-1" />
                                Rechazar
                              </Button>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                onClick={() => setShowPostponeModal(order.id)}
                                variant="outline"
                                className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                              >
                                <Calendar className="h-4 w-4 mr-1" />
                                Postergar
                              </Button>
                              <Button
                                onClick={() => returnOrderToPending(order.id)}
                                variant="outline"
                                className="border-orange-500 text-orange-600 hover:bg-orange-50"
                              >
                                <RotateCcw className="h-4 w-4 mr-1" />
                                Devolver
                              </Button>
                            </div>
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

      {/* DELIVERY CONFIRMATION MODAL */}
      <Dialog open={!!showDeliveryModal} onOpenChange={() => setShowDeliveryModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Entrega</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invoice">Número de Factura/Boleta *</Label>
              <Input
                id="invoice"
                placeholder="Ej: F001-12345 o B001-67890"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Observaciones (opcional)</Label>
              <Textarea
                id="notes"
                placeholder="Ej: Entregado a recepcionista, sin contacto directo..."
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => showDeliveryModal && handleDeliveryConfirm(showDeliveryModal)}
                className="bg-green-600 hover:bg-green-700 flex-1"
                disabled={!invoiceNumber.trim()}
              >
                Confirmar Entrega
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeliveryModal(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* REJECT ORDER MODAL */}
      <Dialog open={!!showRejectModal} onOpenChange={() => setShowRejectModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Rechazar Pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Motivo del rechazo</Label>
              <Select value={rejectReason} onValueChange={setRejectReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un motivo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cliente_ausente">Cliente ausente</SelectItem>
                  <SelectItem value="direccion_incorrecta">Dirección incorrecta</SelectItem>
                  <SelectItem value="cliente_cancelo">Cliente canceló</SelectItem>
                  <SelectItem value="problemas_acceso">Problemas de acceso</SelectItem>
                  <SelectItem value="pago_rechazado">Pago rechazado</SelectItem>
                  <SelectItem value="otro">Otro motivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {rejectReason === 'otro' && (
              <div className="space-y-2">
                <Label htmlFor="custom-reason">Especifica el motivo</Label>
                <Textarea
                  id="custom-reason"
                  placeholder="Describe el motivo del rechazo..."
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  rows={3}
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button
                onClick={() => showRejectModal && handleRejectOrder(showRejectModal)}
                variant="destructive"
                className="flex-1"
                disabled={!rejectReason || (rejectReason === 'otro' && !customRejectReason.trim())}
              >
                Confirmar Rechazo
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowRejectModal(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* POSTPONE ORDER MODAL */}
      <Dialog open={!!showPostponeModal} onOpenChange={() => setShowPostponeModal(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Postergar Pedido</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="postpone-date">Nueva fecha de entrega</Label>
              <Input
                id="postpone-date"
                type="date"
                value={postponeDate}
                onChange={(e) => setPostponeDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postpone-reason">Motivo de la postergación</Label>
              <Textarea
                id="postpone-reason"
                placeholder="Ej: Cliente solicitó nueva fecha, problemas de tráfico..."
                value={postponeReason}
                onChange={(e) => setPostponeReason(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => showPostponeModal && handlePostponeOrder(showPostponeModal)}
                className="bg-yellow-600 hover:bg-yellow-700 flex-1"
                disabled={!postponeDate || !postponeReason.trim()}
              >
                Confirmar Postergación
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPostponeModal(null)}
              >
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* PRINT MODAL */}
      {showPrintModal && (
        <PrintModal
          order={orders.find(o => o.id === showPrintModal)}
          isOpen={!!showPrintModal}
          onClose={() => setShowPrintModal(null)}
          onPrint={handlePrintOrder}
        />
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
