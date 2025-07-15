
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Star, 
  Phone, 
  MessageSquare, 
  Edit, 
  User, 
  Mail,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

export const BillingClients = () => {
  const [filterStatus, setFilterStatus] = useState('todos');
  const [searchClient, setSearchClient] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<any>(null);

  // Mock clients data
  const clients = [
    {
      id: "CLI-001",
      name: "Distribuidora El Sol SAC",
      ruc: "20123456789",
      phone: "+51 999 111 222",
      email: "pagos@elsol.com",
      status: "moroso",
      creditScore: 2.5,
      paymentTerms: "credito_30",
      creditLimit: 2000.00,
      currentDebt: 780.00,
      lastPayment: "2023-12-15",
      avgPaymentDays: 35,
      paymentHistory: [
        { date: "2024-01-10", status: "late", days: 5 },
        { date: "2023-12-15", status: "very_late", days: 20 },
        { date: "2023-11-20", status: "on_time", days: 0 }
      ]
    },
    {
      id: "CLI-002",
      name: "Bodega Don Carlos",
      ruc: "20555666777",
      phone: "+51 999 555 666",
      email: "carlos@bodega.com",
      status: "activo",
      creditScore: 5.0,
      paymentTerms: "contado",
      creditLimit: 500.00,
      currentDebt: 0.00,
      lastPayment: "2024-01-16",
      avgPaymentDays: 0,
      paymentHistory: [
        { date: "2024-01-16", status: "on_time", days: 0 },
        { date: "2024-01-14", status: "on_time", days: 0 },
        { date: "2024-01-12", status: "on_time", days: 0 }
      ]
    },
    {
      id: "CLI-003",
      name: "Restaurante La Plaza",
      ruc: "20777888999",
      phone: "+51 999 777 888",
      email: "admin@laplaza.com",
      status: "puntual",
      creditScore: 4.5,
      paymentTerms: "credito_15",
      creditLimit: 1500.00,
      currentDebt: 450.00,
      lastPayment: "2024-01-12",
      avgPaymentDays: 12,
      paymentHistory: [
        { date: "2024-01-12", status: "on_time", days: 0 },
        { date: "2024-01-05", status: "early", days: -2 },
        { date: "2023-12-28", status: "on_time", days: 0 }
      ]
    }
  ];

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'activo':
        return { color: 'bg-green-100 text-green-800', text: 'Activo', icon: CheckCircle };
      case 'moroso':
        return { color: 'bg-red-100 text-red-800', text: 'Moroso', icon: AlertTriangle };
      case 'puntual':
        return { color: 'bg-blue-100 text-blue-800', text: 'Puntual', icon: Clock };
      default:
        return { color: 'bg-gray-100 text-gray-800', text: status, icon: User };
    }
  };

  const renderCreditStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`h-4 w-4 ${i < score ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  const renderPaymentHistory = (history: any[]) => {
    return (
      <div className="flex gap-1">
        {history.slice(0, 10).map((payment, index) => {
          let color = 'bg-gray-300';
          if (payment.status === 'on_time' || payment.status === 'early') color = 'bg-green-500';
          else if (payment.status === 'late') color = 'bg-yellow-500';
          else if (payment.status === 'very_late') color = 'bg-red-500';
          
          return (
            <div 
              key={index}
              className={`w-2 h-6 rounded-sm ${color}`}
              title={`${payment.date} - ${payment.status}`}
            />
          );
        })}
      </div>
    );
  };

  const filteredClients = clients.filter(client => {
    const matchesStatus = filterStatus === 'todos' || client.status === filterStatus;
    const matchesSearch = !searchClient || 
      client.name.toLowerCase().includes(searchClient.toLowerCase()) ||
      client.ruc.includes(searchClient);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Gestión de Clientes</h2>
        <p className="text-stone-600">Estado financiero y comportamiento de pago</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              placeholder="Buscar cliente o RUC..."
              value={searchClient}
              onChange={(e) => setSearchClient(e.target.value)}
            />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="moroso">Moroso</SelectItem>
                <SelectItem value="puntual">Puntual</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Clients List */}
      <div className="space-y-4">
        {filteredClients.map((client) => {
          const statusInfo = getStatusInfo(client.status);
          const StatusIcon = statusInfo.icon;
          
          return (
            <Card key={client.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-stone-600" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {client.name}
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {statusInfo.text}
                        </Badge>
                      </CardTitle>
                      <p className="text-stone-600">RUC: {client.ruc}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-1">
                      {renderCreditStars(client.creditScore)}
                      <span className="text-sm text-stone-600 ml-2">
                        ({client.creditScore}/5.0)
                      </span>
                    </div>
                    <div className="text-sm text-stone-500">
                      Último pago: {new Date(client.lastPayment).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Contact Info */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-stone-400" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-stone-400" />
                      <span className="truncate">{client.email}</span>
                    </div>
                  </div>

                  {/* Financial Info */}
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Límite:</span> S/ {client.creditLimit.toFixed(2)}
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Deuda:</span> 
                      <span className={client.currentDebt > 0 ? 'text-red-600 font-bold ml-1' : 'text-green-600 ml-1'}>
                        S/ {client.currentDebt.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Términos:</span> {client.paymentTerms}
                    </div>
                  </div>

                  {/* Payment Behavior */}
                  <div className="space-y-2">
                    <div className="text-sm">
                      <span className="font-medium">Promedio:</span> {client.avgPaymentDays} días
                    </div>
                    <div className="text-sm">
                      <span className="font-medium">Historial:</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {renderPaymentHistory(client.paymentHistory)}
                      <span className="text-xs text-stone-500">10 últimos</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-blue-600 border-blue-300 hover:bg-blue-50 flex-1"
                      >
                        <Phone className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-green-600 border-green-300 hover:bg-green-50 flex-1"
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedClient(client);
                        setShowEditModal(true);
                      }}
                      className="text-stone-600 border-stone-300 hover:bg-stone-50"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Edit Modal */}
      {showEditModal && selectedClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Editar Cliente</CardTitle>
              <p className="text-stone-600">{selectedClient.name}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Términos de Pago</label>
                <Select defaultValue={selectedClient.paymentTerms}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="contado">Contado</SelectItem>
                    <SelectItem value="credito_15">Crédito 15 días</SelectItem>
                    <SelectItem value="credito_30">Crédito 30 días</SelectItem>
                    <SelectItem value="credito_45">Crédito 45 días</SelectItem>
                    <SelectItem value="credito_60">Crédito 60 días</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Límite de Crédito</label>
                <Input
                  type="number"
                  defaultValue={selectedClient.creditLimit}
                  placeholder="S/ 0.00"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white flex-1"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowEditModal(false)}
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
