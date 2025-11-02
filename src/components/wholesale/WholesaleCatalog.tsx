// src/components/wholesale/WholesaleCatalog.tsx
import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';
import { useWholesaleCustomer } from '@/hooks/useWholesaleCustomer';

// Helpers de precios/cantidades (porcentuales)
import {
  computeLine,
  normalizeToStep,
  type QtyDiscount,
  money,
} from '@/lib/wholesale/pricing';

/* -------------------- Tipos -------------------- */
type DbCatalogProduct = {
  name?: string;
  description?: string;
  imageUrl?: string;
  unit?: string;
  price?: number;
  wholesalePrice?: number;
  categoryId?: string;
  active?: boolean;
  activeWholesale?: boolean;
  minMultiple?: number;
  stock?: number;
  sortOrder?: number;
  qtyDiscounts?: QtyDiscount[];
};

type UiProduct = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  unit: string;
  price?: number;
  wholesalePrice: number;
  categoryId: string;
  minMultiple: number;
  stock?: number;
  sortOrder: number;
  qtyDiscounts: QtyDiscount[];
};

type Props = {
  selectedCategory: string; // 'todas' | id de categoría
  searchQuery: string;
};

export const WholesaleCatalog = ({ selectedCategory, searchQuery }: Props) => {
  const { toast } = useToast();
  const { addItem } = useWholesaleCart();
  const { uid } = useWholesaleCustomer();

  const [products, setProducts] = useState<UiProduct[]>([]);
  const [clientCatalog, setClientCatalog] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  /* -------------------- Carga catálogo personalizado del cliente -------------------- */
  useEffect(() => {
    if (!uid) {
      setClientCatalog({});
      return;
    }

    const clientCatalogRef = ref(db, `clientCatalogs/${uid}/products`);
    const unsub = onValue(
      clientCatalogRef,
      (snap) => {
        const data = snap.val() || {};
        setClientCatalog(data);
      },
      () => setClientCatalog({})
    );

    return () => unsub();
  }, [uid]);

  /* -------------------- Carga /catalog/products -------------------- */
  useEffect(() => {
    const r = ref(db, 'catalog/products');

    const unsub = onValue(
      r,
      (snap) => {
        const raw = (snap.val() || {}) as Record<string, DbCatalogProduct>;

        const list = Object.entries(raw)
          .map(([id, p]) => {
            const wholesale = Number(p?.wholesalePrice ?? 0);
            if (!wholesale || Number.isNaN(wholesale)) return null;

            const active = p?.active !== false && p?.activeWholesale !== false;
            if (!active) return null;

            const item: UiProduct = {
              id,
              name: p?.name ?? id,
              description: p?.description || '',
              imageUrl: p?.imageUrl || '',
              unit: p?.unit || 'und.',
              price: Number.isFinite(p?.price) ? (p!.price as number) : undefined,
              wholesalePrice: wholesale,
              categoryId: p?.categoryId || 'sin-categoria',
              minMultiple: Math.max(1, Number(p?.minMultiple ?? 6)),
              stock: Number.isFinite(p?.stock) ? (p!.stock as number) : undefined,
              sortOrder: Number.isFinite(p?.sortOrder) ? (p!.sortOrder as number) : 9999,
              qtyDiscounts: Array.isArray(p?.qtyDiscounts)
                ? (p!.qtyDiscounts as QtyDiscount[])
                : [],
            };
            return item;
          })
          .filter(Boolean) as UiProduct[];

        list.sort(
          (a, b) =>
            (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) ||
            a.name.localeCompare(b.name)
        );

        setProducts(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, []);

  /* -------------------- Filtros -------------------- */
  const filtered = useMemo(() => {
    // Si el cliente tiene catálogo personalizado, solo mostrar esos productos
    const hasCustomCatalog = Object.keys(clientCatalog).length > 0;
    
    let out = products.filter((p) => {
      // Si hay catálogo personalizado, filtrar por productos activos en el catálogo del cliente
      if (hasCustomCatalog) {
        const clientProduct = clientCatalog[p.id];
        if (!clientProduct || !clientProduct.active) return false;
      }
      
      // Filtrar por categoría
      return selectedCategory === 'todas' || p.categoryId === selectedCategory;
    });

    // Aplicar precios personalizados si existen
    if (hasCustomCatalog) {
      out = out.map(p => {
        const clientProduct = clientCatalog[p.id];
        if (clientProduct && clientProduct.customPrice) {
          return { ...p, wholesalePrice: clientProduct.customPrice };
        }
        return p;
      });
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      out = out.filter((p) => {
        const haystack = `${p.name} ${p.description ?? ''}`.toLowerCase();
        return haystack.includes(q);
      });
    }
    return out;
  }, [products, clientCatalog, selectedCategory, searchQuery]);

  /* -------------------- Cantidades y añadir -------------------- */
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  const stepFor = (p: UiProduct) => Math.max(1, p.minMultiple || 6);

  const setQty = (id: string, qty: number, p: UiProduct) => {
    const step = stepFor(p);
    const normalized = normalizeToStep(Number(qty || 0), step); // redondeo hacia ARRIBA
    setQtyById((prev) => ({ ...prev, [id]: normalized }));
  };

  const dec = (p: UiProduct) => {
    const step = stepFor(p);
    const current = qtyById[p.id] ?? step;
    const next = Math.max(0, current - step);
    setQty(p.id, next, p);
  };

  const inc = (p: UiProduct) => {
    const step = stepFor(p);
    const current = qtyById[p.id] ?? step;
    const next = current + step;
    setQty(p.id, next, p);
  };

  const addToCart = (p: UiProduct) => {
    const step = stepFor(p);
    const qty = qtyById[p.id] ?? step;

    const { unit } = computeLine(p.wholesalePrice, p.qtyDiscounts, qty);

    // Enviar imagen en la clave "image" para que el carrito la muestre
    const cartProduct: any = {
      id: p.id,
      name: p.name,
      price: p.price ?? p.wholesalePrice,
      image: p.imageUrl || '/placeholder.svg',
      imageUrl: p.imageUrl,
      unit: p.unit,
      description: p.description,
      wholesalePrice: p.wholesalePrice,
      minMultiple: p.minMultiple,
      qtyDiscounts: p.qtyDiscounts,
    };

    addItem(cartProduct, qty);

    toast({
      title: 'Agregado al carrito',
      description: `${qty} ${p.unit ?? 'und.'} de ${p.name}`,
    });
  };

  /* -------------------- UI -------------------- */
  return (
    <section>
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="border rounded-xl p-6 shadow-sm">
              <div className="w-full h-64 bg-stone-200 animate-pulse rounded-lg mb-4" />
              <div className="h-5 w-3/4 bg-stone-200 animate-pulse rounded mb-3" />
              <div className="h-4 w-1/2 bg-stone-200 animate-pulse rounded mb-5" />
              <div className="flex gap-3">
                <div className="h-11 w-24 bg-stone-200 animate-pulse rounded-lg" />
                <div className="h-11 w-32 bg-stone-200 animate-pulse rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-stone-600 py-16">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-semibold mb-2">No hay productos para mostrar</h3>
          <p className="text-stone-500">Intenta cambiar los filtros de búsqueda</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((p) => {
            const step = stepFor(p);
            const qty = qtyById[p.id] ?? step;

            const { unit, discountPct } = computeLine(
              p.wholesalePrice,
              p.qtyDiscounts,
              qty
            );

            return (
              <div key={p.id} className="border rounded-xl p-6 hover:shadow-lg transition-all duration-200 bg-card">
                <div className="w-full h-64 mb-4 bg-muted rounded-lg overflow-hidden">
                  {p.imageUrl ? (
                    // eslint-disable-next-line
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = '/placeholder.svg';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-foreground line-clamp-2 min-h-[3.5rem]">{p.name}</h3>
                  {p.unit && <p className="text-sm text-muted-foreground">Unidad: {p.unit}</p>}

                  <div className="text-2xl font-bold text-primary">
                    {money(unit)}
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    <span className="text-xs">Precio mayorista c/u</span>
                  </div>

                  {discountPct > 0 && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-medium">
                      🎉 {discountPct}% de descuento
                    </div>
                  )}
                  
                  <div className="text-sm text-muted-foreground pt-1">
                    Base: <span className="font-semibold">{money(p.wholesalePrice)}</span>
                  </div>
                </div>

                <div className="mt-5 flex items-center gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    onClick={() => dec(p)} 
                    className="px-4 text-lg font-bold"
                  >
                    −
                  </Button>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={0}
                    step={step}
                    value={qty}
                    onChange={(e) => setQty(p.id, Number(e.target.value || 0), p)}
                    onBlur={(e) => setQty(p.id, Number(e.target.value || 0), p)}
                    className="flex-1 text-center text-lg font-semibold h-11"
                    placeholder={`${step}`}
                  />
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="lg"
                    onClick={() => inc(p)} 
                    className="px-4 text-lg font-bold"
                  >
                    +
                  </Button>
                </div>

                <Button 
                  className="mt-4 w-full h-11 text-base font-semibold" 
                  size="lg"
                  onClick={() => addToCart(p)}
                >
                  Añadir al carrito
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
