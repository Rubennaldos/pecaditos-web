import { Navigate } from "react-router-dom";
import { PropsWithChildren, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

type RouteType =
  | "PUBLIC"
  | "ADMIN"
  | "ORDERS"
  | "DELIVERY"
  | "PRODUCTION"
  | "BILLING"
  | "LOGISTICS"
  | "CATALOG_RETAIL"
  | "CATALOG_WHOLESALE";

type Role =
  | "admin"
  | "pedidos"
  | "reparto"
  | "produccion"
  | "cobranzas"
  | "logistica"
  | "mayorista"
  | "cliente"
  | "retail";

// Normaliza lo que venga de RTDB
function normalizeRole(v?: string): Role | undefined {
  if (!v) return undefined;
  const s = v.toLowerCase().trim();
  if (["admin", "admingeneral"].includes(s)) return "admin";
  if (["pedidos", "pedido", "orders"].includes(s)) return "pedidos";
  if (["reparto", "delivery"].includes(s)) return "reparto";
  if (["produccion", "production"].includes(s)) return "produccion";
  if (["cobranzas", "cobranza", "billing"].includes(s)) return "cobranzas";
  if (["logistica", "logistics"].includes(s)) return "logistica";
  if (["mayorista", "wholesale"].includes(s)) return "mayorista";
  if (["cliente", "client"].includes(s)) return "cliente";
  if (["retail"].includes(s)) return "retail";
  return undefined;
}

// Quién puede entrar a cada route
const ALLOW: Record<RouteType, Role[]> = {
  PUBLIC: ["admin", "pedidos", "reparto", "produccion", "cobranzas", "logistica", "mayorista", "cliente", "retail"],
  ADMIN: ["admin"],
  ORDERS: ["admin", "pedidos", "cliente"],
  DELIVERY: ["admin", "reparto"],
  PRODUCTION: ["admin", "produccion"],
  BILLING: ["admin", "cobranzas", "cliente"],
  LOGISTICS: ["admin", "logistica"],
  CATALOG_RETAIL: ["admin", "cliente"],
  CATALOG_WHOLESALE: ["admin", "mayorista"],
};

export function ProtectedRoute({
  routeType,
  children,
}: PropsWithChildren<{ routeType: RouteType }>) {
  const { user, perfil, loading } = useAuth() as {
    user: { uid: string } | null;
    perfil?: { rol?: string; role?: string; activo?: boolean } | null;
    loading: boolean;
  };

  useEffect(() => {
    // Útil para depurar (quítalo en prod si quieres)
    console.log("ProtectedRoute check:", {
      routeType,
      uid: user?.uid,
      perfil,
    });
  }, [routeType, user, perfil]);

  // Público: pasa directo
  if (routeType === "PUBLIC") return <>{children}</>;

  // Cargando perfil
  if (loading) return null; // o spinner

  // Sin sesión → login
  if (!user) {
    console.warn("Acceso denegado: no autenticado");
    return <Navigate to="/login" replace />;
  }

  // Perfil inactivo
  if (perfil && perfil.activo === false) {
    console.warn("Acceso denegado: usuario inactivo");
    // usa /403 si la tienes; si no, usa "/"
    return <Navigate to="/403" replace />;
  }

  // Normaliza rol
  const rol = normalizeRole(perfil?.rol || perfil?.role);
  if (!rol) {
    console.warn("Acceso denegado: usuario sin rol definido", { perfil });
    return <Navigate to="/" replace />;
  }

  // Si el routeType no está en ALLOW, trata como denegado
  const allowed = ALLOW[routeType] ?? [];
  const ok = allowed.includes(rol);

  if (!ok) {
    console.warn("Acceso denegado:", { routeType, rol, allowed });
    // Si no tienes /403, cambia a "/"
    return <Navigate to="/403" replace />;
  }

  console.log("Acceso autorizado:", { routeType, rol });
  return <>{children}</>;
}
