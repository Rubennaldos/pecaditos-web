
import { useState } from 'react';
import { ShoppingCart, X, Minus, Plus, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { appConfig } from '@/data/mockData';

export const StickyCart = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { 
    items, 
    updateQuantity, 
    removeFromCart, 
    subtotal, 
    discount, 
    total, 
    itemCount, 
    isMinimumMet,
    discountCode,
    setDiscountCode,
    nextDiscountProgress
  } = useCart();

  const handleCheckout = () => {
    if (isMinimumMet) {
      console.log('Proceder al checkout');
      // Aquí iría la lógica para ir al formulario de checkout
    }
  };

  return (
    <>
      {/* Botón flotante móvil */}
      <div className="fixed bottom-4 right-4 z-50 lg:hidden">
        <Button
          onClick={() => setIsOpen(true)}
          className="bg-amber-500 hover:bg-amber-600 text-white rounded-full shadow-lg w-14 h-14 relative"
        >
          <ShoppingCart className="h-6 w-6" />
          {itemCount > 0 && (
            <Badge className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 p-0 flex items-center justify-center text-xs">
              {itemCount}
            </Badge>
          )}
        </Button>
      </div>

      {/* Carrito sticky desktop */}
      <div className="hidden lg:block fixed right-4 top-1/2 -translate-y-1/2 z-40 w-80">
        <CartContent
          items={items}
          updateQuantity={updateQuantity}
          removeFromCart={removeFromCart}
          subtotal={subtotal}
          discount={discount}
          total={total}
          itemCount={itemCount}
          isMinimumMet={isMinimumMet}
          discountCode={discountCode}
          setDiscountCode={setDiscountCode}
          nextDiscountProgress={nextDiscountProgress}
          onCheckout={handleCheckout}
        />
      </div>

      {/* Modal móvil */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-background rounded-t-2xl p-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Tu Carrito</h2>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            <CartContent
              items={items}
              updateQuantity={updateQuantity}
              removeFromCart={removeFromCart}
              subtotal={subtotal}
              discount={discount}
              total={total}
              itemCount={itemCount}
              isMinimumMet={isMinimumMet}
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
              nextDiscountProgress={nextDiscountProgress}
              onCheckout={handleCheckout}
              onClose={() => setIsOpen(false)}
            />
          </div>
        </div>
      )}
    </>
  );
};

interface CartContentProps {
  items: any[];
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  subtotal: number;
  discount: number;
  total: number;
  itemCount: number;
  isMinimumMet: boolean;
  discountCode: string;
  setDiscountCode: (code: string) => void;
  nextDiscountProgress: any;
  onCheckout: () => void;
  onClose?: () => void;
}

const CartContent = ({
  items,
  updateQuantity,
  removeFromCart,
  subtotal,
  discount,
  total,
  itemCount,
  isMinimumMet,
  discountCode,
  setDiscountCode,
  nextDiscountProgress,
  onCheckout,
  onClose
}: CartContentProps) => {
  return (
    <Card className="w-full shadow-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center space-x-2">
            <ShoppingCart className="h-5 w-5" />
            <span>Carrito ({itemCount})</span>
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {items.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>Tu carrito está vacío</p>
          </div>
        ) : (
          <>
            {/* Lista de productos */}
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {items.map((item) => (
                <div key={item.product.id} className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm line-clamp-2">{item.product.name}</h4>
                    <p className="text-xs text-muted-foreground">S/ {item.product.price}</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-6 text-center text-sm">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <div className="text-right">
                    <p className="font-medium text-sm">S/ {(item.product.price * item.quantity).toFixed(2)}</p>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-red-500 hover:text-red-700"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* Progreso de descuento */}
            {nextDiscountProgress && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <div className="flex justify-between text-xs mb-1">
                  <span>Progreso al siguiente descuento</span>
                  <span>{nextDiscountProgress.current}/{nextDiscountProgress.next}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(nextDiscountProgress.progress, 100)}%` }}
                  />
                </div>
              </div>
            )}

            {/* Código de descuento */}
            <div className="space-y-2">
              <Input
                placeholder="Código de descuento"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Resumen de precios */}
            <div className="space-y-2 pt-3 border-t">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>S/ {subtotal.toFixed(2)}</span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Descuento:</span>
                  <span>-S/ {discount.toFixed(2)}</span>
                </div>
              )}
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t">
                <span>Total:</span>
                <span>S/ {total.toFixed(2)}</span>
              </div>
            </div>

            {/* Mensaje de pedido mínimo */}
            {!isMinimumMet && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  El pedido mínimo es de S/ {appConfig.minOrderAmount}. 
                  Te faltan S/ {(appConfig.minOrderAmount - total).toFixed(2)} para continuar.
                </p>
              </div>
            )}

            {/* Mensaje de delivery */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-xs text-blue-800 dark:text-blue-200">
                ℹ️ No hay delivery gratis. El costo de envío se calculará según tu dirección.
              </p>
            </div>

            {/* Botón checkout */}
            <Button
              className={`w-full ${isMinimumMet 
                ? 'bg-amber-500 hover:bg-amber-600' 
                : 'bg-gray-400 cursor-not-allowed'
              } text-white`}
              disabled={!isMinimumMet}
              onClick={() => {
                onCheckout();
                onClose?.();
              }}
            >
              {isMinimumMet ? (
                <>
                  Siguiente
                  <ArrowRight className="h-4 w-4 ml-2" />
                </>
              ) : (
                'Agrega más productos'
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
