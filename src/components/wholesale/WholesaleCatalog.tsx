// src/components/wholesale/WholesaleCatalog.tsx
import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
import { db } from '@/config/firebase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';

/* -------------------- Helpers locales -------------------- */
const normalizeToStep = (qty: number, step: number) => {
  const s = Math.max(1, step || 1);
  const n = Math.round((Number(qty) || s) / s) * s;
  return n <= 0 ? s : n;
};

// Devuelve el precio unitario efectivo para una cantidad dada.
// Si hay niveles de quantityDiscounts, toma el de mayor minQty <= qty.
// Si no hay niveles aplicables, devuelve wholesalePrice.
const unitPriceForQty = (
  wholesalePrice: number,
  qty: number,
  tiers: QtyPrice[] = []
) => {
  if (!Array.isArray(tiers) || tiers.length === 0) return wholesalePrice;
  const sorted = [...tiers]
    .map(t => ({ minQty: Number(t.minQty) || 0, price: Number(t.price) || 0 }))
    .filter(t => t.minQty > 0 && t.price > 0)
    .sort((a, b) => a.minQty - b.minQty);

  let price = wholesalePrice;
  for (const t of sorted) {
    if (qty >= t.minQty) price = t.price;
    else break;
  }
  return price || wholesalePrice;
};

/* -------------------- Tipos -------------------- */
// Lo que está en /products (tu estructura)
type QtyPrice = { minQty: number | string; price: number | string };

type DbProduct = {
  name?: string;
  description?: string;
  image?: string;             // <- en products
  unit?: string;
  price?: number;             // normal (opcional para mostrar)
  wholesalePrice?: number;    // base mayorista
  category?: string;          // <- en products
  isActive?: boolean;
  minOrder?: number;          // <- múltiplo
  stock?: number;
  quantityDiscounts?: QtyPrice[]; // [{minQty, price}]
  sortOrder?: number;
};

type UiProduct = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  unit?: string;
  price?: number;
  wholesalePrice: number;
  categoryId: string;
  minMultiple: number;
  stock?: number;
  tiers: QtyPrice[];
};

type Props = {
  selectedCategory: string; // 'todas' | id de categoría
  searchQuery: string;
};

// Tipo mínimo para addItem del carrito
type AddItemArg = {
  id: string;
  name: string;
  price: number;
  imageUrl?: string;
  unit?: string;
};

export const WholesaleCatalog = ({ selectedCategory, searchQuery }: Props) => {
  const { toast } = useToast();
  const { addItem } = useWholesaleCart();
  const [products, setProducts] = useState<UiProduct[]>([]);
  const [loading, setLoading] = useState(true);

  /* -------------------- Carga desde /products -------------------- */
  useEffect(() => {
    const r = ref(db, 'products');

    const unsub = onValue(
      r,
      (snap) => {
        const val = (snap.val() || {}) as Record<string, DbProduct>;

        const list: UiProduct[] = Object.entries(val)
          .map(([id, p]) => {
            const item: UiProduct & {
              _active: boolean;
              _sortOrder: number;
            } = {
              id,
              name: p?.name ?? id,
              description: p?.description || '',
              imageUrl: p?.image, // products usa 'image'
              unit: p?.unit || 'und.',
              price: Number.isFinite(p?.price) ? (p!.price as number) : undefined,
              wholesalePrice: Number.isFinite(p?.wholesalePrice) ? (p!.wholesalePrice as number) : 0,
              categoryId: p?.category || 'sin-categoria',
              minMultiple: Number.isFinite(p?.minOrder) ? (p!.minOrder as number) : 6,
              stock: Number.isFinite(p?.stock) ? (p!.stock as number) : undefined,
              tiers: Array.isArray(p?.quantityDiscounts) ? (p!.quantityDiscounts as QtyPrice[]) : [],
              _active: p?.isActive !== false,
              _sortOrder: Number.isFinite(p?.sortOrder) ? (p!.sortOrder as number) : 9999,
            };
            return item;
          })
          .filter((x) => x._active)
          .sort(
            (a: any, b: any) =>
              (a._sortOrder ?? 9999) - (b._sortOrder ?? 9999) ||
              a.name.localeCompare(b.name)
          )
          .map(({ _active, _sortOrder, ...clean }) => clean as UiProduct);

        setProducts(list);
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => unsub();
  }, []);

  /* -------------------- Filtros búsqueda/categoría -------------------- */
  const filtered = useMemo(() => {
    let out = products.filter(
      (p) => selectedCategory === 'todas' || p.categoryId === selectedCategory
    );

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      out = out.filter((p) => {
        const haystack = `${p.name} ${p.description ?? ''}`.toLowerCase();
        return haystack.includes(q);
      });
    }
    return out;
  }, [products, selectedCategory, searchQuery]);

  /* -------------------- Cantidades y carrito -------------------- */
  const [qtyById, setQtyById] = useState<Record<string, number>>({});

  const stepFor = (p: UiProduct) => Math.max(1, p.minMultiple || 6);

  const setQty = (id: string, qty: number, p: UiProduct) => {
    const step = stepFor(p);
    const normalized = normalizeToStep(Number(qty || step), step);
    setQtyById((prev) => ({ ...prev, [id]: normalized }));
  };

  const dec = (p: UiProduct) => {
    const step = stepFor(p);
    const current = qtyById[p.id] ?? step;
    const next = Math.max(step, current - step);
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

    const unit = unitPriceForQty(p.wholesalePrice, qty, p.tiers);

    const payload: AddItemArg = {
      id: p.id,
      name: p.name,
      price: unit,
      imageUrl: p.imageUrl,
      unit: p.unit,
    };

    addItem(payload as any, qty);

    toast({
      title: 'Agregado al carrito',
      description: `${qty} ${p.unit ?? 'und.'} de ${p.name}`,
    });
  };

  /* -------------------- UI -------------------- */
  return (
    <section>
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <div className="w-full h-40 bg-stone-200 animate-pulse rounded mb-3" />
              <div className="h-4 w-2/3 bg-stone-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-1/3 bg-stone-200 animate-pulse rounded mb-4" />
              <div className="flex gap-2">
                <div className="h-10 w-20 bg-stone-200 animate-pulse rounded" />
                <div className="h-10 w-24 bg-stone-200 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center text-stone-600 py-12">
          No hay productos para mostrar.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((p) => {
            const step = stepFor(p);
            const qty = qtyById[p.id] ?? step;
            const unit = unitPriceForQty(p.wholesalePrice, qty, p.tiers);
            const hasDiscount = unit < (p.wholesalePrice || unit);

            return (
              <div key={p.id} className="border rounded-lg p-4 hover:shadow-md transition">
                <div className="aspect-square w-full mb-3 bg-stone-100 rounded overflow-hidden">
                  {p.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-400">
                      Sin imagen
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <h3 className="font-semibold text-stone-800 line-clamp-2">{p.name}</h3>
                  {p.unit && <p className="text-xs text-stone-500">Unidad: {p.unit}</p>}

                  <div className="text-lg font-bold text-green-700">
                    S/ {unit.toFixed(2)}
                    <span className="ml-1 text-xs text-stone-500"> mayorista</span>
                  </div>

                  {hasDiscount && (
                    <div className="text-xs text-stone-500">
                      Antes: <s>S/ {p.wholesalePrice.toFixed(2)}</s>
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => dec(p)} className="px-3">
                    −
                  </Button>
                  <Input
                    type="number"
                    inputMode="numeric"
                    min={step}
                    step={step}
                    value={qty}
                    onChange={(e) => setQty(p.id, Number(e.target.value || step), p)}
                    className="w-20 text-center"
                  />
                  <Button type="button" variant="outline" onClick={() => inc(p)} className="px-3">
                    +
                  </Button>
                </div>

                <Button className="mt-3 w-full" onClick={() => addToCart(p)}>
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
