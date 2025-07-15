
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Calendar,
  Clock,
  DollarSign,
  CreditCard,
  FileText,
  Search,
  Bell
} from 'lucide-react';

export const BillingToBePaid = () => {
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    date: '',
    operationNumber: '',
    bank: '',
    account: '',
    responsible: ''
  });
  const [commitmentData, setCommitmentData] = useState({
    date: '',
    observation: ''
  });
  const [creditNoteData, setCreditNoteData] = useState({
    number: '',
    reason: '',
    date: '',
    amount: '',
    authCode: ''
  });

  // Enhanced mock invoices data
  const invoices = [
    {
      id: "FAC-2024-001",
      orderNumber: "PEC-2024-001",
      client: "Distribuidora El Sol SAC",
      comercialName: "El Sol Distribuciones",
      ruc: "20123456789",
      clientPhone: "+51 999 111 222",
      amount: 780.00,
      issueDate: "2024-01-01",
      dueDate: "2024-01-16",
      status: "overdue",
      daysOverdue: 15,
      paymentMethod: "credito_30",
      urgency: 3
    },
    {
      id: "FAC-2024-002",
      orderNumber: "PEC-2024-002",
      client: "Minimarket Los Andes",
      comercialName: "Los Andes Market",
      ruc: "20555666777",
      clientPhone: "+51 999 333 444",
      amount: 450.00,
      issueDate: "2024-01-10",
      dueDate: "2024-01-25",
      status: "overdue",
      daysOverdue: 7,
      paymentMethod: "credito_15",
      urgency: 2
    }
  ];

  const handlePaymentRegistration = () => {
    if (!paymentData.amount || !paymentData.date || !paymentData.responsible) {
      alert('Complete todos los campos obligatorios');
      return;
    }
    
    console.log('Registrando pago:', {
      invoiceId: selectedInvoice?.id,
      ...paymentData,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Generate receipt and send via WhatsApp
    
    setShowPaymentModal(false);
    setSelectedInvoice(null);
    setPaymentData({
      amount: '',
      date: '',
      operationNumber: '',
      bank: '',
      account: '',
      responsible: ''
    });
  };

  const handlePaymentCommitment = () => {
    if (!commitmentData.date || !commitmentData.observation) {
      alert('Complete todos los campos');
      return;
    }
    
    console.log('Registrando compromiso de pago:', {
      invoiceId: selectedInvoice?.id,
      ...commitmentData,
      timestamp: new Date().toISOString()
    });
    
    // TODO: Send commitment via WhatsApp and create automatic alert
    
    setShowCommitmentModal(false);
    setSelectedInvoice(null);
    setCommitmentData({ date: '', observation: '' });
  };

  const handleCreditNote = () => {
    if (!creditNoteData.number || !creditNoteData.reason || !creditNoteData.amount) {
      alert('Complete todos los campos obligatorios');
      return;
    }
    
    console.log('Generando nota de crédito:', {
      invoiceId: selectedInvoice?.id,
      ...creditNoteData,
      timestamp: new Date().toISOString()
    });
    
    setShowCreditNoteModal(false);
    setSelectedInvoice(null);
    setCreditNoteData({
      number: '',
      reason: '',
      date: '',
      amount: '',
      authCode: ''
    });
  };

  const sendWarning = (invoice: any) => {
    console.log(`Enviando advertencia a ${invoice.client}...`);
    // TODO: Send warning notification visible to client
  };

  // Intelligent filtering
  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'todos' || invoice.status === filterStatus;
    const matchesSearch = !searchTerm || 
      invoice.ruc.includes(searchTerm) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.comercialName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  // Auto-sort by urgency (overdue first, then by days overdue)
  const sortedInvoices = [...filteredInvoices].sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    if (a.status === 'overdue' && b.status === 'overdue') {
      return b.daysOverdue - a.daysOverdue;
    }
    return 0;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Cuentas por Cobrar</h2>
        <p className="text-stone-600">Gestión completa de facturas pendientes y vencidas</p>
      </div>

      {/* Enhanced Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Vencidas</p>
                <p className="text-2xl font-bold text-red-700">2</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Por Vencer (7 días)</p>
                <p className="text-2xl font-bold text-yellow-700">3</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Total Adeudado</p>
                <p className="text-2xl font-bold text-orange-700">S/ 1,230</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Compromisos Hoy</p>
                <p className="text-2xl font-bold text-blue-700">1</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="RUC, razón social, orden..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="pending">Pendientes</SelectItem>
                <SelectItem value="overdue">Vencidas</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" placeholder="Fecha desde" />
            <Input type="date" placeholder="Fecha hasta" />
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Invoices List */}
      <div className="space-y-4">
        {sortedInvoices.map((invoice) => {
          const isOverdue = invoice.status === 'overdue';
          
          return (
            <Card 
              key={invoice.id} 
              className={`hover:shadow-lg transition-all ${
                isOverdue ? 'animate-pulse border-red-300 bg-red-50' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {invoice.id}
                      <Badge className={isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {isOverdue ? `Vencida (${invoice.daysOverdue} días)` : 'Pendiente'}
                      </Badge>
                    </CardTitle>
                    <div className="mt-1 space-y-1">
                      <p className="text-stone-800 font-medium">{invoice.client}</p>
                      <p className="text-stone-600 text-sm">Comercial: {invoice.comercialName}</p>
                      <p className="text-stone-500 text-xs">RUC: {invoice.ruc} | Pedido: {invoice.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">S/ {invoice.amount.toFixed(2)}</div>
                    <div className="text-sm text-stone-500">
                      Vence: {new Date(invoice.dueDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs text-stone-400">
                      {invoice.paymentMethod}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm">
                      <span className="font-medium">Emitida:</span> {new Date(invoice.issueDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Contacto:</span> {invoice.clientPhone}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Llamar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowPaymentModal(true);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Cobrar
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowCommitmentModal(true);
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Compromiso
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowCreditNoteModal(true);
                      }}
                      variant="outline"
                      className="text-purple-600 border-purple-300 hover:bg-purple-50"
                    >
                      <CreditCard className="h-4 w-4 mr-1" />
                      N. Crédito
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => sendWarning(invoice)}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <Bell className="h-4 w-4 mr-1" />
                      Advertir
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-stone-600 border-stone-300 hover:bg-stone-50"
                    >
                      <Download className="h-4 w-4 mr-1" />
                      PDF
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Registration Modal */}
      {showPaymentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-green-800">Registrar Pago</CardTitle>
              <p className="text-stone-600">
                {selectedInvoice.id} - {selectedInvoice.client}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto Pagado *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={paymentData.amount}
                    onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Pago *</label>
                  <Input
                    type="date"
                    value={paymentData.date}
                    onChange={(e) => setPaymentData({...paymentData, date: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">N° Operación</label>
                  <Input
                    placeholder="Número de operación"
                    value={paymentData.operationNumber}
                    onChange={(e) => setPaymentData({...paymentData, operationNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Banco</label>
                  <Select 
                    value={paymentData.bank} 
                    onValueChange={(value) => setPaymentData({...paymentData, bank: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bcp">BCP</SelectItem>
                      <SelectItem value="bbva">BBVA</SelectItem>
                      <SelectItem value="scotiabank">Scotiabank</SelectItem>
                      <SelectItem value="interbank">Interbank</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cuenta Destino</label>
                <Input
                  placeholder="Número de cuenta"
                  value={paymentData.account}
                  onChange={(e) => setPaymentData({...paymentData, account: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Responsable *</label>
                <Input
                  placeholder="Nombre del responsable"
                  value={paymentData.responsible}
                  onChange={(e) => setPaymentData({...paymentData, responsible: e.target.value})}
                />
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handlePaymentRegistration}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Registrar Pago
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                >
                  Cancelar
                </Button>
              </div>
              
              <div className="border-t pt-4 space-y-2">
                <Button variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Recibo
                </Button>
                <Button variant="outline" className="w-full">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Enviar por WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Payment Commitment Modal */}
      {showCommitmentModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-orange-800">Compromiso de Pago</CardTitle>
              <p className="text-stone-600">
                {selectedInvoice.id} - {selectedInvoice.client}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha de Compromiso *</label>
                <Input
                  type="date"
                  value={commitmentData.date}
                  onChange={(e) => setCommitmentData({...commitmentData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Observaciones *</label>
                <Textarea
                  placeholder="Detalles del acuerdo..."
                  value={commitmentData.observation}
                  onChange={(e) => setCommitmentData({...commitmentData, observation: e.target.value})}
                  className="min-h-20"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handlePaymentCommitment}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Registrar Compromiso
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCommitmentModal(false)}
                >
                  Cancelar
                </Button>
              </div>
              <Button variant="outline" className="w-full">
                <MessageSquare className="h-4 w-4 mr-2" />
                Enviar por WhatsApp
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credit Note Modal */}
      {showCreditNoteModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-lg mx-4">
            <CardHeader>
              <CardTitle className="text-purple-800">Nota de Crédito</CardTitle>
              <p className="text-stone-600">
                Factura: {selectedInvoice.id} - {selectedInvoice.client}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">N° Nota de Crédito *</label>
                  <Input
                    placeholder="NC-2024-001"
                    value={creditNoteData.number}
                    onChange={(e) => setCreditNoteData({...creditNoteData, number: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha</label>
                  <Input
                    type="date"
                    value={creditNoteData.date}
                    onChange={(e) => setCreditNoteData({...creditNoteData, date: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo *</label>
                <Select 
                  value={creditNoteData.reason} 
                  onValueChange={(value) => setCreditNoteData({...creditNoteData, reason: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error_facturacion">Error en facturación</SelectItem>
                    <SelectItem value="devolucion">Devolución de mercadería</SelectItem>
                    <SelectItem value="descuento">Descuento aplicado</SelectItem>
                    <SelectItem value="ajuste_precio">Ajuste de precio</SelectItem>
                    <SelectItem value="otro">Otro motivo</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Monto *</label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={creditNoteData.amount}
                    onChange={(e) => setCreditNoteData({...creditNoteData, amount: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Código Autorización</label>
                  <Input
                    placeholder="AUTH-TOKEN-123"
                    value={creditNoteData.authCode}
                    onChange={(e) => setCreditNoteData({...creditNoteData, authCode: e.target.value})}
                  />
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <FileText className="h-4 w-4 inline mr-2" />
                  La nota de crédito se aplicará automáticamente al saldo del cliente.
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreditNote}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Generar Nota de Crédito
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCreditNoteModal(false)}
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
