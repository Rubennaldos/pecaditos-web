
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  Printer, 
  Search, 
  Filter, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  QrCode,
  FileText,
  LogOut,
  User
} from 'lucide-react';

/**
 * PANEL DE PEDIDOS - PREPARACIÓN E IMPRESIÓN
 * 
 * Funcionalidades específicas para el perfil de pedidos:
 * - Lista y filtros de pedidos pendientes/en preparación
 * - Impresión de pedidos en diferentes formatos
 * - Firma digital y confirmación de preparación
 * - Generación y lectura de códigos QR
 * - Actualización de estados de pedidos
 * - Observaciones internas para cada pedido
 * - Historial de cambios y trazabilidad
 * - Exportación de pedidos preparados
 * 
 * ACCESO: Solo usuarios con perfil "pedidos" y admin (impersonación)
 * RUTA: /pedidos
 */

const OrdersPanel = () => {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('pendientes');

  // Mock data - En producción conectar con Firebase
  const mockOrders = [
    {
      id: 'PED001',
      cliente: 'María González',
      productos: ['Combo Familiar x2', 'Granola Premium x1'],
      total: 85.50,
      estado: 'pendiente',
      hora: '09:30',
      observaciones: '',
      priority: 'normal'
    },
    {
      id: 'PED002', 
      cliente: 'Carlos Ruiz',
      productos: ['Mix Frutos Secos x3'],
      total: 45.00,
      estado: 'preparando',
      hora: '10:15',
      observaciones: 'Sin almendras por alergia',
      priority: 'urgente'
    },
    {
      id: 'PED003',
      cliente: 'Ana Torres',
      productos: ['Snack Saludable x4', 'Barras Energéticas x2'],
      total: 67.80,
      estado: 'listo',
      hora: '11:00',
      observaciones: '',
      priority: 'normal'
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handlePrintOrder = (orderId: string) => {
    console.log(`🖨️ Imprimiendo pedido: ${orderId}`);
    // Aquí iría la lógica de impresión
  };

  const handleUpdateStatus = (orderId: string, newStatus: string) => {
    console.log(`📝 Actualizando pedido ${orderId} a estado: ${newStatus}`);
    // Aquí iría la lógica de actualización en Firebase
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'preparando': return 'bg-blue-100 text-blue-800';  
      case 'listo': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgente' ? 'border-l-4 border-red-500' : '';
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header del Panel */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">Panel de Pedidos</h1>
              <p className="text-sm text-stone-600">Preparación e impresión de pedidos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 rounded-full">
              <User className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                {user?.name || 'Usuario Pedidos'}
              </span>
            </div>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-600">5</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">En Preparación</p>
                  <p className="text-2xl font-bold text-blue-600">3</p>
                </div>
                <Package className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Listos</p>
                  <p className="text-2xl font-bold text-green-600">8</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Hoy Total</p>
                  <p className="text-2xl font-bold text-stone-600">16</p>
                </div>
                <FileText className="h-8 w-8 text-stone-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Pedidos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Buscar por ID, cliente, producto..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant={selectedStatus === 'pendientes' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('pendientes')}
                  size="sm"
                >
                  Pendientes
                </Button>
                <Button 
                  variant={selectedStatus === 'preparando' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('preparando')}
                  size="sm"
                >
                  Preparando
                </Button>
                <Button 
                  variant={selectedStatus === 'listos' ? 'default' : 'outline'}
                  onClick={() => setSelectedStatus('listos')}
                  size="sm"
                >
                  Listos
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de pedidos */}
        <div className="space-y-4">
          {mockOrders.map((order) => (
            <Card key={order.id} className={`${getPriorityColor(order.priority)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">#{order.id}</h3>
                      <Badge className={getStatusColor(order.estado)}>
                        {order.estado.toUpperCase()}
                      </Badge>
                      {order.priority === 'urgente' && (
                        <Badge variant="destructive">URGENTE</Badge>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-stone-600">Cliente:</p>
                        <p className="font-medium">{order.cliente}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-stone-600">Hora:</p>
                        <p className="font-medium">{order.hora}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="text-sm text-stone-600">Productos:</p>
                        <ul className="list-disc list-inside">
                          {order.productos.map((producto, index) => (
                            <li key={index} className="text-sm">{producto}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {order.observaciones && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-stone-600">Observaciones:</p>
                          <p className="text-sm bg-amber-50 p-2 rounded border-l-4 border-amber-400">
                            <AlertCircle className="h-4 w-4 inline mr-2 text-amber-600" />
                            {order.observaciones}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-stone-600">Total:</p>
                        <p className="font-bold text-lg text-green-600">S/ {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      size="sm" 
                      onClick={() => handlePrintOrder(order.id)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Printer className="h-4 w-4 mr-2" />
                      Imprimir
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleUpdateStatus(order.id, 'preparando')}
                    >
                      <QrCode className="h-4 w-4 mr-2" />
                      QR Code
                    </Button>
                    
                    {order.estado === 'pendiente' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleUpdateStatus(order.id, 'preparando')}
                        className="border-green-300 text-green-700 hover:bg-green-50"
                      >
                        Iniciar
                      </Button>
                    )}
                    
                    {order.estado === 'preparando' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleUpdateStatus(order.id, 'listo')}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Listo
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrdersPanel;

/*
INSTRUCCIONES PARA PERSONALIZAR:

1. CONECTAR CON FIREBASE:
   - Reemplazar mockOrders con consultas a Firebase Realtime Database
   - Implementar funciones de actualización de estado en tiempo real
   - Sincronizar con sistema de impresión

2. FUNCIONALIDADES A IMPLEMENTAR:
   - Impresión real de pedidos (PDF, ticket)
   - Generación de códigos QR únicos por pedido
   - Firma digital del preparador
   - Notificaciones push para nuevos pedidos
   - Historial de cambios y auditoría

3. PERSONALIZACIÓN:
   - Modificar colores y estilos según marca
   - Agregar más filtros y opciones de búsqueda
   - Personalizar formato de impresión
   - Configurar alertas y notificaciones

4. DATOS MOCK:
   - Cambiar mockOrders por datos reales
   - Actualizar estadísticas con datos dinámicos
   - Conectar con sistema de usuarios real

ESTE PANEL ESTÁ DISEÑADO ESPECÍFICAMENTE PARA:
- Personal de cocina/preparación
- Gestión eficiente de pedidos
- Trazabilidad completa del proceso
- Interface simple y práctica para uso diario
*/
