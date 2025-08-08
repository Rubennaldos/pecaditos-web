import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';

export type RouteType =
  | 'CATALOG_RETAIL'
  | 'CATALOG_WHOLESALE'
  | 'ADMIN'
  | 'ORDERS'
  | 'DELIVERY'
  | 'PRODUCTION'
  | 'BILLING'
  | 'LOGISTICS'
  | 'PUBLIC';

interface ProtectedRouteProps {
  children: React.ReactNode;
  routeType: RouteType;
}

export const ProtectedRoute = ({ children, routeType }: ProtectedRouteProps) => {
  const location = useLocation();

  // Sesiones disponibles
  const { user: retailUser } = useAuth();               // cliente retail (landing / compras)
  const { user: wholesaleUser } = useWholesaleAuth();   // cliente mayorista
  const { user: adminUser } = useAdmin();               // admin con perfil desde /usuarios/{uid}

  // Perfil normalizado (prioridad: admin > mayorista > retail > público)
  const userProfile: string =
    adminUser?.profile ??
    (wholesaleUser ? 'mayorista' :
    (retailUser ? 'retail' : 'public'));

  const isAdmin = (p: string) => p === 'admin' || p === 'adminGeneral';

  // Ruta principal por perfil
  const getProfileMainRoute = (profile: string): string => {
    switch (profile) {
      case 'admin':
      case 'adminGeneral':
        return '/admin';
      case 'pedidos':
        return '/pedidos';
      case 'reparto':
        return '/reparto';
      case 'produccion':
        return '/produccion';
      case 'cobranzas':
        return '/cobranzas';
      case 'logistica':
        return '/logistica';
      case 'mayorista':
        return '/mayorista';
      case 'retail':
      default:
        return '/';
    }
  };

  // Configuración de acceso por tipo de ruta
  const routeConfig: Record<RouteType, {
    allowedProfiles: string[];
    redirectTo: string;
    requireAuth: boolean;
    message: string;
  }> = {
    CATALOG_RETAIL: {
      allowedProfiles: ['admin', 'adminGeneral'],
      redirectTo: '/',
      requireAuth: true,
      message: 'Catálogo minorista temporalmente no disponible',
    },
    CATALOG_WHOLESALE: {
      allowedProfiles: ['mayorista', 'admin', 'adminGeneral'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido a mayoristas autorizados',
    },
    ADMIN: {
      allowedProfiles: ['admin', 'adminGeneral'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido a administrador general',
    },
    ORDERS: {
      allowedProfiles: ['pedidos', 'admin', 'adminGeneral'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de pedidos',
    },
    DELIVERY: {
      allowedProfiles: ['reparto', 'admin', 'adminGeneral'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de reparto',
    },
    PRODUCTION: {
      allowedProfiles: ['produccion', 'admin', 'adminGeneral'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de producción',
    },
    BILLING: {
      allowedProfiles: ['cobranzas', 'admin', 'adminGeneral'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de cobranzas',
    },
    LOGISTICS: {
      allowedProfiles: ['logistica', 'admin', 'adminGeneral'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de logística',
    },
    PUBLIC: {
      allowedProfiles: [
        'admin', 'adminGeneral', 'mayorista', 'pedidos', 'reparto', 'produccion', 'cobranzas', 'retail', 'public',
      ],
      redirectTo: '/',
      requireAuth: false,
      message: 'Acceso público',
    },
  };

  const config = routeConfig[routeType];

  // 1) Si no requiere autenticación → pasa directo
  if (!config.requireAuth) {
    return <>{children}</>;
  }

  // 2) Requiere autenticación y NO hay ningún user
  const hasAnyUser = !!(adminUser || wholesaleUser || retailUser);
  if (!hasAnyUser) {
    console.log(`🔒 Acceso denegado: No hay usuario autenticado para ${routeType}`);
    return <Navigate to={config.redirectTo} state={{ from: location }} replace />;
  }

  // 3) Admin siempre tiene pase (admin o adminGeneral)
  if (isAdmin(userProfile)) {
    console.log(`✅ Acceso autorizado (admin): ${routeType}`);
    return <>{children}</>;
  }

  // 4) Validación normal por lista
  if (!config.allowedProfiles.includes(userProfile)) {
    console.log(`🚫 Acceso denegado: perfil "${userProfile}" en ${routeType}`);
    console.log(`📄 Mensaje: ${config.message}`);
    const userMainRoute = getProfileMainRoute(userProfile);
    console.log(`🔄 Redirigiendo a: ${userMainRoute}`);
    return <Navigate to={userMainRoute} state={{ from: location }} replace />;
  }

  // 5) Permitido
  console.log(`✅ Acceso autorizado: perfil "${userProfile}" en ${routeType}`);
  return <>{children}</>;
};
