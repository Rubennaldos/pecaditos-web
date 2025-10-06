import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { db } from "@/config/firebase";
import { onValue, ref, update, set, push, remove, get } from "firebase/database";

/* ================== Tipos mínimos ================== */
export type RdbOrder = {
  id: string;
  number?: string;
  status: string; // pendiente | en_preparacion | listo | entregado | sin_entrega | rechazado | cobrado ...
  total?: number;
  createdAt?: number;
  acceptedAt?: number;
  readyAt?: number;
  deliveredAt?: number;
  customerName?: string;
  site?: { name?: string; address?: string };
  client?: { commercialName?: string; legalName?: string; ruc?: string };
  shipping?: { siteName?: string; address?: string; eta?: string };
};

export type RdbPayment = {
  id: string;
  orderId: string;
  amount: number;
  bank: string;
  depositDate: number; // timestamp
  voucherUrl?: string;
  partial?: boolean;
  createdAt: number; // timestamp
};

type RecordPaymentArgs = {
  orderId: string;
  bank: string;
  amount: number;
  depositDate: number;
  voucherUrl?: string;
  partial?: boolean;
};

type ReminderArgs = {
  orderId: string;
  dueAt: number; // timestamp
  notes?: string;
};

/* ============ Interfaz del contexto de Cobranzas ============ */
interface AdminBillingContextType {
  isAdminMode: boolean;
  setIsAdminMode: (value: boolean) => void;

  orders: RdbOrder[];
  payments: RdbPayment[];

  acceptOrder: (orderId: string) => Promise<void>;
  rejectOrder: (orderId: string, reason: string) => Promise<void>;
  recycleOrderToPending: (orderId: string) => Promise<void>;

  recordPayment: (args: RecordPaymentArgs) => Promise<void>;
  createReminder: (args: ReminderArgs) => Promise<void>;
  sendWarningMessage: (orderId: string, message: string) => Promise<void>;
  
  editMovement: (id: string, data: any) => Promise<void>;
  deleteMovement: (id: string) => Promise<void>;
  editOrder: (orderId: string, data: any) => Promise<void>;
  deleteOrder: (orderId: string, reason?: string) => Promise<void>;
  generateAdvancedReport: (filters: any) => Promise<any>;
  sendReminder: (orderId: string, date: number, notes?: string) => Promise<void>;
}

/* ================== Contexto ================== */
const AdminBillingContext = createContext<AdminBillingContextType | undefined>(undefined);

export const AdminBillingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [orders, setOrders] = useState<RdbOrder[]>([]);
  const [payments, setPayments] = useState<RdbPayment[]>([]);

  /* --------- Suscripción a /orders --------- */
  useEffect(() => {
    const r = ref(db, "orders");
    const unsub = onValue(r, (snap) => {
      const next: RdbOrder[] = [];
      snap.forEach((c) => {
        const v = c.val() || {};
        next.push({
          id: c.key!,
          number: v.number || v.orderNumber || v.id,
          status: v.status || "pendiente",
          total: Number(v.total ?? v?.totals?.total ?? 0),
          createdAt: typeof v.createdAt === "number" ? v.createdAt : Date.parse(v.createdAt || "") || undefined,
          acceptedAt: typeof v.acceptedAt === "number" ? v.acceptedAt : Date.parse(v.acceptedAt || "") || undefined,
          readyAt: typeof v.readyAt === "number" ? v.readyAt : Date.parse(v.readyAt || "") || undefined,
          deliveredAt: typeof v.deliveredAt === "number" ? v.deliveredAt : Date.parse(v.deliveredAt || "") || undefined,
          customerName: v.customerName,
          site: v.site,
          client: v.client,
          shipping: v.shipping,
        });
        return false;
      });
      next.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setOrders(next);
    });
    return () => typeof unsub === "function" && unsub();
  }, []);

  /* --------- Suscripción a /payments --------- */
  useEffect(() => {
    const r = ref(db, "payments");
    const unsub = onValue(r, (snap) => {
      const list: RdbPayment[] = [];
      snap.forEach((c) => {
        const v = c.val() || {};
        list.push({
          id: c.key!,
          orderId: String(v.orderId),
          amount: Number(v.amount || 0),
          bank: String(v.bank || "bcp"),
          depositDate: Number(v.depositDate || 0),
          voucherUrl: v.voucherUrl || undefined,
          partial: Boolean(v.partial),
          createdAt: Number(v.createdAt || 0),
        });
        return false;
      });
      list.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setPayments(list);
    });
    return () => typeof unsub === "function" && unsub();
  }, []);

  /* --------- Helpers: mantener ordersByStatus --------- */
  const syncOrderByStatus = async (orderId: string, prevStatus?: string, nextStatus?: string) => {
    if (prevStatus && prevStatus !== nextStatus) {
      await remove(ref(db, `ordersByStatus/${prevStatus}/${orderId}`));
    }
    if (nextStatus) {
      await set(ref(db, `ordersByStatus/${nextStatus}/${orderId}`), true);
    }
  };

  const getOrderCurrentStatus = async (orderId: string): Promise<string | undefined> => {
    const s = await get(ref(db, `orders/${orderId}/status`));
    return s.exists() ? String(s.val()) : undefined;
  };

  /* ================== Acciones de bandeja ================== */
  const acceptOrder = async (orderId: string) => {
    const prev = await getOrderCurrentStatus(orderId);
    const now = Date.now();
    await update(ref(db, `orders/${orderId}`), { status: "en_preparacion", acceptedAt: now });
    await syncOrderByStatus(orderId, prev, "en_preparacion");
  };

  const rejectOrder = async (orderId: string, reason: string) => {
    const prev = await getOrderCurrentStatus(orderId);
    const now = Date.now();
    await update(ref(db, `orders/${orderId}`), {
      status: "rechazado",
      rejectedAt: now,
      rejectionReason: reason || "Sin motivo",
    });
    await syncOrderByStatus(orderId, prev, "rechazado");
  };

  const recycleOrderToPending = async (orderId: string) => {
    const prev = await getOrderCurrentStatus(orderId);
    await update(ref(db, `orders/${orderId}`), { status: "pendiente" });
    await syncOrderByStatus(orderId, prev, "pendiente");
  };

  /* ================== Pagos y recordatorios ================== */
  const recordPayment = async (args: RecordPaymentArgs) => {
    const { orderId, bank, amount, depositDate, voucherUrl, partial } = args;
    const pRef = push(ref(db, "payments"));
    const payload: Omit<RdbPayment, "id"> = {
      orderId,
      amount,
      bank,
      depositDate,
      voucherUrl,
      partial: Boolean(partial),
      createdAt: Date.now(),
    };
    await set(pRef, payload);

    // Si el pago NO es parcial, marcamos la orden como cobrada
    if (!partial) {
      const prev = await getOrderCurrentStatus(orderId);
      await update(ref(db, `orders/${orderId}`), { status: "cobrado", paidAt: Date.now() });
      await syncOrderByStatus(orderId, prev, "cobrado");
    }
  };

  const createReminder = async (args: ReminderArgs) => {
    const { orderId, dueAt, notes } = args;
    const rRef = push(ref(db, `billingReminders/${orderId}`));
    await set(rRef, {
      id: rRef.key!,
      orderId,
      dueAt,
      notes: notes || "",
      createdAt: Date.now(),
      done: false,
    });
  };

  /* ================== Nuevo: advertencia/recordatorio corto ================== */
  const sendWarningMessage = async (orderId: string, message: string) => {
    const wRef = push(ref(db, `billingWarnings/${orderId}`));
    await set(wRef, {
      id: wRef.key!,
      orderId,
      message,
      channel: "internal",
      createdAt: Date.now(),
    });
  };

  const editMovement = async (id: string, data: any) => {
    await update(ref(db, `billingMovements/${id}`), { ...data, updatedAt: Date.now() });
  };

  const deleteMovement = async (id: string) => {
    await remove(ref(db, `billingMovements/${id}`));
  };

  const editOrder = async (orderId: string, data: any) => {
    await update(ref(db, `orders/${orderId}`), { ...data, updatedAt: Date.now() });
  };

  const deleteOrder = async (orderId: string, reason?: string) => {
    const prev = await getOrderCurrentStatus(orderId);
    if (reason) {
      await update(ref(db, `orders/${orderId}`), { deletedReason: reason, deletedAt: Date.now() });
    }
    await remove(ref(db, `orders/${orderId}`));
    if (prev) await remove(ref(db, `ordersByStatus/${prev}/${orderId}`));
  };

  const generateAdvancedReport = async (filters: any) => {
    return { message: 'Reporte generado', filters };
  };

  const sendReminder = async (orderId: string, date: number, notes?: string) => {
    await createReminder({ orderId, dueAt: date, notes });
  };

  /* ================== Valor del contexto ================== */
  const value = useMemo<AdminBillingContextType>(
    () => ({
      isAdminMode,
      setIsAdminMode,
      orders,
      payments,
      acceptOrder,
      rejectOrder,
      recycleOrderToPending,
      recordPayment,
      createReminder,
      sendWarningMessage,
      editMovement,
      deleteMovement,
      editOrder,
      deleteOrder,
      generateAdvancedReport,
      sendReminder,
    }),
    [isAdminMode, orders, payments]
  );

  return <AdminBillingContext.Provider value={value}>{children}</AdminBillingContext.Provider>;
};

export const useAdminBilling = () => {
  const ctx = useContext(AdminBillingContext);
  if (!ctx) throw new Error("useAdminBilling must be used within an AdminBillingProvider");
  return ctx;
};
