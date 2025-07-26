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
  const { user: retailUser } = useAuth();
  const { user: wholesaleUser } = useWholesaleAuth();
  const { user: adminUser } = useAdmin();

  // Determinar usuario actual
  const currentUser = adminUser || wholesaleUser || retailUser;

  // *** DETECCIÓN DE PERFIL POR EMAIL ***
  const getUserProfile = (user: any): string | null => {
    if (!user) return null;
    const email = user.email || '';

    // ADMIN GENERAL - Incluye tu email
    if (
      email === 'admin@pecaditos.com' ||
      email === 'albertonaldos@gmail.com'
    )
      return 'admin';

    if (email === 'pedidos@pecaditos.com') return 'pedidos';
    if (email === 'reparto@pecaditos.com') return 'reparto';
    if (email === 'produccion@pecaditos.com') return 'produccion';
    if (email === 'cobranzas@pecaditos.com') return 'cobranzas';
    if (email === 'logistica@pecaditos.com') return 'logistica';

    // Mayoristas
    if (
      email.includes('@ejemplo.com') ||
      email.includes('distribuidora') ||
      email.includes('minimarket') ||
      email.includes('mayorista')
    ) {
      return 'mayorista';
    }

    // Retail (default)
    return 'retail';
  };

  const userProfile = getUserProfile(currentUser);

  // Ruta principal por perfil
  const getProfileMainRoute = (profile: string): string => {
    switch (profile) {
      case 'admin':
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
        return '/'; // landing
      default:
        return '/';
    }
  };

  // Configuración de acceso por ruta
  const routeConfig = {
    CATALOG_RETAIL: {
      allowedProfiles: ['admin'],
      redirectTo: '/',
      requireAuth: true,
      message: 'Catálogo minorista temporalmente no disponible',
    },
    CATALOG_WHOLESALE: {
      allowedProfiles: ['mayorista', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido a mayoristas autorizados',
    },
    ADMIN: {
      allowedProfiles: ['admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido a administrador general',
    },
    ORDERS: {
      allowedProfiles: ['pedidos', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de pedidos',
    },
    DELIVERY: {
      allowedProfiles: ['reparto', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de reparto',
    },
    PRODUCTION: {
      allowedProfiles: ['produccion', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de producción',
    },
    BILLING: {
      allowedProfiles: ['cobranzas', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de cobranzas',
    },
    LOGISTICS: {
      allowedProfiles: ['logistica', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de logística',
    },
    PUBLIC: {
      allowedProfiles: [
        'admin',
        'mayorista',
        'pedidos',
        'reparto',
        'produccion',
        'cobranzas',
        'retail',
        'public',
      ],
      redirectTo: '/',
      requireAuth: false,
      message: 'Acceso público',
    },
  };

  const config = routeConfig[routeType];

  // Si no requiere autenticación, permitir acceso
  if (!config.requireAuth) {
    return <>{children}</>;
  }

  // Si requiere autenticación pero no hay usuario logueado
  if (config.requireAuth && !currentUser) {
    console.log(
      `🔒 Acceso denegado: No hay usuario autenticado para ${routeType}`
    );
    return <Navigate to={config.redirectTo} state={{ from: location }} replace />;
  }

  // Verificar permisos por perfil específico
  if (!config.allowedProfiles.includes(userProfile || '')) {
    console.log(
      `🚫 Acceso denegado: Usuario con perfil "${userProfile}" intentó acceder a ${routeType}`
    );
    console.log(`📄 Mensaje: ${config.message}`);

    const userMainRoute = getProfileMainRoute(userProfile || '');
    console.log(`🔄 Redirigiendo a: ${userMainRoute}`);

    return <Navigate to={userMainRoute} state={{ from: location }} replace />;
  }

  // Usuario autorizado - permitir acceso
  console.log(
    `✅ Acceso autorizado: Usuario con perfil "${userProfile}" accedió a ${routeType}`
  );
  return <>{children}</>;
};
