
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Clock, User, Package } from 'lucide-react';

interface MovementHistoryModalProps {
  product: any;
  onClose: () => void;
}

// Mock data para historial - luego se conectará a Firebase
const mockMovements = [
  {
    id: 1,
    date: '2024-01-15T10:30:00Z',
    quantity: 50,
    user: 'Ana Ruiz - Producción',
    comment: 'Producción matutina',
    lote: 'LOTE-2024-009'
  },
  {
    id: 2,
    date: '2024-01-14T16:45:00Z',
    quantity: 30,
    user: 'Ana Ruiz - Producción',
    comment: 'Reposición urgente',
    lote: 'LOTE-2024-008'
  },
  {
    id: 3,
    date: '2024-01-13T14:20:00Z',
    quantity: 75,
    user: 'Carlos López - Producción',
    comment: 'Producción semanal',
    lote: 'LOTE-2024-007'
  }
];

export const MovementHistoryModal = ({ product, onClose }: MovementHistoryModalProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-3xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between border-b">
          <div>
            <CardTitle className="text-xl font-bold text-stone-800">
              Historial de Movimientos
            </CardTitle>
            <p className="text-stone-600 mt-1">
              {product.name} - {product.flavor}
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="space-y-4">
            {mockMovements.map((movement) => (
              <div key={movement.id} className="bg-stone-50 border border-stone-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-stone-500" />
                      <span className="text-sm font-medium text-stone-700">
                        {formatDate(movement.date)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-green-600" />
                        <Badge className="bg-green-100 text-green-800">
                          +{movement.quantity} unidades
                        </Badge>
                      </div>
                      
                      {movement.lote && (
                        <Badge variant="outline" className="text-xs">
                          {movement.lote}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 mb-2">
                      <User className="h-4 w-4 text-stone-500" />
                      <span className="text-sm text-stone-600">
                        {movement.user}
                      </span>
                    </div>
                    
                    {movement.comment && (
                      <p className="text-sm text-stone-600 mt-2 italic">
                        "{movement.comment}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {mockMovements.length === 0 && (
              <div className="text-center py-8 text-stone-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-stone-300" />
                <p>No hay movimientos registrados para este producto</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
