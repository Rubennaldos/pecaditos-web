import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, 
  Search, 
  Calendar, 
  Package, 
  Clock,
  CheckCircle,
  Download,
  Filter,
  User,
  MapPin,
  Phone
} from 'lucide-react';

export const DeliveryHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterDeliveryPerson, setFilterDeliveryPerson] = useState('todos');

  // Mock delivery history data - integrar con Firebase
  const deliveryHistory = [
    {
      id: "ENTREGA-001",
      orderId: "PEC-2024-001",
      clientName: "Distribuidora El Sol SAC",
      clientPhone: "+51 999 111 222",
      clientAddress: "Av. Los Olivos 123, San Isidro",
      deliveryPerson: "Carlos Mendoza",
      deliveryPersonEmail: "carlos@pecaditos.com",
      takenAt: "2024-01-15T09:30:00",
      deliveredAt: "2024-01-15T11:45:00",
      deliveryNotes: "Entrega exitosa. Cliente satisfecho con la calidad.",
      orderTotal: 780.00,
      deliveryTime: "2h 15min"
    },
    {
      id: "ENTREGA-002",
      orderId: "PEC-2024-002",
      clientName: "Minimarket Los Andes",
      clientPhone: "+51 999 333 444",
      clientAddress: "Jr. Las Flores 456, Miraflores",
      deliveryPerson: "Ana Gutierrez",
      deliveryPersonEmail: "ana@pecaditos.com",
      takenAt: "2024-01-14T14:20:00",
      deliveredAt: "2024-01-14T15:30:00",
      deliveryNotes: "Entrega sin inconvenientes.",
      orderTotal: 450.00,
      deliveryTime: "1h 10min"
    },
    {
      id: "ENTREGA-003",
      orderId: "PEC-2024-003",
      clientName: "Bodega Don Carlos",
      clientPhone: "+51 999 555 666",
      clientAddress: "Calle Santa Rosa 789, San Borja",
      deliveryPerson: "Carlos Mendoza",
      deliveryPersonEmail: "carlos@pecaditos.com",
      takenAt: "2024-01-13T16:00:00",
      deliveredAt: "2024-01-13T17:20:00",
      deliveryNotes: "Cliente solicitó factura adicional para contabilidad.",
      orderTotal: 225.00,
      deliveryTime: "1h 20min"
    }
  ];

  // Get unique delivery persons for filter
  const deliveryPersons = [...new Set(deliveryHistory.map(d => d.deliveryPersonEmail))];

  // Get current user's deliveries only (simulate logged in delivery person)
  const currentUser = "carlos@pecaditos.com"; // This would come from auth context
  const currentUserDeliveries = deliveryHistory.filter(d => d.deliveryPersonEmail === currentUser);

  const filteredDeliveries = currentUserDeliveries.filter(delivery => {
    const matchesSearch = !searchTerm || 
      delivery.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.clientPhone.includes(searchTerm);
    
    const matchesDateFrom = !dateFrom || new Date(delivery.deliveredAt) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(delivery.deliveredAt) <= new Date(dateTo + 'T23:59:59');
    
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const exportHistory = () => {
    console.log('Exportando historial de entregas del repartidor...');
    // TODO: Implementar exportación a Excel/PDF
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Historial de Entregas</h2>
          <p className="text-stone-600">
            Consulta tu historial completo de entregas realizadas
          </p>
        </div>
        <Button
          onClick={exportHistory}
          variant="outline"
          className="text-stone-600 border-stone-300 hover:bg-stone-50"
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Total Entregas</p>
                <p className="text-2xl font-bold">{currentUserDeliveries.length}</p>
              </div>
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Esta Semana</p>
                <p className="text-2xl font-bold">
                  {currentUserDeliveries.filter(d => {
                    const deliveryDate = new Date(d.deliveredAt);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return deliveryDate >= weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Tiempo Promedio</p>
                <p className="text-2xl font-bold">1h 35min</p>
              </div>
              <Clock className="h-6 w-6 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Entregas Exitosas</p>
                <p className="text-2xl font-bold text-green-600">100%</p>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar por pedido, cliente, teléfono..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="Fecha desde"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="Fecha hasta"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Filter className="h-4 w-4" />
              {filteredDeliveries.length} de {currentUserDeliveries.length} entregas
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery History List */}
      <div className="space-y-4">
        {filteredDeliveries.map((delivery) => (
          <Card key={delivery.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {delivery.orderId}
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Entregado
                    </Badge>
                  </CardTitle>
                  <div className="mt-2 space-y-1">
                    <p className="text-stone-800 font-medium">{delivery.clientName}</p>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <Phone className="h-4 w-4" />
                      <span>{delivery.clientPhone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-stone-500">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{delivery.clientAddress}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">S/ {delivery.orderTotal.toFixed(2)}</div>
                  <div className="text-sm text-green-600 font-medium">
                    {delivery.deliveryTime}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-stone-400" />
                    <span className="font-medium">Tomado:</span>
                    <span>{new Date(delivery.takenAt).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Entregado:</span>
                    <span>{new Date(delivery.deliveredAt).toLocaleString()}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-stone-400" />
                    <span className="font-medium">Repartidor:</span>
                    <span>{delivery.deliveryPerson}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-stone-400" />
                    <span className="font-medium">ID Entrega:</span>
                    <span>{delivery.id}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Notes */}
              {delivery.deliveryNotes && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <h4 className="font-medium text-green-800 mb-1">Observaciones de la entrega:</h4>
                  <p className="text-sm text-green-700">{delivery.deliveryNotes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredDeliveries.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-600 mb-2">No hay entregas</h3>
            <p className="text-stone-500">
              No se encontraron entregas que coincidan con los filtros aplicados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};