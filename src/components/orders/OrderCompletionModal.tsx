import { useState, useEffect } from 'react';
import { 
  CheckCircle, 
  AlertTriangle, 
  Calendar,
  Package,
  ArrowRight,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

/**
 * MODAL PARA COMPLETAR PEDIDOS
 * 
 * Permite:
 * - Marcar todo el pedido como completo
 * - Marcar productos individuales como completos
 * - Editar cantidades enviadas
 * - Generar nueva orden para productos faltantes
 * - Calcular fecha de completación (3-4 días hábiles)
 */

interface OrderItem {
  product: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customerName: string;
  items: OrderItem[];
  total: number;
}

interface OrderCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: Order | null;
  onComplete: (orderId: string, completedItems: any[], incompleteItems?: any[]) => void;
}

interface ItemCompletion {
  product: string;
  requestedQuantity: number;
  sentQuantity: number;
  price: number;
  isComplete: boolean;
  isSelected: boolean;
}

export const OrderCompletionModal = ({ isOpen, onClose, order, onComplete }: OrderCompletionModalProps) => {
  const { toast } = useToast();
  const [completionMode, setCompletionMode] = useState<'complete' | 'partial'>('complete');
  const [items, setItems] = useState<ItemCompletion[]>([]);
  const [showIncompleteConfirm, setShowIncompleteConfirm] = useState(false);

  // Inicializar items cuando se abre el modal
  useEffect(() => {
    if (order && isOpen) {
      const initialItems: ItemCompletion[] = order.items.map(item => ({
        product: item.product,
        requestedQuantity: item.quantity,
        sentQuantity: item.quantity,
        price: item.price,
        isComplete: true,
        isSelected: true
      }));
      setItems(initialItems);
    }
  }, [order, isOpen]);

  const calculateBusinessDays = (startDate: Date, businessDays: number): Date => {
    let date = new Date(startDate);
    let addedDays = 0;
    
    while (addedDays < businessDays) {
      date.setDate(date.getDate() + 1);
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (date.getDay() !== 0 && date.getDay() !== 6) {
        addedDays++;
      }
    }
    
    return date;
  };

  const getCompletionDate = () => {
    const today = new Date();
    const completionDate = calculateBusinessDays(today, 4); // 3-4 días hábiles
    return completionDate.toLocaleDateString('es-PE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const updateItemQuantity = (index: number, sentQuantity: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index 
        ? { 
            ...item, 
            sentQuantity: Math.max(0, Math.min(sentQuantity, item.requestedQuantity)),
            isComplete: sentQuantity === item.requestedQuantity
          }
        : item
    ));
  };

  const toggleItemSelection = (index: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, isSelected: !item.isSelected } : item
    ));
  };

  const handleCompleteAll = () => {
    const completedItems = items.map(item => ({
      ...item,
      sentQuantity: item.requestedQuantity,
      isComplete: true
    }));

    onComplete(order!.id, completedItems);
    
    toast({
      title: "Pedido marcado como listo",
      description: `Pedido ${order!.id} completado exitosamente`,
    });

    onClose();
  };

  const handlePartialCompletion = () => {
    const selectedItems = items.filter(item => item.isSelected);
    const incompleteItems = items.filter(item => !item.isComplete && item.sentQuantity < item.requestedQuantity);

    if (incompleteItems.length > 0) {
      setShowIncompleteConfirm(true);
    } else {
      completeSelectedItems(selectedItems);
    }
  };

  const completeSelectedItems = (completedItems: ItemCompletion[], createNewOrder = false) => {
    const incompleteItems = items.filter(item => item.sentQuantity < item.requestedQuantity);

    onComplete(order!.id, completedItems, createNewOrder ? incompleteItems : undefined);

    if (createNewOrder && incompleteItems.length > 0) {
      toast({
        title: "Pedido parcialmente completado",
        description: `Nueva orden creada para ${incompleteItems.length} productos faltantes. Fecha estimada: ${getCompletionDate()}`,
      });
    } else {
      toast({
        title: "Pedido completado",
        description: "Productos seleccionados marcados como listos",
      });
    }

    setShowIncompleteConfirm(false);
    onClose();
  };

  if (!order) return null;

  const selectedItems = items.filter(item => item.isSelected);
  const hasIncompleteItems = items.some(item => item.sentQuantity < item.requestedQuantity);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-green-600" />
              Completar Pedido: {order.id}
            </DialogTitle>
            <DialogDescription>
              Cliente: {order.customerName} • Selecciona el método de completación
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Modo de completación */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Método de Completación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setCompletionMode('complete')}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      completionMode === 'complete' 
                        ? 'border-green-500 bg-green-50' 
                        : 'border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <span className="font-medium">Pedido Completo</span>
                    </div>
                    <p className="text-sm text-stone-600">
                      Marcar todo el pedido como listo y completo
                    </p>
                  </button>

                  <button
                    onClick={() => setCompletionMode('partial')}
                    className={`p-4 border rounded-lg text-left transition-all ${
                      completionMode === 'partial' 
                        ? 'border-amber-500 bg-amber-50' 
                        : 'border-stone-300 hover:border-stone-400'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="h-5 w-5 text-amber-600" />
                      <span className="font-medium">Completación Parcial</span>
                    </div>
                    <p className="text-sm text-stone-600">
                      Seleccionar productos y editar cantidades
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Lista de productos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Productos del Pedido</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      {completionMode === 'partial' && (
                        <Checkbox
                          checked={item.isSelected}
                          onCheckedChange={() => toggleItemSelection(index)}
                        />
                      )}
                      
                      <div className="flex-1">
                        <p className="font-medium text-stone-800">{item.product}</p>
                        <p className="text-sm text-stone-600">S/ {item.price.toFixed(2)} c/u</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Solicitado:</Label>
                        <span className="text-sm font-medium">{item.requestedQuantity}</span>
                      </div>

                      {completionMode === 'partial' ? (
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Enviado:</Label>
                          <Input
                            type="number"
                            min="0"
                            max={item.requestedQuantity}
                            value={item.sentQuantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                            className="w-20 text-center"
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Label className="text-sm">Enviado:</Label>
                          <span className="text-sm font-medium text-green-600">{item.requestedQuantity}</span>
                        </div>
                      )}

                      {completionMode === 'partial' && (
                        <div className="flex items-center">
                          {item.isComplete ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Resumen */}
            {completionMode === 'partial' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-stone-600">Productos seleccionados:</p>
                      <p className="font-medium">{selectedItems.length} de {items.length}</p>
                    </div>
                    <div>
                      <p className="text-stone-600">Productos incompletos:</p>
                      <p className="font-medium text-amber-600">
                        {items.filter(item => item.sentQuantity < item.requestedQuantity).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="flex gap-3">
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            
            {completionMode === 'complete' ? (
              <Button onClick={handleCompleteAll} className="bg-green-500 hover:bg-green-600">
                <CheckCircle className="h-4 w-4 mr-2" />
                Marcar Todo como Listo
              </Button>
            ) : (
              <Button 
                onClick={handlePartialCompletion}
                disabled={selectedItems.length === 0}
                className="bg-amber-500 hover:bg-amber-600"
              >
                <ArrowRight className="h-4 w-4 mr-2" />
                Completar Seleccionados
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para productos incompletos */}
      <Dialog open={showIncompleteConfirm} onOpenChange={setShowIncompleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600" />
              Productos Faltantes Detectados
            </DialogTitle>
            <DialogDescription>
              Algunos productos no se enviaron en su totalidad
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800 mb-2">
                <strong>Productos incompletos encontrados:</strong>
              </p>
              <ul className="text-xs text-amber-700 space-y-1">
                {items.filter(item => item.sentQuantity < item.requestedQuantity).map((item, index) => (
                  <li key={index}>
                    • {item.product}: faltan {item.requestedQuantity - item.sentQuantity} unidades
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-sm text-stone-600">
              ¿Deseas emitir una nueva orden de pedido para los productos faltantes?
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>Si aceptas:</strong> Se creará una nueva orden que se completará el{' '}
                <span className="font-medium">{getCompletionDate()}</span>
                <br />
                <span className="text-xs">(3-4 días hábiles, no incluye sábados ni domingos)</span>
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => {
                const selectedItems = items.filter(item => item.isSelected);
                completeSelectedItems(selectedItems, false);
              }}
            >
              No, solo completar parcial
            </Button>
            <Button 
              onClick={() => {
                const selectedItems = items.filter(item => item.isSelected);
                completeSelectedItems(selectedItems, true);
              }}
              className="bg-blue-500 hover:bg-blue-600"
            >
              Sí, crear nueva orden
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};