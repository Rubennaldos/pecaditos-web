// src/components/orders/QuickOrderModal.tsx
import { useState, useEffect, useRef } from 'react';
import { X, Plus, Minus, Trash2, ShoppingCart, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';
import { ref, onValue } from 'firebase/database';
import { db } from '@/config/firebase';
import { createOrder } from '@/services/firebaseService';
import { computeLine, type QtyDiscount } from '@/lib/wholesale/pricing';

type Product = {
  id: string;
  name: string;
  wholesalePrice: number;
  minMultiple: number;
  unit: string;
  imageUrl?: string;
  stock?: number;
  qtyDiscounts?: QtyDiscount[];
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

const CART_STORAGE_KEY = 'quickOrderCart';

export const QuickOrderModal = ({ isOpen, onClose, clientData, onOrderCreated }: Props) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isEnteringQuantity, setIsEnteringQuantity] = useState(false);
  const [tempQuantity, setTempQuantity] = useState('');
  const selectedProductRef = useRef<HTMLDivElement>(null);

  // Cargar carrito persistido al abrir el modal
  useEffect(() => {
    if (!isOpen) return;

    try {
      const savedCart = localStorage.getItem(`${CART_STORAGE_KEY}_${clientData.ruc}`);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (parsed.items && Array.isArray(parsed.items) && parsed.items.length > 0) {
          setOrderItems(parsed.items);
          toast({
            title: 'Carrito recuperado',
            description: `${parsed.items.length} producto(s) en tu carrito`,
          });
        }
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
  }, [isOpen, clientData.ruc]);

  // Guardar carrito cuando cambia
  useEffect(() => {
    if (orderItems.length > 0 && clientData.ruc) {
      try {
        localStorage.setItem(`${CART_STORAGE_KEY}_${clientData.ruc}`, JSON.stringify({
          items: orderItems,
          timestamp: Date.now()
        }));
      } catch (error) {
        console.error('Error guardando carrito:', error);
      }
    }
  }, [orderItems, clientData.ruc]);

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
          qtyDiscounts: Array.isArray(p.qtyDiscounts) ? p.qtyDiscounts : [],
        }))
        .filter((p) => p.wholesalePrice > 0 && p.name);

      setProducts(productList);
    });

    return () => unsubscribe();
  }, [isOpen]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Resetear índice cuando cambian los productos filtrados
  useEffect(() => {
    setSelectedIndex(0);
    setIsEnteringQuantity(false);
    setTempQuantity('');
  }, [searchTerm, products]);

  // Scroll automático al producto seleccionado
  useEffect(() => {
    if (selectedProductRef.current) {
      selectedProductRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  // Manejo de teclas de navegación
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Si estamos ingresando cantidad
      if (isEnteringQuantity) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirmQuantity();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setIsEnteringQuantity(false);
          setTempQuantity('');
        } else if (e.key >= '0' && e.key <= '9') {
          e.preventDefault();
          setTempQuantity(prev => prev + e.key);
        } else if (e.key === 'Backspace') {
          e.preventDefault();
          setTempQuantity(prev => prev.slice(0, -1));
        }
        return;
      }

      // Navegación con flechas
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredProducts.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 2, filteredProducts.length - 1));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 2, 0));
      } else if (e.key === 'Enter' && filteredProducts.length > 0) {
        e.preventDefault();
        const product = filteredProducts[selectedIndex];
        if (product) {
          setIsEnteringQuantity(true);
          setTempQuantity(String(product.minMultiple));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isEnteringQuantity, selectedIndex, filteredProducts, tempQuantity]);

  const handleConfirmQuantity = () => {
    const product = filteredProducts[selectedIndex];
    if (!product) return;

    const qty = parseInt(tempQuantity) || product.minMultiple;

    // Validar múltiplos
    if (qty < product.minMultiple) {
      toast({
        title: 'Cantidad mínima',
        description: `La cantidad mínima es ${product.minMultiple} unidades`,
        variant: 'destructive',
      });
      return;
    }

    if (qty % product.minMultiple !== 0) {
      toast({
        title: 'Múltiplos requeridos',
        description: `La cantidad debe ser múltiplo de ${product.minMultiple}`,
        variant: 'destructive',
      });
      return;
    }

    // Agregar al carrito con precio calculado según cantidad
    const { unit: calculatedPrice } = computeLine(
      product.wholesalePrice,
      product.qtyDiscounts || [],
      qty
    );

    const existing = orderItems.find((item) => item.productId === product.id);
    if (existing) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: qty, price: calculatedPrice }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          price: calculatedPrice,
          unit: product.unit,
        },
      ]);
    }

    toast({
      title: 'Producto agregado',
      description: `${qty} ${product.unit} de ${product.name}`,
    });

    setIsEnteringQuantity(false);
    setTempQuantity('');
    setQuantities({ ...quantities, [product.id]: product.minMultiple });
  };

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

    // Calcular precio con descuentos por cantidad
    const { unit: calculatedPrice } = computeLine(
      product.wholesalePrice,
      product.qtyDiscounts || [],
      qty
    );

    // Verificar si ya existe
    const existing = orderItems.find((item) => item.productId === product.id);
    if (existing) {
      setOrderItems(
        orderItems.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: qty, price: calculatedPrice }
            : item
        )
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          productId: product.id,
          productName: product.name,
          quantity: qty,
          price: calculatedPrice,
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
      // ✅ USAR FUNCIÓN CENTRALIZADA createOrder (Profesionalizado)
      // Esto garantiza:
      // - Correlativo correcto (ORD-001, ORD-002, etc.)
      // - Facturación electrónica automática
      // - Reindexación en ordersByStatus
      // - Inicialización de billing
      
      const orderData = {
        client: {
          ruc: clientData.ruc || '',
          legalName: clientData.legalName || '',
          commercialName: clientData.commercialName || '',
        },
        customerAddress: clientData.address || '',
        customerPhone: clientData.phone || '',
        customerName: clientData.commercialName || clientData.legalName || 'Cliente',
        items: orderItems.map((item) => ({
          product: item.productName,
          name: item.productName,
          quantity: item.quantity,
          price: item.price,
        })),
        total: calculateTotal(),
        notes: 'Pedido rápido',
        paymentMethod: 'Por definir',
      };

      // Llamar a la función centralizada
      const createdOrder = await createOrder(orderData as any, {
        channel: 'quick', // Identificar que viene de pedido rápido
      });

      toast({
        title: '¡Pedido creado!',
        description: `Orden ${createdOrder.orderNumber} registrada exitosamente`,
      });

      // Limpiar carrito del localStorage
      if (clientData.ruc) {
        localStorage.removeItem(`${CART_STORAGE_KEY}_${clientData.ruc}`);
      }

      onOrderCreated(createdOrder.id, createdOrder.orderNumber);
      
      // Limpiar y cerrar
      setOrderItems([]);
      setQuantities({});
      setSearchTerm('');
      onClose();
    } catch (error) {
      console.error('Error al crear pedido:', error);
      toast({
        title: 'Error',
        description: 'No se pudo crear el pedido. Intenta nuevamente.',
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

        {/* Indicador de ingreso de cantidad */}
        {isEnteringQuantity && filteredProducts[selectedIndex] && (
          <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
              <h3 className="text-lg font-bold text-stone-800 mb-2">
                {filteredProducts[selectedIndex].name}
              </h3>
              <p className="text-sm text-stone-600 mb-4">
                Ingresa la cantidad (Mínimo: {filteredProducts[selectedIndex].minMultiple})
              </p>
              <div className="flex items-center gap-3 mb-4">
                <Input
                  type="text"
                  value={tempQuantity}
                  readOnly
                  className="text-3xl font-bold text-center h-16"
                  placeholder="0"
                />
                <span className="text-lg text-stone-600">
                  {filteredProducts[selectedIndex].unit}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={handleConfirmQuantity}
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Confirmar (Enter)
                </Button>
                <Button
                  onClick={() => {
                    setIsEnteringQuantity(false);
                    setTempQuantity('');
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Cancelar (Esc)
                </Button>
              </div>
              <p className="text-xs text-stone-500 mt-3 text-center">
                Usa el teclado numérico para ingresar la cantidad
              </p>
            </div>
          </div>
        )}

        <div className="flex h-[calc(90vh-8rem)]">
          {/* Panel Izquierdo - Productos */}
          <div className="w-2/3 border-r flex flex-col">
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

            {/* Guía de teclas */}
            <div className="px-4 py-2 bg-blue-50 border-b border-blue-100">
              <div className="flex items-center gap-4 text-xs text-blue-700">
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 bg-white rounded border">↑↓←→</kbd>
                  Navegar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 bg-white rounded border">Enter</kbd>
                  Seleccionar
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 bg-white rounded border">0-9</kbd>
                  Cantidad
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-2 py-0.5 bg-white rounded border">Esc</kbd>
                  Cancelar
                </span>
              </div>
            </div>

            <ScrollArea className="h-[calc(90vh-16rem)]">
              <div className="p-4 grid grid-cols-2 gap-3">
                {filteredProducts.map((product, index) => {
                  const qty = quantities[product.id] || product.minMultiple;
                  const isSelected = index === selectedIndex;
                  
                  // Calcular precio con descuentos
                  const { unit: pricePerUnit, discountPct } = computeLine(
                    product.wholesalePrice,
                    product.qtyDiscounts || [],
                    qty
                  );
                  
                  return (
                    <div
                      key={product.id}
                      ref={isSelected ? selectedProductRef : null}
                      className={`border rounded-lg p-3 bg-white transition-all ${
                        isSelected
                          ? 'ring-2 ring-blue-500 shadow-lg scale-105 bg-blue-50'
                          : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedIndex(index)}
                    >
                      <h4 className={`font-semibold text-sm mb-1 line-clamp-2 ${
                        isSelected ? 'text-blue-700' : 'text-stone-800'
                      }`}>
                        {product.name}
                      </h4>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex flex-col">
                          <span className={`text-lg font-bold ${
                            isSelected ? 'text-blue-600' : 'text-blue-600'
                          }`}>
                            S/ {pricePerUnit.toFixed(2)}
                          </span>
                          {discountPct > 0 && (
                            <span className="text-xs text-green-600 font-semibold">
                              {discountPct}% desc.
                            </span>
                          )}
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          Mín: {product.minMultiple}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustQuantity(product.id, -1, product.minMultiple);
                          }}
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
                          onClick={(e) => e.stopPropagation()}
                          className="h-7 text-center w-16 text-sm"
                          min={product.minMultiple}
                          step={product.minMultiple}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            adjustQuantity(product.id, 1, product.minMultiple);
                          }}
                          className="h-7 w-7 p-0"
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>

                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToOrder(product);
                        }}
                        className={`w-full ${
                          isSelected
                            ? 'bg-blue-600 hover:bg-blue-700'
                            : 'bg-blue-500 hover:bg-blue-600'
                        }`}
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
