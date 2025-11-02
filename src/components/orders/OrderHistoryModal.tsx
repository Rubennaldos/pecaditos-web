
import { useState } from 'react';
import { History, User, Clock, Activity, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';

interface OrderHistoryModalProps {
  orderId?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const OrderHistoryModal = ({ orderId, isOpen, onClose }: OrderHistoryModalProps) => {
  const { getOrderHistory, getAllOrderHistory } = useAdminOrders();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterProfile, setFilterProfile] = useState('all');

  if (!isOpen) return null;

  const history = orderId ? getOrderHistory(orderId) : getAllOrderHistory();
  
  const filteredHistory = history.filter(entry => {
    const matchesSearch = searchTerm === '' || 
      entry.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.orderId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === 'all' || entry.action === filterAction;
    const matchesProfile = filterProfile === 'all' || entry.profile === filterProfile;
    
    return matchesSearch && matchesAction && matchesProfile;
  });

  const getActionColor = (action: string) => {
    switch (action) {
      case 'crear': return 'bg-blue-100 text-blue-800';
      case 'editar': return 'bg-amber-100 text-amber-800';
      case 'aceptar': return 'bg-green-100 text-green-800';
      case 'eliminar': return 'bg-red-100 text-red-800';
      case 'restaurar': return 'bg-purple-100 text-purple-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  const getProfileColor = (profile: string) => {
    switch (profile) {
      case 'admin': return 'bg-purple-100 text-purple-800';
      case 'pedidos': return 'bg-blue-100 text-blue-800';
      case 'sistema': return 'bg-stone-100 text-stone-800';
      default: return 'bg-stone-100 text-stone-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-purple-800">
            <History className="h-5 w-5" />
            {orderId ? `Historial - ${orderId}` : 'Historial Global de Pedidos'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar en historial..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAction} onValueChange={setFilterAction}>
              <SelectTrigger>
                <SelectValue placeholder="Acción" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las acciones</SelectItem>
                <SelectItem value="crear">Crear</SelectItem>
                <SelectItem value="editar">Editar</SelectItem>
                <SelectItem value="aceptar">Aceptar</SelectItem>
                <SelectItem value="eliminar">Eliminar</SelectItem>
                <SelectItem value="restaurar">Restaurar</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterProfile} onValueChange={setFilterProfile}>
              <SelectTrigger>
                <SelectValue placeholder="Perfil" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los perfiles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pedidos">Pedidos</SelectItem>
                <SelectItem value="sistema">Sistema</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>

          {/* History List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredHistory.map((entry) => (
              <Card key={entry.id} className="border-l-4 border-l-purple-400">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={getActionColor(entry.action)}>
                          {entry.action.toUpperCase()}
                        </Badge>
                        <Badge className={getProfileColor(entry.profile)}>
                          {entry.profile.toUpperCase()}
                        </Badge>
                        {!orderId && (
                          <Badge variant="outline">
                            {entry.orderId}
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-sm text-stone-800 mb-1">{entry.details}</p>
                      
                      <div className="flex items-center gap-4 text-xs text-stone-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {entry.user}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(entry.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {/* Show changes if available */}
                      {entry.previousValue && entry.newValue && (
                        <div className="mt-2 p-2 bg-stone-50 rounded text-xs">
                          <span className="text-red-600">Anterior: {entry.previousValue}</span>
                          <span className="mx-2">→</span>
                          <span className="text-green-600">Nuevo: {entry.newValue}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {filteredHistory.length === 0 && (
              <div className="text-center py-8 text-stone-500">
                <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No se encontraron registros</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
