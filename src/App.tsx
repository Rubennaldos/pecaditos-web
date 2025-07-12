
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
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
      <BrowserRouter>
        <Routes>
          {/* PÁGINA PRINCIPAL - Landing/Bienvenida */}
          <Route path="/" element={<Index />} />
          
          {/* CATÁLOGO MINORISTA - Cliente final */}
          <Route path="/catalogo" element={<Catalog />} />
          <Route path="/productos" element={<Catalog />} />
          
          {/* PORTAL MAYORISTA - Login exclusivo */}
          <Route path="/mayorista" element={<WholesalePortal />} />
          
          {/* PANEL DE ADMINISTRACIÓN - Personal interno */}
          <Route path="/admin" element={<AdminPanel />} />
          
          {/* SEGUIMIENTO DE PEDIDOS - Público */}
          <Route path="/seguimiento" element={<OrderTracking />} />
          
          {/* RUTA 404 - Debe ir al final */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

/*
RUTAS CONFIGURADAS:

1. / - Landing page principal (bienvenida)
2. /catalogo o /productos - Catálogo para cliente final 
3. /mayorista - Portal exclusivo para mayoristas
4. /admin - Panel de administración (todos los perfiles)
5. /seguimiento - Consulta pública de estado de pedidos

PARA PERSONALIZAR:
- Agregar nuevas rutas en el array Routes
- Modificar paths según necesidades
- Agregar protección de rutas si es necesario
*/
