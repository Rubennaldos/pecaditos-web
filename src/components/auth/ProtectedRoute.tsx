import { Navigate } from "react-router-dom";
import { PropsWithChildren } from "react";
import { useAuth } from "@/hooks/useAuth";

export function ProtectedRoute({
  module,
  children,
}: PropsWithChildren<{ module?: string }>) {
  const { user, profile, loading } = useAuth();

  // Mostrar loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Sin usuario → redirigir a login
  if (!user) {
    console.warn('[ProtectedRoute] Sin usuario, redirigiendo a login');
    return <Navigate to="/login" replace />;
  }

  // Sin perfil → error
  if (!profile) {
    console.warn('[ProtectedRoute] Sin perfil');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-stone-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  // Usuario inactivo
  if (!profile.activo) {
    console.warn('[ProtectedRoute] Usuario inactivo');
    return <Navigate to="/" replace />;
  }

  // Si no requiere módulo específico, permitir acceso
  if (!module) {
    return <>{children}</>;
  }

  // Usuarios admin tienen acceso a TODO
  const isAdmin = profile.rol === 'admin' || profile.rol === 'adminGeneral';
  if (isAdmin) {
    console.log('[ProtectedRoute] Admin, acceso completo');
    return <>{children}</>;
  }

  // Verificar acceso al módulo
  const hasAccess = profile.access_modules?.includes(module);
  if (!hasAccess) {
    console.warn('[ProtectedRoute] Sin acceso al módulo:', module);
    return <Navigate to="/panel-control" replace />;
  }

  console.log('[ProtectedRoute] Acceso permitido:', module);
  return <>{children}</>;
}
