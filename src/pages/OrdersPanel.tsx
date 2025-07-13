
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Package, 
  Clock3, 
  CheckCircle, 
  AlertTriangle, 
  QrCode, 
  Printer, 
  FileDown,
  Search,
  Filter,
  Calendar,
  User,
  Phone,
  MapPin,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * PANEL DE PEDIDOS - GESTIÓN Y PREPARACIÓN
 * 
 * Funcionalidades principales:
 * - Dashboard con filtros y estadísticas
 * - Gestión de estados de pedidos
 * - Impresión en múltiples formatos
 * - Lector QR global
 * - Alertas de tiempo por estado
 * - Observaciones y edición
 * 
 * *** MOCK DATA - INTEGRAR CON FIREBASE REALTIME DATABASE ***
 * Para conectar: reemplazar mockOrders con queries de Firebase
 */

// *** MOCK DATA - REEMPLAZAR CON FIREBASE ***
const mockOrders = [
  {
    id: "PEC-2024-001",
    customerName: "Distribuidora El Sol SAC",
    customerPhone: "+51 999 111 222",
    customerAddress: "Av. Los Olivos 123, San Isidro",
    status: "pendiente",
    createdAt: "2024-01-15T08:30:00",
    items: [
      { product: "Galletas Integrales Avena", quantity: 12, price: 8.50 },
      { product: "Galletas Integrales Quinua", quantity: 6, price: 9.00 }
    ],
    total: 156.00,
    paymentMethod: "credito_30",
    orderType: "normal",
    notes: "",
    preparationAlert: true // Más de 1 día sin aceptar
  },
  {
    id: "PEC-2024-002",
    customerName: "Minimarket Los Andes",
    customerPhone: "+51 999 333 444",
    customerAddress: "Jr. Las Flores 456, Miraflores",
    status: "en_preparacion",
    createdAt: "2024-01-14T14:20:00",
    acceptedAt: "2024-01-14T15:00:00",
    items: [
      { product: "Galletas Integrales Coco", quantity: 24, price: 8.00 },
      { product: "Galletas Integrales Chía", quantity: 18, price: 8.50 }
    ],
    total: 345.00,
    paymentMethod: "contado",
    orderType: "reposicion",
    notes: "Cliente habitual - prioridad",
    preparationAlert: false
  },
  {
    id: "PEC-2024-003",
    customerName: "Bodega Don Carlos",
    customerPhone: "+51 999 555 666",
    customerAddress: "Calle Santa Rosa 789, San Borja",
    status: "listo",
    createdAt: "2024-01-13T10:15:00",
    acceptedAt: "2024-01-13T11:00:00",
    readyAt: "2024-01-14T16:30:00",
    items: [
      { product: "Galletas Integrales Mix", quantity: 30, price: 7.50 }
    ],
    total: 225.00,
    paymentMethod: "credito_15",
    orderType: "degustacion",
    notes: "Incluir material promocional",
    preparationAlert: false
  }
];

const OrdersPanel = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [dateFilter, setDateFilter] = useState('hoy');
  const [showQRReader, setShowQRReader] = useState(false);
  const [qrInput, setQrInput] = useState('');

  // *** FILTRAR PEDIDOS SEGÚN CRITERIOS ***
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // *** ESTADÍSTICAS DEL DASHBOARD ***
  const stats = {
    total: mockOrders.length,
    pendientes: mockOrders.filter(o => o.status === 'pendiente').length,
    enPreparacion: mockOrders.filter(o => o.status === 'en_preparacion').length,
    listos: mockOrders.filter(o => o.status === 'listo').length,
    alertas: mockOrders.filter(o => o.preparationAlert).length
  };

  // *** FUNCIÓN PARA CAMBIAR ESTADO DE PEDIDO ***
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    console.log(`Actualizando pedido ${orderId} a estado: ${newStatus}`);
    // TODO: Integrar con Firebase
  };

  // *** FUNCIÓN PARA IMPRIMIR PEDIDO ***
  const printOrder = (order: any, format: 'A4' | 'A5' | 'ticket') => {
    console.log(`Imprimiendo pedido ${order.id} en formato ${format}`);
    // TODO: Implementar impresión
  };

  // *** FUNCIÓN PARA LEER QR ***
  const handleQRRead = (code: string) => {
    console.log(`Código QR leído: ${code}`);
    // TODO: Buscar pedido por código QR
    setShowQRReader(false);
    setQrInput('');
  };

  // *** FUNCIÓN PARA CERRAR SESIÓN ***
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  // *** OBTENER COLOR Y TEXTO DEL ESTADO ***
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pendiente':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' };
      case 'en_preparacion':
        return { color: 'bg-blue-100 text-blue-800', text: 'En Preparación' };
      case 'listo':
        return { color: 'bg-green-100 text-green-800', text: 'Listo' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Panel de Pedidos</h1>
                <p className="text-stone-600">Gestión y preparación de pedidos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {/* Botón QR Global */}
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
          <TabsList className="grid w-full grid-cols-5 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes ({stats.pendientes})</TabsTrigger>
            <TabsTrigger value="preparacion">En Preparación ({stats.enPreparacion})</TabsTrigger>
            <TabsTrigger value="listos">Listos ({stats.listos})</TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
                  <Package className="h-4 w-4 text-stone-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock3 className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.pendientes}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En Preparación</CardTitle>
                  <Package className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.enPreparacion}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.alertas}</div>
                </CardContent>
              </Card>
            </div>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <Input
                        placeholder="Buscar por ID o cliente..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="md:w-48">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="pendiente">Pendientes</SelectItem>
                      <SelectItem value="en_preparacion">En Preparación</SelectItem>
                      <SelectItem value="listo">Listos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={dateFilter} onValueChange={setDateFilter}>
                    <SelectTrigger className="md:w-48">
                      <SelectValue placeholder="Fecha" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hoy">Hoy</SelectItem>
                      <SelectItem value="ayer">Ayer</SelectItem>
                      <SelectItem value="semana">Esta semana</SelectItem>
                      <SelectItem value="mes">Este mes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Pedidos */}
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = getStatusInfo(order.status);
                return (
                  <Card key={order.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <CardTitle className="flex items-center gap-2">
                              {order.id}
                              {order.preparationAlert && (
                                <AlertTriangle className="h-4 w-4 text-red-500" />
                              )}
                            </CardTitle>
                            <CardDescription>{order.customerName}</CardDescription>
                          </div>
                        </div>
                        <Badge className={statusInfo.color}>
                          {statusInfo.text}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <User className="h-4 w-4 text-stone-400" />
                            <span>{order.customerName}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-4 w-4 text-stone-400" />
                            <span>{order.customerPhone}</span>
                          </div>
                          <div className="flex items-start gap-2 text-sm">
                            <MapPin className="h-4 w-4 text-stone-400 mt-0.5" />
                            <span>{order.customerAddress}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-stone-400" />
                            <span>{new Date(order.createdAt).toLocaleString()}</span>
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Total: S/ {order.total.toFixed(2)}</span>
                          </div>
                          <div className="text-sm">
                            <span>Tipo: {order.orderType}</span>
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button
                            size="sm"
                            onClick={() => printOrder(order, 'A4')}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir
                          </Button>
                          <Select onValueChange={(value) => updateOrderStatus(order.id, value)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Cambiar estado" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendiente">Pendiente</SelectItem>
                              <SelectItem value="en_preparacion">En Preparación</SelectItem>
                              <SelectItem value="listo">Listo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      {order.notes && (
                        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                          <p className="text-sm text-amber-800">
                            <strong>Observaciones:</strong> {order.notes}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Otras pestañas (Pendientes, En Preparación, etc.) */}
          <TabsContent value="pendientes">
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-800 mb-2">
                Vista de Pedidos Pendientes
              </h3>
              <p className="text-stone-600">
                Aquí se mostrarán solo los pedidos pendientes de aceptar
              </p>
            </div>
          </TabsContent>

          <TabsContent value="preparacion">
            <div className="text-center py-12">
              <Clock3 className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-800 mb-2">
                Vista de Pedidos en Preparación
              </h3>
              <p className="text-stone-600">
                Aquí se mostrarán solo los pedidos en preparación
              </p>
            </div>
          </TabsContent>

          <TabsContent value="listos">
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-800 mb-2">
                Vista de Pedidos Listos
              </h3>
              <p className="text-stone-600">
                Aquí se mostrarán solo los pedidos listos para entrega
              </p>
            </div>
          </TabsContent>

          <TabsContent value="reportes">
            <div className="text-center py-12">
              <FileDown className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-800 mb-2">
                Reportes y Exportación
              </h3>
              <p className="text-stone-600">
                Aquí podrás exportar reportes de pedidos en Excel
              </p>
              <Button className="mt-4 bg-green-600 hover:bg-green-700 text-white">
                <FileDown className="h-4 w-4 mr-2" />
                Exportar a Excel
              </Button>
            </div>
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
                Escanea el código QR del pedido o ingresa el código manualmente
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

export default OrdersPanel;

/*
INSTRUCCIONES PARA INTEGRACIÓN CON FIREBASE:

1. ESTRUCTURA DE DATOS:
   /orders/{orderId}: {
     customerName: string,
     customerPhone: string,
     customerAddress: string,
     status: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado',
     createdAt: timestamp,
     acceptedAt?: timestamp,
     readyAt?: timestamp,
     items: [{ product: string, quantity: number, price: number }],
     total: number,
     paymentMethod: string,
     orderType: string,
     notes: string,
     qrCode: string
   }

2. FUNCIONALIDADES A IMPLEMENTAR:
   - Actualización en tiempo real de estados
   - Notificaciones push para nuevos pedidos
   - Impresión PDF con formato personalizable
   - Lector QR con cámara
   - Exportación a Excel
   - Alertas automáticas por tiempo

3. ALERTAS DE TIEMPO:
   - 1 día para aceptar/registrar (amarillo)
   - 2 días para preparar (naranja)
   - 2 días para entregar (rojo)

4. PERSONALIZACIÓN:
   - Cambiar colores y estilos según brand
   - Modificar estados de pedidos según flujo
   - Agregar campos personalizados
   - Configurar formatos de impresión
*/
