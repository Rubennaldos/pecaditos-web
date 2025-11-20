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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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

  // -------- BOTÓN FLOTANTE COMPACTO (CÍRCULO) - NUEVA VERSIÓN --------
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

        {isExpanded && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setIsExpanded(false)}
          >
            <div
              className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
                <h2 className="text-xl font-bold text-stone-800">Carrito Mayorista</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-4 space-y-4">
                {!isMinimumMet && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-amber-800 mb-1">Pedido mínimo: S/ {minimumAmount.toFixed(2)}</p>
                        <p className="text-sm text-amber-700">Faltan S/ {remainingForMinimum.toFixed(2)} para continuar</p>
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

                {items.length > 0 ? (
                  <div className="space-y-3">
                    {items.map((item) => {
                      const prod: any = item.product;
                      const step = stepOf(prod);
                      const base = baseUnitOf(prod);
                      const discounts = discountsOf(prod);
                      const { unit, total, savings } = computeLine(base, discounts, item.quantity);

                      return (
                        <div key={item.product.id} className="flex gap-3 p-3 bg-stone-50 rounded-lg">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-16 h-16 object-cover rounded flex-shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-stone-800">{prod.name}</h4>
                            <p className="text-xs text-stone-600 mb-2">S/ {unit.toFixed(2)} c/u</p>

                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(prod.id, item.quantity - step)}
                                  disabled={item.quantity <= step}
                                  className="h-8 w-8 p-0"
                                >
                                  <Minus className="h-4 w-4" />
                                </Button>
                                <span className="text-sm font-medium min-w-[3rem] text-center">{item.quantity}</span>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleQuantityChange(prod.id, item.quantity + step)}
                                  className="h-8 w-8 p-0"
                                >
                                  <Plus className="h-4 w-4" />
                                </Button>
                              </div>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => removeItem(prod.id)}
                                className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>

                            <div className="mt-2">
                              <p className="text-sm font-medium text-stone-800">S/ {total.toFixed(2)}</p>
                              {savings > 0 && <p className="text-xs text-green-600">Ahorro: S/ {savings.toFixed(2)}</p>}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-16 w-16 text-stone-300 mx-auto mb-4" />
                    <p className="text-lg text-stone-500 mb-2">Tu carrito está vacío</p>
                    <p className="text-sm text-stone-400">Agrega productos para empezar tu pedido mayorista</p>
                  </div>
                )}

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
                      <span>S/ {finalTotal.toFixed(2)}</span>
                    </div>

                    <p className="text-xs text-stone-500 text-center">
                      * Precios mayoristas incluyen descuentos por volumen
                    </p>
                  </div>
                )}

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

                {/* Checkout desde el modal */}
                <WholesaleCheckout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
              </div>
            </div>
          </div>
        )}

        {/* Fallback por si se abre directo */}
        <WholesaleCheckout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
      </>
    );
  }

  // -------- Sticky (desktop) --------
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;
  if (isMobile) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t-2 border-amber-300 shadow-lg lg:hidden">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <ShoppingCart className="h-6 w-6 text-amber-600" />
                {itemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center">
                    {itemCount}
                  </Badge>
                )}
              </div>
              <div>
                <p className="font-semibold text-stone-800">S/ {finalTotal.toFixed(2)}</p>
                <p className="text-xs text-stone-600">{itemCount} productos</p>
              </div>
            </div>

            <Button
              onClick={handleProceedToCheckout}
              disabled={!isMinimumMet || items.length === 0}
              className="bg-blue-500 hover:bg-blue-600 text-white"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              Continuar
            </Button>

            <WholesaleCheckout isOpen={showCheckout} onClose={() => setShowCheckout(false)} />
          </div>

          {!isMinimumMet && remainingForMinimum > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-stone-600 mb-1">
                <span>Pedido mínimo</span>
                <span>S/ {remainingForMinimum.toFixed(2)} restantes</span>
              </div>
              <div className="w-full bg-stone-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="sticky top-4">
      <Card className="w-full max-w-sm shadow-xl border-2 border-amber-200">
        <CardHeader className="cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-amber-600" />
              <span>Carrito Mayorista</span>
              {itemCount > 0 && (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  {itemCount}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm">
              {isExpanded ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </Button>
          </CardTitle>
        </CardHeader>

        {isExpanded && (
          <CardContent className="space-y-4">
            {!isMinimumMet && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium text-amber-800 mb-1">Pedido mínimo: S/ {minimumAmount.toFixed(2)}</p>
                    <p className="text-xs text-amber-700">Faltan S/ {remainingForMinimum.toFixed(2)} para continuar</p>
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

            {items.length > 0 ? (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {items.map((item) => {
                  const prod: any = item.product;
                  const step = stepOf(prod);
                  const base = baseUnitOf(prod);
                  const discounts = discountsOf(prod);
                  const { unit, total, savings } = computeLine(base, discounts, item.quantity);

                  return (
                    <div key={prod.id} className="flex gap-3 p-2 bg-stone-50 rounded-lg">
                      <img
                        src={prod.image}
                        alt={prod.name}
                        className="w-12 h-12 object-cover rounded flex-shrink-0"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-stone-800 truncate">{prod.name}</h4>
                        <p className="text-xs text-stone-600 mb-1">S/ {unit.toFixed(2)} c/u</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(prod.id, item.quantity - step)}
                              disabled={item.quantity <= step}
                              className="h-6 w-6 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-xs font-medium min-w-[2rem] text-center">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleQuantityChange(prod.id, item.quantity + step)}
                              className="h-6 w-6 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(prod.id)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>

                        <div className="mt-1">
                          <p className="text-xs font-medium text-stone-800">S/ {total.toFixed(2)}</p>
                          {savings > 0 && <p className="text-xs text-green-600">Ahorro: S/ {savings.toFixed(2)}</p>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-stone-300 mx-auto mb-2" />
                <p className="text-sm text-stone-500">Tu carrito está vacío</p>
                <p className="text-xs text-stone-400">Agrega productos para empezar tu pedido mayorista</p>
              </div>
            )}

            {items.length > 0 && (
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    placeholder="Código de descuento"
                    value={discountCodeInput}
                    onChange={(e) => setDiscountCodeInput(e.target.value)}
                    className="flex-1 h-8 text-sm"
                  />
                  <Button onClick={handleApplyDiscountCode} size="sm" variant="outline" className="h-8">
                    <Tag className="h-3 w-3" />
                  </Button>
                </div>

                {discountCode && (
                  <div className="flex items-center justify-between text-xs bg-green-50 border border-green-200 rounded-lg p-2">
                    <span className="text-green-800 font-medium">Código: {discountCode}</span>
                    <span className="text-green-600">-{(additionalDiscount * 100).toFixed(0)}%</span>
                  </div>
                )}
              </div>
            )}

            {items.length > 0 && (
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-stone-600">Subtotal:</span>
                  <span>S/ {subtotal.toFixed(2)}</span>
                </div>

                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-green-600">Descuentos:</span>
                    <span className="text-green-600">-S/ {totalDiscount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total:</span>
                  <span>S/ {finalTotal.toFixed(2)}</span>
                </div>

                <p className="text-xs text-stone-500 text-center">
                  * Precios mayoristas incluyen descuentos por volumen
                </p>
              </div>
            )}

            <Button
              onClick={handleProceedToCheckout}
              disabled={!isMinimumMet || items.length === 0}
              className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold"
            >
              <ArrowRight className="h-4 w-4 mr-2" />
              {items.length === 0
                ? 'Carrito vacío'
                : !isMinimumMet
                ? `Faltan S/ ${remainingForMinimum.toFixed(2)}`
                : 'Continuar Pedido'}
            </Button>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
