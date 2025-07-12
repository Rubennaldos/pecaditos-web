
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { 
  Truck, 
  MapPin, 
  Phone, 
  QrCode, 
  CheckCircle, 
  Clock,
  Navigation,
  MessageCircle,
  LogOut,
  User,
  Search
} from 'lucide-react';

/**
 * PANEL DE REPARTO - DISTRIBUCIÓN Y ENTREGA
 * 
 * Funcionalidades específicas para el perfil de reparto:
 * - Lista de pedidos asignados y pendientes de entrega
 * - Agregar pedidos por código o QR
 * - Lista completa de entregas con datos del cliente
 * - Marcar pedidos como entregados
 * - Filtrar entregas por zona geográfica
 * - Contacto directo con cliente via WhatsApp
 * - Ver historial de entregas completadas
 * - Registro de incidencias en entregas
 * 
 * ACCESO: Solo usuarios con perfil "reparto" y admin (impersonación)
 * RUTA: /reparto
 */

const DeliveryPanel = () => {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('todas');

  // Mock data - En producción conectar con Firebase
  const mockDeliveries = [
    {
      id: 'ENT001',
      pedidoId: 'PED001',
      cliente: 'María González',
      telefono: '+51999888777',
      direccion: 'Av. Javier Prado 1234, San Borja',
      zona: 'San Borja',
      productos: ['Combo Familiar x2', 'Granola Premium x1'],
      total: 85.50,
      estado: 'en_ruta',
      horaAsignacion: '14:30',
      observaciones: 'Departamento 5B - Tocar timbre',
      prioridad: 'normal'
    },
    {
      id: 'ENT002',
      pedidoId: 'PED002', 
      cliente: 'Carlos Ruiz',
      telefono: '+51888777666',
      direccion: 'Jr. Los Comerciantes 456, Miraflores',
      zona: 'Miraflores',
      productos: ['Mix Frutos Secos x3'],
      total: 45.00,
      estado: 'pendiente',
      horaAsignacion: '15:00',
      observaciones: 'Oficina - Horario: 9am-6pm',
      prioridad: 'urgente'
    },
    {
      id: 'ENT003',
      pedidoId: 'PED003',
      cliente: 'Ana Torres',
      telefono: '+51777666555',
      direccion: 'Calle Las Flores 789, San Isidro',
      zona: 'San Isidro',
      productos: ['Snack Saludable x4', 'Barras Energéticas x2'],
      total: 67.80,
      estado: 'entregado',
      horaAsignacion: '13:45',
      horaEntrega: '14:20',
      observaciones: '',
      prioridad: 'normal'
    }
  ];

  const zones = ['todas', 'San Borja', 'Miraflores', 'San Isidro', 'Surco', 'La Molina'];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleMarkDelivered = (deliveryId: string) => {
    console.log(`✅ Marcando como entregado: ${deliveryId}`);
    // Aquí iría la lógica de actualización en Firebase
  };

  const handleWhatsApp = (phone: string, cliente: string) => {
    const message = encodeURIComponent(`Hola ${cliente}, soy el repartidor de Pecaditos Integrales. Estoy en camino con tu pedido.`);
    const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleNavigate = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
    window.open(mapsUrl, '_blank');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800';
      case 'en_ruta': return 'bg-blue-100 text-blue-800';  
      case 'entregado': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    return priority === 'urgente' ? 'border-l-4 border-red-500' : '';
  };

  const filteredDeliveries = mockDeliveries.filter(delivery => {
    const matchesSearch = delivery.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.pedidoId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         delivery.direccion.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesZone = selectedZone === 'todas' || delivery.zona === selectedZone;
    return matchesSearch && matchesZone;
  });

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header del Panel */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Truck className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">Panel de Reparto</h1>
              <p className="text-sm text-stone-600">Distribución y entrega de pedidos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 rounded-full">
              <User className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                {user?.name || 'Usuario Reparto'}
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
                  <p className="text-2xl font-bold text-yellow-600">3</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">En Ruta</p>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                </div>
                <Truck className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Entregados Hoy</p>
                  <p className="text-2xl font-bold text-green-600">12</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Total Hoy</p>
                  <p className="text-2xl font-bold text-stone-600">17</p>
                </div>
                <MapPin className="h-8 w-8 text-stone-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Filtros de Entregas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Buscar por cliente, pedido, dirección..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {zones.map(zone => (
                  <Button 
                    key={zone}
                    variant={selectedZone === zone ? 'default' : 'outline'}
                    onClick={() => setSelectedZone(zone)}
                    size="sm"
                    className="capitalize"
                  >
                    {zone}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de entregas */}
        <div className="space-y-4">
          {filteredDeliveries.map((delivery) => (
            <Card key={delivery.id} className={`${getPriorityColor(delivery.prioridad)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-bold text-lg">#{delivery.pedidoId}</h3>
                      <Badge className={getStatusColor(delivery.estado)}>
                        {delivery.estado.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {delivery.prioridad === 'urgente' && (
                        <Badge variant="destructive">URGENTE</Badge>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-stone-600">Cliente:</p>
                        <p className="font-medium">{delivery.cliente}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-stone-600">Teléfono:</p>
                        <p className="font-medium">{delivery.telefono}</p>
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="text-sm text-stone-600">Dirección:</p>
                        <p className="font-medium">{delivery.direccion}</p>
                        <Badge variant="outline" className="mt-1">{delivery.zona}</Badge>
                      </div>
                      
                      <div className="md:col-span-2">
                        <p className="text-sm text-stone-600">Productos:</p>
                        <ul className="list-disc list-inside">
                          {delivery.productos.map((producto, index) => (
                            <li key={index} className="text-sm">{producto}</li>
                          ))}
                        </ul>
                      </div>
                      
                      {delivery.observaciones && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-stone-600">Observaciones:</p>
                          <p className="text-sm bg-blue-50 p-2 rounded border-l-4 border-blue-400">
                            <MapPin className="h-4 w-4 inline mr-2 text-blue-600" />
                            {delivery.observaciones}
                          </p>
                        </div>
                      )}
                      
                      <div>
                        <p className="text-sm text-stone-600">Total:</p>
                        <p className="font-bold text-lg text-green-600">S/ {delivery.total.toFixed(2)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-stone-600">Hora Asignación:</p>
                        <p className="font-medium">{delivery.horaAsignacion}</p>
                        {delivery.horaEntrega && (
                          <>
                            <p className="text-sm text-stone-600 mt-1">Hora Entrega:</p>
                            <p className="font-medium text-green-600">{delivery.horaEntrega}</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    <Button 
                      size="sm" 
                      onClick={() => handleNavigate(delivery.direccion)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Ir Ahí
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleWhatsApp(delivery.telefono, delivery.cliente)}
                      className="border-green-300 text-green-700 hover:bg-green-50"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    
                    {delivery.estado !== 'entregado' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkDelivered(delivery.id)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Entregado
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

export default DeliveryPanel;

/*
INSTRUCCIONES PARA PERSONALIZAR:

1. CONECTAR CON FIREBASE:
   - Reemplazar mockDeliveries con consultas a Firebase
   - Implementar geolocalización en tiempo real
   - Sincronizar estados de entrega

2. FUNCIONALIDADES A IMPLEMENTAR:
   - GPS tracking del repartidor
   - Confirmación con firma digital del cliente
   - Foto como prueba de entrega
   - Notificaciones automáticas al cliente
   - Optimización de rutas de entrega

3. PERSONALIZACIÓN:
   - Configurar zonas de entrega específicas
   - Integrar con Google Maps API
   - Personalizar mensajes de WhatsApp
   - Agregar sistema de calificación

4. DATOS MOCK:
   - Actualizar con zonas reales de Lima
   - Conectar con sistema de pedidos real
   - Implementar historial de entregas

ESTE PANEL ESTÁ DISEÑADO PARA:
- Repartidores y personal de delivery
- Gestión eficiente de entregas
- Comunicación directa con clientes
- Trazabilidad completa de entregas
*/
