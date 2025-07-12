
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Phone, 
  Calendar, 
  Bell, 
  MessageCircle, 
  Search,
  Filter,
  Eye,
  Edit3,
  LogOut,
  User,
  TrendingUp,
  Clock
} from 'lucide-react';

/**
 * PANEL DE SEGUIMIENTO DE CLIENTES
 * 
 * Funcionalidades específicas para el perfil de seguimiento:
 * - Historial completo de compras por cliente
 * - Dashboard de clientes para llamar y contactar
 * - Alertas de clientes inactivos o importantes
 * - Hacer pedidos sin mínimos para clientes VIP
 * - Programar entregas y recordatorios
 * - Observaciones y notas por cliente
 * - Reportes de seguimiento y actividad
 * 
 * ACCESO: Solo usuarios con perfil "seguimiento" y admin (impersonación)
 * RUTA: /seguimiento-panel
 */

const TrackingPanel = () => {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('todos');
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [newNote, setNewNote] = useState('');

  // Mock data - En producción conectar con Firebase
  const mockClients = [
    {
      id: 'CLI001',
      nombre: 'María González',
      telefono: '+51999888777',
      email: 'maria@email.com',
      ultimaCompra: '2024-01-10',
      totalCompras: 15,
      montoTotal: 890.50,
      frecuencia: 'semanal',
      estado: 'activo',
      prioridad: 'vip',
      proximaLlamada: '2024-01-15',
      observaciones: ['Cliente VIP', 'Prefiere entregas por la mañana'],
      historialCompras: [
        { fecha: '2024-01-10', pedido: 'PED001', monto: 85.50 },
        { fecha: '2024-01-03', pedido: 'PED005', monto: 67.80 },
        { fecha: '2023-12-28', pedido: 'PED010', monto: 45.00 }
      ]
    },
    {
      id: 'CLI002', 
      nombre: 'Carlos Ruiz',
      telefono: '+51888777666',
      email: 'carlos@email.com',
      ultimaCompra: '2023-12-20',
      totalCompras: 8,
      montoTotal: 456.30,
      frecuencia: 'quincenal',
      estado: 'inactivo',
      prioridad: 'normal',
      proximaLlamada: '2024-01-12',
      observaciones: ['Inactivo por 3 semanas', 'Ofrecerle descuento'],
      historialCompras: [
        { fecha: '2023-12-20', pedido: 'PED020', monto: 78.90 },
        { fecha: '2023-12-05', pedido: 'PED025', monto: 89.40 }
      ]
    },
    {
      id: 'CLI003',
      nombre: 'Ana Torres',
      telefono: '+51777666555',
      email: 'ana@email.com',
      ultimaCompra: '2024-01-11',
      totalCompras: 22,
      montoTotal: 1250.80,
      frecuencia: 'semanal',
      estado: 'activo',
      prioridad: 'vip',
      proximaLlamada: '2024-01-16',
      observaciones: ['Cliente fiel desde 2023', 'Siempre compra combos familiares'],
      historialCompras: [
        { fecha: '2024-01-11', pedido: 'PED002', monto: 125.60 },
        { fecha: '2024-01-04', pedido: 'PED006', monto: 98.20 }
      ]
    }
  ];

  const filters = ['todos', 'activos', 'inactivos', 'vip', 'llamar_hoy'];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleCallClient = (phone: string, name: string) => {
    const message = encodeURIComponent(`Hola ${name}, soy del equipo de Pecaditos Integrales. ¿Cómo has estado? Queríamos saber si te interesa alguno de nuestros productos.`);
    const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleAddNote = (clientId: string) => {
    if (!newNote.trim()) return;
    console.log(`📝 Agregando nota para cliente ${clientId}: ${newNote}`);
    setNewNote('');
    // Aquí iría la lógica de actualización en Firebase
  };

  const handleScheduleDelivery = (clientId: string) => {
    console.log(`📅 Programando entrega para cliente: ${clientId}`);
    // Aquí iría la lógica de programación
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-800';
      case 'inactivo': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (prioridad: string) => {
    return prioridad === 'vip' ? 'border-l-4 border-amber-400' : '';
  };

  const filteredClients = mockClients.filter(client => {
    const matchesSearch = client.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         client.telefono.includes(searchQuery) ||
                         client.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    switch (selectedFilter) {
      case 'activos':
        matchesFilter = client.estado === 'activo';
        break;
      case 'inactivos':
        matchesFilter = client.estado === 'inactivo';
        break;
      case 'vip':
        matchesFilter = client.prioridad === 'vip';
        break;
      case 'llamar_hoy':
        matchesFilter = client.proximaLlamada === '2024-01-12'; // Hoy (mock)
        break;
    }
    
    return matchesSearch && matchesFilter;
  });

  const totalClients = mockClients.length;
  const activeClients = mockClients.filter(c => c.estado === 'activo').length;
  const inactiveClients = mockClients.filter(c => c.estado === 'inactivo').length;
  const vipClients = mockClients.filter(c => c.prioridad === 'vip').length;

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header del Panel */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">Panel de Seguimiento</h1>
              <p className="text-sm text-stone-600">Gestión y seguimiento de clientes</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 rounded-full">
              <User className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                {user?.name || 'Usuario Seguimiento'}
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
                  <p className="text-sm text-stone-600">Total Clientes</p>
                  <p className="text-2xl font-bold text-stone-600">{totalClients}</p>
                </div>
                <Users className="h-8 w-8 text-stone-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Activos</p>
                  <p className="text-2xl font-bold text-green-600">{activeClients}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Inactivos</p>
                  <p className="text-2xl font-bold text-red-600">{inactiveClients}</p>
                </div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Clientes VIP</p>
                  <p className="text-2xl font-bold text-amber-600">{vipClients}</p>
                </div>
                <Users className="h-8 w-8 text-amber-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Clientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Buscar por nombre, teléfono o email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {filters.map(filter => (
                  <Button 
                    key={filter}
                    variant={selectedFilter === filter ? 'default' : 'outline'}
                    onClick={() => setSelectedFilter(filter)}
                    size="sm"
                    className="capitalize"
                  >
                    {filter.replace('_', ' ')}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Lista de clientes */}
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-stone-800">Lista de Clientes</h2>
            {filteredClients.map((client) => (
              <Card key={client.id} className={`cursor-pointer hover:shadow-md transition-shadow ${getPriorityColor(client.prioridad)}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1" onClick={() => setSelectedClient(client)}>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold">{client.nombre}</h3>
                        <Badge className={getStatusColor(client.estado)}>
                          {client.estado.toUpperCase()}
                        </Badge>
                        {client.prioridad === 'vip' && (
                          <Badge className="bg-amber-100 text-amber-800">VIP</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <p className="text-stone-600">Teléfono:</p>
                          <p className="font-medium">{client.telefono}</p>
                        </div>
                        
                        <div>
                          <p className="text-stone-600">Última Compra:</p>
                          <p className="font-medium">{client.ultimaCompra}</p>
                        </div>
                        
                        <div>
                          <p className="text-stone-600">Total Compras:</p>
                          <p className="font-medium">{client.totalCompras}</p>
                        </div>
                        
                        <div>
                          <p className="text-stone-600">Monto Total:</p>
                          <p className="font-medium text-green-600">S/ {client.montoTotal.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button 
                        size="sm" 
                        onClick={() => handleCallClient(client.telefono, client.nombre)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Llamar
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedClient(client)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detalle del cliente seleccionado */}
          <div>
            {selectedClient ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Detalle de {selectedClient.nombre}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-stone-600">Email:</p>
                      <p className="font-medium">{selectedClient.email}</p>
                    </div>
                    
                    <div>
                      <p className="text-stone-600">Frecuencia:</p>
                      <p className="font-medium capitalize">{selectedClient.frecuencia}</p>
                    </div>
                    
                    <div>
                      <p className="text-stone-600">Próxima Llamada:</p>
                      <p className="font-medium">{selectedClient.proximaLlamada}</p>
                    </div>
                    
                    <div>
                      <p className="text-stone-600">Estado:</p>
                      <Badge className={getStatusColor(selectedClient.estado)}>
                        {selectedClient.estado.toUpperCase()}
                      </Badge>
                    </div>
                  </div>

                  {/* Observaciones */}
                  <div>
                    <p className="text-stone-600 font-medium mb-2">Observaciones:</p>
                    <div className="space-y-1">
                      {selectedClient.observaciones.map((obs: string, index: number) => (
                        <p key={index} className="text-sm bg-amber-50 p-2 rounded">{obs}</p>
                      ))}
                    </div>
                  </div>

                  {/* Agregar nueva nota */}
                  <div>
                    <p className="text-stone-600 font-medium mb-2">Agregar Nota:</p>
                    <div className="flex gap-2">
                      <Textarea
                        placeholder="Escribe una observación..."
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                        className="flex-1"
                        rows={2}
                      />
                      <Button 
                        onClick={() => handleAddNote(selectedClient.id)}
                        disabled={!newNote.trim()}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Historial de compras */}
                  <div>
                    <p className="text-stone-600 font-medium mb-2">Historial de Compras:</p>
                    <div className="space-y-2">
                      {selectedClient.historialCompras.map((compra: any, index: number) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-stone-50 rounded">
                          <div>
                            <p className="font-medium">{compra.pedido}</p>
                            <p className="text-sm text-stone-600">{compra.fecha}</p>
                          </div>
                          <p className="font-bold text-green-600">S/ {compra.monto}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={() => handleCallClient(selectedClient.telefono, selectedClient.nombre)}
                      className="flex-1"
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                    
                    <Button 
                      variant="outline"
                      onClick={() => handleScheduleDelivery(selectedClient.id)}
                      className="flex-1"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Programar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-8 text-center">
                  <Users className="h-12 w-12 text-stone-300 mx-auto mb-4" />
                  <p className="text-stone-500">Selecciona un cliente para ver sus detalles</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackingPanel;

/*
INSTRUCCIONES PARA PERSONALIZAR:

1. CONECTAR CON FIREBASE:
   - Reemplazar mockClients con datos de Firebase
   - Implementar sistema de notas y observaciones
   - Sincronizar con historial de pedidos real

2. FUNCIONALIDADES A IMPLEMENTAR:
   - Recordatorios automáticos de llamadas
   - Programación de entregas recurrentes
   - Análisis de comportamiento de compra
   - Segmentación automática de clientes
   - Campañas de reactivación

3. PERSONALIZACIÓN:
   - Configurar frecuencias de contacto
   - Personalizar mensajes de WhatsApp
   - Agregar campos personalizados por cliente
   - Integrar con CRM externo

4. DATOS MOCK:
   - Actualizar con clientes reales
   - Conectar con sistema de pedidos
   - Implementar métricas de fidelización

ESTE PANEL ESTÁ DISEÑADO PARA:
- Personal de atención al cliente
- Seguimiento personalizado de clientes
- Fidelización y reactivación
- Análisis de comportamiento de compra
*/
