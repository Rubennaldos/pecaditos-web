
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Truck, 
  Package, 
  CheckCircle, 
  QrCode, 
  MapPin, 
  Phone,
  User,
  Calendar,
  Filter,
  LogOut,
  AlertCircle
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * PANEL DE REPARTO - DISTRIBUCIÓN Y ENTREGA
 * 
 * Funcionalidades principales:
 * - Selección de repartidor al iniciar
 * - Vista de pedidos por estado (pendientes, en ruta, entregados)
 * - Filtros por distrito de Lima
 * - Lector QR para cambio rápido de estado
 * - Observaciones por repartidor
 * - Datos completos de entrega
 * 
 * *** MOCK DATA - INTEGRAR CON FIREBASE REALTIME DATABASE ***
 */

// *** DISTRITOS DE LIMA METROPOLITANA ***
const limaDistricts = [
  "Todos los distritos",
  "Cercado de Lima", "San Isidro", "Miraflores", "San Borja", "Surco", "La Molina",
  "Independencia", "Los Olivos", "San Martín de Porres", "Comas", "Puente Piedra",
  "Ate", "Santa Anita", "El Agustino", "San Juan de Lurigancho", "Lurigancho",
  "Breña", "Jesús María", "Magdalena", "Pueblo Libre", "Lince", "San Miguel",
  "Chorrillos", "Barranco", "Surquillo", "San Luis", "Villa María del Triunfo",
  "Villa El Salvador", "Pachacamac", "Lurín", "Punta Hermosa", "Punta Negra",
  "San Bartolo", "Santa María del Mar", "Pucusana"
];

// *** MOCK DATA DE PEDIDOS PARA ENTREGA ***
const mockDeliveryOrders = [
  {
    id: "PEC-2024-003",
    customerName: "Bodega Don Carlos",
    customerPhone: "+51 999 555 666",
    customerAddress: "Calle Santa Rosa 789, San Borja",
    district: "San Borja",
    coordinates: { lat: -12.1004, lng: -76.9967 },
    status: "pendiente_entrega",
    readyAt: "2024-01-14T16:30:00",
    total: 225.00,
    paymentMethod: "credito_15",
    notes: "Incluir material promocional",
    deliveryNotes: ""
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
    total: 480.00,
    paymentMethod: "contado",
    notes: "Horario preferido: 2-6 PM",
    deliveryNotes: "Cliente confirmó recepción por teléfono"
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
    total: 345.00,
    paymentMethod: "contado",
    notes: "Entregar en almacén trasero",
    deliveryNotes: "Entregado correctamente. Recibido por Sr. García."
  }
];

// *** MOCK DATA DE REPARTIDORES ***
const deliveryPersons = [
  { id: "1", name: "Carlos Mendoza", phone: "+51 999 111 111" },
  { id: "2", name: "María López", phone: "+51 999 222 222" },
  { id: "3", name: "José Ramírez", phone: "+51 999 333 333" },
  { id: "4", name: "Ana Torres", phone: "+51 999 444 444" }
];

const DeliveryPanel = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [selectedDeliveryPerson, setSelectedDeliveryPerson] = useState('');
  const [showPersonSelection, setShowPersonSelection] = useState(true);
  const [selectedTab, setSelectedTab] = useState('pendientes');
  const [districtFilter, setDistrictFilter] = useState('Todos los distritos');
  const [showQRReader, setShowQRReader] = useState(false);
  const [qrInput, setQrInput] = useState('');

  // *** FILTRAR PEDIDOS SEGÚN CRITERIOS ***
  const filteredOrders = mockDeliveryOrders.filter(order => {
    const matchesDistrict = districtFilter === 'Todos los distritos' || order.district === districtFilter;
    const matchesTab = 
      (selectedTab === 'pendientes' && order.status === 'pendiente_entrega') ||
      (selectedTab === 'en_ruta' && order.status === 'en_ruta') ||
      (selectedTab === 'entregados' && order.status === 'entregado');
    return matchesDistrict && matchesTab;
  });

  // *** ESTADÍSTICAS ***
  const stats = {
    pendientes: mockDeliveryOrders.filter(o => o.status === 'pendiente_entrega').length,
    enRuta: mockDeliveryOrders.filter(o => o.status === 'en_ruta').length,
    entregados: mockDeliveryOrders.filter(o => o.status === 'entregado').length
  };

  // *** SELECCIONAR REPARTIDOR ***
  const handlePersonSelection = (personId: string) => {
    const person = deliveryPersons.find(p => p.id === personId);
    if (person) {
      setSelectedDeliveryPerson(person.name);
      setShowPersonSelection(false);
      console.log(`Repartidor seleccionado: ${person.name}`);
    }
  };

  // *** CAMBIAR ESTADO DE PEDIDO ***
  const updateOrderStatus = (orderId: string, newStatus: string, notes?: string) => {
    console.log(`Actualizando pedido ${orderId} a estado: ${newStatus}`, notes ? `Observaciones: ${notes}` : '');
    // TODO: Integrar con Firebase
  };

  // *** LEER QR ***
  const handleQRRead = (code: string) => {
    console.log(`Código QR leído: ${code}`);
    // TODO: Buscar pedido y permitir cambio de estado
    setShowQRReader(false);
    setQrInput('');
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

  // *** OBTENER COLOR DEL ESTADO ***
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendiente_entrega':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente Entrega' };
      case 'en_ruta':
        return { color: 'bg-blue-100 text-blue-800', text: 'En Ruta' };
      case 'entregado':
        return { color: 'bg-green-100 text-green-800', text: 'Entregado' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  // *** MODAL DE SELECCIÓN DE REPARTIDOR ***
  if (showPersonSelection) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Truck className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-stone-800">
              ¿Quién eres?
            </CardTitle>
            <CardDescription>
              Selecciona tu nombre para continuar con las entregas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deliveryPersons.map((person) => (
              <Button
                key={person.id}
                onClick={() => handlePersonSelection(person.id)}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white justify-start"
              >
                <User className="h-4 w-4 mr-3" />
                <div className="text-left">
                  <div className="font-medium">{person.name}</div>
                  <div className="text-xs opacity-75">{person.phone}</div>
                </div>
              </Button>
            ))}
            <div className="pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => navigate('/')}
                className="w-full text-stone-600 border-stone-300 hover:bg-stone-50"
              >
                Volver al inicio
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
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
                <p className="text-stone-600">Repartidor: {selectedDeliveryPerson}</p>
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
                onClick={() => setShowPersonSelection(true)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50"
              >
                <User className="h-4 w-4 mr-2" />
                Cambiar Repartidor
              </Button>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-stone-600 border-stone-300 hover:bg-stone-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="pendientes">
              Pendientes ({stats.pendientes})
            </TabsTrigger>
            <TabsTrigger value="en_ruta">
              En Ruta ({stats.enRuta})
            </TabsTrigger>
            <TabsTrigger value="entregados">
              Entregados ({stats.entregados})
            </TabsTrigger>
          </TabsList>

          {/* Filtro por Distrito */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtrar por Distrito
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={districtFilter} onValueChange={setDistrictFilter}>
                <SelectTrigger className="md:w-64">
                  <SelectValue placeholder="Seleccionar distrito" />
                </SelectTrigger>
                <SelectContent>
                  {limaDistricts.map((district) => (
                    <SelectItem key={district} value={district}>
                      {district}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Contenido de Pestañas */}
          <TabsContent value="pendientes" className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-800 mb-2">
                  No hay pedidos pendientes de entrega
                </h3>
                <p className="text-stone-600">
                  {districtFilter !== 'Todos los distritos' 
                    ? `No hay pedidos en ${districtFilter}` 
                    : 'Todos los pedidos han sido asignados'}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {order.id}
                          <Badge className="bg-yellow-100 text-yellow-800">
                            Listo para entrega
                          </Badge>
                        </CardTitle>
                        <CardDescription>{order.customerName}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
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
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-stone-400" />
                          <span>Listo desde: {new Date(order.readyAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="font-medium">Total: S/ {order.total.toFixed(2)}</span>
                        </div>
                        <div className="text-sm">
                          <span>Pago: {order.paymentMethod}</span>
                        </div>
                        {order.notes && (
                          <div className="p-3 bg-amber-50 border border-amber-200 rounded-md">
                            <p className="text-sm text-amber-800">
                              <strong>Observaciones:</strong> {order.notes}
                            </p>
                          </div>
                        )}
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'en_ruta')}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Truck className="h-4 w-4 mr-2" />
                          Tomar para entrega
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="en_ruta" className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12">
                <Truck className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-stone-800 mb-2">
                  No tienes pedidos en ruta
                </h3>
                <p className="text-stone-600">
                  Toma pedidos de la pestaña "Pendientes" para comenzar las entregas
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-all border-blue-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {order.id}
                          <Badge className="bg-blue-100 text-blue-800">
                            En ruta
                          </Badge>
                        </CardTitle>
                        <CardDescription>{order.customerName}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
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
                        {order.deliveryNotes && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                            <p className="text-sm text-blue-800">
                              <strong>Notas de entrega:</strong> {order.deliveryNotes}
                            </p>
                          </div>
                        )}
                      </div>
                      <div className="space-y-3">
                        <div className="text-sm">
                          <span className="font-medium">Total: S/ {order.total.toFixed(2)}</span>
                        </div>
                        <Button
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${order.coordinates.lat},${order.coordinates.lng}`, '_blank')}
                          variant="outline"
                          className="w-full border-green-500 text-green-600 hover:bg-green-50"
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Ver en Google Maps
                        </Button>
                        <Button
                          onClick={() => updateOrderStatus(order.id, 'entregado', 'Entregado correctamente')}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar como entregado
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="entregados" className="space-y-4">
            {filteredOrders.length === 0 ? (
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
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-lg transition-all border-green-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {order.id}
                          <Badge className="bg-green-100 text-green-800">
                            Entregado
                          </Badge>
                        </CardTitle>
                        <CardDescription>{order.customerName}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-stone-400" />
                          <span className="font-medium">{order.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar className="h-4 w-4 text-stone-400" />
                          <span>Entregado: {new Date(order.deliveredAt || '').toLocaleString()}</span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Total: S/ {order.total.toFixed(2)}</span>
                        </div>
                      </div>
                      <div>
                        {order.deliveryNotes && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                            <p className="text-sm text-green-800">
                              <strong>Observaciones de entrega:</strong> {order.deliveryNotes}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal QR Reader */}
      {showQRReader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Leer Código QR</CardTitle>
              <CardDescription>
                Escanea el código QR del pedido para cambiar su estado
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-stone-300 rounded-lg p-8 text-center">
                <QrCode className="h-12 w-12 text-stone-400 mx-auto mb-4" />
                <p className="text-stone-600">Cámara QR aquí</p>
                <p className="text-xs text-stone-500 mt-2">
                  (Funcionalidad a implementar)
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">O ingresa el código:</label>
                <Input
                  placeholder="Código del pedido"
                  value={qrInput}
                  onChange={(e) => setQrInput(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => handleQRRead(qrInput)}
                  disabled={!qrInput}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                >
                  Buscar Pedido
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowQRReader(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default DeliveryPanel;

/*
INSTRUCCIONES PARA INTEGRACIÓN CON FIREBASE:

1. ESTRUCTURA DE DATOS:
   /delivery_orders/{orderId}: {
     customerName: string,
     customerPhone: string,
     customerAddress: string,
     district: string,
     coordinates: { lat: number, lng: number },
     status: 'pendiente_entrega' | 'en_ruta' | 'entregado',
     assignedTo: string (nombre del repartidor),
     readyAt: timestamp,
     deliveredAt?: timestamp,
     total: number,
     paymentMethod: string,
     notes: string,
     deliveryNotes: string
   }

2. FUNCIONALIDADES A IMPLEMENTAR:
   - Tracking GPS en tiempo real
   - Notificaciones push al cliente
   - Firma digital en la entrega
   - Foto de confirmación
   - Integración con Google Maps API
   - Chat con el cliente

3. MEJORAS SUGERIDAS:
   - Optimización de rutas
   - Cálculo de tiempo estimado de entrega
   - Historial detallado por repartidor
   - Métricas de rendimiento
   - Sistema de calificaciones

4. PERSONALIZACIÓN:
   - Agregar más distritos según cobertura
   - Modificar estados según flujo operativo
   - Personalizar campos de observaciones
   - Configurar alertas automáticas
*/
