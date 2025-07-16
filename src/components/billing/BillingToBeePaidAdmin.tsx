
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
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
  History
} from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';

export const BillingToBePaidAdmin = () => {
  const { isAdminMode, sendWarningMessage } = useAdminBilling();
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showConfirmWarning, setShowConfirmWarning] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

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

  const handleWarning = (invoice: any) => {
    setSelectedInvoice(invoice);
    setShowConfirmWarning(true);
  };

  const confirmWarning = () => {
    const defaultMessage = `Estimado cliente ${selectedInvoice?.client}, le recordamos que tiene una factura pendiente (${selectedInvoice?.id}) por S/ ${selectedInvoice?.amount.toFixed(2)} con vencimiento el ${new Date(selectedInvoice?.dueDate).toLocaleDateString()}. Por favor, regularice su pago a la brevedad. Gracias.`;
    
    sendWarningMessage(selectedInvoice?.ruc, defaultMessage);
    setShowConfirmWarning(false);
    setSelectedInvoice(null);
  };

  const handleDownloadPDF = (invoice: any) => {
    console.log(`Descargando PDF de factura ${invoice.id}`);
    // TODO: Implement PDF download functionality
  };

  const handleCall = (phone: string) => {
    console.log(`Iniciando llamada a ${phone}`);
    // TODO: Integrate with phone system
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
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Cobrar
                    </Button>
                    <Button
                      size="sm"
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Calendar className="h-4 w-4 mr-1" />
                      Compromiso
                    </Button>
                    <Button
                      size="sm"
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
    </div>
  );
};
