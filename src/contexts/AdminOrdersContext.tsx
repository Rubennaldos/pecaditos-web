import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { db } from "@/config/firebase";
import { onValue, ref, update, remove, set, get } from "firebase/database";

/** ===== Tipos UI que usan tus componentes ===== */
export interface UIItem {
  name: string;
  quantity: number;
  price: number;
}

export interface UIOrder {
  id: string;
  customer: string;
  address: string;
  phone: string;
  items: UIItem[];
  total: number;
  status: string;
  priority: "normal" | "urgent";
  estimatedTime: string;
  paymentMethod: string;
  notes?: string;
  customerName?: string;
  customerAddress?: string;
  createdAt?: number;
  readyAt?: number;
  acceptedAt?: number;
  orderType?: string;
}

interface OrderHistoryEntry {
  id: string;
  orderId: string;
  timestamp: string;
  user: string;
  profile: string;
  action: string;
  details: string;
  previousValue?: any;
  newValue?: any;
}

interface AdminOrdersContextType {
  orders: UIOrder[];
  isAdminMode: boolean;
  setIsAdminMode: (mode: boolean) => void;
  deleteOrder: (orderId: string, reason: string) => Promise<void>;
  editOrder: (orderId: string, changes: any) => Promise<void>;
  changeOrderStatus: (orderId: string, newStatus: string) => Promise<void>;
  getOrderHistory: (orderId: string) => OrderHistoryEntry[];
  getAllOrderHistory: () => OrderHistoryEntry[];
  deletedOrders: any[];
  restoreOrder: (orderId: string) => Promise<void>;
}

const AdminOrdersContext = createContext<AdminOrdersContextType | undefined>(undefined);

/** ===== Utilidades ===== */
const toNumber = (v: any, d = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : d;
};

const mapItem = (it: any): UIItem => ({
  name: it?.name ?? it?.product ?? "",
  quantity: toNumber(it?.quantity ?? it?.qty, 0),
  price: toNumber(it?.price ?? it?.unit, 0),
});

const mapOrder = (id: string, o: any): UIOrder => {
  const items: UIItem[] = Array.isArray(o?.items) ? o.items.map(mapItem) : [];
  const total = toNumber(o?.total) || toNumber(o?.totals?.total);
  const address = o?.shipping?.address ?? o?.customer?.address ?? o?.site?.address ?? "";
  const name = o?.customer?.name ?? o?.shipping?.siteName ?? o?.site?.name ?? "";
  const eta = o?.shipping?.eta ?? o?.site?.deliveryTime ?? o?.estimatedTime ?? "";
  const notes = o?.notes ?? o?.observations ?? "";

  return {
    id,
    customer: name || "-",
    address,
    phone: o?.customer?.phone ?? o?.phone ?? "",
    items,
    total,
    status: o?.status ?? "pendiente",
    priority: (o?.priority as any) ?? "normal",
    estimatedTime: eta,
    paymentMethod: o?.paymentMethod ?? "Por definir",
    notes,
    customerName: name,
    customerAddress: address,
    createdAt: o?.createdAt ? Number(o.createdAt) : undefined,
    readyAt: o?.readyAt ? Number(o.readyAt) : undefined,
    acceptedAt: o?.acceptedAt ? Number(o.acceptedAt) : undefined,
    orderType: o?.channel ?? o?.orderType ?? "retail",
  };
};

/** ===== Historial mock mínimo ===== */
const initialHistory: OrderHistoryEntry[] = [
  {
    id: "hist-001",
    orderId: "PEC-2024-001",
    timestamp: "2024-01-15T08:30:00",
    user: "Sistema",
    profile: "sistema",
    action: "crear",
    details: "Pedido creado automáticamente",
  },
];

export const AdminOrdersProvider = ({ children }: { children: ReactNode }) => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [orders, setOrders] = useState<UIOrder[]>([]);
  const [orderHistory, setOrderHistory] = useState<OrderHistoryEntry[]>(initialHistory);
  const [deletedOrders, setDeletedOrders] = useState<any[]>([]);

  /** Suscripción segura a /orders */
  useEffect(() => {
    const r = ref(db, "orders");
    const unsubscribe = onValue(r, (snap) => {
      const next: UIOrder[] = [];
      snap.forEach((c) => {
        const mappedOrder = mapOrder(c.key!, c.val());
        next.push(mappedOrder);
      });
      // sort debe devolver number (no boolean)
      next.sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
      setOrders(next);
    });

    // Siempre devolver una función (no un número)
    return () => {
      try {
        // en SDKs antiguos onValue no devuelve nada; esto lo hace seguro
        if (typeof unsubscribe === "function") {
          unsubscribe();
        }
      } catch {
        /* noop */
      }
    };
  }, []);

  /** Historial local */
  const addHistoryEntry = (entry: Omit<OrderHistoryEntry, "id" | "timestamp">) => {
    const newEntry: OrderHistoryEntry = {
      ...entry,
      id: `hist-${Date.now()}`,
      timestamp: new Date().toISOString(),
    };
    setOrderHistory((prev) => [newEntry, ...prev]);
  };

  /** Acciones */
  const changeOrderStatus = async (orderId: string, newStatus: string) => {
    const prev = orders.find((o) => o.id === orderId)?.status;
    const updates: any = { status: newStatus };
    const now = Date.now();
    if (newStatus === "en_preparacion") updates.acceptedAt = now;
    if (newStatus === "listo") updates.readyAt = now;

    await update(ref(db, `orders/${orderId}`), updates);

    if (prev && prev !== newStatus) {
      await set(ref(db, `ordersByStatus/${newStatus}/${orderId}`), true);
      await remove(ref(db, `ordersByStatus/${prev}/${orderId}`));
    }

    addHistoryEntry({
      orderId,
      user: "Usuario Pedidos",
      profile: "pedidos",
      action: "cambiar_estado",
      details: `Estado cambiado a ${newStatus}`,
      previousValue: prev,
      newValue: newStatus,
    });
  };

  const editOrder = async (orderId: string, changes: any) => {
    await update(ref(db, `orders/${orderId}`), changes);
    addHistoryEntry({
      orderId,
      user: "Admin",
      profile: "admin",
      action: "editar",
      details: "Pedido editado por admin",
      newValue: changes,
    });
  };

  const deleteOrder = async (orderId: string, reason: string) => {
    const copySnap = await get(ref(db, `orders/${orderId}`));
    const copy = copySnap.exists() ? copySnap.val() : null;

    await remove(ref(db, `orders/${orderId}`));
    await remove(ref(db, `ordersByStatus/pendiente/${orderId}`));
    await remove(ref(db, `ordersByStatus/en_preparacion/${orderId}`));
    await remove(ref(db, `ordersByStatus/listo/${orderId}`));

    setDeletedOrders((prev) => [...prev, { id: orderId, reason, deletedAt: new Date().toISOString(), copy }]);

    addHistoryEntry({
      orderId,
      user: "Admin",
      profile: "admin",
      action: "eliminar",
      details: `Pedido eliminado por admin. Motivo: ${reason}`,
      previousValue: copy,
    });
  };

  const restoreOrder = async (orderId: string) => {
    const rec = deletedOrders.find((o) => o.id === orderId);
    if (rec?.copy) {
      await set(ref(db, `orders/${orderId}`), rec.copy);
      await set(ref(db, `ordersByStatus/${rec.copy.status || "pendiente"}/${orderId}`), true);
    }
    setDeletedOrders((prev) => prev.filter((o) => o.id !== orderId));

    addHistoryEntry({
      orderId,
      user: "Admin",
      profile: "admin",
      action: "restaurar",
      details: "Pedido restaurado desde papelera",
    });
  };

  const getOrderHistory = (orderId: string) =>
    orderHistory.filter((e) => e.orderId === orderId);

  const getAllOrderHistory = () =>
    [...orderHistory].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

  const value = useMemo<AdminOrdersContextType>(
    () => ({
      orders,
      isAdminMode,
      setIsAdminMode,
      deleteOrder,
      editOrder,
      changeOrderStatus,
      getOrderHistory,
      getAllOrderHistory,
      deletedOrders,
      restoreOrder,
    }),
    [orders, isAdminMode, orderHistory, deletedOrders]
  );

  return <AdminOrdersContext.Provider value={value}>{children}</AdminOrdersContext.Provider>;
};

export const useAdminOrders = () => {
  const context = useContext(AdminOrdersContext);
  if (!context) {
    throw new Error("useAdminOrders must be used within an AdminOrdersProvider");
  }
  return context;
};
