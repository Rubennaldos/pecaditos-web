
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * COMPONENTE DE RUTA PROTEGIDA
 * 
 * Controla el acceso a diferentes rutas según el perfil del usuario:
 * - CATALOG_RETAIL: Catálogo minorista (OCULTO - redirige a login)
 * - CATALOG_WHOLESALE: Solo mayoristas y admin
 * - ADMIN: Solo usuarios admin
 * - PUBLIC: Acceso público (seguimiento de pedidos)
 * 
 * PARA REACTIVAR CATÁLOGO MINORISTA:
 * - Cambiar allowedRoles de CATALOG_RETAIL de [] a ['retail', 'admin']
 * - O eliminar la validación completamente
 */

export type RouteType = 'CATALOG_RETAIL' | 'CATALOG_WHOLESALE' | 'ADMIN' | 'PUBLIC';

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
  const userType = adminUser ? 'admin' : wholesaleUser ? 'wholesale' : retailUser ? 'retail' : null;

  // CONFIGURACIÓN DE ACCESO POR RUTA
  const routeConfig = {
    // CATÁLOGO MINORISTA - COMPLETAMENTE OCULTO
    // Para reactivar: cambiar allowedRoles a ['retail', 'admin']
    CATALOG_RETAIL: {
      allowedRoles: [], // VACÍO = NADIE PUEDE ACCEDER
      redirectTo: '/login',
      requireAuth: true
    },
    
    // CATÁLOGO MAYORISTA - Solo mayoristas y admin
    CATALOG_WHOLESALE: {
      allowedRoles: ['wholesale', 'admin'],
      redirectTo: '/login',
      requireAuth: true
    },
    
    // PANEL ADMIN - Solo admin
    ADMIN: {
      allowedRoles: ['admin'],
      redirectTo: '/login',
      requireAuth: true
    },
    
    // RUTAS PÚBLICAS - Sin restricción
    PUBLIC: {
      allowedRoles: ['retail', 'wholesale', 'admin', 'public'],
      redirectTo: '/',
      requireAuth: false
    }
  };

  const config = routeConfig[routeType];

  // Si no requiere autenticación, permitir acceso
  if (!config.requireAuth) {
    return <>{children}</>;
  }

  // Si requiere autenticación pero no hay usuario logueado
  if (config.requireAuth && !currentUser) {
    return <Navigate to={config.redirectTo} state={{ from: location }} replace />;
  }

  // Verificar permisos por tipo de usuario
  if (!config.allowedRoles.includes(userType || '')) {
    // REGISTRO DE INTENTO DE ACCESO NO AUTORIZADO
    console.log(`Acceso denegado: Usuario ${userType} intentó acceder a ${routeType}`);
    return <Navigate to={config.redirectTo} state={{ from: location }} replace />;
  }

  // Usuario autorizado - permitir acceso
  return <>{children}</>;
};

/*
INSTRUCCIONES PARA MODIFICAR ACCESO:

1. PARA REACTIVAR CATÁLOGO MINORISTA:
   - Cambiar CATALOG_RETAIL.allowedRoles de [] a ['retail', 'admin']
   - O agregar 'wholesale' si también quieres que mayoristas accedan

2. PARA CAMBIAR REDIRECCIONES:
   - Modificar redirectTo en cada configuración
   - Ejemplo: redirectTo: '/acceso-denegado'

3. PARA AGREGAR NUEVOS TIPOS DE RUTA:
   - Agregar a RouteType: 'NUEVA_RUTA'
   - Agregar configuración en routeConfig
   - Usar en componente: <ProtectedRoute routeType="NUEVA_RUTA">

4. LOGS Y DEBUGGING:
   - Los intentos de acceso no autorizado se registran en console.log
   - Para producción, cambiar por sistema de logs robusto
*/
