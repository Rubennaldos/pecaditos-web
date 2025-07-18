import { useState } from 'react';
import { 
  Package, 
  Calendar, 
  ArrowRight, 
  X,
  ShoppingCart,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';
import { toast } from '@/components/ui/use-toast';

/**
 * MODAL REPETIR PEDIDO
 * 
 * Modal que muestra pedidos anteriores del usuario mayorista
 * y permite repetir cualquiera de ellos agregándolo al carrito
 */

interface OrderHistory {
  id: string;
  date: string;
  total: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    image: string;
  }>;
  status: 'completed' | 'pending' | 'cancelled';
}

interface RepeatOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data de pedidos anteriores
const mockOrderHistory: OrderHistory[] = [
  {
    id: "ORD-2024-001",
    date: "2024-01-15",
    total: 420.50,
    status: "completed",
    items: [
      {
        productId: "1",
        productName: "Galletas de Avena",
        quantity: 12,
        unitPrice: 15.50,
        image: "/placeholder.svg"
      },
      {
        productId: "3",
        productName: "Galletas de Chocolate",
        quantity: 18,
        unitPrice: 12.80,
        image: "/placeholder.svg"
      }
    ]
  },
  {
    id: "ORD-2024-002", 
    date: "2024-01-08",
    total: 650.00,
    status: "completed",
    items: [
      {
        productId: "2",
        productName: "Galletas Integrales",
        quantity: 24,
        unitPrice: 14.20,
        image: "/placeholder.svg"
      },
      {
        productId: "4",
        productName: "Combo Surtido",
        quantity: 12,
        unitPrice: 18.90,
        image: "/placeholder.svg"
      }
    ]
  },
  {
    id: "ORD-2023-045",
    date: "2023-12-22",
    total: 380.75,
    status: "completed", 
    items: [
      {
        productId: "1",
        productName: "Galletas de Avena",
        quantity: 18,
        unitPrice: 15.50,
        image: "/placeholder.svg"
      },
      {
        productId: "5",
        productName: "Galletas Navideñas",
        quantity: 6,
        unitPrice: 16.80,
        image: "/placeholder.svg"
      }
    ]
  }
];

export const RepeatOrderModal = ({ isOpen, onClose }: RepeatOrderModalProps) => {
  const [selectedOrder, setSelectedOrder] = useState<string | null>(null);
  const { addItem } = useWholesaleCart();

  if (!isOpen) return null;

  const handleRepeatOrder = (order: OrderHistory) => {
    setSelectedOrder(order.id);
    
    // Simular agregado de productos al carrito
    // En una implementación real, aquí buscarías los productos actuales por ID
    order.items.forEach(item => {
      // Mock: crear producto básico para agregar al carrito
      const mockProduct = {
        id: item.productId,
        name: item.productName,
        price: item.unitPrice,
        image: item.image,
        description: `Producto ${item.productName}`,
        category: 'especiales',
        available: true,
        ingredients: [],
        nutritionalInfo: { calories: 0, protein: 0, carbs: 0, fat: 0 },
        allergens: [],
        stock: 100,
        featured: false
      };
      
      addItem(mockProduct, item.quantity);
    });

    toast({
      title: "¡Pedido repetido exitosamente!",
      description: `${order.items.length} productos agregados al carrito`,
    });

    // Cerrar modal después de 1 segundo
    setTimeout(() => {
      onClose();
      setSelectedOrder(null);
    }, 1000);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completado</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pendiente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Cancelado</Badge>;
      default:
        return <Badge variant="secondary">Desconocido</Badge>;
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-stone-800 flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Repetir Pedido Anterior
          </h2>
          <button 
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-2xl font-bold"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="space-y-4">
            {mockOrderHistory.map((order) => (
              <Card 
                key={order.id} 
                className={`cursor-pointer transition-all duration-300 ${
                  selectedOrder === order.id 
                    ? 'border-green-500 bg-green-50 shadow-lg' 
                    : 'hover:shadow-md hover:border-amber-300'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-stone-800">
                          Pedido #{order.id}
                        </h3>
                        {getStatusBadge(order.status)}
                        {selectedOrder === order.id && (
                          <Badge className="bg-green-100 text-green-800 animate-pulse">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Agregando...
                          </Badge>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-stone-600 mb-3">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(order.date)}
                        </div>
                        <div className="font-semibold text-stone-800">
                          Total: S/ {order.total.toFixed(2)}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-stone-700">
                          Productos ({order.items.length}):
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white rounded border">
                              <img
                                src={item.image}
                                alt={item.productName}
                                className="w-8 h-8 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.src = '/placeholder.svg';
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium truncate">
                                  {item.productName}
                                </p>
                                <p className="text-xs text-stone-500">
                                  {item.quantity} unid. × S/ {item.unitPrice.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-auto">
                      <Button
                        onClick={() => handleRepeatOrder(order)}
                        disabled={selectedOrder === order.id || order.status === 'cancelled'}
                        className="w-full lg:w-auto bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                      >
                        {selectedOrder === order.id ? (
                          <>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Agregando...
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Repetir Este Pedido
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {mockOrderHistory.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-stone-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-stone-800 mb-2">
                No hay pedidos anteriores
              </h3>
              <p className="text-stone-600">
                Una vez realices pedidos, aparecerán aquí para que puedas repetirlos fácilmente.
              </p>
            </div>
          )}
        </div>

        <div className="bg-stone-50 px-6 py-4 border-t">
          <div className="flex justify-between items-center">
            <p className="text-sm text-stone-600">
              💡 <strong>Tip:</strong> Los pedidos repetidos se agregan a tu carrito actual
            </p>
            <Button variant="outline" onClick={onClose}>
              Cerrar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};