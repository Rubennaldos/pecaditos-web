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
  FileDown,
  Search,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import OrderCard from '@/components/orders/OrderCard';

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

  // Función para obtener pedidos con urgencia
  const getOrdersWithUrgency = () => {
    return mockOrders.map(order => {
      const urgency = calculateOrderUrgency(order);
      return { ...order, urgency };
    });
  };

  const calculateOrderUrgency = (order: any) => {
    const now = new Date();
    let referenceDate: Date;
    let timeLimit: number;

    switch (order.status) {
      case 'pendiente':
        referenceDate = new Date(order.createdAt);
        timeLimit = 24;
        break;
      case 'en_preparacion':
        referenceDate = order.acceptedAt ? new Date(order.acceptedAt) : new Date(order.createdAt);
        timeLimit = 48;
        break;
      case 'listo':
        referenceDate = order.readyAt ? new Date(order.readyAt) : new Date(order.createdAt);
        timeLimit = 48;
        break;
      default:
        return { isExpired: false, isUrgent: false, hoursLeft: 0 };
    }

    const limitDate = new Date(referenceDate.getTime() + (timeLimit * 60 * 60 * 1000));
    const difference = limitDate.getTime() - now.getTime();
    const hoursLeft = Math.floor(difference / (1000 * 60 * 60));

    return {
      isExpired: difference <= 0,
      isUrgent: hoursLeft <= 6 && hoursLeft > 0,
      hoursLeft: Math.max(0, hoursLeft)
    };
  };

  // *** FILTRAR PEDIDOS SEGÚN CRITERIOS ***
  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesStatus = statusFilter === 'todos' || order.status === statusFilter;
    
    // Filtro especial para urgentes/vencidos
    if (statusFilter === 'urgentes') {
      const urgency = calculateOrderUrgency(order);
      matchesStatus = urgency.isExpired || urgency.isUrgent;
    }
    
    return matchesSearch && matchesStatus;
  });

  // *** ESTADÍSTICAS DEL DASHBOARD ACTUALIZADAS ***
  const ordersWithUrgency = getOrdersWithUrgency();
  const stats = {
    total: mockOrders.length,
    pendientes: mockOrders.filter(o => o.status === 'pendiente').length,
    enPreparacion: mockOrders.filter(o => o.status === 'en_preparacion').length,
    listos: mockOrders.filter(o => o.status === 'listo').length,
    vencidos: ordersWithUrgency.filter(o => o.urgency.isExpired).length,
    urgentes: ordersWithUrgency.filter(o => o.urgency.isUrgent && !o.urgency.isExpired).length,
    alertas: ordersWithUrgency.filter(o => o.urgency.isExpired || o.urgency.isUrgent).length
  };

  // *** FUNCIÓN PARA CAMBIAR ESTADO DE PEDIDO ***
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    console.log(`Actualizando pedido ${orderId} a estado: ${newStatus}`);
    // TODO: Integrar con Firebase
  };

  // *** FUNCIÓN PARA IMPRIMIR PEDIDO MEJORADA ***
  const printOrder = (order: any, format: 'A4' | 'A5' | 'ticket', editedData: any) => {
    console.log(`Imprimiendo pedido ${order.id} en formato ${format}`, { order, editedData });
    
    // Generar QR único
    const qrData = `PECADITOS-${order.id}-${Date.now()}`;
    
    // Aquí iría la lógica de impresión real
    // Por ahora solo log para demostración
    console.log(`QR generado: ${qrData}`);
    
    // TODO: Implementar impresión real con los datos editados
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
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="pendientes">Pendientes ({stats.pendientes})</TabsTrigger>
            <TabsTrigger value="preparacion">En Preparación ({stats.enPreparacion})</TabsTrigger>
            <TabsTrigger value="listos">Listos ({stats.listos})</TabsTrigger>
            <TabsTrigger value="urgentes" className="text-red-600">
              Urgentes ({stats.alertas})
            </TabsTrigger>
            <TabsTrigger value="reportes">Reportes</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Estadísticas actualizadas */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
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
                  <CardTitle className="text-sm font-medium">Listos</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.listos}</div>
                </CardContent>
              </Card>
              <Card className="ring-2 ring-red-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas Críticas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.alertas}</div>
                  <div className="text-xs text-red-500 mt-1">
                    {stats.vencidos} vencidos, {stats.urgentes} urgentes
                  </div>
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
                      <SelectItem value="urgentes">🚨 Urgentes/Vencidos</SelectItem>
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

            {/* Lista de Pedidos con nuevos componentes */}
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <OrderCard
                  key={order.id}
                  order={order}
                  onStatusUpdate={updateOrderStatus}
                  onPrint={printOrder}
                />
              ))}
            </div>
          </TabsContent>

          {/* Pestaña específica para urgentes */}
          <TabsContent value="urgentes" className="space-y-6">
            <Card className="border-red-200 bg-red-50">
              <CardHeader>
                <CardTitle className="text-red-800 flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Pedidos Críticos - Requieren Atención Inmediata
                </CardTitle>
                <CardDescription className="text-red-700">
                  {stats.vencidos} pedidos vencidos y {stats.urgentes} próximos a vencer
                </CardDescription>
              </CardHeader>
            </Card>
            
            <div className="space-y-4">
              {ordersWithUrgency
                .filter(order => order.urgency.isExpired || order.urgency.isUrgent)
                .sort((a, b) => {
                  if (a.urgency.isExpired && !b.urgency.isExpired) return -1;
                  if (!a.urgency.isExpired && b.urgency.isExpired) return 1;
                  return a.urgency.hoursLeft - b.urgency.hoursLeft;
                })
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={updateOrderStatus}
                    onPrint={printOrder}
                  />
                ))}
            </div>
          </TabsContent>

          {/* Otras pestañas existentes */}
          <TabsContent value="pendientes">
            <div className="space-y-4">
              {mockOrders
                .filter(order => order.status === 'pendiente')
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={updateOrderStatus}
                    onPrint={printOrder}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="preparacion">
            <div className="space-y-4">
              {mockOrders
                .filter(order => order.status === 'en_preparacion')
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={updateOrderStatus}
                    onPrint={printOrder}
                  />
                ))}
            </div>
          </TabsContent>

          <TabsContent value="listos">
            <div className="space-y-4">
              {mockOrders
                .filter(order => order.status === 'listo')
                .map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onStatusUpdate={updateOrderStatus}
                    onPrint={printOrder}
                  />
                ))}
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

      {/* Modal QR Reader (mantenido igual) */}
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
