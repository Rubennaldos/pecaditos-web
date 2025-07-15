
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
  DollarSign
} from 'lucide-react';

export const BillingToBePaid = () => {
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterClient, setFilterClient] = useState('');
  const [showPaymentCommitment, setShowPaymentCommitment] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [commitmentData, setCommitmentData] = useState({
    date: '',
    amount: '',
    reason: ''
  });

  // Mock invoices data - sorted by urgency
  const invoices = [
    {
      id: "FAC-2024-001",
      client: "Distribuidora El Sol SAC",
      clientPhone: "+51 999 111 222",
      amount: 780.00,
      issueDate: "2024-01-01",
      dueDate: "2024-01-16",
      status: "overdue",
      daysOverdue: 15,
      urgency: 3
    },
    {
      id: "FAC-2024-002",
      client: "Minimarket Los Andes",
      clientPhone: "+51 999 333 444",
      amount: 450.00,
      issueDate: "2024-01-10",
      dueDate: "2024-01-25",
      status: "overdue",
      daysOverdue: 7,
      urgency: 2
    },
    {
      id: "FAC-2024-003",
      client: "Restaurante La Plaza",
      clientPhone: "+51 999 555 666",
      amount: 1200.00,
      issueDate: "2024-01-15",
      dueDate: "2024-02-14",
      status: "pending",
      daysOverdue: 0,
      urgency: 1
    }
  ];

  const getStatusInfo = (status: string, daysOverdue: number) => {
    if (status === 'overdue') {
      return {
        color: 'bg-red-100 text-red-800',
        text: `Vencida (${daysOverdue} días)`,
        shouldBlink: true
      };
    }
    return {
      color: 'bg-yellow-100 text-yellow-800',
      text: 'Pendiente',
      shouldBlink: false
    };
  };

  const handlePaymentCommitment = () => {
    if (!commitmentData.date || !commitmentData.amount || !commitmentData.reason) {
      alert('Todos los campos son obligatorios');
      return;
    }
    
    console.log('Compromiso de pago registrado:', {
      invoiceId: selectedInvoice?.id,
      ...commitmentData
    });
    
    setShowPaymentCommitment(false);
    setSelectedInvoice(null);
    setCommitmentData({ date: '', amount: '', reason: '' });
  };

  const sortedInvoices = [...invoices].sort((a, b) => {
    if (a.status === 'overdue' && b.status !== 'overdue') return -1;
    if (a.status !== 'overdue' && b.status === 'overdue') return 1;
    if (a.status === 'overdue' && b.status === 'overdue') {
      return b.daysOverdue - a.daysOverdue;
    }
    return 0;
  });

  const filteredInvoices = sortedInvoices.filter(invoice => {
    const matchesStatus = filterStatus === 'todos' || invoice.status === filterStatus;
    const matchesClient = !filterClient || invoice.client.toLowerCase().includes(filterClient.toLowerCase());
    return matchesStatus && matchesClient;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Cuentas por Cobrar</h2>
        <p className="text-stone-600">Gestión de facturas pendientes y vencidas</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Facturas Vencidas</p>
                <p className="text-2xl font-bold text-red-700">2</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-700">1</p>
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
                <p className="text-2xl font-bold text-orange-700">S/ 2,430</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            <Input
              placeholder="Buscar cliente..."
              value={filterClient}
              onChange={(e) => setFilterClient(e.target.value)}
            />
            <Input type="date" />
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => {
          const statusInfo = getStatusInfo(invoice.status, invoice.daysOverdue);
          
          return (
            <Card 
              key={invoice.id} 
              className={`hover:shadow-lg transition-all ${
                statusInfo.shouldBlink ? 'animate-pulse border-red-300 bg-red-50' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {invoice.id}
                      <Badge className={statusInfo.color}>
                        {statusInfo.text}
                      </Badge>
                    </CardTitle>
                    <p className="text-stone-600 mt-1">{invoice.client}</p>
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
                      <span className="font-medium">Teléfono:</span> {invoice.clientPhone}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Llamar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-300 hover:bg-green-50"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      WhatsApp
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-purple-600 border-purple-300 hover:bg-purple-50"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      PDF
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Marcar Pagada
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => {
                        setSelectedInvoice(invoice);
                        setShowPaymentCommitment(true);
                      }}
                      className="bg-orange-600 hover:bg-orange-700 text-white"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Compromiso
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Payment Commitment Modal */}
      {showPaymentCommitment && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-orange-800">Compromiso de Pago</CardTitle>
              <p className="text-stone-600">
                Factura: {selectedInvoice.id} - {selectedInvoice.client}
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
                <label className="text-sm font-medium">Monto Comprometido *</label>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={commitmentData.amount}
                  onChange={(e) => setCommitmentData({...commitmentData, amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Motivo/Observaciones *</label>
                <Textarea
                  placeholder="Detalles del acuerdo..."
                  value={commitmentData.reason}
                  onChange={(e) => setCommitmentData({...commitmentData, reason: e.target.value})}
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
                  onClick={() => setShowPaymentCommitment(false)}
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
