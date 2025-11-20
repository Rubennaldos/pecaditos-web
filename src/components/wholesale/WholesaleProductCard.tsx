import { useState, useMemo } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Product } from '@/data/mockData';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';
import { toast } from '@/components/ui/use-toast';

// Helpers de precios/cantidades
import {
  computeLine,
  nextTierInfo,
  normalizeToStep,
  type QtyDiscount,
  money,
} from '@/lib/wholesale/pricing';

interface WholesaleProductCardProps {
  product: Product & {
    minMultiple?: number;
    qtyDiscounts?: QtyDiscount[];
    wholesalePrice?: number;
    description?: string;
    imageUrl?: string; // por si tu objeto trae imageUrl en vez de image
  };
}

export const WholesaleProductCard = ({ product }: WholesaleProductCardProps) => {
  // múltiplo del producto (por defecto 6)
  const step = Math.max(1, Number(product.minMultiple || 6));

  // precio base unitario mayorista (si no viene, 20% menos del minorista como fallback)
  const baseUnit = Number(product.wholesalePrice ?? product.price * 0.8) || 0;

  // tramos de descuento (definidos en la creación del producto)
  const tiers: QtyDiscount[] = Array.isArray(product.qtyDiscounts) ? product.qtyDiscounts : [];

  // cantidad seleccionada en la card
  const [quantity, setQuantity] = useState<number>(0);

  // carrito mayorista
  const { addItem, updateQuantity, removeItem, items } = useWholesaleCart();

  // línea calculada: unitario aplicado, %desc, total y ahorro
  const line = useMemo(() => computeLine(baseUnit, tiers, quantity), [baseUnit, tiers, quantity]);

  // próximo tramo por alcanzar (para hint)
  const nextTier = useMemo(() => nextTierInfo(quantity, tiers), [quantity, tiers]);

  // buscar si ya está en el carrito
  const existingItem = items.find((i) => i.product.id === product.id);

  // sincroniza con el carrito
  const syncCart = (qty: number) => {
    try {
      if (qty > 0) {
        if (existingItem) {
          updateQuantity(product.id, qty); // el contexto recalcula usando computeLine
        } else {
          // IMPORTANTE: pasar el producto completo (con wholesalePrice, minMultiple y qtyDiscounts)
          addItem(
            {
              ...product,
              wholesalePrice: baseUnit,
              minMultiple: step,
              qtyDiscounts: tiers,
            } as Product, // cast si tu Product no incluye opcionales
            qty
          );
        }
      } else if (existingItem) {
        removeItem(product.id);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Error al gestionar el producto',
        variant: 'destructive',
      });
    }
  };

  // fija cantidad en múltiplos al salir del input
  const setQtyNormalized = (raw: number) => {
    const q = Number(raw) || 0;
    if (q <= 0) {
      setQuantity(0);
      syncCart(0);
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
    syncCart(normalized);
  };

  const dec = () => {
    const next = Math.max(0, quantity - step);
    setQuantity(next);
    syncCart(next);
  };

  const inc = () => {
    const next = quantity + step;
    setQuantity(next);
    syncCart(next);
  };

  // imagen con fallbacks
  const imgSrc =
    (product as any).image ||
    (product as any).imageUrl ||
    '/placeholder.svg';

  return (
    <Card className="w-full bg-white border shadow-sm hover:shadow-md transition-all duration-200">
      {/* IMAGEN */}
      <div className="h-28 sm:h-36 relative overflow-hidden rounded-t-lg">
        {/* eslint-disable-next-line */}
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
        {product.stock !== undefined && (
          <span className="absolute bottom-1 right-1 bg-stone-800 text-white text-[9px] px-1.5 py-0.5 rounded">
            Stock: {product.stock}
          </span>
        )}
      </div>

      <CardContent className="p-2 sm:p-3 flex-1 flex flex-col space-y-1.5">
        {/* NOMBRE */}
        <h3 className="font-semibold text-stone-900 text-xs sm:text-sm line-clamp-2 min-h-[2rem]">
          {product.name}
        </h3>

        {/* PRECIO */}
        <div className="text-center">
          <p className="text-[10px] text-stone-600 mb-0.5">
            Base: <span className="font-medium">{money(baseUnit)}</span>
          </p>
          
          <p className="text-base sm:text-lg font-bold text-amber-700 leading-tight">
            {quantity > 0 && line.discountPct > 0 ? (
              <>
                {money(line.unit)}{' '}
                <span className="text-[10px] text-green-600">
                  ({line.discountPct}% desc.)
                </span>
              </>
            ) : (
              money(baseUnit)
            )}{' '}
            <span className="text-[9px] text-stone-500">c/u</span>
          </p>
        </div>

        {/* CONTROLES */}
        <div className="space-y-1 mt-auto">
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={dec}
              disabled={quantity <= 0}
              className="h-7 w-7 p-0 text-xs"
              aria-label="Disminuir"
            >
              <Minus className="h-3 w-3" />
            </Button>

            <Input
              type="number"
              inputMode="numeric"
              value={quantity}
              onChange={(e) => {
                const v = e.target.value.trim();
                if (v === '') {
                  setQuantity(0);
                  return;
                }
                const n = Number(v);
                if (Number.isNaN(n)) return;
                setQuantity(Math.max(0, n));
              }}
              onBlur={(e) => setQtyNormalized(Number(e.target.value || 0))}
              className="flex-1 text-center h-7 text-xs sm:text-sm"
              min={0}
              step={step}
              placeholder={`x${step}`}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={inc}
              className="h-7 w-7 p-0 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              aria-label="Aumentar"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <p className="text-[9px] text-stone-500 text-center">
            Múltiplos de {step}
          </p>

          {/* PRÓXIMO TRAMO */}
          {quantity > 0 && nextTier && (
            <p className="text-[9px] text-blue-700 text-center leading-tight">
              +{nextTier.missing} = {nextTier.discountPct}% desc.
            </p>
          )}

          {/* SUBTOTAL */}
          {quantity > 0 && (
            <div className="bg-amber-50 p-1.5 rounded text-center">
              {line.discountPct > 0 ? (
                <>
                  <p className="text-[9px] text-green-700 mb-0.5 leading-tight">
                    {line.discountPct}% desc. — ahorras {money(line.savings)}
                  </p>
                  <p className="text-xs font-medium text-amber-800 leading-tight">
                    <span className="line-through text-stone-500 mr-1 text-[10px]">
                      {money(baseUnit * quantity)}
                    </span>
                    <span className="text-sm sm:text-base">{money(line.total)}</span>
                  </p>
                </>
              ) : (
                <p className="text-xs font-medium text-amber-800 leading-tight">
                  Total: {money(line.total)}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
                    </span>
                    <span className="text-green-700">{money(line.total)}</span>
                  </p>
                </>
              ) : (
                <p className="text-sm font-medium text-amber-800">
                  Subtotal: {money(baseUnit * quantity)}
                </p>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
