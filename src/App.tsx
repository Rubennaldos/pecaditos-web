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
import UserDashboard from "./pages/UserDashboard";
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
              {/* 👇 IMPORTANTE: basename para que funcione en /pecaditos-web/ */}
              <BrowserRouter basename={import.meta.env.BASE_URL}>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <Routes>
                    {/* PÁGINA PRINCIPAL - Landing/Bienvenida - Acceso público */}
                    <Route path="/" element={<Index />} />

                    {/* LOGIN UNIFICADO - Detecta automáticamente el perfil del usuario */}
                    <Route path="/login" element={<Login />} />

                    {/* DASHBOARD DE USUARIO - Muestra módulos habilitados */}
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute>
                          <UserDashboard />
                        </ProtectedRoute>
                      }
                    />

                    {/* CATÁLOGO MINORISTA */}
                    <Route
                      path="/catalogo"
                      element={
                        <ProtectedRoute module="catalog">
                          <Catalog />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/productos"
                      element={
                        <ProtectedRoute module="catalog">
                          <Catalog />
                        </ProtectedRoute>
                      }
                    />

                    {/* PANEL DE ADMINISTRACIÓN GENERAL */}
                    <Route
                      path="/admin"
                      element={
                        <ProtectedRoute module="dashboard">
                          <AdminPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* PANEL DE PEDIDOS */}
                    <Route
                      path="/pedidos"
                      element={
                        <ProtectedRoute module="orders">
                          <OrdersPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* PANEL DE REPARTO */}
                    <Route
                      path="/reparto"
                      element={
                        <ProtectedRoute module="delivery">
                          <DeliveryPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* PANEL DE PRODUCCIÓN */}
                    <Route
                      path="/produccion"
                      element={
                        <ProtectedRoute module="production">
                          <ProductionPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* PANEL DE COBRANZAS */}
                    <Route
                      path="/cobranzas"
                      element={
                        <ProtectedRoute module="billing">
                          <BillingPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* PANEL DE LOGÍSTICA */}
                    <Route
                      path="/logistica"
                      element={
                        <ProtectedRoute module="logistics">
                          <LogisticsPanel />
                        </ProtectedRoute>
                      }
                    />

                    {/* SEGUIMIENTO PÚBLICO */}
                    <Route
                      path="/seguimiento"
                      element={
                        <ProtectedRoute module="tracking">
                          <OrderTracking />
                        </ProtectedRoute>
                      }
                    />

                    {/* PORTAL MAYORISTA */}
                    <Route
                      path="/mayorista"
                      element={
                        <ProtectedRoute module="wholesale">
                          <WholesalePortal />
                        </ProtectedRoute>
                      }
                    />

                    {/* DÓNDE NOS UBICAMOS */}
                    <Route
                      path="/donde-nos-ubicamos"
                      element={
                        <ProtectedRoute>
                          <DondeNosUbicamos />
                        </ProtectedRoute>
                      }
                    />

                    {/* 404 */}
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
