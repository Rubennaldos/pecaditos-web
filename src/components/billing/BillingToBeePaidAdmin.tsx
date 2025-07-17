
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Phone, 
  MessageSquare, 
  CheckCircle, 
  AlertTriangle,
  Download,
  Calendar,
  Clock,
  CreditCard,
  Search,
  Bell,
  Edit,
  Trash2,
  History,
  DollarSign,
  FileText,
  User
} from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';
import { useToast } from '@/hooks/use-toast';

export const BillingToBePaidAdmin = () => {
  const { isAdminMode, sendWarningMessage } = useAdminBilling();
  const { toast } = useToast();
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal states
  const [showConfirmWarning, setShowConfirmWarning] = useState(false);
  const [showCollectModal, setShowCollectModal] = useState(false);
  const [showCommitmentModal, setShowCommitmentModal] = useState(false);
  const [showCreditNoteModal, setCreditNoteModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  
  // Form states
  const [collectData, setCollectData] = useState({
    amount: '',
    operationNumber: '',
    bank: '',
    paymentDate: '',
    responsible: '',
    notes: ''
  });
  
  const [commitmentData, setCommitmentData] = useState({
    commitmentDate: '',
    amount: '',
    notes: '',
    sendNotification: true
  });
  
  const [creditNoteData, setCreditNoteData] = useState({
    noteNumber: '',
    amount: '',
    reason: '',
    description: ''
  });

  // Enhanced mock invoices data without total amount displayed
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
      paymentMethod: "credito_30"
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
      paymentMethod: "credito_15"
    }
  ];

  // Action handlers
  const handleCollect = (invoice: any) => {
    setSelectedInvoice(invoice);
    setCollectData({
      amount: invoice.amount.toFixed(2),
      operationNumber: '',
      bank: '',
      paymentDate: new Date().toISOString().split('T')[0],
      responsible: 'cobranzas@pecaditos.com',
      notes: ''
    });
    setShowCollectModal(true);
  };

  const handleCommitment = (invoice: any) => {
    setSelectedInvoice(invoice);
    setCommitmentData({
      commitmentDate: '',
      amount: invoice.amount.toFixed(2),
      notes: '',
      sendNotification: true
    });
    setShowCommitmentModal(true);
  };

  const handleCreditNote = (invoice: any) => {
    setSelectedInvoice(invoice);
    setCreditNoteData({
      noteNumber: '',
      amount: invoice.amount.toFixed(2),
      reason: '',
      description: ''
    });
    setCreditNoteModal(true);
  };

  const handleWhatsApp = (invoice: any) => {
    const message = `Hola ${invoice.client}, le recordamos que tiene una factura pendiente ${invoice.id} por S/ ${invoice.amount.toFixed(2)}. ¿Podríamos coordinar el pago? Gracias.`;
    const whatsappUrl = `https://wa.me/${invoice.clientPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    toast({
      title: "WhatsApp Abierto",
      description: "Se abrió WhatsApp con el mensaje predeterminado",
    });
  };

  const handleWarning = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowConfirmWarning(true);
  };

  const handleDownloadPDF = (invoice: any) => {
    console.log(`Descargando PDF de factura ${invoice.id}`);
    toast({
      title: "Descargando PDF",
      description: `Generando PDF de la factura ${invoice.id}`,
    });
    // TODO: Implement real PDF download functionality
  };

  const handleCall = (phone: string) => {
    console.log(`Iniciando llamada a ${phone}`);
    toast({
      title: "Llamada Iniciada",
      description: `Marcando al número ${phone}`,
    });
    // TODO: Integrate with phone system
  };

  const confirmCollect = () => {
    if (!collectData.operationNumber || !collectData.bank) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    console.log('Registrando cobro:', {
      invoice: selectedInvoice?.id,
      ...collectData
    });

    toast({
      title: "Cobro Registrado",
      description: `Cobro de S/ ${collectData.amount} registrado exitosamente`,
    });

    setShowCollectModal(false);
    setSelectedInvoice(null);
    // TODO: Integrar con base de datos
  };

  const confirmCommitment = () => {
    if (!commitmentData.commitmentDate) {
      toast({
        title: "Error", 
        description: "Debe seleccionar una fecha de compromiso",
        variant: "destructive"
      });
      return;
    }

    console.log('Registrando compromiso:', {
      invoice: selectedInvoice?.id,
      ...commitmentData
    });

    if (commitmentData.sendNotification) {
      const message = `${selectedInvoice?.client}, confirmamos su compromiso de pago de S/ ${commitmentData.amount} para el ${new Date(commitmentData.commitmentDate).toLocaleDateString()}. Gracias.`;
      sendWarningMessage(selectedInvoice?.ruc, message);
    }

    toast({
      title: "Compromiso Registrado",
      description: `Compromiso agendado para ${new Date(commitmentData.commitmentDate).toLocaleDateString()}`,
    });

    setShowCommitmentModal(false);
    setSelectedInvoice(null);
  };

  const confirmCreditNote = () => {
    if (!creditNoteData.noteNumber || !creditNoteData.reason) {
      toast({
        title: "Error",
        description: "Complete todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }

    console.log('Creando nota de crédito:', {
      invoice: selectedInvoice?.id,
      ...creditNoteData
    });

    toast({
      title: "Nota de Crédito Creada",
      description: `Nota de crédito ${creditNoteData.noteNumber} por S/ ${creditNoteData.amount}`,
    });

    setCreditNoteModal(false);
    setSelectedInvoice(null);
  };

  const confirmWarning = () => {
    const defaultMessage = `Estimado cliente ${selectedInvoice?.client}, le recordamos que tiene una factura pendiente (${selectedInvoice?.id}) por S/ ${selectedInvoice?.amount.toFixed(2)} con vencimiento el ${new Date(selectedInvoice?.dueDate).toLocaleDateString()}. Por favor, regularice su pago a la brevedad. Gracias.`;
    
    sendWarningMessage(selectedInvoice?.ruc, defaultMessage);
    setShowConfirmWarning(false);
    setSelectedInvoice(null);
    
    toast({
      title: "Advertencia Enviada",
      description: "Se envió la advertencia por WhatsApp al cliente",
    });
  };

  const filteredInvoices = invoices.filter(invoice => {
    const matchesStatus = filterStatus === 'todos' || invoice.status === filterStatus;
    const matchesSearch = !searchTerm || 
      invoice.ruc.includes(searchTerm) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Cuentas por Cobrar</h2>
        <p className="text-stone-600">Gestión completa de facturas pendientes y vencidas</p>
      </div>

      {/* Summary Cards - Without total amount */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => {
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
                      onClick={() => handleCall(invoice.clientPhone)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      {invoice.clientPhone}
                    </Button>
                     <Button
                       size="sm"
                       variant="outline"
                       onClick={() => handleWhatsApp(invoice)}
                       className="text-green-600 border-green-300 hover:bg-green-50"
                     >
                       <MessageSquare className="h-4 w-4 mr-1" />
                       WhatsApp
                     </Button>
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

                    {/* Admin Controls */}
                    {isAdminMode && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-orange-600 border-orange-300 hover:bg-orange-50"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-300 hover:bg-purple-50"
                        >
                          <History className="h-4 w-4 mr-1" />
                          Historial
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Warning Confirmation Modal */}
      {showConfirmWarning && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-800">Confirmar Envío de Advertencia</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <Bell className="h-4 w-4 inline mr-2" />
                  Se enviará un mensaje de advertencia por WhatsApp al cliente <strong>{selectedInvoice.client}</strong> sobre la factura <strong>{selectedInvoice.id}</strong>.
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={confirmWarning}
                  className="bg-red-600 hover:bg-red-700 text-white flex-1"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Confirmar Envío
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowConfirmWarning(false)}
                >
                  Cancelar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Collect Payment Modal */}
      {showCollectModal && selectedInvoice && (
        <Dialog open={showCollectModal} onOpenChange={setShowCollectModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-green-800">Registrar Cobro</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  <strong>Cliente:</strong> {selectedInvoice.client}<br/>
                  <strong>Factura:</strong> {selectedInvoice.id}<br/>
                  <strong>Monto:</strong> S/ {selectedInvoice.amount.toFixed(2)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Monto Cobrado *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={collectData.amount}
                    onChange={(e) => setCollectData({...collectData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Fecha de Pago *</Label>
                  <Input
                    type="date"
                    value={collectData.paymentDate}
                    onChange={(e) => setCollectData({...collectData, paymentDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número de Operación *</Label>
                  <Input
                    value={collectData.operationNumber}
                    onChange={(e) => setCollectData({...collectData, operationNumber: e.target.value})}
                    placeholder="Ej: 123456789"
                  />
                </div>
                <div>
                  <Label>Banco *</Label>
                  <Select value={collectData.bank} onValueChange={(value) => setCollectData({...collectData, bank: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar banco" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bcp">BCP</SelectItem>
                      <SelectItem value="bbva">BBVA</SelectItem>
                      <SelectItem value="scotiabank">Scotiabank</SelectItem>
                      <SelectItem value="interbank">Interbank</SelectItem>
                      <SelectItem value="banbif">BanBif</SelectItem>
                      <SelectItem value="efectivo">Efectivo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Responsable</Label>
                <Input
                  value={collectData.responsible}
                  onChange={(e) => setCollectData({...collectData, responsible: e.target.value})}
                  placeholder="Usuario responsable"
                />
              </div>
              
              <div>
                <Label>Observaciones</Label>
                <Textarea
                  value={collectData.notes}
                  onChange={(e) => setCollectData({...collectData, notes: e.target.value})}
                  placeholder="Notas adicionales sobre el cobro..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={confirmCollect}
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Registrar Cobro
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCollectModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Commitment Modal */}
      {showCommitmentModal && selectedInvoice && (
        <Dialog open={showCommitmentModal} onOpenChange={setShowCommitmentModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-orange-800">Agendar Compromiso de Pago</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
                <p className="text-sm text-orange-800">
                  <strong>Cliente:</strong> {selectedInvoice.client}<br/>
                  <strong>Factura:</strong> {selectedInvoice.id}<br/>
                  <strong>Monto:</strong> S/ {selectedInvoice.amount.toFixed(2)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Fecha de Compromiso *</Label>
                  <Input
                    type="date"
                    value={commitmentData.commitmentDate}
                    onChange={(e) => setCommitmentData({...commitmentData, commitmentDate: e.target.value})}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label>Monto Comprometido</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={commitmentData.amount}
                    onChange={(e) => setCommitmentData({...commitmentData, amount: e.target.value})}
                  />
                </div>
              </div>
              
              <div>
                <Label>Observaciones del Compromiso</Label>
                <Textarea
                  value={commitmentData.notes}
                  onChange={(e) => setCommitmentData({...commitmentData, notes: e.target.value})}
                  placeholder="Detalles del acuerdo, condiciones especiales..."
                  rows={3}
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="sendNotification"
                  checked={commitmentData.sendNotification}
                  onChange={(e) => setCommitmentData({...commitmentData, sendNotification: e.target.checked})}
                  className="rounded"
                />
                <Label htmlFor="sendNotification" className="text-sm">
                  Enviar notificación por WhatsApp al cliente
                </Label>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={confirmCommitment}
                  className="bg-orange-600 hover:bg-orange-700 text-white flex-1"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Compromiso
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowCommitmentModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Credit Note Modal */}
      {showCreditNoteModal && selectedInvoice && (
        <Dialog open={showCreditNoteModal} onOpenChange={setCreditNoteModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-purple-800">Crear Nota de Crédito</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <p className="text-sm text-purple-800">
                  <strong>Cliente:</strong> {selectedInvoice.client}<br/>
                  <strong>Factura Original:</strong> {selectedInvoice.id}<br/>
                  <strong>Monto Original:</strong> S/ {selectedInvoice.amount.toFixed(2)}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Número de Nota *</Label>
                  <Input
                    value={creditNoteData.noteNumber}
                    onChange={(e) => setCreditNoteData({...creditNoteData, noteNumber: e.target.value})}
                    placeholder="NC-2024-001"
                  />
                </div>
                <div>
                  <Label>Monto de la Nota *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={creditNoteData.amount}
                    onChange={(e) => setCreditNoteData({...creditNoteData, amount: e.target.value})}
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <Label>Motivo *</Label>
                <Select value={creditNoteData.reason} onValueChange={(value) => setCreditNoteData({...creditNoteData, reason: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar motivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="devolucion">Devolución de mercadería</SelectItem>
                    <SelectItem value="descuento">Descuento comercial</SelectItem>
                    <SelectItem value="error_facturacion">Error en facturación</SelectItem>
                    <SelectItem value="bonificacion">Bonificación</SelectItem>
                    <SelectItem value="otros">Otros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Descripción Detallada</Label>
                <Textarea
                  value={creditNoteData.description}
                  onChange={(e) => setCreditNoteData({...creditNoteData, description: e.target.value})}
                  placeholder="Descripción detallada del motivo de la nota de crédito..."
                  rows={3}
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={confirmCreditNote}
                  className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Crear Nota de Crédito
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCreditNoteModal(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
