import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Filter, Eye, CreditCard, Building, User, Calendar } from 'lucide-react';

export const BillingPaid = () => {
  const [filterClient, setFilterClient] = useState('');
  const [filterMonth, setFilterMonth] = useState('todos');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Enhanced mock paid invoices data
  const paidInvoices = [
    {
      id: "FAC-2024-001",
      client: "Bodega Don Carlos",
      amount: 480.00,
      issueDate: "2024-01-14",
      paidDate: "2024-01-14",
      paymentMethod: "Efectivo",
      status: "paid",
      paidBy: "Carlos Mendoza",
      operationNumber: "OP-2024-001",
      bank: "BCP",
      account: "194-123456789",
      voucher: "VOU-001-2024",
      managedBy: "cobranzas@pecaditos.com",
      paymentTime: "14:30",
      notes: "Pago completo en efectivo, sin cambio"
    },
    {
      id: "FAC-2024-002",
      client: "Restaurante La Plaza",
      amount: 1200.00,
      issueDate: "2024-01-10",
      paidDate: "2024-01-12",
      paymentMethod: "Transferencia",
      status: "paid",
      paidBy: "María García - Administradora",
      operationNumber: "TRF-456789",
      bank: "Interbank",
      account: "300-987654321",
      voucher: "VOU-002-2024",
      managedBy: "cobranzas@pecaditos.com",
      paymentTime: "09:15",
      notes: "Transferencia bancaria verificada"
    },
    {
      id: "FAC-2024-003",
      client: "Minimarket Central",
      amount: 650.00,
      issueDate: "2024-01-08",
      paidDate: "2024-01-15",
      paymentMethod: "Yape",
      status: "paid",
      paidBy: "Roberto Silva",
      operationNumber: "YAP-789123",
      bank: "BCP (Yape)",
      account: "999-555-333",
      voucher: "YAP-003-2024",
      managedBy: "pedidos@pecaditos.com",
      paymentTime: "16:45",
      notes: "Pago por Yape confirmado con captura"
    }
  ];

  const handleViewDetail = (invoice: any) => {
    setSelectedPayment(invoice);
    setShowDetailModal(true);
  };

  const filteredInvoices = paidInvoices.filter(invoice => {
    const matchesClient = !filterClient || invoice.client.toLowerCase().includes(filterClient.toLowerCase());
    // Add month filter logic here
    return matchesClient;
  });

  const totalPaid = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Facturas Cobradas</h2>
        <p className="text-stone-600">Historial de pagos recibidos</p>
      </div>

      {/* Summary */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600">Total Cobrado</p>
              <p className="text-2xl font-bold text-green-700">S/ {totalPaid.toFixed(2)}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-500" />
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Buscar cliente..."
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            />
            <Select value={filterMonth} onValueChange={setFilterMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Mes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los meses</SelectItem>
                <SelectItem value="2024-01">Enero 2024</SelectItem>
                <SelectItem value="2023-12">Diciembre 2023</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Paid Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {invoice.id}
                    <Badge className="bg-green-100 text-green-800">
                      Pagada
                    </Badge>
                  </CardTitle>
                  <p className="text-stone-600 mt-1">{invoice.client}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-green-700">S/ {invoice.amount.toFixed(2)}</div>
                  <div className="text-sm text-stone-500">
                    Pagada: {new Date(invoice.paidDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="space-y-1 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-sm">
                      <span className="font-medium">Emitida:</span> {new Date(invoice.issueDate).toLocaleDateString()}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Método:</span> {invoice.paymentMethod}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Pagado por:</span> {invoice.paidBy}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Gestión:</span> {invoice.managedBy}
                    </div>
                  </div>
                  <div className="text-sm text-stone-500">
                    <span className="font-medium">Op. #{invoice.operationNumber}</span> - 
                    Tiempo de cobro: {
                      Math.ceil((new Date(invoice.paidDate).getTime() - new Date(invoice.issueDate).getTime()) / (1000 * 60 * 60 * 24))
                    } días
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetail(invoice)}
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver Detalle
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-green-600 border-green-300 hover:bg-green-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Recibo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Detalle Completo del Pago
              </CardTitle>
              <p className="text-stone-600">Factura: {selectedPayment.id}</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-stone-600 flex items-center gap-1">
                    <User className="h-4 w-4" />
                    Cliente
                  </label>
                  <p className="font-semibold text-lg">{selectedPayment.client}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Monto Pagado</label>
                  <p className="font-bold text-2xl text-green-700">S/ {selectedPayment.amount.toFixed(2)}</p>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Información del Pago
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-green-700">Pagado por</label>
                    <p className="font-semibold">{selectedPayment.paidBy}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">Método de Pago</label>
                    <p className="font-semibold">{selectedPayment.paymentMethod}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">Fecha de Pago</label>
                    <p className="font-semibold">{new Date(selectedPayment.paidDate).toLocaleDateString()} - {selectedPayment.paymentTime}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-green-700">Número de Operación</label>
                    <p className="font-semibold">{selectedPayment.operationNumber}</p>
                  </div>
                </div>
              </div>

              {/* Banking Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Información Bancaria
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-blue-700">Banco</label>
                    <p className="font-semibold">{selectedPayment.bank}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">Cuenta</label>
                    <p className="font-semibold">{selectedPayment.account}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">Voucher</label>
                    <p className="font-semibold">{selectedPayment.voucher}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-blue-700">Gestionado por</label>
                    <p className="font-semibold">{selectedPayment.managedBy}</p>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                <h3 className="font-semibold text-stone-800 mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Información Adicional
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-stone-700">Fecha de Emisión</label>
                    <p className="font-semibold">{new Date(selectedPayment.issueDate).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-stone-700">Tiempo de Cobro</label>
                    <p className="font-semibold">
                      {Math.ceil((new Date(selectedPayment.paidDate).getTime() - new Date(selectedPayment.issueDate).getTime()) / (1000 * 60 * 60 * 24))} días
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <label className="text-sm font-medium text-stone-700">Notas</label>
                  <p className="bg-white p-3 rounded border">{selectedPayment.notes}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowDetailModal(false)}
                  className="flex-1"
                >
                  Cerrar
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar Recibo
                </Button>
                <Button
                  variant="outline"
                  className="text-blue-600 border-blue-300 hover:bg-blue-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Voucher
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
