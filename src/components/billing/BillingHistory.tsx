import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  CreditCard,
  FileText,
  AlertTriangle,
  Edit
} from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';
import { useBilling } from '@/hooks/useBilling';
import { db } from '@/config/firebase';
import { onValue, ref } from 'firebase/database';

type Movement = {
  id: string;
  type: 'payment' | 'credit_note' | 'order_edit' | 'warning' | 'other';
  clientName: string;
  amount: number;
  description: string;
  user: string;
  timestamp: string;
  status: 'success' | 'pending' | 'failed';
};

export const BillingHistory = () => {
  const { editMovement, deleteMovement } = useAdminBilling();
  const { clients } = useBilling();
  
  const [movements, setMovements] = useState<Movement[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const movementsRef = ref(db, 'billing/movements');
    const unsubscribe = onValue(movementsRef, (snapshot) => {
      const data = snapshot.val() || {};
      const movementsList = Object.entries<any>(data).map(([id, movement]) => ({
        id,
        type: movement.type || 'other',
        clientName: movement.clientName || 'Cliente Desconocido',
        amount: Number(movement.amount || 0),
        description: movement.description || 'Sin descripción',
        user: movement.user || 'Sistema',
        timestamp: movement.timestamp || new Date().toISOString(),
        status: movement.status || 'success'
      }));
      
      movementsList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setMovements(movementsList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getMovementIcon = (type: string) => {
    switch (type) {
      case 'payment': return CheckCircle;
      case 'credit_note': return CreditCard;
      case 'order_edit': return Edit;
      case 'warning': return AlertTriangle;
      default: return FileText;
    }
  };

  const getMovementColor = (type: string) => {
    switch (type) {
      case 'payment': return 'bg-green-100 text-green-800';
      case 'credit_note': return 'bg-purple-100 text-purple-800';
      case 'order_edit': return 'bg-blue-100 text-blue-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredMovements = useMemo(() => {
    return movements.filter(movement => {
      const matchesType = filterType === 'todos' || movement.type === filterType;
      const matchesSearch = !searchTerm || 
        movement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        movement.clientName.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesType && matchesSearch;
    });
  }, [movements, filterType, searchTerm]);

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="text-stone-600">Cargando historial...</div></div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Historial de Movimientos</h2>
        <p className="text-stone-600">Registro completo de actividades del módulo de cobranzas</p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="payment">Pagos</SelectItem>
                <SelectItem value="credit_note">Notas de Crédito</SelectItem>
                <SelectItem value="order_edit">Ediciones</SelectItem>
                <SelectItem value="warning">Advertencias</SelectItem>
              </SelectContent>
            </Select>
            <Input type="date" placeholder="Desde" />
            <Button variant="outline" className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Movements List */}
      <div className="space-y-4">
        {filteredMovements.length === 0 ? (
          <div className="text-center text-stone-400 py-8">
            No hay movimientos registrados.
          </div>
        ) : (
          filteredMovements.map((movement) => {
            const Icon = getMovementIcon(movement.type);
            const colorClass = getMovementColor(movement.type);
            
            return (
              <Card key={movement.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-800">{movement.description}</h3>
                        <p className="text-sm text-stone-600">Cliente: {movement.clientName}</p>
                        <div className="flex items-center gap-4 mt-1 text-xs text-stone-500">
                          <span>Por: {movement.user}</span>
                          <span>{new Date(movement.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {movement.amount > 0 && (
                        <div className="text-lg font-bold text-green-600 mr-4">
                          S/ {movement.amount.toFixed(2)}
                        </div>
                      )}
                      <Button size="sm" variant="outline" className="text-blue-600 border-blue-300 hover:bg-blue-50">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};