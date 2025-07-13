
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { 
  CreditCard, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  DollarSign,
  FileDown,
  Calendar,
  User,
  Phone,
  Star,
  TrendingUp,
  TrendingDown,
  LogOut,
  X,
  Edit
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * PANEL DE COBRANZAS - GESTIÓN FINANCIERA Y CRÉDITOS
 * 
 * Funcionalidades principales:
 * - Vista de pedidos por estado de pago
 * - Gestión de clientes deudores
 * - Configuración de términos de pago
 * - Historial crediticio con puntuación
 * - Reportes exportables
 * - Compromisos de pago editables
 * 
 * *** MOCK DATA - INTEGRAR CON FIREBASE REALTIME DATABASE ***
 */

// *** MOCK DATA DE CLIENTES Y FACTURAS ***
const mockClients = [
  {
    id: "CLI-001",
    name: "Distribuidora El Sol SAC",
    ruc: "20123456789",
    phone: "+51 999 111 222",
    email: "pagos@elsol.com",
    paymentTerms: "credito_30",
    creditLimit: 2000.00,
    currentDebt: 380.00,
    creditScore: 4.5,
    status: "active",
    lastPayment: "2024-01-10T00:00:00"
  },
  {
    id: "CLI-002", 
    name: "Minimarket Los Andes",
    ruc: "10987654321",
    phone: "+51 999 333 444",
    email: "admin@losandes.com",
    paymentTerms: "credito_15",
    creditLimit: 1000.00,
    currentDebt: 750.00,
    creditScore: 2.5,
    status: "overdue",
    lastPayment: "2023-12-15T00:00:00"
  },
  {
    id: "CLI-003",
    name: "Bodega Don Carlos",
    ruc: "20555666777",
    phone: "+51 999 555 666",
    email: "carlos@bodega.com",
    paymentTerms: "contado",
    creditLimit: 500.00,
    currentDebt: 0.00,
    creditScore: 5.0,
    status: "active",
    lastPayment: "2024-01-14T00:00:00"
  }
];

const mockInvoices = [
  {
    id: "FAC-2024-001",
    clientId: "CLI-001",
    clientName: "Distribuidora El Sol SAC",
    orderId: "PEC-2024-001",
    amount: 225.00,
    issueDate: "2024-01-15T00:00:00",
    dueDate: "2024-02-14T00:00:00",
    status: "pending",
    daysOverdue: 0,
    paymentMethod: "credito_30",
    notes: ""
  },
  {
    id: "FAC-2024-002",
    clientId: "CLI-002",
    clientName: "Minimarket Los Andes",
    orderId: "PEC-2024-002",
    amount: 345.00,
    issueDate: "2024-01-01T00:00:00",
    dueDate: "2024-01-16T00:00:00",
    status: "overdue",
    daysOverdue: 15,
    paymentMethod: "credito_15",
    notes: "Cliente solicitó extensión hasta el 25/01"
  },
  {
    id: "FAC-2024-003",
    clientId: "CLI-003",
    clientName: "Bodega Don Carlos",
    orderId: "PEC-2024-003",
    amount: 480.00,
    issueDate: "2024-01-14T00:00:00",
    dueDate: "2024-01-14T00:00:00",
    status: "paid",
    daysOverdue: 0,
    paymentMethod: "contado",
    paidDate: "2024-01-14T00:00:00",
    notes: "Pagado al contado - sin problemas"
  }
];

const BillingPanel = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterDays, setFilterDays] = useState('todos');
  const [showEditPayment, setShowEditPayment] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showRejectOrder, setShowRejectOrder] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // *** FILTRAR FACTURAS ***
  const filteredInvoices = mockInvoices.filter(invoice => {
    const matchesStatus = filterStatus === 'todos' || invoice.status === filterStatus;
    const matchesDays = filterDays === 'todos' || 
      (filterDays === '30' && invoice.daysOverdue <= 30) ||
      (filterDays === '60' && invoice.daysOverdue <= 60) ||
      (filterDays === '90' && invoice.daysOverdue > 60);
    return matchesStatus && matchesDays;
  });

  // *** ESTADÍSTICAS ***
  const stats = {
    totalPending: mockInvoices.filter(inv => inv.status === 'pending').length,
    totalOverdue: mockInvoices.filter(inv => inv.status === 'overdue').length,
    totalPaid: mockInvoices.filter(inv => inv.status === 'paid').length,
    totalAmount: mockInvoices.reduce((sum, inv) => sum + (inv.status !== 'paid' ? inv.amount : 0), 0),
    overdueAmount: mockInvoices.filter(inv => inv.status === 'overdue').reduce((sum, inv) => sum + inv.amount, 0)
  };

  // *** FUNCIÓN PARA RECHAZAR PEDIDO ***
  const handleRejectOrder = () => {
    if (!rejectReason.trim()) {
      alert('Debe ingresar el motivo del rechazo');
      return;
    }
    
    console.log(`Rechazando factura ${selectedInvoice?.id} por: ${rejectReason}`);
    // TODO: Integrar con Firebase
    
    setShowRejectOrder(false);
    setSelectedInvoice(null);
    setRejectReason('');
  };

  // *** FUNCIÓN PARA EDITAR TÉRMINOS DE PAGO ***
  const handleEditPaymentTerms = (clientId: string, newTerms: string) => {
    console.log(`Actualizando términos de pago para cliente ${clientId}: ${newTerms}`);
    // TODO: Integrar con Firebase
  };

  // *** FUNCIÓN PARA MARCAR COMO PAGADO ***
  const markAsPaid = (invoiceId: string) => {
    console.log(`Marcando factura ${invoiceId} como pagada`);
    // TODO: Integrar con Firebase
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
  const getStatusInfo = (status: string, daysOverdue?: number) => {
    switch (status) {
      case 'pending':
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Pendiente' };
      case 'overdue':
        const severity = daysOverdue > 30 ? 'severe' : 'normal';
        return { 
          color: severity === 'severe' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800', 
          text: `Vencida (${daysOverdue} días)` 
        };
      case 'paid':
        return { color: 'bg-green-100 text-green-800', text: 'Pagada' };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status };
    }
  };

  // *** OBTENER ESTRELLAS DE CRÉDITO ***
  const renderCreditStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < score ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-stone-800">Panel de Cobranzas</h1>
                <p className="text-stone-600">Gestión financiera y créditos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                className="bg-green-600 hover:bg-green-700 text-white"
                onClick={() => console.log('Exportar reporte')}
              >
                <FileDown className="h-4 w-4 mr-2" />
                Exportar Excel
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
            <TabsTrigger value="pedidos">Pedidos ({stats.totalPending})</TabsTrigger>
            <TabsTrigger value="por_cobrar">Por Cobrar ({stats.totalOverdue})</TabsTrigger>
            <TabsTrigger value="cobrado">Cobrado ({stats.totalPaid})</TabsTrigger>
            <TabsTrigger value="clientes">Clientes</TabsTrigger>
          </TabsList>

          {/* Dashboard */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Estadísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pendientes</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">{stats.totalPending}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats.totalOverdue}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Por Cobrar</CardTitle>
                  <DollarSign className="h-4 w-4 text-orange-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">S/ {stats.totalAmount.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vencido</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">S/ {stats.overdueAmount.toFixed(2)}</div>
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
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="md:w-48">
                      <SelectValue placeholder="Estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los estados</SelectItem>
                      <SelectItem value="pending">Pendientes</SelectItem>
                      <SelectItem value="overdue">Vencidas</SelectItem>
                      <SelectItem value="paid">Pagadas</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filterDays} onValueChange={setFilterDays}>
                    <SelectTrigger className="md:w-48">
                      <SelectValue placeholder="Días vencidos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="30">Hasta 30 días</SelectItem>
                      <SelectItem value="60">Hasta 60 días</SelectItem>
                      <SelectItem value="90">Más de 60 días</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Lista de Facturas */}
            <div className="space-y-4">
              {filteredInvoices.map((invoice) => {
                const statusInfo = getStatusInfo(invoice.status, invoice.daysOverdue);
                return (
                  <Card key={invoice.id} className="hover:shadow-lg transition-all">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {invoice.id}
                            <Badge className={statusInfo.color}>
                              {statusInfo.text}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{invoice.clientName}</CardDescription>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">S/ {invoice.amount.toFixed(2)}</div>
                          <div className="text-sm text-stone-500">
                            Vence: {new Date(invoice.dueDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex justify-between items-center">
                        <div className="space-y-1">
                          <div className="text-sm">
                            <span className="font-medium">Pedido:</span> {invoice.orderId}
                          </div>
                          <div className="text-sm">
                            <span className="font-medium">Método:</span> {invoice.paymentMethod}
                          </div>
                          {invoice.notes && (
                            <div className="text-sm text-amber-700 bg-amber-50 p-2 rounded mt-2">
                              <strong>Observaciones:</strong> {invoice.notes}
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          {invoice.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => markAsPaid(invoice.id)}
                                className="bg-green-600 hover:bg-green-700 text-white"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Marcar Pagada
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedInvoice(invoice);
                                  setShowRejectOrder(true);
                                }}
                                className="text-red-600 border-red-300 hover:bg-red-50"
                              >
                                <X className="h-4 w-4 mr-2" />
                                Rechazar
                              </Button>
                            </>
                          )}
                          {invoice.status === 'overdue' && (
                            <Button
                              size="sm"
                              onClick={() => markAsPaid(invoice.id)}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar Pagada
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Otras pestañas */}
          <TabsContent value="pedidos">
            <div className="text-center py-12">
              <Clock className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-800 mb-2">
                Vista de Pedidos Pendientes de Pago
              </h3>
              <p className="text-stone-600">
                Aquí se mostrarán solo los pedidos pendientes de cobro
              </p>
            </div>
          </TabsContent>

          <TabsContent value="por_cobrar">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-800 mb-2">
                Vista de Facturas Vencidas
              </h3>
              <p className="text-stone-600">
                Gestión de clientes morosos y compromisos de pago
              </p>
            </div>
          </TabsContent>

          <TabsContent value="cobrado">
            <div className="text-center py-12">
              <CheckCircle className="h-12 w-12 text-stone-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-stone-800 mb-2">
                Historial de Pagos
              </h3>
              <p className="text-stone-600">
                Todas las facturas pagadas y movimientos
              </p>
            </div>
          </TabsContent>

          <TabsContent value="clientes" className="space-y-6">
            {/* Gestión de Clientes */}
            <div className="space-y-4">
              {mockClients.map((client) => (
                <Card key={client.id} className="hover:shadow-lg transition-all">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {client.name}
                          <Badge className={client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                            {client.status === 'active' ? 'Activo' : 'Moroso'}
                          </Badge>
                        </CardTitle>
                        <CardDescription>RUC: {client.ruc}</CardDescription>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 mb-1">
                          {renderCreditStars(client.creditScore)}
                          <span className="text-sm text-stone-600 ml-2">
                            ({client.creditScore}/5.0)
                          </span>
                        </div>
                        <div className="text-sm text-stone-500">
                          Última pago: {new Date(client.lastPayment).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-stone-400" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-4 w-4 text-stone-400" />
                          <span>{client.email}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm">
                          <span className="font-medium">Límite de crédito:</span> S/ {client.creditLimit.toFixed(2)}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Deuda actual:</span> 
                          <span className={client.currentDebt > 0 ? 'text-red-600 font-bold ml-1' : 'text-green-600 ml-1'}>
                            S/ {client.currentDebt.toFixed(2)}
                          </span>
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Términos:</span> {client.paymentTerms}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedClient(client);
                            setShowEditPayment(true);
                          }}
                          className="text-blue-600 border-blue-300 hover:bg-blue-50"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Editar Términos
                        </Button>
                        {client.status === 'overdue' && (
                          <Button
                            size="sm"
                            className="bg-orange-600 hover:bg-orange-700 text-white"
                          >
                            <Calendar className="h-4 w-4 mr-2" />
                            Compromiso de Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modal para Rechazar Pedido */}
      {showRejectOrder && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-800">Rechazar Pedido</CardTitle>
              <CardDescription>
                Factura: {selectedInvoice.id} - {selectedInvoice.clientName}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo del rechazo *</label>
                <Textarea
                  placeholder="Explica el motivo del rechazo (será visible para todos los perfiles)"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="min-h-20"
                />
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">
                  <AlertCircle className="h-4 w-4 inline mr-2" />
                  <strong>Atención:</strong> Este rechazo será visible para todos los perfiles 
                  y el pedido no podrá ser procesado hasta resolver el problema.
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleRejectOrder}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  Rechazar Pedido
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowRejectOrder(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Modal para Editar Términos de Pago */}
      {showEditPayment && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Editar Términos de Pago</CardTitle>
              <CardDescription>
                Cliente: {selectedClient.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Términos de Pago</label>
                <Select 
                  defaultValue={selectedClient.paymentTerms}
                  onValueChange={(value) => handleEditPaymentTerms(selectedClient.id, value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contado">Contado</SelectItem>
                    <SelectItem value="credito_15">Crédito 15 días</SelectItem>
                    <SelectItem value="credito_30">Crédito 30 días</SelectItem>
                    <SelectItem value="credito_45">Crédito 45 días</SelectItem>
                    <SelectItem value="credito_60">Crédito 60 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Límite de Crédito</label>
                <Input
                  type="number"
                  defaultValue={selectedClient.creditLimit}
                  placeholder="S/ 0.00"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Guardar Cambios
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditPayment(false)}
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

export default BillingPanel;

/*
INSTRUCCIONES PARA INTEGRACIÓN CON FIREBASE:

1. ESTRUCTURA DE DATOS:
   /clients/{clientId}: {
     name: string,
     ruc: string,
     phone: string,
     email: string,
     paymentTerms: 'contado' | 'credito_15' | 'credito_30' | 'credito_45' | 'credito_60',
     creditLimit: number,
     currentDebt: number,
     creditScore: number (1-5),
     status: 'active' | 'overdue' | 'blocked',
     lastPayment: timestamp,
     paymentHistory: [{ date: timestamp, amount: number, method: string }]
   }

   /invoices/{invoiceId}: {
     clientId: string,
     orderId: string,
     amount: number,
     issueDate: timestamp,
     dueDate: timestamp,
     status: 'pending' | 'overdue' | 'paid' | 'rejected',
     daysOverdue: number,
     paymentMethod: string,
     paidDate?: timestamp,
     rejectReason?: string,
     notes: string
   }

2. FUNCIONALIDADES A IMPLEMENTAR:
   - Cálculo automático de días vencidos
   - Alertas automáticas por email/SMS
   - Generación automática de reportes
   - Sistema de scoring crediticio automático
   - Integración con pasarelas de pago
   - Estados de cuenta automáticos

3. SISTEMA DE PUNTUACIÓN CREDITICIA:
   - 5 estrellas: Siempre paga a tiempo
   - 4 estrellas: Ocasionalmente se retrasa (1-5 días)
   - 3 estrellas: Se retrasa frecuentemente (5-15 días)
   - 2 estrellas: Moroso habitual (15-30 días)
   - 1 estrella: Moroso grave (>30 días)

4. ALERTAS AUTOMÁTICAS:
   - 5 días antes del vencimiento: Recordatorio
   - Día del vencimiento: Aviso
   - 1 día después: Primera alerta
   - 7 días después: Segunda alerta
   - 15 días después: Alerta grave
   - 30 días después: Bloqueo automático

5. REPORTES EXPORTABLES:
   - Estado de cuentas por cliente
   - Antigüedad de saldos
   - Flujo de caja proyectado
   - Análisis de riesgo crediticio
   - Comparativo mensual/anual
*/
