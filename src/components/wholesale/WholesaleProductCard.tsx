import { useState, useMemo } from 'react';
import { Plus, Minus, ShoppingBag, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/data/mockData';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';
import { toast } from '@/components/ui/use-toast';
import { WholesaleProductDetailModal } from './WholesaleProductDetailModal';

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
    imageUrl?: string;
    stock?: number;
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
  
  // modal de detalles
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

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

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('input')) {
      setIsDetailModalOpen(true);
    }
  };

  return (
    <>
      <Card 
        className="group relative overflow-hidden bg-gradient-to-br from-white to-stone-50/50 border border-stone-200/60 shadow-sm hover:shadow-xl hover:border-amber-300/40 transition-all duration-500 cursor-pointer backdrop-blur-sm rounded-2xl"
        onClick={handleCardClick}
        title="Toca para ver más detalles"
      >
        <CardContent className="p-0">
          {/* IMAGEN con efecto glassmorphism */}
          <div className="relative overflow-hidden bg-gradient-to-br from-stone-100 via-stone-50 to-white aspect-square group-hover:scale-[1.02] transition-transform duration-500">
            <img
              src={imgSrc}
              alt={product.name}
              className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-700"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
              }}
            />
            
            {/* Overlay gradient sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            {/* Stock badge modernizado */}
            {product.stock !== undefined && (
              <div className="absolute top-2 right-2 backdrop-blur-md bg-white/90 px-2.5 py-1 rounded-full border border-stone-200/60 shadow-lg">
                <span className="text-[10px] font-semibold text-stone-700">
                  Stock: <span className="text-amber-700">{product.stock}</span>
                </span>
              </div>
            )}

            {/* Descuento flash badge */}
            {quantity > 0 && line.discountPct > 0 && (
              <div className="absolute top-2 left-2 backdrop-blur-md bg-gradient-to-r from-amber-500/90 to-orange-500/90 px-2.5 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-[10px] font-bold text-white">
                  -{line.discountPct}%
                </span>
              </div>
            )}
          </div>

          {/* CONTENIDO */}
          <div className="p-3 space-y-2.5">
            {/* NOMBRE con línea decorativa */}
            <div className="relative">
              <h3 className="font-bold text-stone-900 text-xs leading-tight line-clamp-2 min-h-[2rem] group-hover:text-amber-700 transition-colors duration-300">
                {product.name}
              </h3>
              <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-full transition-all duration-500" />
            </div>

            {/* PRECIO con diseño futurista */}
            <div className="relative">
              <div className="backdrop-blur-sm bg-gradient-to-br from-amber-50/80 to-orange-50/60 p-2.5 rounded-xl border border-amber-200/40 shadow-inner">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[9px] text-stone-600 font-medium">Precio base</span>
                  <span className="text-xs font-bold text-stone-700">{money(baseUnit)}</span>
                </div>
                
                {quantity > 0 && line.discountPct > 0 ? (
                  <div className="flex items-baseline justify-between">
                    <span className="text-[9px] text-green-700 font-medium flex items-center gap-1">
                      <Sparkles className="w-2.5 h-2.5" />
                      Con descuento
                    </span>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                        {money(line.unit)}
                      </span>
                      <span className="text-[8px] text-stone-500">c/u</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <span className="text-sm font-bold text-amber-700">{money(baseUnit)}</span>
                    <span className="text-[8px] text-stone-500 ml-1">c/u</span>
                  </div>
                )}
              </div>
            </div>

            {/* CONTROLES modernizados */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 p-1 bg-gradient-to-r from-stone-100 to-stone-50 rounded-xl border border-stone-200/60">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    dec();
                  }}
                  disabled={quantity <= 0}
                  className="h-8 w-8 p-0 rounded-lg hover:bg-white hover:shadow-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Disminuir"
                >
                  <Minus className="h-3.5 w-3.5 text-stone-700" />
                </Button>

                <Input
                  type="number"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => {
                    e.stopPropagation();
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
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-center h-8 text-sm font-bold border-0 bg-white shadow-sm rounded-lg focus-visible:ring-2 focus-visible:ring-amber-400"
                  min={0}
                  step={step}
                  placeholder={`x${step}`}
                />

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    inc();
                  }}
                  className="h-8 w-8 p-0 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-md hover:shadow-lg transition-all"
                  aria-label="Aumentar"
                >
                  <Plus className="h-3.5 w-3.5" />
                </Button>
              </div>

              <p className="text-[9px] text-center text-stone-500 font-medium">
                Múltiplos de {step} unidades
              </p>

              {/* PRÓXIMO TRAMO con diseño mejorado */}
              {quantity > 0 && nextTier && (
                <div className="backdrop-blur-sm bg-gradient-to-r from-amber-50/80 to-orange-50/60 px-2.5 py-1.5 rounded-lg border border-amber-200/40 shadow-sm">
                  <p className="text-[9px] text-amber-800 text-center leading-tight font-semibold flex items-center justify-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" />
                    +{nextTier.missing} para {nextTier.discountPct}% OFF
                  </p>
                </div>
              )}

              {/* SUBTOTAL futurista */}
              {quantity > 0 && (
                <div className="relative overflow-hidden backdrop-blur-md bg-gradient-to-br from-amber-100/90 to-orange-100/80 p-2.5 rounded-xl border border-amber-300/60 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 to-orange-400/10 animate-pulse" />
                  <div className="relative">
                    {line.discountPct > 0 ? (
                      <>
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="bg-green-100 text-green-700 border-green-300 text-[8px] px-1.5 py-0.5">
                            Ahorro: {money(line.savings)}
                          </Badge>
                          <span className="text-[9px] text-amber-700 font-medium">{line.discountPct}% desc.</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] text-stone-600 line-through">{money(baseUnit * quantity)}</span>
                          <span className="text-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
                            {money(line.total)}
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="text-center">
                        <p className="text-[9px] text-stone-600 mb-0.5">Subtotal</p>
                        <p className="text-base font-black text-amber-700">{money(line.total)}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>

        {/* Borde glow effect en hover */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-400/0 via-orange-400/0 to-amber-400/0 group-hover:from-amber-400/20 group-hover:via-orange-400/20 group-hover:to-amber-400/20 transition-all duration-500 pointer-events-none" />
      </Card>

      {/* Modal de detalles */}
      <WholesaleProductDetailModal
        product={product}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  );
};
