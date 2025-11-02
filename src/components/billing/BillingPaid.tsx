import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Filter, Eye, CreditCard, Calendar } from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';

export const BillingPaid = () => {
  const { invoices, clients } = useBilling();
  const [filterClient, setFilterClient] = useState('');
  const [filterMonth, setFilterMonth] = useState('todos');
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Obtener facturas pagadas desde datos reales
  const paidInvoices = useMemo(() => {
    return invoices
      .filter(invoice => invoice.status === 'paid')
      .map(invoice => {
        const client = clients[invoice.clientId] || { id: invoice.clientId };
        return {
          id: invoice.id,
          client: client.nombre || client.comercial || client.id,
          clientId: invoice.clientId,
          amount: Number(invoice.amount || 0),
          paidDate: invoice.createdAt,
          dueDate: invoice.dueDate,
          method: 'Transferencia', // Por defecto, se puede agregar al modelo de datos
          reference: invoice.orderId || invoice.id
        };
      })
      .sort((a, b) => new Date(b.paidDate).getTime() - new Date(a.paidDate).getTime());
  }, [invoices, clients]);

  const handleViewDetail = (invoice: any) => {
    setSelectedPayment(invoice);
    setShowDetailModal(true);
  };

  const filteredInvoices = useMemo(() => {
    return paidInvoices.filter(invoice => {
      const matchesClient = !filterClient || 
        invoice.client.toLowerCase().includes(filterClient.toLowerCase());
      
      const matchesMonth = filterMonth === 'todos' || 
        invoice.paidDate?.startsWith(filterMonth);
        
      return matchesClient && matchesMonth;
    });
  }, [paidInvoices, filterClient, filterMonth]);

  const totalPaid = filteredInvoices.reduce((sum, invoice) => sum + invoice.amount, 0);

  // Obtener meses únicos para el filtro
  const availableMonths = useMemo(() => {
    const months = [...new Set(paidInvoices.map(inv => inv.paidDate?.slice(0, 7)).filter(Boolean))];
    return months.sort().reverse();
  }, [paidInvoices]);

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
                {availableMonths.map((month) => (
                  <SelectItem key={month} value={month}>
                    {new Date(month + '-01').toLocaleDateString('es-ES', { 
                      month: 'long', 
                      year: 'numeric' 
                    })}
                  </SelectItem>
                ))}
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
            {paidInvoices.length === 0 ? 'No hay facturas cobradas aún.' : 'No se encontraron facturas con los filtros aplicados.'}
          </div>
        ) : (
          filteredInvoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-2 rounded-full bg-green-100">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-stone-800">{invoice.client}</h3>
                        <Badge className="bg-green-100 text-green-800">Pagado</Badge>
                      </div>
                      <p className="text-sm text-stone-600">Factura: {invoice.id}</p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Pagado: {invoice.paidDate ? new Date(invoice.paidDate).toLocaleDateString() : '-'}
                        </span>
                        <span className="flex items-center gap-1">
                          <CreditCard className="h-3 w-3" />
                          {invoice.method}
                        </span>
                        <span>Ref: {invoice.reference}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right mr-4">
                      <div className="text-lg font-bold text-green-600">
                        S/ {invoice.amount.toFixed(2)}
                      </div>
                      <div className="text-sm text-stone-500">
                        Vencía: {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : '-'}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleViewDetail(invoice)}
                      className="text-blue-600 border-blue-300 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Payment Detail Modal */}
      {showDetailModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Detalle del Pago</CardTitle>
              <p className="text-stone-600">Factura: {selectedPayment.id}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-stone-600">Cliente</label>
                  <p className="font-semibold">{selectedPayment.client}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Monto Pagado</label>
                  <p className="font-semibold text-green-600">S/ {selectedPayment.amount.toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Fecha de Pago</label>
                  <p className="font-semibold">
                    {selectedPayment.paidDate ? new Date(selectedPayment.paidDate).toLocaleDateString() : '-'}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Método de Pago</label>
                  <p className="font-semibold">{selectedPayment.method}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Referencia</label>
                  <p className="font-semibold">{selectedPayment.reference}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-stone-600">Fecha de Vencimiento Original</label>
                  <p className="font-semibold">
                    {selectedPayment.dueDate ? new Date(selectedPayment.dueDate).toLocaleDateString() : '-'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDetailModal(false)} 
                  className="flex-1"
                >
                  Cerrar
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => window.print()}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Imprimir Comprobante
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
