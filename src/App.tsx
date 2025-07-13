
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

/**
 * APLICACIÓN PRINCIPAL - SISTEMA UNIFICADO PECADITOS INTEGRALES
 * 
 * RUTAS ACTIVAS POR PERFIL:
 * 
 * PÚBLICAS:
 * - / → Landing page
 * - /login → Login único para todos los perfiles
 * - /seguimiento → Seguimiento público de pedidos
 * - /donde-nos-ubicamos → Puntos de venta (NUEVA)
 * 
 * PROTEGIDAS POR PERFIL:
 * - /admin → Solo admin general
 * - /pedidos → Solo perfil pedidos + admin
 * - /reparto → Solo perfil reparto + admin  
 * - /produccion → Solo perfil producción + admin
 * - /cobranzas → Solo perfil cobranzas + admin
 * - /mayorista → Solo mayoristas + admin
 * 
 * OCULTAS:
 * - /catalogo → Solo admin (minorista oculto)
 * - /productos → Solo admin (minorista oculto)
 * 
 * ELIMINADAS:
 * - /seguimiento-panel → ELIMINADO (era perfil seguimiento)
 * 
 * EDITAR AQUÍ para agregar nuevas rutas o cambiar configuración
 */

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      {/* CONTEXTOS DE AUTENTICACIÓN UNIFICADOS */}
      <AuthProvider>
        <WholesaleAuthProvider>
          <AdminProvider>
            <BrowserRouter>
              <Routes>
                {/* RUTAS PÚBLICAS */}
                <Route path="/" element={<Index />} />
                <Route path="/login" element={<Login />} />
                <Route 
                  path="/seguimiento" 
                  element={
                    <ProtectedRoute routeType="PUBLIC">
                      <OrderTracking />
                    </ProtectedRoute>
                  } 
                />
                <Route 
                  path="/donde-nos-ubicamos" 
                  element={
                    <ProtectedRoute routeType="PUBLIC">
                      <WhereToFindUs />
                    </ProtectedRoute>
                  } 
                />
                
                {/* CATÁLOGO MINORISTA - COMPLETAMENTE OCULTO */}
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
                
                {/* PORTAL MAYORISTA */}
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
                
                {/* PANELES POR PERFIL ESPECÍFICO */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute routeType="ADMIN">
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/pedidos" 
                  element={
                    <ProtectedRoute routeType="ORDERS">
                      <OrdersPanel />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/reparto" 
                  element={
                    <ProtectedRoute routeType="DELIVERY">
                      <DeliveryPanel />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/produccion" 
                  element={
                    <ProtectedRoute routeType="PRODUCTION">
                      <ProductionPanel />
                    </ProtectedRoute>
                  } 
                />
                
                <Route 
                  path="/cobranzas" 
                  element={
                    <ProtectedRoute routeType="BILLING">
                      <BillingPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* RUTA 404 */}
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
CONFIGURACIÓN ACTUAL DEL SISTEMA:

PERFILES ACTIVOS:
✅ admin → /admin (acceso completo + impersonación)
✅ pedidos → /pedidos (solo gestión de pedidos)
✅ reparto → /reparto (solo distribución)
✅ produccion → /produccion (solo stock)
✅ cobranzas → /cobranzas (solo facturación)
✅ mayorista → /mayorista (catálogo mayorista)

CAMBIOS REALIZADOS:
❌ Eliminado perfil "seguimiento" completamente
❌ Eliminada ruta /seguimiento-panel
✅ Agregada ruta /donde-nos-ubicamos
✅ Catálogo minorista completamente oculto

PARA EDITAR:
1. Agregar nuevas rutas: Copiar estructura existente
2. Cambiar permisos: Modificar routeType en ProtectedRoute
3. Nuevos perfiles: Actualizar ProtectedRoute.tsx también
4. Rutas públicas: Usar routeType="PUBLIC"

FIREBASE READY:
- Todos los contextos preparados para Firebase Auth
- Rutas protegidas con redirección automática
- Sistema modular y escalable
*/
