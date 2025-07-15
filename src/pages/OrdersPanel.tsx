import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  QrCode, 
  LogOut,
  Search,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileDown,
  Smile,
  Frown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import OrdersDashboard from '@/components/orders/OrdersDashboard';
import CompactOrderList from '@/components/orders/CompactOrderList';
import QRReaderModal from '@/components/orders/QRReaderModal';
import QROrderDetailModal from '@/components/orders/QROrderDetailModal';

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
  const [showQRReader, setShowQRReader] = useState(false);
  const [qrScannedOrder, setQrScannedOrder] = useState<any>(null);

  // *** FUNCIÓN PARA OBTENER PEDIDOS CON URGENCIA MEJORADA ***
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
        timeLimit = 72; // 72 horas para preparación
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
      isUrgent: (order.status === 'en_preparacion' && hoursLeft <= 36) || 
                (order.status === 'pendiente' && hoursLeft <= 6),
      hoursLeft: Math.max(0, hoursLeft)
    };
  };

  // *** ESTADÍSTICAS ACTUALIZADAS ***
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

  // *** FUNCIÓN MEJORADA PARA LEER QR ***
  const handleQRRead = (code: string) => {
    console.log(`Código QR leído: ${code}`);
    
    // Extraer el ID del pedido de la URL del QR
    const urlMatch = code.match(/\/seguimiento\/(.+)$/);
    let orderId = urlMatch ? urlMatch[1] : code;
    
    // Buscar el pedido en los datos mock
    const foundOrder = mockOrders.find(order => order.id === orderId);
    if (foundOrder) {
      const orderWithUrgency = { ...foundOrder, urgency: calculateOrderUrgency(foundOrder) };
      setQrScannedOrder(orderWithUrgency);
      setShowQRReader(false);
    } else {
      console.error('Pedido no encontrado:', orderId);
      setShowQRReader(false);
    }
  };

  // *** FUNCIÓN PARA ACTUALIZAR ESTADO DESDE QR ***
  const updateOrderStatusFromQR = (orderId: string, newStatus: string, reason?: string) => {
    console.log(`Actualizando pedido ${orderId} a estado: ${newStatus}`, reason ? `Motivo: ${reason}` : '');
    updateOrderStatus(orderId, newStatus);
    setQrScannedOrder(null);
  };

  // *** FUNCIÓN PARA CAMBIAR ESTADO DE PEDIDO ***
  const updateOrderStatus = (orderId: string, newStatus: string) => {
    console.log(`Actualizando pedido ${orderId} a estado: ${newStatus}`);
    // TODO: Integrar con Firebase
  };

  // *** FUNCIÓN PARA IMPRIMIR PEDIDO ***
  const printOrder = (order: any, format: 'A4' | 'A5' | 'ticket', editedData: any) => {
    console.log(`Imprimiendo pedido ${order.id} en formato ${format}`, { order, editedData });
    
    // Generar QR único
    const qrData = `PECADITOS-${order.id}-${Date.now()}`;
    console.log(`QR generado: ${qrData}`);
  };

  // *** FUNCIÓN PARA EXPORTAR REPORTES ***
  const exportReport = (reportType: string) => {
    console.log(`Exportando reporte: ${reportType}`);
    // TODO: Implementar exportación real
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
    <div className="min-h-screen bg-gradient-to-b from-sand-50 via-white to-sand-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-sand-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-brown-900">Panel de Pedidos</h1>
                <p className="text-brown-700">Gestión y preparación de pedidos</p>
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
                onClick={handleLogout}
                className="text-brown-700 border-sand-300 hover:bg-sand-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido Principal con navegación lateral */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Navegación lateral */}
          <div className="w-64 space-y-2">
            <nav className="space-y-1">
              {[
                { id: 'dashboard', label: 'Dashboard', icon: BarChart3, count: null },
                { id: 'pendientes', label: 'Pendientes', icon: Clock, count: stats.pendientes },
                { id: 'preparacion', label: 'En Preparación', icon: Package, count: stats.enPreparacion },
                { id: 'listos', label: 'Listos', icon: CheckCircle, count: stats.listos }
              ].map((tab) => (
                <Button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  variant={selectedTab === tab.id ? "default" : "ghost"}
                  className={`w-full justify-start ${
                    selectedTab === tab.id ? 'bg-primary text-primary-foreground' : 'hover:bg-sand-100'
                  }`}
                >
                  <tab.icon className="h-4 w-4 mr-3" />
                  <span className="flex-1 text-left">{tab.label}</span>
                  {tab.count !== null && (
                    <Badge variant="secondary" className="ml-2">
                      {tab.count}
                    </Badge>
                  )}
                </Button>
              ))}
            </nav>

            {/* Botón de Urgentes Especial */}
            <div className="pt-4 border-t border-sand-200">
              <Button
                onClick={() => setSelectedTab('urgentes')}
                className={`w-full h-16 flex flex-col items-center justify-center gap-1 transition-all ${
                  stats.alertas > 0 
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {stats.alertas > 0 ? (
                  <>
                    <Frown className="h-6 w-6" />
                    <span className="text-xs font-bold">¡Vamos, tú puedes!</span>
                    <span className="text-xs">Urgentes: {stats.alertas}</span>
                  </>
                ) : (
                  <>
                    <Smile className="h-6 w-6" />
                    <span className="text-xs font-bold">¡Muy bien!</span>
                    <span className="text-xs">Sin urgentes</span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="flex-1">
            {/* Filtro de búsqueda para vistas de lista */}
            {selectedTab !== 'dashboard' && (
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <Input
                      placeholder="Buscar por ID, cliente o sede..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Dashboard */}
            {selectedTab === 'dashboard' && (
              <OrdersDashboard orders={mockOrders} onExportReport={exportReport} />
            )}

            {/* Pendientes */}
            {selectedTab === 'pendientes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-brown-900">Pedidos Pendientes</h2>
                  <Badge className="bg-yellow-100 text-yellow-800">
                    {mockOrders.filter(o => o.status === 'pendiente').length} pedidos
                  </Badge>
                </div>
                <CompactOrderList
                  orders={mockOrders.filter(order => {
                    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
                    return order.status === 'pendiente' && matchesSearch;
                  })}
                  showTimer={true}
                  showActions={true}
                  onStatusUpdate={updateOrderStatus}
                  onPrint={printOrder}
                />
              </div>
            )}

            {/* En Preparación */}
            {selectedTab === 'preparacion' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-brown-900">En Preparación</h2>
                  <Badge className="bg-blue-100 text-blue-800">
                    {mockOrders.filter(o => o.status === 'en_preparacion').length} pedidos
                  </Badge>
                </div>
                <CompactOrderList
                  orders={mockOrders.filter(order => {
                    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
                    return order.status === 'en_preparacion' && matchesSearch;
                  })}
                  showTimer={true}
                  timeLimit={72}
                  onStatusUpdate={updateOrderStatus}
                  onPrint={printOrder}
                />
              </div>
            )}

            {/* Listos */}
            {selectedTab === 'listos' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-brown-900">Pedidos Listos</h2>
                  <Badge className="bg-green-100 text-green-800">
                    {mockOrders.filter(o => o.status === 'listo').length} pedidos
                  </Badge>
                </div>
                <CompactOrderList
                  orders={mockOrders.filter(order => {
                    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                         order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
                    return order.status === 'listo' && matchesSearch;
                  })}
                  showTimer={false}
                  showAlerts={false}
                  onStatusUpdate={updateOrderStatus}
                  onPrint={printOrder}
                />
              </div>
            )}

            {/* Urgentes */}
            {selectedTab === 'urgentes' && (
              <div className="space-y-4">
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
                
                <CompactOrderList
                  orders={ordersWithUrgency
                    .filter(order => {
                      const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                           order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
                      return (order.urgency.isExpired || order.urgency.isUrgent) && matchesSearch;
                    })
                    .sort((a, b) => {
                      if (a.urgency.isExpired && !b.urgency.isExpired) return -1;
                      if (!a.urgency.isExpired && b.urgency.isExpired) return 1;
                      return a.urgency.hoursLeft - b.urgency.hoursLeft;
                    })}
                  showTimer={true}
                  showActions={true}
                  onStatusUpdate={updateOrderStatus}
                  onPrint={printOrder}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal QR Reader */}
      <QRReaderModal
        isOpen={showQRReader}
        onClose={() => setShowQRReader(false)}
        onQRRead={handleQRRead}
      />

      {/* Modal QR Order Detail */}
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
