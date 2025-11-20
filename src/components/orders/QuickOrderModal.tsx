// src/components/orders/QuickOrderModal.tsx
import { useState, useEffect } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ref, onValue, push, set, update } from 'firebase/database';
import { db } from '@/config/firebase';

type Product = {
  id: string;
  name: string;
  wholesalePrice: number;
  minMultiple: number;
  unit: string;
  imageUrl?: string;
  stock?: number;
};

type OrderItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  unit: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  clientData: {
    ruc?: string;
    legalName?: string;
    commercialName?: string;
    address?: string;
    phone?: string;
  };
  onOrderCreated: (orderId: string, orderNumber: string) => void;
};

export const QuickOrderModal = ({ isOpen, onClose, clientData, onOrderCreated }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  // Cargar productos del catálogo
  useEffect(() => {
    if (!isOpen) return;

    const productsRef = ref(db, 'catalog/products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setProducts([]);
        return;
      }

      const productList: Product[] = Object.entries(data)
        .map(([id, p]: [string, any]) => ({
          id,
          name: p.name || '',
          wholesalePrice: p.wholesalePrice || 0,
          minMultiple: p.minMultiple || 6,
          unit: p.unit || 'und',
          imageUrl: p.imageUrl,
          stock: p.stock,
        }))
        .filter((p) => p.wholesalePrice > 0 && p.name);

      setProducts(productList);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuantityChange = (productId: string, value: string, minMultiple: number) => {
    const num = parseInt(value) || 0;
    
    if (num === 0) {
      setQuantities({ ...quantities, [productId]: 0 });
      return;
    }

    // Validar múltiplos
    if (num < minMultiple) {
      toast({
        title: 'Cantidad mínima',
        description: `La cantidad mínima es ${minMultiple} unidades`,
        variant: 'destructive',
      });
      return;
    }

    if (num % minMultiple !== 0) {
      toast({
        title: 'Múltiplos requeridos',
        description: `La cantidad debe ser múltiplo de ${minMultiple}`,
        variant: 'destructive',
      });
      return;
    }

    setQuantities({ ...quantities, [productId]: num });
  };

  const adjustQuantity = (productId: string, delta: number, minMultiple: number) => {
    const current = quantities[productId] || minMultiple;
    const newQty = Math.max(0, current + delta * minMultiple);
    
    if (newQty === 0) {
      setQuantities({ ...quantities, [productId]: 0 });
    } else {
      setQuantities({ ...quantities, [productId]: newQty });
    }
  };

  const addToOrder = (product: Product) => {
    const qty = quantities[product.id] || product.minMultiple;

    if (qty < product.minMultiple) {
      toast({
        title: 'Cantidad insuficiente',
        description: `Mínimo ${product.minMultiple} ${product.unit}`,
        variant: 'destructive',
      });
      return;
    }

    // Verificar si ya existe
    const existing = orderItems.find((item) => item.productId === product.id);
    if (existing) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.id ? { ...item, quantity: qty } : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          price: product.wholesalePrice,
          unit: product.unit,
        },
      ]);
    }

    toast({
      title: 'Producto agregado',
      description: `${qty} ${product.unit} de ${product.name}`,
    });

    setQuantities({ ...quantities, [product.id]: product.minMultiple });
  };

  const removeFromOrder = (productId: string) => {
    setOrderItems(orderItems.filter((item) => item.productId !== productId));
  };

  const calculateTotal = () => {
    return orderItems.reduce((sum, item) => sum + item.quantity * item.price, 0);
  };

  const handleCreateOrder = async () => {
    if (orderItems.length === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'Agrega al menos un producto',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Crear pedido en Firebase
      const ordersRef = ref(db, 'orders');
      const newOrderRef = push(ordersRef);

      const orderData = {
        status: 'pendiente',
        createdAt: new Date().toISOString(),
        client: {
          ruc: clientData.ruc || '',
          legalName: clientData.legalName || '',
          commercialName: clientData.commercialName || '',
        },
        customerAddress: clientData.address || '',
        customerPhone: clientData.phone || '',
        items: orderItems.map((item) => ({
          product: item.productName,
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        total: calculateTotal(),
        notes: 'Pedido rápido',
      };

      await set(newOrderRef, orderData);

      // Generar número de orden
      const orderNumber = `ORD-${String(Date.now()).slice(-6)}`;
      await update(newOrderRef, { orderNumber });

      toast({
        title: '¡Pedido creado!',
        description: `Orden ${orderNumber} registrada exitosamente`,
      });

      onOrderCreated(newOrderRef.key!, orderNumber);
      
      // Limpiar y cerrar
      setOrderItems([]);
      setQuantities({});
      setSearchTerm('');
      onClose();
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el pedido',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-blue-500 to-blue-600">
          <DialogTitle className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pedido Rápido - {clientData.commercialName || clientData.legalName || 'Cliente'}
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-[calc(90vh-8rem)]">
          {/* Panel Izquierdo - Productos */}
          <div className="w-2/3 border-r">
            <div className="p-4 border-b bg-stone-50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <Input
                  placeholder="Buscar productos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <ScrollArea className="h-[calc(90vh-14rem)]">
              <div className="p-4 grid grid-cols-2 gap-3">
                {filteredProducts.map((product) => {
                  const qty = quantities[product.id] || product.minMultiple;
                  
                  return (
                    <div
                      key={product.id}
                      className="border rounded-lg p-3 bg-white hover:shadow-md transition-shadow"
                    >
                      <h4 className="font-semibold text-sm text-stone-800 mb-1 line-clamp-2">
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-lg font-bold text-blue-600">
                          S/ {product.wholesalePrice.toFixed(2)}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          Mín: {product.minMultiple}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adjustQuantity(product.id, -1, product.minMultiple)}
                          className="h-7 w-7 p-0"
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <Input
                          type="number"
                          value={qty}
                          onChange={(e) =>
                            handleQuantityChange(product.id, e.target.value, product.minMultiple)
                          }
                          className="h-7 text-center w-16 text-sm"
                          min={product.minMultiple}
                          step={product.minMultiple}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => adjustQuantity(product.id, 1, product.minMultiple)}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => addToOrder(product)}
                        className="w-full bg-blue-500 hover:bg-blue-600"
                      >
                        Agregar
                      </Button>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Panel Derecho - Resumen del Pedido */}
          <div className="w-1/3 flex flex-col">
            <div className="p-4 border-b bg-stone-50">
              <h3 className="font-bold text-stone-800">Resumen del Pedido</h3>
              <p className="text-sm text-stone-600">{orderItems.length} productos</p>
            </div>

            <ScrollArea className="flex-1 p-4">
              {orderItems.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <ShoppingCart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p className="text-sm">No hay productos agregados</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {orderItems.map((item) => (
                    <div
                      key={item.productId}
                      className="p-3 bg-stone-50 rounded-lg border"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-sm flex-1 pr-2">{item.productName}</h4>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFromOrder(item.productId)}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-stone-600">
                          {item.quantity} {item.unit} × S/ {item.price.toFixed(2)}
                        </span>
                        <span className="font-bold text-blue-600">
                          S/ {(item.quantity * item.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            <div className="border-t p-4 bg-stone-50">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-bold">Total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  S/ {calculateTotal().toFixed(2)}
                </span>
              </div>

              <Button
                onClick={handleCreateOrder}
                disabled={orderItems.length === 0 || loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3"
              >
                {loading ? 'Procesando...' : 'Crear Pedido'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
