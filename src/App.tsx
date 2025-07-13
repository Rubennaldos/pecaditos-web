
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { WholesaleAuthProvider } from "@/contexts/WholesaleAuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Catalog from "./pages/Catalog";
import WholesalePortal from "./pages/WholesalePortal";
import AdminPanel from "./pages/AdminPanel";
import OrdersPanel from "./pages/OrdersPanel";
import DeliveryPanel from "./pages/DeliveryPanel";
import ProductionPanel from "./pages/ProductionPanel";
import BillingPanel from "./pages/BillingPanel";
import OrderTracking from "./pages/OrderTracking";
import WhereToFindUs from "./pages/WhereToFindUs";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      {/* PROVIDERS DE AUTENTICACIÓN - Sistema unificado por perfiles */}
      <AuthProvider>
        <WholesaleAuthProvider>
          <AdminProvider>
            <BrowserRouter>
              <Routes>
                {/* PÁGINA PRINCIPAL - Landing/Bienvenida - Acceso público */}
                <Route path="/" element={<Index />} />
                
                {/* LOGIN UNIFICADO - Detecta automáticamente el perfil del usuario */}
                <Route path="/login" element={<Login />} />
                
                {/* CATÁLOGO MINORISTA - *** COMPLETAMENTE OCULTO *** */}
                {/* Solo admin puede acceder - Para reactivar: cambiar allowedProfiles en ProtectedRoute.tsx */}
                <Route 
                  path="/catalogo" 
                  element={
                    <ProtectedRoute routeType="CATALOG_RETAIL">
                      <Catalog />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/productos" 
                  element={
                    <ProtectedRoute routeType="CATALOG_RETAIL">
                      <Catalog />
                    </ProtectedRoute>
                  } 
                />
                
                {/* PORTAL MAYORISTA - Solo mayoristas y admin */}
                <Route 
                  path="/mayorista" 
                  element={
                    <ProtectedRoute routeType="CATALOG_WHOLESALE">
                      <WholesalePortal />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/catalogo-mayorista" 
                  element={
                    <ProtectedRoute routeType="CATALOG_WHOLESALE">
                      <WholesalePortal />
                    </ProtectedRoute>
                  } 
                />
                
                {/* PANEL DE ADMINISTRACIÓN GENERAL - Solo admin */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute routeType="ADMIN">
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* PANEL DE PEDIDOS - Solo perfil pedidos y admin */}
                <Route 
                  path="/pedidos" 
                  element={
                    <ProtectedRoute routeType="ORDERS">
                      <OrdersPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* PANEL DE REPARTO - Solo perfil reparto y admin */}
                <Route 
                  path="/reparto" 
                  element={
                    <ProtectedRoute routeType="DELIVERY">
                      <DeliveryPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* PANEL DE PRODUCCIÓN - Solo perfil producción y admin */}
                <Route 
                  path="/produccion" 
                  element={
                    <ProtectedRoute routeType="PRODUCTION">
                      <ProductionPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* PANEL DE COBRANZAS - Solo perfil cobranzas y admin */}
                <Route 
                  path="/cobranzas" 
                  element={
                    <ProtectedRoute routeType="BILLING">
                      <BillingPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* SEGUIMIENTO PÚBLICO DE PEDIDOS - Acceso público */}
                <Route 
                  path="/seguimiento" 
                  element={
                    <ProtectedRoute routeType="PUBLIC">
                      <OrderTracking />
                    </ProtectedRoute>
                  } 
                />
                
                {/* DÓNDE NOS UBICAMOS - Nueva ruta pública */}
                <Route 
                  path="/donde-nos-ubicamos" 
                  element={
                    <ProtectedRoute routeType="PUBLIC">
                      <WhereToFindUs />
                    </ProtectedRoute>
                  } 
                />
                
                {/* RUTA 404 - Debe ir al final */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AdminProvider>
        </WholesaleAuthProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

/*
CONFIGURACIÓN DE RUTAS POR PERFIL - SISTEMA UNIFICADO:

RUTAS POR PERFIL ESPECÍFICO:
1. / - Landing page principal (público)
2. /login - Login unificado con detección automática (público)
3. /admin - Panel administrador general (solo admin)
4. /pedidos - Panel de pedidos (solo pedidos + admin)
5. /reparto - Panel de reparto (solo reparto + admin)
6. /produccion - Panel de producción (solo produccion + admin)
7. /cobranzas - Panel de cobranzas (solo cobranzas + admin)
8. /mayorista - Portal mayorista (solo mayorista + admin)
9. /seguimiento - Consulta pública de pedidos (público)
10. /donde-nos-ubicamos - Puntos de venta (público)

RUTAS OCULTAS:
11. /catalogo y /productos - Catálogo minorista (OCULTO - solo admin)

PERFILES ACTIVOS (eliminado perfil "seguimiento"):
- admin: Acceso completo + impersonación
- pedidos: Solo /pedidos  
- reparto: Solo /reparto
- produccion: Solo /produccion
- cobranzas: Solo /cobranzas
- mayorista: Solo /mayorista
- retail: Bloqueado (catálogo oculto)

DETECCIÓN AUTOMÁTICA DE PERFIL:
- El login detecta automáticamente el perfil por email
- Cada usuario es redirigido SOLO a su panel correspondiente
- Solo admin puede acceder a otros paneles (impersonación)
- Cerrar sesión siempre lleva a la landing page

PARA REACTIVAR CATÁLOGO MINORISTA:
1. Ir a src/components/auth/ProtectedRoute.tsx
2. Cambiar CATALOG_RETAIL.allowedProfiles de ['admin'] a ['retail', 'admin']
3. Modificar getUserProfile() para detectar usuarios retail correctamente

PARA AGREGAR NUEVAS RUTAS:
1. Crear la nueva página/componente
2. Agregar la ruta en este archivo
3. Configurar ProtectedRoute con el tipo correspondiente
4. Actualizar ProtectedRoute.tsx con el nuevo perfil/ruta

SEGURIDAD:
- Cada perfil solo puede acceder a SU ruta específica
- Intentos de acceso no autorizado son redirigidos automáticamente
- Solo admin puede impersonar otros perfiles
- Todos los accesos son registrados en logs
*/
