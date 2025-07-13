
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * COMPONENTE DE RUTA PROTEGIDA - CONTROL DE ACCESO POR PERFIL
 * 
 * PERFILES ACTIVOS:
 * - admin: Administrador general con acceso completo
 * - mayorista: Portal mayorista 
 * - pedidos: Panel de pedidos y preparación
 * - reparto: Panel de distribución y entrega
 * - produccion: Panel de producción y stock
 * - cobranzas: Panel de facturación y cobros
 * 
 * NOTA: El perfil "seguimiento" fue ELIMINADO completamente
 * 
 * DETECCIÓN DE PERFIL POR EMAIL:
 * - admin@pecaditos.com → /admin
 * - pedidos@pecaditos.com → /pedidos  
 * - reparto@pecaditos.com → /reparto
 * - produccion@pecaditos.com → /produccion
 * - cobranzas@pecaditos.com → /cobranzas
 * - mayoristas@ejemplo.com → /mayorista
 * 
 * EDITAR AQUÍ para cambiar detección de perfiles o rutas de redirección
 */

export type RouteType = 'CATALOG_RETAIL' | 'CATALOG_WHOLESALE' | 'ADMIN' | 'ORDERS' | 'DELIVERY' | 'PRODUCTION' | 'BILLING' | 'PUBLIC';

interface ProtectedRouteProps {
  children: React.ReactNode;
  routeType: RouteType;
}

export const ProtectedRoute = ({ children, routeType }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user: retailUser } = useAuth();
  const { user: wholesaleUser } = useWholesaleAuth();
  const { user: adminUser } = useAdmin();

  const currentUser = adminUser || wholesaleUser || retailUser;
  
  // FUNCIÓN PARA DETECTAR PERFIL POR EMAIL
  // EDITAR AQUÍ para cambiar la lógica de detección de perfiles
  const getUserProfile = (user: any): string | null => {
    if (!user) return null;
    
    const email = user.email || '';
    
    // Perfiles administrativos específicos
    if (email === 'admin@pecaditos.com') return 'admin';
    if (email === 'pedidos@pecaditos.com') return 'pedidos';
    if (email === 'reparto@pecaditos.com') return 'reparto';
    if (email === 'produccion@pecaditos.com') return 'produccion';
    if (email === 'cobranzas@pecaditos.com') return 'cobranzas';
    
    // NOTA: Perfil "seguimiento" ELIMINADO completamente
    
    // Mayoristas
    if (email.includes('@ejemplo.com') || 
        email.includes('mayorista') || 
        email.includes('distribuidora') || 
        email.includes('minimarket')) {
      return 'mayorista';
    }
    
    // Retail (oculto)
    return 'retail';
  };

  const userProfile = getUserProfile(currentUser);

  // FUNCIÓN PARA OBTENER LA RUTA PRINCIPAL DE CADA PERFIL
  // EDITAR AQUÍ para cambiar rutas de redirección
  const getProfileMainRoute = (profile: string): string => {
    switch (profile) {
      case 'admin': return '/admin';
      case 'pedidos': return '/pedidos';
      case 'reparto': return '/reparto';
      case 'produccion': return '/produccion';
      case 'cobranzas': return '/cobranzas';
      case 'mayorista': return '/mayorista';
      case 'retail': return '/login'; // Catálogo oculto
      default: return '/';
    }
  };

  // CONFIGURACIÓN DE ACCESO POR RUTA
  // EDITAR AQUÍ para modificar permisos de acceso
  const routeConfig = {
    // CATÁLOGO MINORISTA - COMPLETAMENTE OCULTO
    CATALOG_RETAIL: {
      allowedProfiles: ['admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Catálogo minorista oculto - Solo admin'
    },
    
    // CATÁLOGO MAYORISTA - Solo mayoristas y admin
    CATALOG_WHOLESALE: {
      allowedProfiles: ['mayorista', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido a mayoristas'
    },
    
    // ADMIN - Solo admin general
    ADMIN: {
      allowedProfiles: ['admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Solo administrador general'
    },

    // PEDIDOS - Solo perfil pedidos y admin
    ORDERS: {
      allowedProfiles: ['pedidos', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Solo área de pedidos'
    },

    // REPARTO - Solo perfil reparto y admin  
    DELIVERY: {
      allowedProfiles: ['reparto', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Solo área de reparto'
    },

    // PRODUCCIÓN - Solo perfil producción y admin
    PRODUCTION: {
      allowedProfiles: ['produccion', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Solo área de producción'
    },

    // COBRANZAS - Solo perfil cobranzas y admin
    BILLING: {
      allowedProfiles: ['cobranzas', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Solo área de cobranzas'
    },
    
    // PÚBLICO - Sin restricción
    PUBLIC: {
      allowedProfiles: ['admin', 'mayorista', 'pedidos', 'reparto', 'produccion', 'cobranzas', 'retail', 'public'],
      redirectTo: '/',
      requireAuth: false,
      message: 'Acceso público'
    }
  };

  const config = routeConfig[routeType];

  if (!config.requireAuth) {
    return <>{children}</>;
  }

  if (config.requireAuth && !currentUser) {
    console.log(`🔒 Usuario no autenticado para ${routeType}`);
    return <Navigate to={config.redirectTo} state={{ from: location }} replace />;
  }

  if (!config.allowedProfiles.includes(userProfile || '')) {
    console.log(`🚫 Acceso denegado: "${userProfile}" intentó acceder a ${routeType}`);
    console.log(`📋 ${config.message}`);
    
    const userMainRoute = getProfileMainRoute(userProfile || '');
    console.log(`🔄 Redirigiendo a: ${userMainRoute}`);
    
    return <Navigate to={userMainRoute} state={{ from: location }} replace />;
  }

  console.log(`✅ Acceso autorizado: "${userProfile}" → ${routeType}`);
  return <>{children}</>;
};

/*
INSTRUCCIONES PARA EDITAR:

1. CAMBIAR DETECCIÓN DE PERFILES:
   - Modificar getUserProfile() línea 30-50
   - Cambiar patrones de email o criterios

2. CAMBIAR RUTAS DE REDIRECCIÓN:
   - Modificar getProfileMainRoute() línea 55-65
   - Actualizar rutas por perfil

3. MODIFICAR PERMISOS:
   - Editar routeConfig línea 70-130
   - Cambiar allowedProfiles según necesidades

4. AGREGAR NUEVOS PERFILES:
   - Añadir detección en getUserProfile()
   - Agregar ruta en getProfileMainRoute()
   - Configurar permisos en routeConfig

PERFILES ACTIVOS:
✅ admin, pedidos, reparto, produccion, cobranzas, mayorista
❌ seguimiento (ELIMINADO)
❌ retail (OCULTO)
*/
