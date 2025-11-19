import { Navigate } from "react-router-dom";
import { PropsWithChildren, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

// Mapeo de módulos a rutas
const MODULE_TO_ROUTE: Record<string, string> = {
  "dashboard": "/panel-control",
  "catalog": "/catalogo",
  "orders": "/pedidos",
  "tracking": "/seguimiento",
  "delivery": "/reparto",
  "production": "/produccion",
  "billing": "/cobranzas",
  "logistics": "/logistica",
  "locations": "/donde-nos-ubicamos",
  "reports": "/reportes",
  "wholesale": "/mayorista",
};

export function ProtectedRoute({
  module,
  children,
}: PropsWithChildren<{ module?: string }>) {
  const { user, perfil, loading } = useAuth() as {
    user: { uid: string } | null;
    perfil?: { 
      activo?: boolean;
      isAdmin?: boolean;
      rol?: string;
      role?: string;
      accessModules?: string[];
      permissions?: string[];
    } | null;
    loading: boolean;
  };

  useEffect(() => {
    console.log("ProtectedRoute check:", {
      module,
      uid: user?.uid,
      perfil,
    });
  }, [module, user, perfil]);

  // Sin módulo = ruta pública
  if (!module) return <>{children}</>;

  // Cargando perfil
  if (loading) return null;

  // Sin sesión → login
  if (!user) {
    console.warn("Acceso denegado: no autenticado");
    return <Navigate to="/login" replace />;
  }

  // Perfil inactivo
  if (perfil && perfil.activo === false) {
    console.warn("Acceso denegado: usuario inactivo");
    return <Navigate to="/" replace />;
  }

  // Usuarios con rol admin tienen acceso automático a todos los módulos
  const isAdminRole = perfil?.rol === 'admin' || perfil?.rol === 'adminGeneral' || perfil?.role === 'admin';
  
  if (isAdminRole) {
    console.log("Acceso autorizado: usuario admin con acceso completo");
    return <>{children}</>;
  }

  // Verificar si tiene acceso al módulo específico
  const userModules = perfil?.accessModules || perfil?.permissions || [];
  const hasAccess = userModules.includes(module);

  if (!hasAccess) {
    console.warn("Acceso denegado:", { module, userModules });
    return <Navigate to="/" replace />;
  }

  console.log("Acceso autorizado:", { module });
  return <>{children}</>;
}
