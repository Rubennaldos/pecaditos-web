import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { WholesaleAuthProvider } from "@/contexts/WholesaleAuthContext";
import { AdminProvider } from "@/contexts/AdminContext";
import { AdminOrdersProvider } from "@/contexts/AdminOrdersContext"; // ⬅️ NUEVO
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AuthErrorBoundary } from "@/components/auth/AuthErrorBoundary";

import Index from "./pages/Index";
import Login from "./pages/Login";
import Catalog from "./pages/Catalog";
import WholesalePortal from "./pages/WholesalePortal";
import AdminPanel from "./pages/AdminPanel";
import OrdersPanel from "./pages/OrdersPanel";
import DeliveryPanel from "./pages/DeliveryPanel";
import ProductionPanel from "./pages/ProductionPanel";
import BillingPanel from "./pages/BillingPanel";
import LogisticsPanel from "./pages/LogisticsPanel";
import OrderTracking from "./pages/OrderTracking";
import DondeNosUbicamos from "./pages/DondeNosUbicamos";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthErrorBoundary>
      {/* PROVIDERS DE AUTENTICACIÓN - Sistema unificado por perfiles */}
      <AuthProvider>
        <WholesaleAuthProvider>
          <AdminProvider>
            {/* ⬇️ Proveedor que expone orders + acciones a todo el panel */}
            <AdminOrdersProvider>
              <BrowserRouter>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
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

                    {/* PANEL DE LOGÍSTICA - Solo perfil logística y admin */}
                    <Route
                      path="/logistica"
                      element={
                        <ProtectedRoute routeType="LOGISTICS">
                          <LogisticsPanel />
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

                    {/* PORTAL MAYORISTA - Acceso para mayoristas */}
                    <Route
                      path="/mayorista"
                      element={
                        <ProtectedRoute routeType="CATALOG_WHOLESALE">
                          <WholesalePortal />
                        </ProtectedRoute>
                      }
                    />

                    {/* DÓNDE NOS UBICAMOS - Nueva ruta pública */}
                    <Route
                      path="/donde-nos-ubicamos"
                      element={
                        <ProtectedRoute routeType="PUBLIC">
                          <DondeNosUbicamos />
                        </ProtectedRoute>
                      }
                    />

                    {/* RUTA 404 - Debe ir al final */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </TooltipProvider>
              </BrowserRouter>
            </AdminOrdersProvider>
          </AdminProvider>
        </WholesaleAuthProvider>
      </AuthProvider>
    </AuthErrorBoundary>
  </QueryClientProvider>
);

export default App;
