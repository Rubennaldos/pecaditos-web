// src/hooks/useBilling.ts
import { useEffect, useMemo, useState } from 'react';
import { onValue, ref } from 'firebase/database';
// Usa la ruta que te funcione. Si tu alias '@' no está configurado, usa la relativa.
import { db } from '../config/firebase'; // o: import { db } from '@/config/firebase';

export type Client = {
  id: string;
  nombre?: string;
  comercial?: string;
  ruc?: string;
  telefono?: string;
  whatsapp?: string;
};

export type Order = {
  id: string;
  clientId: string;
  total: number;
  status: string;                // e.g. 'delivered'
  deliveredAt?: number | string; // timestamp o ISO
  paymentMethod?: 'contado' | 'credito_15' | 'credito_30';
  invoiceId?: string;
};

export type Invoice = {
  id: string;
  orderId: string;
  clientId: string;
  amount: number;
  dueDate: string;                  // ISO
  status: 'pending' | 'overdue' | 'paid' | 'rejected';
  createdAt: string;                // ISO
};

export function useBilling() {
  const [clients, setClients] = useState<Record<string, Client>>({});
  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [invoices, setInvoices] = useState<Record<string, Invoice>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const unsubClients = onValue(ref(db, 'clients'), (s) => {
      setClients((s.val() || {}) as Record<string, Client>);
    });

    const unsubOrders = onValue(ref(db, 'orders'), (s) => {
      setOrders((s.val() || {}) as Record<string, Order>);
    });

    // Si ya manejas facturas reales en RTDB
    const unsubInvoices = onValue(ref(db, 'billing/invoices'), (s) => {
      setInvoices((s.val() || {}) as Record<string, Invoice>);
      setLoading(false);
    });

    return () => {
      try { unsubClients(); } catch {}
      try { unsubOrders(); } catch {}
      try { unsubInvoices(); } catch {}
    };
  }, []);

  // Derivar facturas desde pedidos entregados si no existieran en RTDB
  const derivedInvoices: Invoice[] = useMemo(() => {
    const out: Invoice[] = [];
    const now = new Date();

    Object.entries(orders).forEach(([id, o]) => {
      if (!o || o.status !== 'delivered') return;

      const amount = Number(o.total ?? 0);
      const base = new Date(
        typeof o.deliveredAt === 'string' || typeof o.deliveredAt === 'number'
          ? o.deliveredAt
          : Date.now()
      );

      // calcular vencimiento según método de pago
      const due = new Date(base);
      if (o.paymentMethod === 'credito_15') due.setDate(base.getDate() + 15);
      else if (o.paymentMethod === 'credito_30') due.setDate(base.getDate() + 30);
      // contado = mismo día

      // Si hay due válido y ya pasó => vencida; si no, pendiente
      const dueValid = Number.isFinite(due.getTime());
      const status: Invoice['status'] =
        dueValid && due.getTime() < now.getTime() ? 'overdue' : 'pending';

      out.push({
        id: o.invoiceId || `auto-${id}`,
        orderId: id,
        clientId: o.clientId,
        amount,
        createdAt: base.toISOString(),
        dueDate: (dueValid ? due : base).toISOString(),
        status,
      });
    });

    return out;
  }, [orders]);

  // Si existen facturas reales en /billing/invoices, usarlas; si no, derivadas
  const list: Invoice[] = useMemo(() => {
    const real = Object.entries(invoices).map(([id, v]) => ({
      ...(v as any), // primero el contenido
      id,            // luego id para no sobreescribir con un id vacío
    }));
    return real.length ? real : derivedInvoices;
  }, [invoices, derivedInvoices]);

  // Agrupar por cliente para “Por Cobrar”
  const byClient = useMemo(() => {
    const g: Record<string, { client: Client; invoices: Invoice[]; total: number }> = {};

    for (const inv of list) {
      const clientId = inv.clientId || 'desconocido';
      const c = clients[clientId] || { id: clientId };

      if (!g[clientId]) {
        g[clientId] = { client: { ...c, id: clientId }, invoices: [], total: 0 };
      }

      if (inv.status === 'pending' || inv.status === 'overdue') {
        g[clientId].invoices.push(inv);
        g[clientId].total += Number(inv.amount || 0);
      }
    }
    return g;
  }, [list, clients]);

  // Indicadores de cabecera
  const stats = useMemo(() => {
    const pending = list.filter((i) => i.status === 'pending' || i.status === 'overdue');
    const debtors = Object.values(byClient).filter((v) => v.total > 0).length;

    const now = new Date();
    const month = now.getMonth();
    const year = now.getFullYear();

    const collectedThisMonth = list
      .filter((i) => {
        if (i.status !== 'paid') return false;
        const d = new Date(i.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((acc, i) => acc + Number(i.amount || 0), 0);

    const totalDue = pending.reduce((acc, i) => acc + Number(i.amount || 0), 0);

    // (Si manejas compromisos, calcula aquí)
    const commitmentsToday = 0;

    return {
      debtors,
      pendingCount: pending.length,
      totalDue,
      commitmentsToday,
      collectedThisMonth,
    };
  }, [list, byClient]);

  return {
    loading,
    stats,
    invoices: list,
    byClient,
    clients,
  };
}
