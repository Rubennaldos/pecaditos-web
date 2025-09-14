import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  CreditCard,
  Bell,
  Phone,
  MessageSquare,
  Download,
  Search,
  DollarSign,
  Users,
  FileText
} from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';
import { useToast } from '@/hooks/use-toast';
import { useBilling } from '@/hooks/useBilling';

export const BillingToBePaidAdmin = () => {
  const { editOrder, sendWarningMessage } = useAdminBilling();
  const { toast } = useToast();
  const { invoices, byClient, stats, loading } = useBilling();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'overdue_days'>('amount');

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return Object.values(byClient);
    
    const term = searchTerm.toLowerCase();
    return Object.values(byClient).filter(client =>
      client.client.name?.toLowerCase().includes(term) ||
      client.client.comercialName?.toLowerCase().includes(term) ||
      client.client.ruc?.includes(term)
    );
  }, [byClient, searchTerm]);

  const sortedClients = useMemo(() => {
    return [...filteredClients].sort((a, b) => {
      if (sortBy === 'amount') return b.total - a.total;
      
      const getMaxOverdueDays = (invoices: any[]) => {
        const now = new Date();
        return Math.max(...invoices.map(inv => {
          const dueDate = new Date(inv.dueDate);
          return Math.max(0, Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)));
        }), 0);
      };
      
      return getMaxOverdueDays(b.invoices) - getMaxOverdueDays(a.invoices);
    });
  }, [filteredClients, sortBy]);

  const handleCollect = (invoice: any) => {
    editOrder(invoice.orderId, { paymentStatus: 'paid', paymentDate: new Date().toISOString() });
    toast({ title: "Pago registrado", description: `Factura ${invoice.id} marcada como pagada` });
  };

  const handleWarning = (client: any) => {
    const message = `Estimado ${client.client.name || client.client.comercialName}, tiene facturas pendientes por S/ ${client.total.toFixed(2)}. Regularice su situación.`;
    sendWarningMessage(client.client.id, message);
    toast({ title: "Advertencia enviada", description: `Mensaje enviado a ${client.client.name}` });
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-stone-600">Cargando...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Cuentas por Cobrar</h2>
        <p className="text-stone-600">Gestión de facturas pendientes y vencidas</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-red-600">Deudores</p>
                <p className="text-2xl font-bold text-red-700">{stats.debtors}</p>
              </div>
              <Users className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600">Total Adeudado</p>
                <p className="text-2xl font-bold text-orange-700">S/ {stats.totalDue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-yellow-600">Facturas Pendientes</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.pendingCount}</p>
              </div>
              <FileText className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600">Cobrado Este Mes</p>
                <p className="text-2xl font-bold text-green-700">S/ {stats.collectedThisMonth.toFixed(2)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Section */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar cliente, RUC..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="amount">Mayor deuda</SelectItem>
                <SelectItem value="overdue_days">Más días vencido</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="space-y-6">
        {sortedClients.length === 0 ? (
          <div className="text-center text-stone-400 py-8">
            No hay facturas pendientes de cobro.
          </div>
        ) : (
          sortedClients.map((clientData) => (
            <Card key={clientData.client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {clientData.client.name || clientData.client.comercialName}
                      {clientData.invoices.some(inv => {
                        const now = new Date();
                        const dueDate = new Date(inv.dueDate);
                        return dueDate < now;
                      }) && (
                        <Badge className="bg-red-100 text-red-800 animate-pulse">
                          Vencido
                        </Badge>
                      )}
                    </CardTitle>
                    <p className="text-stone-600 text-sm">RUC: {clientData.client.ruc}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-red-600">
                      S/ {clientData.total.toFixed(2)}
                    </div>
                    <div className="text-sm text-stone-500">
                      {clientData.invoices.length} factura{clientData.invoices.length !== 1 ? 's' : ''}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {clientData.invoices.map((invoice) => {
                    const dueDate = new Date(invoice.dueDate);
                    const now = new Date();
                    const isOverdue = dueDate < now;
                    const daysOverdue = isOverdue ? Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
                    
                    return (
                      <div key={invoice.id} className={`p-4 rounded-lg border ${
                        isOverdue ? 'border-red-200 bg-red-50' : 'border-yellow-200 bg-yellow-50'
                      }`}>
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-stone-800">{invoice.id}</h4>
                              <Badge className={isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                                {isOverdue ? `Vencida ${daysOverdue} días` : 'Pendiente'}
                              </Badge>
                            </div>
                            <p className="text-sm text-stone-600">
                              Vence: {dueDate.toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-stone-800">
                              S/ {invoice.amount.toFixed(2)}
                            </div>
                          </div>
                        </div>
                        
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
                            onClick={() => handleWarning(clientData)}
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                          >
                            <Bell className="h-4 w-4 mr-1" />
                            Advertir
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};