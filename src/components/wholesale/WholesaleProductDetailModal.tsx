import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus, Minus, ShoppingCart } from 'lucide-react';
import { Product } from '@/data/mockData';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';
import { toast } from '@/hooks/use-toast';
import {
  computeLine,
  nextTierInfo,
  normalizeToStep,
  type QtyDiscount,
  money,
} from '@/lib/wholesale/pricing';

interface WholesaleProductDetailModalProps {
  product: (Product & {
    minMultiple?: number;
    qtyDiscounts?: QtyDiscount[];
    wholesalePrice?: number;
    description?: string;
    imageUrl?: string;
    stock?: number;
  }) | null;
  isOpen: boolean;
  onClose: () => void;
}

export const WholesaleProductDetailModal = ({ 
  product, 
  isOpen, 
  onClose 
}: WholesaleProductDetailModalProps) => {
  if (!product) return null;

  const step = Math.max(1, Number(product.minMultiple || 6));
  const baseUnit = Number(product.wholesalePrice ?? product.price * 0.8) || 0;
  const tiers: QtyDiscount[] = Array.isArray(product.qtyDiscounts) ? product.qtyDiscounts : [];

  const [quantity, setQuantity] = useState<number>(step);
  const { addItem, updateQuantity, items } = useWholesaleCart();

  const line = useMemo(() => computeLine(baseUnit, tiers, quantity), [baseUnit, tiers, quantity]);
  const nextTier = useMemo(() => nextTierInfo(quantity, tiers), [quantity, tiers]);
  
  const existingItem = items.find((i) => i.product.id === product.id);

  const handleAddToCart = () => {
    try {
      if (existingItem) {
        updateQuantity(product.id, existingItem.quantity + quantity);
      } else {
        addItem(
          {
            ...product,
            wholesalePrice: baseUnit,
            minMultiple: step,
            qtyDiscounts: tiers,
          } as Product,
          quantity
        );
      }
      toast({
        title: "✅ ¡Agregado al carrito!",
        description: `${quantity} unidades de ${product.name}`,
        duration: 2000,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error al agregar al carrito',
        variant: 'destructive',
      });
    }
  };

  const setQtyNormalized = (raw: number) => {
    const q = Number(raw) || step;
    if (q <= 0) {
      setQuantity(step);
      return;
    }
    const normalized = normalizeToStep(q, step);
    if (normalized !== q) {
      toast({
        title: 'Cantidad ajustada',
        description: `Las cantidades deben ser múltiplos de ${step} unidades`,
      });
    }
    setQuantity(normalized);
  };

  const dec = () => setQuantity(Math.max(step, quantity - step));
  const inc = () => setQuantity(quantity + step);

  const imgSrc = (product as any).image || (product as any).imageUrl || '/placeholder.svg';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-stone-800 pr-8">
            {product.name}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Imagen del producto */}
          <div className="relative overflow-hidden bg-stone-100 rounded-lg aspect-square">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            {product.stock !== undefined && (
              <Badge className="absolute top-3 right-3 bg-stone-800 text-white">
                Stock: {product.stock}
              </Badge>
            )}
          </div>

          {/* Información detallada */}
          <div className="space-y-4">
            {/* Categoría */}
            {product.category && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-1">Categoría</h3>
                <Badge variant="secondary" className="capitalize">{product.category}</Badge>
              </div>
            )}

            {/* Descripción */}
            {product.description && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-2">Descripción</h3>
                <p className="text-stone-600 whitespace-pre-line leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Ingredientes */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-2">Ingredientes</h3>
                <div className="flex flex-wrap gap-2">
                  {product.ingredients.map((ingredient, index) => (
                    <span
                      key={index}
                      className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200"
                    >
                      {ingredient}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Precios mayoristas */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-stone-700 mb-3">Precio Mayorista</h3>
              
              <div className="bg-amber-50 p-4 rounded-lg mb-3">
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-sm text-stone-600">Precio base:</span>
                  <span className="text-xl font-bold text-stone-800">
                    {money(baseUnit)}
                  </span>
                  <span className="text-xs text-stone-500">por unidad</span>
                </div>
                
                {quantity > step && line.discountPct > 0 && (
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm text-green-600">Con descuento:</span>
                    <span className="text-2xl font-bold text-green-700">
                      {money(line.unit)}
                    </span>
                    <Badge className="bg-green-600">-{line.discountPct}%</Badge>
                  </div>
                )}
              </div>

              {/* Tabla de descuentos por volumen */}
              {tiers && tiers.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-stone-700">Descuentos por volumen:</p>
                  <div className="space-y-1">
                    {tiers.map((tier, idx) => (
                      <div key={idx} className="text-xs bg-blue-50 px-3 py-2 rounded flex justify-between items-center">
                        <span className="text-stone-700">
                          {tier.from}+ unidades
                        </span>
                        <Badge variant="outline" className="bg-white">
                          {tier.discountPct}% OFF
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Selector de cantidad y agregar */}
            <div className="pt-4 border-t space-y-3">
              <div>
                <h3 className="text-sm font-semibold text-stone-700 mb-2">Cantidad</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={dec}
                    className="h-10 w-10"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <Input
                    type="number"
                    inputMode="numeric"
                    value={quantity}
                    onChange={(e) => {
                      const v = e.target.value.trim();
                      if (v === '') {
                        setQuantity(step);
                        return;
                      }
                      const n = Number(v);
                      if (!Number.isNaN(n)) {
                        setQuantity(Math.max(step, n));
                      }
                    }}
                    onBlur={(e) => setQtyNormalized(Number(e.target.value || step))}
                    className="flex-1 text-center h-10 text-lg font-bold"
                    min={step}
                    step={step}
                  />
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={inc}
                    className="h-10 w-10 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-stone-500 mt-1 text-center">
                  Múltiplos de {step} unidades
                </p>
              </div>

              {/* Próximo descuento */}
              {nextTier && (
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    🎉 Agrega {nextTier.missing} unidades más para obtener {nextTier.discountPct}% de descuento
                  </p>
                </div>
              )}

              {/* Total */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-lg">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-sm text-stone-600">Subtotal:</span>
                  {line.discountPct > 0 ? (
                    <div className="text-right">
                      <p className="text-xs text-stone-500 line-through">
                        {money(baseUnit * quantity)}
                      </p>
                      <p className="text-2xl font-bold text-amber-700">
                        {money(line.total)}
                      </p>
                      <p className="text-xs text-green-600">
                        Ahorras {money(line.savings)}
                      </p>
                    </div>
                  ) : (
                    <span className="text-2xl font-bold text-amber-700">
                      {money(line.total)}
                    </span>
                  )}
                </div>
              </div>

              {/* Botón agregar */}
              <Button
                onClick={handleAddToCart}
                className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Agregar al carrito
              </Button>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Información importante</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Precios especiales para compras mayoristas</li>
            <li>Descuentos automáticos por volumen</li>
            <li>Pedido mínimo en múltiplos de {step} unidades</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
