// src/lib/wholesale/pricing.ts

export type QtyDiscount = {
  /** Cantidad mínima (en unidades) a partir de la cual aplica el descuento */
  from: number;
  /** Porcentaje de descuento, 0–100 */
  discountPct: number;
};

/** Normaliza una cantidad al múltiplo indicado (por defecto, 6). */
export function normalizeToStep(qty: number, step = 6): number {
  const s = Math.max(1, Math.trunc(step) || 1);
  const q = Number(qty) || 0;
  const rounded = Math.round(q / s) * s;
  return rounded > 0 ? rounded : s;
}

/** Devuelve el mejor descuento aplicable para la cantidad dada. */
export function bestDiscountFor(
  qty: number,
  discounts: QtyDiscount[] = []
): QtyDiscount | null {
  if (!Array.isArray(discounts) || discounts.length === 0) return null;

  const q = Number(qty) || 0;
  let best: QtyDiscount | null = null;

  for (const d of discounts) {
    const from = Number(d.from) || 0;
    const pct = Number(d.discountPct) || 0;
    if (q >= from && pct > 0) {
      if (!best || from > best.from) {
        best = { from, discountPct: pct };
      }
    }
  }
  return best;
}

/** Precio unitario efectivo aplicando el mejor descuento por cantidad. */
export function unitPriceWithDiscount(
  baseWholesalePrice: number,
  qty: number,
  discounts: QtyDiscount[] = []
): number {
  const base = Number(baseWholesalePrice) || 0;
  if (base <= 0) return 0;

  const d = bestDiscountFor(qty, discounts);
  if (!d) return base;

  const price = base * (1 - d.discountPct / 100);
  return Math.round(price * 100) / 100; // 2 decimales
}
