
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Filter } from 'lucide-react';

export const BillingPaid = () => {
  const [filterClient, setFilterClient] = useState('');
  const [filterMonth, setFilterMonth] = useState('todos');

  // Mock paid invoices data
  const paidInvoices = [
    {
      id: "FAC-2024-001",
      client: "Bodega Don Carlos",
      amount: 480.00,
      issueDate: "2024-01-14",
      paidDate: "2024-01-14",
      paymentMethod: "Efectivo",
      status: "paid"
    },
    {
      id: "FAC-2024-002",
      client: "Restaurante La Plaza",
      amount: 1200.00,
      issueDate: "2024-01-10",
      paidDate: "2024-01-12",
      paymentMethod: "Transferencia",
      status: "paid"
    },
    {
      id: "FAC-2024-003",
      client: "Minimarket Central",
      amount: 650.00,
      issueDate: "2024-01-08",
      paidDate: "2024-01-15",
      paymentMethod: "Yape",
      status: "paid"
    }
  ];

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
                <div className="space-y-1">
                  <div className="text-sm">
                    <span className="font-medium">Emitida:</span> {new Date(invoice.issueDate).toLocaleDateString()}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Método:</span> {invoice.paymentMethod}
                  </div>
                  <div className="text-sm">
                    <span className="font-medium">Tiempo de cobro:</span> {
                      Math.ceil((new Date(invoice.paidDate).getTime() - new Date(invoice.issueDate).getTime()) / (1000 * 60 * 60 * 24))
                    } días
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-blue-600 border-blue-300 hover:bg-blue-50"
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
    </div>
  );
};
