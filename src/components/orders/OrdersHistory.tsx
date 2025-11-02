import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  History, 
  Search, 
  Calendar, 
  User, 
  Clock,
  CheckCircle,
  Package,
  AlertTriangle,
  Download,
  Filter
} from 'lucide-react';

export const OrdersHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('todos');
  const [dateFilter, setDateFilter] = useState('todos');

  // Mock history data - integrar con Firebase
  const historyEntries = [
    {
      id: "HIST-001",
      orderId: "PEC-2024-001",
      action: "created",
      performedBy: "pedidos@pecaditos.com",
      timestamp: "2024-01-15T08:30:00",
      details: "Pedido creado por cliente",
      previousValue: null,
      newValue: { status: "pendiente", total: 156.00 }
    },
    {
      id: "HIST-002",
      orderId: "PEC-2024-001",
      action: "accepted",
      performedBy: "pedidos@pecaditos.com",
      timestamp: "2024-01-15T09:15:00",
      details: "Pedido aceptado por operador",
      previousValue: { status: "pendiente" },
      newValue: { status: "en_preparacion" }
    },
    {
      id: "HIST-003",
      orderId: "PEC-2024-002",
      action: "ready",
      performedBy: "pedidos@pecaditos.com",
      timestamp: "2024-01-14T16:30:00",
      details: "Pedido marcado como listo",
      previousValue: { status: "en_preparacion" },
      newValue: { status: "listo" }
    },
    {
      id: "HIST-004",
      orderId: "PEC-2024-003",
      action: "delivered",
      performedBy: "repartidor01@pecaditos.com",
      timestamp: "2024-01-13T18:45:00",
      details: "Pedido entregado al cliente",
      previousValue: { status: "en_ruta" },
      newValue: { status: "entregado", deliveredAt: "2024-01-13T18:45:00" }
    },
    {
      id: "HIST-005",
      orderId: "PEC-2024-001",
      action: "notes_updated",
      performedBy: "pedidos@pecaditos.com",
      timestamp: "2024-01-15T10:20:00",
      details: "Notas del pedido actualizadas",
      previousValue: { notes: "" },
      newValue: { notes: "Cliente solicita entrega urgente" }
    }
  ];

  const getActionInfo = (action: string) => {
    const actionMap = {
      created: { color: 'bg-blue-100 text-blue-800', text: 'Creado', icon: Package },
      accepted: { color: 'bg-green-100 text-green-800', text: 'Aceptado', icon: CheckCircle },
      ready: { color: 'bg-purple-100 text-purple-800', text: 'Listo', icon: Clock },
      delivered: { color: 'bg-emerald-100 text-emerald-800', text: 'Entregado', icon: CheckCircle },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelado', icon: AlertTriangle },
      notes_updated: { color: 'bg-orange-100 text-orange-800', text: 'Notas Actualizadas', icon: User },
      edited: { color: 'bg-yellow-100 text-yellow-800', text: 'Editado', icon: User }
    };
    return actionMap[action] || { color: 'bg-stone-100 text-stone-800', text: action, icon: History };
  };

  const filteredEntries = historyEntries.filter(entry => {
    const matchesSearch = !searchTerm || 
      entry.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'todos' || entry.action === filterType;
    
    return matchesSearch && matchesType;
  });

  const exportHistory = () => {
    console.log('Exportando historial de pedidos...');
    // TODO: Implementar exportación a Excel/PDF
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Historial de Pedidos</h2>
          <p className="text-stone-600">Registro completo de todas las acciones realizadas en los pedidos</p>
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

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Total Acciones</p>
                <p className="text-2xl font-bold">{historyEntries.length}</p>
              </div>
              <History className="h-6 w-6 text-stone-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Pedidos Únicos</p>
                <p className="text-2xl font-bold">{new Set(historyEntries.map(e => e.orderId)).size}</p>
              </div>
              <Package className="h-6 w-6 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Hoy</p>
                <p className="text-2xl font-bold">
                  {historyEntries.filter(e => 
                    new Date(e.timestamp).toDateString() === new Date().toDateString()
                  ).length}
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
                <p className="text-sm text-stone-600">Operadores</p>
                <p className="text-2xl font-bold">{new Set(historyEntries.map(e => e.performedBy)).size}</p>
              </div>
              <User className="h-6 w-6 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar por pedido, usuario o detalles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas las acciones</SelectItem>
                <SelectItem value="created">Pedido creado</SelectItem>
                <SelectItem value="accepted">Pedido aceptado</SelectItem>
                <SelectItem value="ready">Marcado como listo</SelectItem>
                <SelectItem value="delivered">Entregado</SelectItem>
                <SelectItem value="cancelled">Cancelado</SelectItem>
                <SelectItem value="edited">Editado</SelectItem>
                <SelectItem value="notes_updated">Notas actualizadas</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-stone-600">
              <Filter className="h-4 w-4" />
              {filteredEntries.length} de {historyEntries.length} registros
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de historial */}
      <div className="space-y-3">
        {filteredEntries.map((entry) => {
          const actionInfo = getActionInfo(entry.action);
          const ActionIcon = actionInfo.icon;
          
          return (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center">
                      <ActionIcon className="h-5 w-5 text-stone-600" />
                    </div>
                    
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold text-stone-800">{entry.orderId}</h4>
                        <Badge className={actionInfo.color}>
                          {actionInfo.text}
                        </Badge>
                        <span className="text-sm text-stone-500">
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>
                      
                      <p className="text-stone-700">{entry.details}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-stone-500">
                        <User className="h-4 w-4" />
                        <span>Realizado por: {entry.performedBy}</span>
                      </div>
                      
                      {/* Mostrar cambios si existen */}
                      {entry.previousValue && entry.newValue && (
                        <div className="bg-stone-50 rounded-lg p-3 mt-2">
                          <div className="text-xs text-stone-600 font-medium mb-1">Cambios realizados:</div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            {entry.previousValue && (
                              <div>
                                <span className="text-red-600 font-medium">Anterior:</span>
                                <div className="text-stone-600">
                                  {JSON.stringify(entry.previousValue, null, 2)}
                                </div>
                              </div>
                            )}
                            <div>
                              <span className="text-green-600 font-medium">Nuevo:</span>
                              <div className="text-stone-600">
                                {JSON.stringify(entry.newValue, null, 2)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredEntries.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <History className="h-12 w-12 text-stone-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-stone-600 mb-2">No hay registros</h3>
            <p className="text-stone-500">No se encontraron registros que coincidan con los filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};