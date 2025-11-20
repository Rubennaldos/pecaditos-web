// src/components/wholesale/WholesaleStickyCart.tsx
import { useState } from 'react';
import {
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Tag,
  AlertCircle,
  ArrowRight,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';
import { toast } from '@/components/ui/use-toast';
import { WholesaleCheckout } from './WholesaleCheckout';

// Motor de precios por volumen
import { computeLine, type QtyDiscount } from '@/lib/wholesale/pricing';

// Helpers para leer campos opcionales sin romper tipos
function stepOf(prod: any): number {
  const step = Number(prod?.minMultiple ?? prod?.minOrder ?? 6);
  return Math.max(1, step || 1);
}
function discountsOf(prod: any): QtyDiscount[] {
  const arr = prod?.qtyDiscounts;
  return Array.isArray(arr) ? (arr as QtyDiscount[]) : [];
}
function baseUnitOf(prod: any): number {
  const base = Number(prod?.wholesalePrice ?? prod?.price ?? 0);
  return base > 0 ? base : 0;
}

interface WholesaleStickyCartProps {
  isCompact?: boolean;
}

export const WholesaleStickyCart = ({ isCompact = false }: WholesaleStickyCartProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [showCheckout, setShowCheckout] = useState(false);

  const {
    items,
    subtotal,
    totalDiscount,
    finalTotal,
    itemCount,
    isMinimumMet,
    minimumAmount,
    updateQuantity,
    removeItem,
    applyDiscountCode,
    discountCode,
    additionalDiscount,
  } = useWholesaleCart();

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity < 0) return;

    const item = items.find((i) => i.product.id === productId);
    const step = stepOf(item?.product as any);

    if (newQuantity > 0 && (newQuantity < step || newQuantity % step !== 0)) {
      toast({
        title: 'Cantidad no válida',
        description: `La cantidad debe ser múltiplo de ${step} (mínimo ${step})`,
        variant: 'destructive',
      });
      return;
    }
    updateQuantity(productId, newQuantity);
  };

  const handleApplyDiscountCode = () => {
    if (!discountCodeInput.trim()) {
      toast({
        title: 'Código requerido',
        description: 'Por favor ingresa un código de descuento',
        variant: 'destructive',
      });
      return;
    }
    const success = applyDiscountCode(discountCodeInput.toUpperCase());
    if (success) {
      toast({
        title: '¡Código aplicado!',
        description: `Descuento ${discountCodeInput.toUpperCase()} aplicado correctamente`,
      });
      setDiscountCodeInput('');
    } else {
      toast({
        title: 'Código no válido',
        description: 'El código ingresado no es válido o ha expirado',
        variant: 'destructive',
      });
    }
  };

  const handleProceedToCheckout = () => {
    if (!isMinimumMet) {
      toast({
        title: 'Pedido mínimo no alcanzado',
        description: `Necesitas S/ ${(minimumAmount - finalTotal).toFixed(2)} más para completar el pedido mínimo`,
        variant: 'destructive',
      });
      return;
    }
    if (itemCount === 0) {
      toast({
        title: 'Carrito vacío',
        description: 'Agrega productos antes de continuar',
        variant: 'destructive',
      });
      return;
    }
    setShowCheckout(true);
    setIsExpanded(false);
  };

  const remainingForMinimum = Math.max(0, minimumAmount - finalTotal);
  const progressPercentage = Math.min(100, (finalTotal / minimumAmount) * 100);

  // ======== BOTÓN FLOTANTE CIRCULAR COMPACTO ========
  return (
    <>
      {/* Botón flotante circular */}
      <button
        onClick={() => setIsExpanded(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-full shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 hover:scale-110 active:scale-95 flex items-center justify-center group"
      >
        <ShoppingCart className="h-7 w-7 text-white" />
        {itemCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-7 w-7 flex items-center justify-center shadow-lg animate-bounce">
            {itemCount}
          </span>
        )}
        {/* Pulso animado */}
        <span className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></span>
      </button>

      {/* Modal expandido */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header con gradiente */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-500 to-blue-600 p-4 flex justify-between items-center z-10">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Carrito Mayorista
              </h2>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsExpanded(false)} 
                className="h-8 w-8 p-0 text-white hover:bg-white/20"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Contenido scrolleable */}
            <div className="p-4 space-y-4 max-h-[calc(90vh-12rem)] overflow-y-auto">
              {/* Alerta de pedido mínimo */}
              {!isMinimumMet && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800 mb-1">
                        Pedido mínimo: S/ {minimumAmount.toFixed(2)}
                      </p>
                      <p className="text-sm text-amber-700">
                        Faltan S/ {remainingForMinimum.toFixed(2)} para continuar
                      </p>
                      <div className="mt-2">
                        <div className="w-full bg-amber-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Lista de productos */}
              {items.length > 0 ? (
                <div className="space-y-3">
                  {items.map((item) => {
                    const prod: any = item.product;
                    const step = stepOf(prod);
                    const base = baseUnitOf(prod);
                    const discounts = discountsOf(prod);
                    const { unit, total, savings } = computeLine(base, discounts, item.quantity);

                    return (
                      <div key={item.product.id} className="flex gap-3 p-3 bg-stone-50 rounded-lg hover:bg-stone-100 transition-colors">
                        <img
                          src={prod.image}
                          alt={prod.name}
                          className="w-16 h-16 object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-stone-800 truncate">{prod.name}</h4>
                          <p className="text-xs text-stone-500 mb-1">
                            {item.quantity} {prod.unit || 'und'}
                          </p>

                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-bold text-blue-600">S/ {unit.toFixed(2)}</span>
                            {savings > 0 && (
                              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 bg-green-100 text-green-700">
                                -{((savings / base) * 100).toFixed(0)}%
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity - step)}
                              className="h-7 w-7 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm min-w-[40px] text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(item.product.id, item.quantity + step)}
                              className="h-7 w-7 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.product.id)}
                              className="h-7 w-7 p-0 ml-auto text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-stone-800">S/ {total.toFixed(2)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 text-stone-400">
                  <ShoppingCart className="h-16 w-16 mx-auto mb-3 opacity-20" />
                  <p className="text-base font-medium">Carrito vacío</p>
                  <p className="text-sm text-stone-400">Agrega productos para empezar tu pedido mayorista</p>
                </div>
              )}

              {/* Código de descuento */}
              {items.length > 0 && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Código de descuento"
                      value={discountCodeInput}
                      onChange={(e) => setDiscountCodeInput(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleApplyDiscountCode} size="sm" variant="outline">
                      <Tag className="h-4 w-4 mr-2" />
                      Aplicar
                    </Button>
                  </div>

                  {discountCode && (
                    <div className="flex items-center justify-between text-sm bg-green-50 border border-green-200 rounded-lg p-3">
                      <span className="text-green-800 font-medium">Código: {discountCode}</span>
                      <span className="text-green-600">-{(additionalDiscount * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
              )}

              {/* Resumen de totales */}
              {items.length > 0 && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-base">
                    <span className="text-stone-600">Subtotal:</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>

                  {totalDiscount > 0 && (
                    <div className="flex justify-between text-base">
                      <span className="text-green-600">Descuentos:</span>
                      <span className="text-green-600">-S/ {totalDiscount.toFixed(2)}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-xl font-bold border-t pt-2">
                    <span>Total:</span>
                    <span className="text-blue-600">S/ {finalTotal.toFixed(2)}</span>
                  </div>

                  <p className="text-xs text-stone-500 text-center">
                    * Precios mayoristas incluyen descuentos por volumen
                  </p>
                </div>
              )}

              {/* Botón de checkout */}
              <Button
                onClick={handleProceedToCheckout}
                disabled={!isMinimumMet || items.length === 0}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3"
              >
                <ArrowRight className="h-5 w-5 mr-2" />
                {items.length === 0
                  ? 'Carrito vacío'
                  : !isMinimumMet
                  ? `Faltan S/ ${remainingForMinimum.toFixed(2)}`
                  : 'Continuar Pedido'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Checkout */}
      <WholesaleCheckout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
    </>
  );
};
