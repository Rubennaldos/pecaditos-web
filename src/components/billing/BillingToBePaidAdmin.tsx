import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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
  Bell,
  Copy,
  X
} from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';
import { useToast } from '@/hooks/use-toast';

export const BillingToBePaidAdmin = () => {
  const { isAdminMode, sendWarningMessage } = useAdminBilling();
  const { toast } = useToast();
  
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('amount_desc');
  const [selectedClient, setSelectedClient] = useState<string | null>(null);
  
  // Modals state
  const [showConfirmWarning, setShowConfirmWarning] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [showCreditNoteModal, setShowCreditNoteModal] = useState(false);
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  // Form data
  const [collectData, setCollectData] = useState({
    amount: '',
    date: '',
    operationNumber: '',
    bank: '',
    responsible: ''
  });
  
  const [commitmentData, setCommitmentData] = useState({
    date: '',
    observation: '',
    sendWhatsApp: false
  });
  
  const [creditNoteData, setCreditNoteData] = useState({
    number: '',
    reason: '',
    date: '',
    amount: '',
    authCode: ''
  });

  // Enhanced mock invoices data grouped by client
  const clientsData = [
    {
      clientId: "20123456789",
      client: "Distribuidora El Sol SAC",
      comercialName: "El Sol Distribuciones",
      ruc: "20123456789",
      phone: "+51 999 111 222",
      totalDebt: 1230.00,
      overdueDays: 22,
      invoices: [
        {
          id: "FAC-2024-001",
          orderNumber: "PEC-2024-001",
          amount: 780.00,
          issueDate: "2024-01-01",
          dueDate: "2024-01-15",
          status: "overdue",
          daysOverdue: 15,
          paymentMethod: "credito_30"
        },
        {
          id: "FAC-2024-003",
          orderNumber: "PEC-2024-003",
          amount: 450.00,
          issueDate: "2024-01-10",
          dueDate: "2024-01-25",
          status: "overdue",
          daysOverdue: 7,
          paymentMethod: "credito_15"
        }
      ]
    },
    {
      clientId: "20555666777",
      client: "Minimarket Los Andes",
      comercialName: "Los Andes Market",
      ruc: "20555666777",
      phone: "+51 999 333 444",
      totalDebt: 450.00,
      overdueDays: 7,
      invoices: [
        {
          id: "FAC-2024-002",
          orderNumber: "PEC-2024-002",
          amount: 450.00,
          issueDate: "2024-01-10",
          dueDate: "2024-01-25",
          status: "overdue",
          daysOverdue: 7,
          paymentMethod: "credito_15"
        }
      ]
    }
  ];

  // Action handlers
  const handleCollect = (invoice: any) => {
    setSelectedInvoice(invoice);
    setCollectData({
      amount: invoice.amount.toString(),
      date: new Date().toISOString().split('T')[0],
      operationNumber: '',
      bank: '',
      responsible: ''
    });
    setShowCollectModal(true);
  };

  const handleCommitment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setCommitmentData({
      date: '',
      observation: '',
      sendWhatsApp: false
    });
    setShowCommitmentModal(true);
  };

  const handleCreditNote = (invoice: any) => {
    setSelectedInvoice(invoice);
    setCreditNoteData({
      number: '',
      reason: '',
      date: new Date().toISOString().split('T')[0],
      amount: invoice.amount.toString(),
      authCode: ''
    });
    setShowCreditNoteModal(true);
  };

  const handleWhatsApp = (invoice: any) => {
    const client = clientsData.find(c => c.invoices.some(inv => inv.id === invoice.id));
    if (client) {
      const message = `Hola ${client.comercialName}, le recordamos que tiene una factura pendiente (${invoice.id}) por S/ ${invoice.amount.toFixed(2)} con vencimiento el ${new Date(invoice.dueDate).toLocaleDateString()}. Por favor, regularice su pago a la brevedad. Gracias.`;
      const whatsappUrl = `https://wa.me/${client.phone.replace(/\s+/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const handleWarning = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowWarningDialog(true);
  };

  const handleDownloadPDF = (invoice: any) => {
    console.log(`Descargando PDF de factura ${invoice.id}`);
    toast({
      title: "Descarga iniciada",
      description: `Descargando PDF de ${invoice.id}`,
    });
  };

  const handleCall = (phone: string) => {
    console.log(`Iniciando llamada a ${phone}`);
    toast({
      title: "Llamada iniciada",
      description: `Marcando ${phone}`,
    });
  };

  // Confirmation handlers
  const confirmCollect = () => {
    if (!collectData.amount || !collectData.date || !collectData.responsible) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Registrando pago:', {
      invoiceId: selectedInvoice?.id,
      ...collectData,
      timestamp: new Date().toISOString()
    });
    
    toast({
      title: "Pago registrado",
      description: `Pago de S/ ${collectData.amount} registrado correctamente`,
    });
    
    setShowCollectModal(false);
    setSelectedInvoice(null);
    setCollectData({
      amount: '',
      date: '',
      operationNumber: '',
      bank: '',
      responsible: ''
    });
  };

  const confirmCommitment = () => {
    if (!commitmentData.date) {
      toast({
        title: "Error",
        description: "Seleccione la fecha de compromiso",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Registrando compromiso de pago:', {
      invoiceId: selectedInvoice?.id,
      ...commitmentData,
      timestamp: new Date().toISOString()
    });

    if (commitmentData.sendWhatsApp) {
      handleWhatsApp(selectedInvoice);
    }
    
    toast({
      title: "Compromiso registrado",
      description: `Compromiso de pago para el ${new Date(commitmentData.date).toLocaleDateString()}`,
    });
    
    setShowCommitmentModal(false);
    setSelectedInvoice(null);
    setCommitmentData({ date: '', observation: '', sendWhatsApp: false });
  };

  const confirmCreditNote = () => {
    if (!creditNoteData.number || !creditNoteData.reason || !creditNoteData.amount) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Generando nota de crédito:', {
      invoiceId: selectedInvoice?.id,
      ...creditNoteData,
      timestamp: new Date().toISOString()
    });
    
    toast({
      title: "Nota de crédito generada",
      description: `Nota de crédito ${creditNoteData.number} por S/ ${creditNoteData.amount}`,
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

  const confirmWarning = () => {
    const client = clientsData.find(c => c.invoices.some(inv => inv.id === selectedInvoice.id));
    if (client) {
      const message = `Estimado cliente ${client.client}, le recordamos que tiene una factura pendiente (${selectedInvoice.id}) por S/ ${selectedInvoice.amount.toFixed(2)} con vencimiento el ${new Date(selectedInvoice.dueDate).toLocaleDateString()}. Por favor, regularice su pago a la brevedad. Gracias.`;
      
      sendWarningMessage(client.clientId, message);
      
      console.log(`Enviando advertencia a cliente ${client.clientId}: ${message}`);
      
      toast({
        title: "Advertencia enviada",
        description: `Mensaje de advertencia enviado a ${client.comercialName}`,
      });
    }
    
    setShowWarningDialog(false);
    setSelectedInvoice(null);
  };

  // Filter and sort clients
  const filteredClients = clientsData.filter(client => {
    const matchesSearch = !searchTerm || 
      client.ruc.includes(searchTerm) ||
      client.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.comercialName.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const sortedClients = [...filteredClients].sort((a, b) => {
    switch (sortBy) {
      case 'amount_desc':
        return b.totalDebt - a.totalDebt;
      case 'amount_asc':
        return a.totalDebt - b.totalDebt;
      case 'overdue_desc':
        return b.overdueDays - a.overdueDays;
      case 'overdue_asc':
        return a.overdueDays - b.overdueDays;
      default:
        return 0;
    }
  });

  const getWarningMessage = (invoice: any) => {
    const client = clientsData.find(c => c.invoices.some(inv => inv.id === invoice.id));
    if (!client) return '';
    
    return `Estimado cliente ${client.client}, le recordamos que tiene una factura pendiente (${invoice.id}) por S/ ${invoice.amount.toFixed(2)} con vencimiento el ${new Date(invoice.dueDate).toLocaleDateString()}. Por favor, regularice su pago a la brevedad. Gracias.`;
  };

  const copyWarningMessage = () => {
    const message = getWarningMessage(selectedInvoice);
    navigator.clipboard.writeText(message);
    toast({
      title: "Mensaje copiado",
      description: "El mensaje de advertencia ha sido copiado al portapapeles",
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Cuentas por Cobrar - Vista por Cliente</h2>
        <p className="text-stone-600">Gestión completa de facturas pendientes agrupadas por cliente</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Clientes con deuda vencida</p>
                <p className="text-2xl font-bold text-red-700">{clientsData.filter(c => c.overdueDays > 0).length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500 animate-pulse" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Total Adeudado</p>
                <p className="text-2xl font-bold text-orange-700">S/ {clientsData.reduce((sum, client) => sum + client.totalDebt, 0).toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Facturas pendientes</p>
                <p className="text-2xl font-bold text-yellow-700">{clientsData.reduce((sum, client) => sum + client.invoices.length, 0)}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600">Mayor deudor</p>
                <p className="text-lg font-bold text-blue-700">S/ {Math.max(...clientsData.map(c => c.totalDebt)).toFixed(2)}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar cliente, RUC, razón social..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount_desc">Mayor deuda</SelectItem>
                <SelectItem value="amount_asc">Menor deuda</SelectItem>
                <SelectItem value="overdue_desc">Más días vencidos</SelectItem>
                <SelectItem value="overdue_asc">Menos días vencidos</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="space-y-4">
        {sortedClients.map((client) => (
          <Card 
            key={client.clientId} 
            className={`hover:shadow-lg transition-all ${
              client.overdueDays > 0 ? 'border-red-300 bg-red-50' : ''
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {client.client}
                    <Badge className={client.overdueDays > 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                      {client.overdueDays > 0 ? `${client.overdueDays} días vencido` : 'Al día'}
                    </Badge>
                  </CardTitle>
                  <div className="mt-1 space-y-1">
                    <p className="text-stone-600 text-sm">Comercial: {client.comercialName}</p>
                    <p className="text-stone-500 text-xs">RUC: {client.ruc}</p>
                    <p className="text-stone-500 text-xs">Teléfono: {client.phone}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-red-600">S/ {client.totalDebt.toFixed(2)}</div>
                  <div className="text-sm text-stone-500">
                    {client.invoices.length} facturas pendientes
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Lista de facturas del cliente */}
                {client.invoices.map((invoice) => (
                  <div key={invoice.id} className="border rounded-lg p-3 bg-white">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-medium text-stone-800">{invoice.id}</p>
                        <p className="text-sm text-stone-600">Orden: {invoice.orderNumber}</p>
                        <p className="text-xs text-stone-500">
                          Vence: {new Date(invoice.dueDate).toLocaleDateString()} 
                          ({invoice.daysOverdue} días vencida)
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-stone-800">S/ {invoice.amount.toFixed(2)}</p>
                        <Badge className="bg-red-100 text-red-800 text-xs">
                          {invoice.paymentMethod}
                        </Badge>
                      </div>
                    </div>
                    
                    {/* Botones de acción por factura */}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        onClick={() => handleCollect(invoice)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Cobrar
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCommitment(invoice)}
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        <Calendar className="h-4 w-4 mr-1" />
                        Compromiso
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCreditNote(invoice)}
                        variant="outline"
                        className="text-purple-600 border-purple-300 hover:bg-purple-50"
                      >
                        <CreditCard className="h-4 w-4 mr-1" />
                        N. Crédito
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleWarning(invoice)}
                        variant="outline"
                        className="text-red-600 border-red-300 hover:bg-red-50"
                      >
                        <Bell className="h-4 w-4 mr-1" />
                        Advertir
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleDownloadPDF(invoice)}
                        variant="outline"
                        className="text-stone-600 border-stone-300 hover:bg-stone-50"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        PDF
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleCall(client.phone)}
                        variant="outline"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50"
                      >
                        <Phone className="h-4 w-4 mr-1" />
                        Llamar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warning Confirmation Modal */}
      <Dialog open={showConfirmWarning} onOpenChange={setShowConfirmWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Advertencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>¿Está seguro que desea enviar una advertencia de pago al cliente?</p>
            <div className="flex gap-2">
              <Button onClick={confirmWarning} className="bg-red-600 hover:bg-red-700 text-white">
                Enviar Advertencia
              </Button>
              <Button variant="outline" onClick={() => setShowConfirmWarning(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Warning Message Dialog */}
      <Dialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Mensaje de Advertencia</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedInvoice && (
              <>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm font-medium mb-2">Mensaje que se enviará:</p>
                  <p className="text-sm text-gray-700">{getWarningMessage(selectedInvoice)}</p>
                </div>
                <div className="flex gap-2">
                  <Button onClick={copyWarningMessage} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copiar Mensaje
                  </Button>
                  <Button onClick={confirmWarning} className="bg-red-600 hover:bg-red-700 text-white flex-1">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar WhatsApp
                  </Button>
                </div>
                <Button variant="outline" onClick={() => setShowWarningDialog(false)} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Cancelar
                </Button>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Collect Payment Modal */}
      <Dialog open={showCollectModal} onOpenChange={setShowCollectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Monto *</label>
                <Input
                  type="number"
                  value={collectData.amount}
                  onChange={(e) => setCollectData({ ...collectData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Fecha *</label>
                <Input
                  type="date"
                  value={collectData.date}
                  onChange={(e) => setCollectData({ ...collectData, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Número de Operación</label>
              <Input
                type="text"
                value={collectData.operationNumber}
                onChange={(e) => setCollectData({ ...collectData, operationNumber: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Banco</label>
              <Input
                type="text"
                value={collectData.bank}
                onChange={(e) => setCollectData({ ...collectData, bank: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Responsable *</label>
              <Input
                type="text"
                value={collectData.responsible}
                onChange={(e) => setCollectData({ ...collectData, responsible: e.target.value })}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmCollect} className="bg-green-600 hover:bg-green-700 text-white">
                Registrar Pago
              </Button>
              <Button variant="outline" onClick={() => setShowCollectModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Commitment Modal */}
      <Dialog open={showCommitmentModal} onOpenChange={setShowCommitmentModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Compromiso de Pago</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-stone-700">Fecha de Compromiso *</label>
              <Input
                type="date"
                value={commitmentData.date}
                onChange={(e) => setCommitmentData({ ...commitmentData, date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Observaciones</label>
              <Textarea
                placeholder="Ingrese observaciones adicionales"
                value={commitmentData.observation}
                onChange={(e) => setCommitmentData({ ...commitmentData, observation: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="checkbox"
                id="sendWhatsApp"
                checked={commitmentData.sendWhatsApp}
                onChange={(e) => setCommitmentData({ ...commitmentData, sendWhatsApp: e.target.checked })}
              />
              <label htmlFor="sendWhatsApp" className="text-sm font-medium text-stone-700">
                Enviar recordatorio por WhatsApp
              </label>
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmCommitment} className="bg-orange-600 hover:bg-orange-700 text-white">
                Registrar Compromiso
              </Button>
              <Button variant="outline" onClick={() => setShowCommitmentModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Credit Note Modal */}
      <Dialog open={showCreditNoteModal} onOpenChange={setShowCreditNoteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generar Nota de Crédito</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Número *</label>
                <Input
                  type="text"
                  value={creditNoteData.number}
                  onChange={(e) => setCreditNoteData({ ...creditNoteData, number: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Fecha *</label>
                <Input
                  type="date"
                  value={creditNoteData.date}
                  onChange={(e) => setCreditNoteData({ ...creditNoteData, date: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700">Motivo *</label>
              <Input
                type="text"
                value={creditNoteData.reason}
                onChange={(e) => setCreditNoteData({ ...creditNoteData, reason: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700">Monto *</label>
                <Input
                  type="number"
                  value={creditNoteData.amount}
                  onChange={(e) => setCreditNoteData({ ...creditNoteData, amount: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700">Código de Autorización</label>
                <Input
                  type="text"
                  value={creditNoteData.authCode}
                  onChange={(e) => setCreditNoteData({ ...creditNoteData, authCode: e.target.value })}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={confirmCreditNote} className="bg-purple-600 hover:bg-purple-700 text-white">
                Generar Nota de Crédito
              </Button>
              <Button variant="outline" onClick={() => setShowCreditNoteModal(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
