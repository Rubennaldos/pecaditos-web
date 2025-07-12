
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAdmin } from '@/contexts/AdminContext';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, 
  FileText, 
  AlertCircle, 
  CheckCircle, 
  DollarSign,
  Search,
  Filter,
  Download,
  Ban,
  Phone,
  LogOut,
  User,
  TrendingUp,
  Clock
} from 'lucide-react';

/**
 * PANEL DE COBRANZAS - GESTIÓN DE FACTURAS Y DEUDAS
 * 
 * Funcionalidades específicas para el perfil de cobranzas:
 * - Gestionar facturas pendientes y pagadas
 * - Control de deudas y morosos
 * - Bloquear/desbloquear clientes por deuda
 * - Agregar y marcar facturas como pagadas
 * - Historial completo de cobros
 * - Exportar reportes de cobranzas
 * - Alertas de vencimientos próximos
 * 
 * ACCESO: Solo usuarios con perfil "cobranzas" y admin (impersonación)
 * RUTA: /cobranzas
 */

const BillingPanel = () => {
  const { user, logout } = useAdmin();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('todas');

  // Mock data - En producción conectar con Firebase
  const mockInvoices = [
    {
      id: 'FAC001',
      numero: '001-0001234',
      cliente: 'Distribuidora Lima Norte',
      ruc: '20123456789',
      contacto: 'María González',
      telefono: '+51999888777',
      fechaEmision: '2024-01-05',
      fechaVencimiento: '2024-01-20',
      monto: 1250.80,
      montoPagado: 0,
      estado: 'pendiente',
      diasVencido: 0,
      observaciones: '',
      pedidos: ['PED001', 'PED002', 'PED003']
    },
    {
      id: 'FAC002', 
      numero: '001-0001235',
      cliente: 'Minimarket San Pedro',
      ruc: '20987654321',
      contacto: 'Carlos Ruiz',
      telefono: '+51888777666',
      fechaEmision: '2023-12-20',
      fechaVencimiento: '2024-01-05',
      monto: 890.50,
      montoPagado: 0,
      estado: 'vencida',
      diasVencido: 7,
      observaciones: 'Cliente reporta problemas de flujo de caja',
      pedidos: ['PED010', 'PED011']
    },
    {
      id: 'FAC003',
      numero: '001-0001236',
      cliente: 'Bodega Los Amigos',
      ruc: '20456789123',
      contacto: 'Ana Torres',
      telefono: '+51777666555',
      fechaEmision: '2024-01-01',
      fechaVencimiento: '2024-01-15',
      monto: 456.30,
      montoPagado: 456.30,
      estado: 'pagada',
      diasVencido: 0,
      observaciones: 'Pagado el 2024-01-10',
      pedidos: ['PED020']
    },
    {
      id: 'FAC004',
      numero: '001-0001237',
      cliente: 'Distribuidora Sur',
      ruc: '20789123456',
      contacto: 'Roberto Silva',
      telefono: '+51666555444',
      fechaEmision: '2023-12-10',
      fechaVencimiento: '2023-12-25',
      monto: 2150.75,
      montoPagado: 0,
      estado: 'morosa',
      diasVencido: 18,
      observaciones: 'No responde llamadas. Considerar bloqueo.',
      pedidos: ['PED030', 'PED031', 'PED032']
    }
  ];

  const statusFilters = ['todas', 'pendiente', 'vencida', 'morosa', 'pagada'];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const handleMarkAsPaid = (invoiceId: string, amount: number) => {
    console.log(`💰 Marcando factura ${invoiceId} como pagada: S/ ${amount}`);
    // Aquí iría la lógica de actualización en Firebase
  };

  const handleBlockClient = (clientRuc: string, clientName: string) => {
    console.log(`🚫 Bloqueando cliente: ${clientName} (${clientRuc})`);
    // Aquí iría la lógica de bloqueo
  };

  const handleCallClient = (phone: string, clientName: string) => {
    const message = encodeURIComponent(`Hola ${clientName}, soy del área de cobranzas de Pecaditos Integrales. Te contacto para coordinar el pago de tu factura pendiente.`);
    const whatsappUrl = `https://wa.me/${phone.replace('+', '')}?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleExportReport = () => {
    console.log('📊 Exportando reporte de cobranzas');
    // Aquí iría la lógica de exportación
  };

  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'vencida': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'morosa': return 'bg-red-100 text-red-800 border-red-200';
      case 'pagada': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityBorder = (estado: string, diasVencido: number) => {
    if (estado === 'morosa' || diasVencido > 15) return 'border-l-4 border-red-500';
    if (estado === 'vencida' || diasVencido > 0) return 'border-l-4 border-orange-500';
    return '';
  };

  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesSearch = invoice.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         invoice.numero.includes(searchQuery) ||
                         invoice.ruc.includes(searchQuery) ||
                         invoice.contacto.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'todas' || invoice.estado === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const totalInvoices = mockInvoices.length;
  const pendingAmount = mockInvoices.filter(i => i.estado !== 'pagada').reduce((sum, i) => sum + i.monto, 0);
  const overdueInvoices = mockInvoices.filter(i => i.estado === 'vencida' || i.estado === 'morosa').length;
  const paidAmount = mockInvoices.filter(i => i.estado === 'pagada').reduce((sum, i) => sum + i.monto, 0);

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header del Panel */}
      <header className="bg-white border-b border-stone-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">Panel de Cobranzas</h1>
              <p className="text-sm text-stone-600">Gestión de facturas y cobros</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-amber-100 rounded-full">
              <User className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">
                {user?.name || 'Usuario Cobranzas'}
              </span>
            </div>
            <Button variant="outline" onClick={handleExportReport}>
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            <Button variant="ghost" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="p-6">
        {/* Alertas importantes */}
        {overdueInvoices > 0 && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <div>
                <h3 className="font-bold text-red-800">¡ATENCIÓN! Facturas Vencidas</h3>
                <p className="text-red-700 text-sm">
                  {overdueInvoices} factura{overdueInvoices > 1 ? 's están' : ' está'} vencida{overdueInvoices > 1 ? 's' : ''} y requiere{overdueInvoices > 1 ? 'n' : ''} seguimiento inmediato.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Total Facturas</p>
                  <p className="text-2xl font-bold text-stone-600">{totalInvoices}</p>
                </div>
                <FileText className="h-8 w-8 text-stone-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Por Cobrar</p>
                  <p className="text-2xl font-bold text-red-600">S/ {pendingAmount.toFixed(2)}</p>
                </div>
                <Clock className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Vencidas</p>
                  <p className="text-2xl font-bold text-orange-600">{overdueInvoices}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600">Cobrado</p>
                  <p className="text-2xl font-bold text-green-600">S/ {paidAmount.toFixed(2)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filtros y búsqueda */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtros de Facturas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <div className="flex-1 min-w-64">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Buscar por cliente, número, RUC..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                {statusFilters.map(status => (
                  <Button 
                    key={status}
                    variant={selectedStatus === status ? 'default' : 'outline'}
                    onClick={() => setSelectedStatus(status)}
                    size="sm"
                    className="capitalize"
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de facturas */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className={`${getPriorityBorder(invoice.estado, invoice.diasVencido)}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-bold text-lg">{invoice.numero}</h3>
                      <Badge className={getStatusColor(invoice.estado)}>
                        {invoice.estado.toUpperCase()}
                      </Badge>
                      {invoice.diasVencido > 0 && (
                        <Badge variant="destructive">
                          {invoice.diasVencido} días vencida
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-stone-600">Cliente:</p>
                        <p className="font-bold">{invoice.cliente}</p>
                        <p className="text-sm text-stone-500">RUC: {invoice.ruc}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-stone-600">Contacto:</p>
                        <p className="font-medium">{invoice.contacto}</p>
                        <p className="text-sm text-stone-500">{invoice.telefono}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-stone-600">Fechas:</p>
                        <p className="text-sm">Emisión: {invoice.fechaEmision}</p>
                        <p className="text-sm">Vencimiento: {invoice.fechaVencimiento}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-stone-600">Monto:</p>
                        <p className="font-bold text-2xl text-green-600">S/ {invoice.monto.toFixed(2)}</p>
                        {invoice.montoPagado > 0 && (
                          <p className="text-sm text-green-600">Pagado: S/ {invoice.montoPagado.toFixed(2)}</p>
                        )}
                      </div>
                      
                      <div>
                        <p className="text-sm text-stone-600">Pedidos:</p>
                        <p className="text-sm">{invoice.pedidos.join(', ')}</p>
                      </div>
                      
                      {invoice.observaciones && (
                        <div className="md:col-span-3">
                          <p className="text-sm text-stone-600">Observaciones:</p>
                          <p className="text-sm bg-amber-50 p-2 rounded border-l-4 border-amber-400">
                            {invoice.observaciones}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {invoice.estado !== 'pagada' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkAsPaid(invoice.id, invoice.monto)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Marcar Pagado
                      </Button>
                    )}
                    
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleCallClient(invoice.telefono, invoice.contacto)}
                      className="border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Contactar
                    </Button>
                    
                    {(invoice.estado === 'morosa' || invoice.diasVencido > 15) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleBlockClient(invoice.ruc, invoice.cliente)}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        Bloquear
                      </Button>
                    )}

                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
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

export default BillingPanel;

/*
INSTRUCCIONES PARA PERSONALIZAR:

1. CONECTAR CON FIREBASE:
   - Reemplazar mockInvoices con datos de Firebase
   - Implementar sistema de pagos en tiempo real
   - Sincronizar con sistema contable

2. FUNCIONALIDADES A IMPLEMENTAR:
   - Generación automática de facturas PDF
   - Envío de recordatorios automáticos por email/WhatsApp
   - Integración con pasarelas de pago
   - Reportes de cobranza detallados
   - Dashboard de métricas financieras

3. PERSONALIZACIÓN:
   - Configurar términos de pago por cliente
   - Personalizar mensajes de cobranza
   - Integrar con sistema de facturación electrónica
   - Agregar descuentos por pronto pago

4. DATOS MOCK:
   - Actualizar con clientes reales
   - Conectar con sistema de pedidos
   - Implementar historial de pagos

ESTE PANEL ESTÁ DISEÑADO PARA:
- Personal de cobranzas y administración
- Control eficiente de facturas
- Seguimiento de pagos y morosos
- Optimización del flujo de caja
*/
