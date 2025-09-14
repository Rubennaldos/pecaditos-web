import { useEffect, useMemo, useState } from 'react';
import { onValue, ref, off } from 'firebase/database';
import { db } from '@/config/firebase';

export type InvoiceStatus = 'pending' | 'overdue' | 'paid' | 'rejected';

export interface Client {
  id: string;
  nombre?: string;     // Razón social
  comercial?: string;  // Razón social + sede (display)
  ruc?: string;
  telefono?: string;
  whatsapp?: string;
}

export interface Invoice {
  id: string;
  orderId: string;
  clientId: string;
  amount: number;
  dueDate: string;         // ISO
  status: InvoiceStatus;
  createdAt: string;       // ISO
  // extras para UI
  orderNumber?: string;
  clientName?: string;     // nombre comercial/sede plano
  ruc?: string | null;
  phone?: string | null;
}

const ORDERS_PATH = 'orders';
const INVOICES_PATH = 'billing/invoices';
const CLIENTS_PATH = 'clients';

const toDate = (v?: string | number | null) => {
  if (!v) return undefined;
  const d = new Date(v as any);
  return isNaN(d.getTime()) ? undefined : d;
};

const normalizeStatus = (inv: Invoice): InvoiceStatus => {
  if (inv.status === 'pending') {
    const due = toDate(inv.dueDate);
    if (due && due.getTime() < Date.now()) return 'overdue';
  }
  return inv.status;
};

// Si el pedido no trae un clientId confiable, generamos uno estable a partir de la razón social
const deriveClientId = (legalOrTradeName?: string) => {
  const base = (legalOrTradeName || 'SIN_ID').toLowerCase().trim();
  return base
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
};

export const useBilling = () => {
  const [clientsDb, setClientsDb] = useState<Record<string, Client>>({});
  const [orders, setOrders] = useState<Record<string, any>>({});
  const [invoicesRaw, setInvoicesRaw] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const rClients = ref(db, CLIENTS_PATH);
    const rOrders = ref(db, ORDERS_PATH);
    const rInvoices = ref(db, INVOICES_PATH);

    const cbClients = (s: any) => setClientsDb((s.val() || {}) as Record<string, Client>);
    const cbOrders = (s: any) => setOrders((s.val() || {}) as Record<string, any>);
    const cbInvoices = (s: any) => {
      setInvoicesRaw((s.val() || {}) as Record<string, any>);
      setLoading(false);
    };

    onValue(rClients, cbClients);
    onValue(rOrders, cbOrders);
    onValue(rInvoices, cbInvoices);

    return () => {
      off(rClients, 'value', cbClients);
      off(rOrders, 'value', cbOrders);
      off(rInvoices, 'value', cbInvoices);
    };
  }, []);

  // Construimos un índice de clientes a partir de los pedidos (para cubrir faltantes de la colección clients)
  const clientsFromOrders: Record<string, Client> = useMemo(() => {
    const map: Record<string, Client> = {};

    Object.values(orders).forEach((o: any) => {
      if (!o) return;

      const legal =
        o?.customer?.name ||
        o?.client?.legalName ||
        o?.client?.name ||
        o?.customerName ||
        '';

      const site =
        o?.shipping?.siteName ||
        o?.site?.name ||
        '';

      const comercial = [legal, site].filter(Boolean).join(site ? ' – ' : '');

      // preferimos IDs reales; si no hay, usamos uno derivado
      const rawId =
        o?.clientId ||
        o?.client?.id ||
        o?.customer?.id ||
        undefined;

      const derivedId = deriveClientId(legal || comercial);
      const id = rawId || derivedId || 'SIN_ID';

      if (!map[id]) {
        map[id] = {
          id,
          nombre: legal || comercial || id,
          comercial: comercial || legal || id,
          ruc: o?.client?.ruc || o?.ruc || undefined,
          telefono: o?.customer?.phone || o?.phone || undefined,
          whatsapp: o?.customer?.whatsapp || o?.whatsapp || undefined,
        };
      }
    });

    return map;
  }, [orders]);

  // Facturas derivadas desde pedidos marcados para cobro o entregados
  const derivedInvoices: Invoice[] = useMemo(() => {
    const out: Invoice[] = [];

    Object.entries(orders).forEach(([id, o]) => {
      if (!o) return;

      const estado = String(o?.status || o?.estado || '').toLowerCase();
      const billingStatus = String(o?.billing?.status || '').toLowerCase();

      const esCandidato =
        estado === 'delivered' ||              // entregado
        billingStatus === 'por_cobrar';        // enviado a Por Cobrar

      if (!esCandidato) return;

      const amount = Number(o?.total ?? o?.amount ?? 0);

      const legal =
        o?.customer?.name ||
        o?.client?.legalName ||
        o?.client?.name ||
        o?.customerName ||
        '';

      const site =
        o?.shipping?.siteName ||
        o?.site?.name ||
        '';

      const displayName = [legal, site].filter(Boolean).join(site ? ' – ' : '');

      const rawClientId =
        o?.clientId ||
        o?.client?.id ||
        o?.customer?.id ||
        undefined;

      const clientId = rawClientId || deriveClientId(legal || displayName) || 'SIN_ID';

      // base y vencimiento
      const createdBase =
        o?.billing?.sentToCollectionAt ||
        o?.deliveredAt ||
        o?.createdAt ||
        Date.now();

      const base = toDate(createdBase) || new Date();

      let due = toDate(o?.billing?.dueDate);
      if (!due) {
        due = new Date(base);
        const pm = String(o?.paymentMethod || '').toLowerCase();
        if (pm.includes('30')) due.setDate(base.getDate() + 30);
        else if (pm.includes('15')) due.setDate(base.getDate() + 15);
      }

      const inv: Invoice = {
        id: o?.billing?.invoiceId || `auto-${id}`,
        orderId: id,
        clientId,
        amount,
        createdAt: base.toISOString(),
        dueDate: (due || base).toISOString(),
        status: billingStatus === 'rechazado' ? 'rejected' : 'pending',
        orderNumber: o?.orderNumber || o?.number || id,
        clientName: displayName || legal || clientId,
        ruc: o?.client?.ruc ?? null,
        phone: o?.customer?.phone ?? o?.phone ?? null,
      };

      inv.status = normalizeStatus(inv);
      out.push(inv);
    });

    out.sort((a, b) => (toDate(a.dueDate)?.getTime() || 0) - (toDate(b.dueDate)?.getTime() || 0));
    return out;
  }, [orders]);

  // Si hay facturas reales en RTDB, las usamos; si no, usamos derivadas
  const invoices: Invoice[] = useMemo(() => {
    const real: Invoice[] = Object.entries(invoicesRaw).map(([id, v]) => {
      const inv: Invoice = {
        id,
        orderId: v?.orderId,
        clientId: v?.clientId,
        amount: Number(v?.amount || 0),
        createdAt: v?.createdAt || new Date().toISOString(),
        dueDate: v?.dueDate || new Date().toISOString(),
        status: (v?.status as InvoiceStatus) || 'pending',
        orderNumber: v?.orderNumber,
        clientName: v?.clientName,
        ruc: v?.ruc ?? null,
        phone: v?.phone ?? null,
      };
      inv.status = normalizeStatus(inv);
      return inv;
    });

    if (real.length) {
      real.sort((a, b) => (toDate(a.dueDate)?.getTime() || 0) - (toDate(b.dueDate)?.getTime() || 0));
      return real;
    }
    return derivedInvoices;
  }, [invoicesRaw, derivedInvoices]);

  // Mezclamos clientes de DB + los derivados de los pedidos
  const clientsMerged: Record<string, Client> = useMemo(() => {
    return { ...clientsFromOrders, ...clientsDb };
  }, [clientsFromOrders, clientsDb]);

  // Agrupación por cliente para "Por Cobrar"
  const byClient = useMemo(() => {
    const g: Record<string, { client: Client; invoices: Invoice[]; total: number; overdueDays: number }> = {};

    invoices.forEach((inv) => {
      if (inv.status !== 'pending' && inv.status !== 'overdue') return;
      const clientId = inv.clientId || 'SIN_ID';
      const c = clientsMerged[clientId] || {
        id: clientId,
        nombre: inv.clientName || clientId,
        comercial: inv.clientName || clientId,
      };

      if (!g[clientId]) {
        g[clientId] = { client: c, invoices: [], total: 0, overdueDays: 0 };
      }

      g[clientId].invoices.push(inv);
      g[clientId].total += Number(inv.amount || 0);

      const due = toDate(inv.dueDate);
      if (due && due.getTime() < Date.now()) {
        const days = Math.ceil((Date.now() - due.getTime()) / (1000 * 60 * 60 * 24));
        g[clientId].overdueDays = Math.max(g[clientId].overdueDays, days);
      }
    });

    Object.values(g).forEach((bucket) =>
      bucket.invoices.sort(
        (a, b) => (toDate(a.dueDate)?.getTime() || 0) - (toDate(b.dueDate)?.getTime() || 0)
      )
    );

    return g;
  }, [invoices, clientsMerged]);

  const stats = useMemo(() => {
    const pend = invoices.filter((i) => i.status === 'pending' || i.status === 'overdue');
    const totalDue = pend.reduce((acc, i) => acc + Number(i.amount || 0), 0);
    const debtors = Object.values(byClient).filter((v) => v.total > 0).length;

    return {
      debtors,
      pendingCount: pend.length,
      totalDue,
      commitmentsToday: 0,
      collectedThisMonth: 0,
    };
  }, [invoices, byClient]);

  return {
    loading,
    stats,
    invoices,
    byClient,
    clients: clientsMerged, // <- ahora ya trae nombre comercial + sede
  };
};

export default useBilling;
