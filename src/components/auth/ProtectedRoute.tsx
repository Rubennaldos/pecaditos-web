
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';

/**
 * COMPONENTE DE RUTA PROTEGIDA - CONTROL DE ACCESO TOTAL
 * 
 * Controla el acceso a diferentes rutas según el perfil del usuario:
 * - CATALOG_RETAIL: Catálogo minorista (OCULTO - solo admin puede acceder)
 * - CATALOG_WHOLESALE: Solo mayoristas y admin
 * - ADMIN: Solo usuarios admin (todos los sub-perfiles de admin)
 * - PUBLIC: Acceso público (seguimiento de pedidos)
 * 
 * PERFILES DE ADMIN DISPONIBLES:
 * - admin: Acceso completo
 * - pedidos: Gestión de pedidos
 * - reparto: Control de entregas
 * - produccion: Control de stock y producción
 * - seguimiento: Seguimiento de clientes
 * - cobranzas: Gestión de facturación
 * 
 * PARA REACTIVAR CATÁLOGO MINORISTA:
 * - Cambiar allowedRoles de CATALOG_RETAIL de ['admin'] a ['retail', 'admin']
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
    // CATÁLOGO MINORISTA - SOLO ADMIN PUEDE ACCEDER (OCULTO PARA TODOS LOS DEMÁS)
    // Para reactivar completamente: cambiar allowedRoles a ['retail', 'admin']
    CATALOG_RETAIL: {
      allowedRoles: ['admin'], // SOLO ADMIN - Catálogo minorista oculto
      redirectTo: '/login',
      requireAuth: true,
      message: 'Catálogo minorista temporalmente no disponible'
    },
    
    // CATÁLOGO MAYORISTA - Solo mayoristas y admin
    CATALOG_WHOLESALE: {
      allowedRoles: ['wholesale', 'admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido a mayoristas autorizados'
    },
    
    // PANEL ADMIN - Todos los perfiles administrativos
    ADMIN: {
      allowedRoles: ['admin'],
      redirectTo: '/login',
      requireAuth: true,
      message: 'Acceso restringido a personal autorizado'
    },
    
    // RUTAS PÚBLICAS - Sin restricción
    PUBLIC: {
      allowedRoles: ['retail', 'wholesale', 'admin', 'public'],
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
    console.log(`Acceso denegado: No hay usuario autenticado para ${routeType}`);
    return <Navigate to={config.redirectTo} state={{ from: location }} replace />;
  }

  // Verificar permisos por tipo de usuario
  if (!config.allowedRoles.includes(userType || '')) {
    // REGISTRO DE INTENTO DE ACCESO NO AUTORIZADO
    console.log(`Acceso denegado: Usuario ${userType} intentó acceder a ${routeType}`);
    console.log(`Mensaje: ${config.message}`);
    
    // Redirigir según el tipo de usuario
    let redirectPath = config.redirectTo;
    if (adminUser) redirectPath = '/admin';
    else if (wholesaleUser) redirectPath = '/mayorista';
    else if (retailUser) redirectPath = '/login'; // Retail va a login porque catálogo está oculto
    
    return <Navigate to={redirectPath} state={{ from: location }} replace />;
  }

  // Usuario autorizado - permitir acceso
  console.log(`Acceso autorizado: Usuario ${userType} accedió a ${routeType}`);
  return <>{children}</>;
};

/*
INSTRUCCIONES PARA MODIFICAR ACCESO:

1. PARA REACTIVAR CATÁLOGO MINORISTA COMPLETAMENTE:
   - Cambiar CATALOG_RETAIL.allowedRoles de ['admin'] a ['retail', 'admin']
   - Descomentar código retail en Login.tsx
   - Cambiar showRetailCatalog a true en MainCards.tsx

2. PARA PERSONALIZAR REDIRECCIONES:
   - Modificar redirectTo en cada configuración
   - Personalizar mensajes de acceso denegado

3. PARA AGREGAR NUEVOS TIPOS DE RUTA:
   - Agregar a RouteType
   - Agregar configuración en routeConfig
   - Usar: <ProtectedRoute routeType="NUEVA_RUTA">

4. LOGS Y DEBUGGING:
   - Todos los intentos de acceso se registran en console.log
   - Incluye información del usuario, ruta y resultado

5. PERFILES ADMINISTRATIVOS:
   Todos los sub-perfiles (pedidos, reparto, produccion, seguimiento, cobranzas)
   son tratados como 'admin' y tienen acceso al panel /admin donde cada uno
   ve solo sus secciones permitidas según su perfil específico.
*/
