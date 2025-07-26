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

  // Deja el array vacío. Se llenará con datos reales desde tu base de datos en el futuro.
  const paidInvoices: any[] = [];

  const handleViewDetail = (invoice: any) => {
    setSelectedPayment(invoice);
    setShowDetailModal(true);
  };

  const filteredInvoices = paidInvoices.filter(invoice => {
    const matchesClient = !filterClient || invoice.client.toLowerCase().includes(filterClient.toLowerCase());
    // Puedes agregar lógica de filtro de mes aquí cuando tengas datos.
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
                {/* Aquí agrega los meses disponibles cuando tengas datos */}
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
        {filteredInvoices.length === 0 ? (
          <div className="text-center text-stone-400 py-8">
            No hay facturas cobradas aún.
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
              {/* ... resto de la card ... */}
            </Card>
          ))
        )}
      </div>

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {/* ... modal ... */}
        </div>
      )}
    </div>
  );
};
