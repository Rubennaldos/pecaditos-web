
import { useState } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Tag, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { appConfig } from '@/data/mockData';

/**
 * CARRITO STICKY
 * 
 * Carrito siempre visible que muestra:
 * - Lista de productos agregados
 * - Cantidades con controles +/-
 * - Subtotal, descuentos, total
 * - Código de descuento
 * - Barra de progreso para descuentos
 * - Botón de checkout (solo si cumple mínimo)
 * 
 * En desktop: panel fijo a la derecha
 * En móvil: flotante colapsable
 */

export const StickyCart = () => {
  const {
    items,
    updateQuantity,
    removeItem,
    subtotal,
    discount,
    total,
    totalItems,
    isMinimumMet,
    discountCode,
    setDiscountCode,
    applyDiscountCode
  } = useCart();

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showDiscountInput, setShowDiscountInput] = useState(false);

  // Calcular progreso hacia próximo descuento
  const getDiscountProgress = () => {
    if (totalItems >= 12) {
      return { progress: 100, message: '¡10% de descuento aplicado!' };
    } else if (totalItems >= 6) {
      const remaining = 12 - totalItems;
      return { 
        progress: 75, 
        message: `Agrega ${remaining} más para 10% de descuento` 
      };
    } else {
      const remaining = 6 - totalItems;
      const progress = (totalItems / 6) * 50;
      return { 
        progress, 
        message: `Agrega ${remaining} más para 5% de descuento` 
      };
    }
  };

  const discountProgress = getDiscountProgress();

  if (items.length === 0) {
    return (
      <div className="lg:sticky lg:top-24">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6 text-center">
            <ShoppingCart className="h-12 w-12 text-stone-300 mx-auto mb-4" />
            <h3 className="font-semibold text-stone-800 mb-2">Tu carrito está vacío</h3>
            <p className="text-stone-600 text-sm">
              Agrega algunos productos deliciosos para comenzar
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      {/* Carrito Desktop */}
      <div className="hidden lg:block lg:sticky lg:top-24">
        <Card className="bg-white shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Tu Carrito ({totalItems})
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 pt-0 max-h-96 overflow-y-auto">
            <CartContent 
              items={items}
              updateQuantity={updateQuantity}
              removeItem={removeItem}
              subtotal={subtotal}
              discount={discount}
              total={total}
              isMinimumMet={isMinimumMet}
              discountCode={discountCode}
              setDiscountCode={setDiscountCode}
              applyDiscountCode={applyDiscountCode}
              discountProgress={discountProgress}
              showDiscountInput={showDiscountInput}
              setShowDiscountInput={setShowDiscountInput}
            />
          </CardContent>
        </Card>
      </div>

      {/* Carrito Móvil Flotante */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Card className="bg-white shadow-xl w-80 max-w-[calc(100vw-2rem)]">
          <CardHeader 
            className="pb-2 cursor-pointer"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <span>Carrito ({totalItems})</span>
              </div>
              {isCollapsed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </CardTitle>
          </CardHeader>
          
          {!isCollapsed && (
            <CardContent className="p-4 pt-0 max-h-80 overflow-y-auto">
              <CartContent 
                items={items}
                updateQuantity={updateQuantity}
                removeItem={removeItem}
                subtotal={subtotal}
                discount={discount}
                total={total}
                isMinimumMet={isMinimumMet}
                discountCode={discountCode}
                setDiscountCode={setDiscountCode}
                applyDiscountCode={applyDiscountCode}
                discountProgress={discountProgress}
                showDiscountInput={showDiscountInput}
                setShowDiscountInput={setShowDiscountInput}
              />
            </CardContent>
          )}
        </Card>
      </div>
    </>
  );
};

// Componente separado para el contenido del carrito
const CartContent = ({ 
  items, 
  updateQuantity, 
  removeItem, 
  subtotal, 
  discount, 
  total, 
  isMinimumMet,
  discountCode,
  setDiscountCode,
  applyDiscountCode,
  discountProgress,
  showDiscountInput,
  setShowDiscountInput
}: any) => {
  return (
    <>
      {/* Lista de productos */}
      <div className="space-y-3 mb-4">
        {items.map((item: any) => (
          <div key={item.product.id} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
            <div className="flex-1">
              <h4 className="font-medium text-sm text-stone-800 line-clamp-1">
                {item.product.name}
              </h4>
              <p className="text-xs text-stone-600">
                S/ {item.product.price.toFixed(2)} c/u
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                className="h-6 w-6 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <span className="font-medium min-w-[1.5rem] text-center text-sm">
                {item.quantity}
              </span>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                className="h-6 w-6 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(item.product.id)}
                className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Barra de progreso para descuentos */}
      <div className="mb-4 p-3 bg-amber-50 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-medium text-amber-700">
            Progreso de descuento
          </span>
          <span className="text-xs text-amber-600">
            {discountProgress.progress.toFixed(0)}%
          </span>
        </div>
        <div className="w-full bg-amber-200 rounded-full h-2 mb-2">
          <div 
            className="bg-amber-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${discountProgress.progress}%` }}
          />
        </div>
        <p className="text-xs text-amber-700">
          {discountProgress.message}
        </p>
      </div>

      {/* Código de descuento */}
      <div className="mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDiscountInput(!showDiscountInput)}
          className="text-stone-600 hover:text-stone-800 p-0 h-auto font-normal"
        >
          <Tag className="h-3 w-3 mr-1" />
          ¿Tienes un código de descuento?
        </Button>
        
        {showDiscountInput && (
          <div className="mt-2 flex gap-2">
            <Input
              type="text"
              placeholder="Código de descuento"
              value={discountCode}
              onChange={(e) => setDiscountCode(e.target.value)}
              className="text-sm"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={applyDiscountCode}
              disabled={!discountCode.trim()}
            >
              Aplicar
            </Button>
          </div>
        )}
      </div>

      {/* Resumen de precios */}
      <div className="space-y-2 mb-4 pt-4 border-t border-stone-200">
        <div className="flex justify-between text-sm">
          <span className="text-stone-600">Subtotal:</span>
          <span className="text-stone-800">S/ {subtotal.toFixed(2)}</span>
        </div>
        
        {discount > 0 && (
          <div className="flex justify-between text-sm">
            <span className="text-green-600">Descuento:</span>
            <span className="text-green-600">-S/ {discount.toFixed(2)}</span>
          </div>
        )}
        
        <div className="flex justify-between font-semibold text-lg pt-2 border-t border-stone-200">
          <span className="text-stone-800">Total:</span>
          <span className="text-stone-800">S/ {total.toFixed(2)}</span>
        </div>
      </div>

      {/* Mensaje de pedido mínimo */}
      {!isMinimumMet && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700 font-medium">
            Pedido mínimo: S/ {appConfig.minOrderAmount.toFixed(2)}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Agrega S/ {(appConfig.minOrderAmount - total).toFixed(2)} más para continuar
          </p>
        </div>
      )}

      {/* Aviso de delivery */}
      <div className="mb-4 p-2 bg-blue-50 rounded-lg">
        <p className="text-xs text-blue-700">
          📍 No hay delivery gratis. El costo de envío se calculará según tu dirección.
        </p>
      </div>

      {/* Botón de checkout */}
      <Button
        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold"
        disabled={!isMinimumMet}
        onClick={() => {
          // TODO: Implementar navegación al checkout
          alert('Próximamente: Checkout y formulario de entrega');
        }}
      >
        {isMinimumMet ? 'Continuar compra' : 'Pedido mínimo no alcanzado'}
      </Button>
    </>
  );
};
