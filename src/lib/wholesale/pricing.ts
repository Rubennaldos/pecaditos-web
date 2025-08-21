// src/lib/wholesale/pricing.ts

/** Tramo de descuento por cantidad.
 *  - from: cantidad mínima (inclusive)
 *  - discountPct: % de descuento sobre el precio base por unidad
 */
export type QtyDiscount = {
  from: number;
  discountPct: number; // 0–100
};

/* ─────────────────── Helpers básicos ─────────────────── */

/** Formatea dinero a "S/ 0.00" */
export function money(n: number) {
  return `S/ ${Number(n || 0).toFixed(2)}`;
}

/** Normaliza una cantidad al múltiplo indicado (por defecto, 6),
 *  redondeando SIEMPRE hacia ARRIBA. Si el resultado fuese 0, devuelve el propio múltiplo.
 */
export function normalizeToStep(qty: number, step = 6): number {
  const s = Math.max(1, Math.trunc(step) || 1);
  const q = Math.max(0, Number(qty) || 0);
  const n = Math.ceil(q / s) * s;
  return n > 0 ? n : s;
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
      if (!best || from > best.from) best = { from, discountPct: pct };
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
  const pct = d ? d.discountPct : 0;

  return +(base * (1 - pct / 100)).toFixed(2);
}

/** Próximo tramo por alcanzar (útil para hints tipo “te faltan X”). */
export function nextTierInfo(qty: number, discounts: QtyDiscount[] = []) {
  if (!discounts?.length) return null;
  const sorted = [...discounts].sort((a, b) => a.from - b.from);
  for (const t of sorted) {
    if (qty < t.from) {
      return {
        nextFrom: t.from,
        missing: t.from - qty,
        discountPct: t.discountPct,
      };
    }
  }
  return null;
}

/* ─────────────────── Cálculos de línea ─────────────────── */

export type LineCalc = {
  /** Precio unitario aplicado (con descuento por cantidad) */
  unit: number;
  /** % de descuento aplicado en función de la cantidad (0-100) */
  discountPct: number;
  /** Total de la línea (unit * qty) */
  total: number;
  /** Ahorro vs. pagar todo al precio base (sin descuento por cantidad) */
  savings: number;
  /** Total si no hubiera descuento por cantidad (base * qty) */
  baseTotal: number;
};

/** Línea completa para UI: unitario, % desc, total, ahorro y baseTotal. */
export function computeLine(
  baseUnitPrice: number,
  tiers: QtyDiscount[] = [],
  qty: number
): LineCalc {
  const base = Number(baseUnitPrice || 0);
  const q = Math.max(0, Number(qty || 0));

  if (base <= 0 || q <= 0) {
    return { unit: 0, discountPct: 0, total: 0, savings: 0, baseTotal: 0 };
  }

  const d = bestDiscountFor(q, tiers);
  const discountPct = d ? d.discountPct : 0;
  const unit = +(base * (1 - discountPct / 100)).toFixed(2);
  const total = +(unit * q).toFixed(2);
  const baseTotal = +(base * q).toFixed(2);
  const savings = +(baseTotal - total).toFixed(2);

  return { unit, discountPct, total, savings, baseTotal };
}

/* ─────────────────── Resumen de carrito (opcional) ─────────────────── */

export type CartLineInput = {
  /** Precio mayorista base por unidad (sin descuento por cantidad) */
  base: number;
  /** Reglas de descuento por cantidad */
  qtyDiscounts: QtyDiscount[];
  /** Cantidad del ítem */
  qty: number;
};

export type CartSummary = {
  /** Suma de base * qty de cada línea (sin descuentos por cantidad) */
  subtotal: number;
  /** Ahorros por descuentos por cantidad (suma savings de líneas) */
  volumeSavings: number;
  /** Ahorro adicional por código (% aplicado al subtotal - volumeSavings) */
  extraSavings: number;
  /** Total final (subtotal - savings - extraSavings) */
  total: number;
  /** Detalle por línea ya calculado (útil para mostrar en la UI) */
  lines: (LineCalc & { qty: number })[];
};

/** Calcula todo el carrito. `extraPct` por ejemplo 0.05 para 5% adicional. */
export function computeCartSummary(
  cart: CartLineInput[],
  extraPct = 0
): CartSummary {
  const lines = cart.map((l) => {
    const c = computeLine(l.base, l.qtyDiscounts, l.qty);
    return { ...c, qty: l.qty };
  });

  const subtotal = +(lines.reduce((a, l) => a + l.baseTotal, 0)).toFixed(2);
  const volumeSavings = +(lines.reduce((a, l) => a + l.savings, 0)).toFixed(2);
  const afterVolume = subtotal - volumeSavings;
  const extraSavings = +((afterVolume) * (extraPct || 0)).toFixed(2);
  const total = +(afterVolume - extraSavings).toFixed(2);

  return { subtotal, volumeSavings, extraSavings, total, lines };
}
