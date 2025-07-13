
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * COMPONENTE DE RUTA PROTEGIDA - CONTROL DE ACCESO POR PERFIL
 * 
 * Controla el acceso a diferentes rutas según el perfil específico del usuario:
 * - CATALOG_RETAIL: Catálogo minorista (OCULTO - solo admin puede acceder)
 * - CATALOG_WHOLESALE: Solo mayoristas y admin
 * - ADMIN: Solo usuario admin general (perfil "admin")
 * - ORDERS: Solo perfil de pedidos
 * - DELIVERY: Solo perfil de reparto
 * - PRODUCTION: Solo perfil de producción
 * - TRACKING: Solo perfil de seguimiento
 * - BILLING: Solo perfil de cobranzas
 * - PUBLIC: Acceso público (seguimiento de pedidos)
 * 
 * DETECCIÓN DE PERFIL:
 * El perfil se detecta automáticamente por el email del usuario:
 * - admin@pecaditos.com -> perfil "admin" -> ruta /admin
 * - pedidos@pecaditos.com -> perfil "pedidos" -> ruta /pedidos
 * - reparto@pecaditos.com -> perfil "reparto" -> ruta /reparto
 * - produccion@pecaditos.com -> perfil "produccion" -> ruta /produccion
 * - seguimiento@pecaditos.com -> perfil "seguimiento" -> ruta /seguimiento
 * - cobranzas@pecaditos.com -> perfil "cobranzas" -> ruta /cobranzas
 * - distribuidora@ejemplo.com -> perfil "mayorista" -> ruta /mayorista
 * 
 * IMPORTANTE: Cada perfil solo puede acceder a SU ruta específica.
 * Si intenta acceder a otra ruta, será redirigido automáticamente a su panel.
 */

export type RouteType = 'CATALOG_RETAIL' | 'CATALOG_WHOLESALE' | 'ADMIN' | 'ORDERS' | 'DELIVERY' | 'PRODUCTION' | 'TRACKING' | 'BILLING' | 'PUBLIC';

interface ProtectedRouteProps {
  children: React.ReactNode;
  routeType: RouteType;
}

export const ProtectedRoute = ({ children, routeType }: ProtectedRouteProps) => {
  const location = useLocation();
  const { user: retailUser } = useAuth();
  const { user: wholesaleUser } = useWholesaleAuth();
  const { user: adminUser } = useAdmin();

  // Determinar qué tipo de usuario está logueado
  const currentUser = adminUser || wholesaleUser || retailUser;
  
  // FUNCIÓN PARA DETECTAR PERFIL POR EMAIL
  // Aquí es donde se puede modificar la lógica de detección de perfiles
  const getUserProfile = (user: any): string | null => {
    if (!user) return null;
    
    const email = user.email || '';
    
    // Detección por email específico para cada perfil administrativo
    if (email === 'admin@pecaditos.com') return 'admin';
    if (email === 'pedidos@pecaditos.com') return 'pedidos';
    if (email === 'reparto@pecaditos.com') return 'reparto';
    if (email === 'produccion@pecaditos.com') return 'produccion';
    if (email === 'seguimiento@pecaditos.com') return 'seguimiento';
    if (email === 'cobranzas@pecaditos.com') return 'cobranzas';
    
    // Detección de mayoristas por patrones de email
    if (email.includes('@ejemplo.com') || 
        email.includes('distribuidora') || 
        email.includes('minimarket') ||
        email.includes('mayorista')) {
      return 'mayorista';
    }
    
    // Usuarios retail (catálogo oculto)
    return 'retail';
  };

  const userProfile = getUserProfile(currentUser);

  // FUNCIÓN PARA OBTENER LA RUTA PRINCIPAL DE CADA PERFIL
  // Aquí es donde se puede modificar las rutas de redirección por perfil
  const getProfileMainRoute = (profile: string): string => {
    switch (profile) {
      case 'admin': return '/admin';
      case 'pedidos': return '/pedidos';
      case 'reparto': return '/reparto';
      case 'produccion': return '/produccion';
      case 'seguimiento': return '/seguimiento';
      case 'cobranzas': return '/cobranzas';
      case 'mayorista': return '/mayorista';
      case 'retail': return '/login'; // Catálogo oculto
      default: return '/login';
    }
  };

  // CONFIGURACIÓN DE ACCESO POR RUTA
  // Aquí es donde se define qué perfiles pueden acceder a cada ruta
  const routeConfig = {
    // CATÁLOGO MINORISTA - SOLO ADMIN PUEDE ACCEDER (OCULTO)
    CATALOG_RETAIL: {
      allowedProfiles: ['admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Catálogo minorista temporalmente no disponible'
    },
    
    // CATÁLOGO MAYORISTA - Solo mayoristas y admin
    CATALOG_WHOLESALE: {
      allowedProfiles: ['mayorista', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido a mayoristas autorizados'
    },
    
    // PANEL ADMIN - Solo perfil admin general
    ADMIN: {
      allowedProfiles: ['admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido a administrador general'
    },

    // PANEL PEDIDOS - Solo perfil pedidos
    ORDERS: {
      allowedProfiles: ['pedidos', 'admin'], // Admin puede impersonar
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de pedidos'
    },

    // PANEL REPARTO - Solo perfil reparto
    DELIVERY: {
      allowedProfiles: ['reparto', 'admin'], // Admin puede impersonar
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de reparto'
    },

    // PANEL PRODUCCIÓN - Solo perfil producción
    PRODUCTION: {
      allowedProfiles: ['produccion', 'admin'], // Admin puede impersonar
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de producción'
    },

    // PANEL SEGUIMIENTO - Solo perfil seguimiento
    TRACKING: {
      allowedProfiles: ['seguimiento', 'admin'], // Admin puede impersonar
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de seguimiento'
    },

    // PANEL COBRANZAS - Solo perfil cobranzas
    BILLING: {
      allowedProfiles: ['cobranzas', 'admin'], // Admin puede impersonar
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido al área de cobranzas'
    },
    
    // RUTAS PÚBLICAS - Sin restricción
    PUBLIC: {
      allowedProfiles: ['admin', 'mayorista', 'pedidos', 'reparto', 'produccion', 'seguimiento', 'cobranzas', 'retail', 'public'],
      redirectTo: '/',
      requireAuth: false,
      message: 'Acceso público'
    }
  };

  const config = routeConfig[routeType];

  // Si no requiere autenticación, permitir acceso
  if (!config.requireAuth) {
    return <>{children}</>;
  }

  // Si requiere autenticación pero no hay usuario logueado
  if (config.requireAuth && !currentUser) {
    console.log(`🔒 Acceso denegado: No hay usuario autenticado para ${routeType}`);
    return <Navigate to={config.redirectTo} state={{ from: location }} replace />;
  }

  // Verificar permisos por perfil específico
  if (!config.allowedProfiles.includes(userProfile || '')) {
    // REGISTRO DE INTENTO DE ACCESO NO AUTORIZADO
    console.log(`🚫 Acceso denegado: Usuario con perfil "${userProfile}" intentó acceder a ${routeType}`);
    console.log(`📄 Mensaje: ${config.message}`);
    
    // REDIRIGIR AL PANEL PRINCIPAL DEL PERFIL DEL USUARIO
    const userMainRoute = getProfileMainRoute(userProfile || '');
    console.log(`🔄 Redirigiendo a: ${userMainRoute}`);
    
    return <Navigate to={userMainRoute} state={{ from: location }} replace />;
  }

  // Usuario autorizado - permitir acceso
  console.log(`✅ Acceso autorizado: Usuario con perfil "${userProfile}" accedió a ${routeType}`);
  return <>{children}</>;
};

/*
INSTRUCCIONES PARA MODIFICAR EL SISTEMA:

1. PARA AGREGAR NUEVOS PERFILES:
   - Modificar getUserProfile() para detectar el nuevo perfil por email
   - Agregar la ruta principal en getProfileMainRoute()
   - Crear nueva entrada en routeConfig con los perfiles permitidos
   - Agregar el nuevo RouteType al enum

2. PARA CAMBIAR DETECCIÓN DE PERFILES:
   - Modificar la función getUserProfile()
   - Cambiar los patrones de email o criterios de detección
   - Actualizar los comentarios de documentación

3. PARA MODIFICAR RUTAS DE REDIRECCIÓN:
   - Cambiar getProfileMainRoute() para nuevas rutas
   - Actualizar routeConfig según necesidades

4. PARA PERMITIR IMPERSONACIÓN:
   - Solo el perfil 'admin' puede acceder a otros paneles
   - Otros perfiles son redirigidos automáticamente a su panel

5. LOGS Y DEBUGGING:
   - Todos los intentos de acceso se registran en console.log
   - Incluye perfil del usuario, ruta solicitada y resultado
   - Emojis para fácil identificación: 🔒 🚫 🔄 ✅

PERFILES CONFIGURADOS:
- admin: Acceso completo + impersonación
- pedidos: Solo /pedidos  
- reparto: Solo /reparto
- produccion: Solo /produccion
- seguimiento: Solo /seguimiento
- cobranzas: Solo /cobranzas
- mayorista: Solo /mayorista
- retail: Bloqueado (catálogo oculto)
*/
