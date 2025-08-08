import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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

// <-- Reemplaza con tu consulta real: -->
const deliveryHistory: any[] = []; // ← Datos vacíos para integrar con tu backend

export const DeliveryHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterDeliveryPerson, setFilterDeliveryPerson] = useState('todos');

  // Aquí obtienes el usuario real del auth context cuando lo conectes
  const currentUser = ""; // ← Asignar email/ID de usuario autenticado
  const currentUserDeliveries = deliveryHistory.filter(d => !currentUser || d.deliveryPersonEmail === currentUser);

  const filteredDeliveries = currentUserDeliveries.filter(delivery => {
    const matchesSearch = !searchTerm || 
      delivery.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      delivery.clientPhone?.includes(searchTerm);

    const matchesDateFrom = !dateFrom || new Date(delivery.deliveredAt) >= new Date(dateFrom);
    const matchesDateTo = !dateTo || new Date(delivery.deliveredAt) <= new Date(dateTo + 'T23:59:59');

    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  const exportHistory = () => {
    // Implementa tu lógica de export aquí
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
                <p className="text-2xl font-bold">
                  {/* Calcula promedio cuando lo tengas */}
                  {/* Mostrar "—" si está vacío */}
                  —
                </p>
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
                <p className="text-2xl font-bold text-green-600">
                  {/* Calcula porcentaje real cuando tengas datos */}
                  —
                </p>
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
                  <div className="text-lg font-bold">S/ {delivery.orderTotal?.toFixed(2) ?? '—'}</div>
                  <div className="text-sm text-green-600 font-medium">
                    {delivery.deliveryTime ?? '—'}
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
                    <span>{delivery.takenAt ? new Date(delivery.takenAt).toLocaleString() : '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="font-medium">Entregado:</span>
                    <span>{delivery.deliveredAt ? new Date(delivery.deliveredAt).toLocaleString() : '—'}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-stone-400" />
                    <span className="font-medium">Repartidor:</span>
                    <span>{delivery.deliveryPerson ?? '—'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Package className="h-4 w-4 text-stone-400" />
                    <span className="font-medium">ID Entrega:</span>
                    <span>{delivery.id}</span>
                  </div>
                </div>
              </div>
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
