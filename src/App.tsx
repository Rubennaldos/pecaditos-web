
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
import OrderTracking from "./pages/OrderTracking";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      
      {/* PROVIDERS DE AUTENTICACIÓN - Todos los contextos disponibles */}
      <AuthProvider>
        <WholesaleAuthProvider>
          <AdminProvider>
            <BrowserRouter>
              <Routes>
                {/* PÁGINA PRINCIPAL - Landing/Bienvenida - Acceso público */}
                <Route path="/" element={<Index />} />
                
                {/* LOGIN UNIFICADO - Detecta automáticamente el tipo de usuario */}
                <Route path="/login" element={<Login />} />
                
                {/* CATÁLOGO MINORISTA - *** COMPLETAMENTE OCULTO *** */}
                {/* Para reactivar: cambiar allowedRoles en ProtectedRoute.tsx */}
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
                
                {/* PORTAL MAYORISTA - Solo mayoristas y admin autenticados */}
                <Route 
                  path="/mayorista" 
                  element={
                    <ProtectedRoute routeType="CATALOG_WHOLESALE">
                      <WholesalePortal />
                    </ProtectedRoute>
                  } 
                />
                
                {/* PANEL DE ADMINISTRACIÓN - Solo usuarios admin */}
                <Route 
                  path="/admin" 
                  element={
                    <ProtectedRoute routeType="ADMIN">
                      <AdminPanel />
                    </ProtectedRoute>
                  } 
                />
                
                {/* SEGUIMIENTO DE PEDIDOS - Acceso público */}
                <Route 
                  path="/seguimiento" 
                  element={
                    <ProtectedRoute routeType="PUBLIC">
                      <OrderTracking />
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
CONFIGURACIÓN DE RUTAS Y PROTECCIÓN:

RUTAS ACTIVAS:
1. / - Landing page principal (público)
2. /login - Login unificado (público)
3. /mayorista - Portal mayorista (solo mayoristas + admin)
4. /admin - Panel administración (solo admin)
5. /seguimiento - Consulta pedidos (público)

RUTAS OCULTAS:
6. /catalogo y /productos - Catálogo minorista (OCULTO - redirige a /login)

PARA REACTIVAR CATÁLOGO MINORISTA:
1. Ir a src/components/auth/ProtectedRoute.tsx
2. Cambiar CATALOG_RETAIL.allowedRoles de [] a ['retail', 'admin']
3. Descomentar código de retail en src/pages/Login.tsx

PARA PERSONALIZAR:
- Agregar nuevas rutas protegidas usando <ProtectedRoute routeType="TIPO">
- Modificar redirecciones en ProtectedRoute.tsx
- Cambiar tipos de acceso por ruta según necesidad del negocio

TIPOS DE PROTECCIÓN DISPONIBLES:
- CATALOG_RETAIL: Catálogo minorista (actualmente oculto)
- CATALOG_WHOLESALE: Catálogo mayorista  
- ADMIN: Panel administrativo
- PUBLIC: Acceso público sin restricciones
*/
