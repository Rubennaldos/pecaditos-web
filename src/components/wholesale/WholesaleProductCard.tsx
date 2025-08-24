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
    <Card className="w-full max-w-xs bg-white border shadow-sm hover:shadow-md transition-all duration-200 mx-auto">
      <div className="h-48 relative overflow-hidden rounded-t-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imgSrc}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>

      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-2 text-center line-clamp-2">
          {product.name}
        </h3>

        {/* Info de precios */}
        <div className="text-center mb-3">
          <p className="text-xs text-gray-500 mb-1 line-clamp-3">
            {product.description || 'Producto mayorista'}
          </p>

          <div className="space-y-1">
            <p className="text-sm text-gray-600">
              Base mayorista: <b>{money(baseUnit)}</b> c/u
            </p>

            <p className="text-lg font-bold text-amber-700">
              {quantity > 0 && line.discountPct > 0 ? (
                <>
                  {money(line.unit)}{' '}
                  <span className="text-xs text-green-600">
                    ({line.discountPct}% desc.)
                  </span>
                </>
              ) : (
                money(baseUnit)
              )}{' '}
              <span className="text-xs text-stone-500">c/u</span>
            </p>
          </div>
        </div>

        {/* Controles de cantidad */}
        <div className="space-y-3 mt-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={dec}
              disabled={quantity <= 0}
              className="h-8 w-8 p-0"
              aria-label="Disminuir"
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
                  setQuantity(0);
                  return;
                }
                const n = Number(v);
                if (Number.isNaN(n)) return;
                setQuantity(Math.max(0, n));
              }}
              onBlur={(e) => setQtyNormalized(Number(e.target.value || 0))}
              className="flex-1 text-center h-8"
              min={0}
              step={step}
              placeholder={`Múltiplos de ${step}`}
            />

            <Button
              variant="outline"
              size="sm"
              onClick={inc}
              className="h-8 w-8 p-0"
              aria-label="Aumentar"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-xs text-stone-500 text-center">
            Cantidades en múltiplos de {step} unidades
          </p>

          {/* Próximo tramo */}
          {quantity > 0 && nextTier && (
            <p className="text-[11px] text-blue-700 text-center">
              Te faltan <b>{nextTier.missing}</b> unid. para {nextTier.discountPct}% de descuento.
            </p>
          )}

          {/* Subtotal / ahorro */}
          {quantity > 0 && (
            <div className="bg-amber-50 p-2 rounded-lg text-center">
              {line.discountPct > 0 ? (
                <>
                  <p className="text-xs text-green-700 mb-1">
                    {line.discountPct}% descuento aplicado — ahorras {money(line.savings)}
                  </p>
                  <p className="text-sm font-medium text-amber-800">
                    <span className="line-through text-gray-500 mr-1">
                      {money(baseUnit * quantity)}
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
