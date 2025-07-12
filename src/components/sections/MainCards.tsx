
import { useEffect, useState } from 'react';
import { ArrowRight, Package, UserCheck, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useWholesaleAuth } from '@/contexts/WholesaleAuthContext';
import { useAdmin } from '@/contexts/AdminContext';

export const MainCards = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showRetailCatalog, setShowRetailCatalog] = useState(false); // Control manual para mostrar catálogo minorista
  
  // Hooks de autenticación para detectar usuarios logueados
  const { user: retailUser } = useAuth();
  const { user: wholesaleUser } = useWholesaleAuth();
  const { user: adminUser } = useAdmin();

  // Determinar tipo de usuario logueado
  const currentUser = adminUser || wholesaleUser || retailUser;
  const userType = adminUser ? 'admin' : wholesaleUser ? 'wholesale' : retailUser ? 'retail' : null;

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // CONFIGURACIÓN DE VISIBILIDAD DEL CATÁLOGO MINORISTA
  // Para mostrar el botón del catálogo minorista, cambiar showRetailCatalog a true
  // O descomentar la lógica condicional basada en el tipo de usuario
  const shouldShowRetailCatalog = showRetailCatalog; // || userType === 'admin'; // Ejemplo: solo admin puede ver

  return (
    <section className="container mx-auto px-4 py-8 lg:py-12">
      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
        
        {/* TARJETA CATÁLOGO MINORISTA - ACTUALMENTE OCULTA */}
        {shouldShowRetailCatalog && (
          <Card className={`group hover:shadow-xl transition-all duration-500 border-2 hover:border-amber-300 transform hover:-translate-y-2 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            <CardContent className="p-8 text-center space-y-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Package className="h-8 w-8 text-white" />
              </div>
              
              <div className="space-y-3">
                <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-200">
                  Ver Catálogo
                </h3>
                <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                  Explora nuestros productos artesanales, precios especiales y promociones exclusivas.
                </p>
              </div>
              
              <div className="space-y-3">
                <Button 
                  size="lg" 
                  className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3 group-hover:shadow-lg transition-all duration-300"
                  onClick={() => window.location.href = '/login'} // Redirige a login en lugar de catálogo
                >
                  Explorar Productos
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <p className="text-xs text-stone-500 dark:text-stone-500">
                  Necesitas iniciar sesión
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TARJETA PORTAL MAYORISTA - SIEMPRE VISIBLE */}
        <Card className={`group hover:shadow-xl transition-all duration-500 border-2 hover:border-blue-300 transform hover:-translate-y-2 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        } ${shouldShowRetailCatalog ? '' : 'md:col-span-2 max-w-lg mx-auto'}`}>
          <CardContent className="p-8 text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <UserCheck className="h-8 w-8 text-white" />
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-200">
                Portal Mayorista
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Acceso exclusivo para mayoristas con precios especiales, pedidos mínimos y gestión empresarial.
              </p>
            </div>
            
            <div className="space-y-3">
              <Button 
                size="lg" 
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 group-hover:shadow-lg transition-all duration-300"
                onClick={() => window.location.href = '/mayorista'}
              >
                Acceder como Mayorista
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <p className="text-xs text-stone-500 dark:text-stone-500">
                Solo usuarios registrados
              </p>
            </div>
          </CardContent>
        </Card>

        {/* PANEL DE CONTROL DE VISIBILIDAD - Solo visible para admin en desarrollo */}
        {adminUser && process.env.NODE_ENV === 'development' && (
          <Card className="md:col-span-2 border-dashed border-orange-300 bg-orange-50">
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center gap-4">
                <span className="text-sm text-orange-800">
                  Control Admin - Catálogo Minorista:
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowRetailCatalog(!showRetailCatalog)}
                  className="text-orange-800 border-orange-300"
                >
                  {showRetailCatalog ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-2" />
                      Ocultar
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-2" />
                      Mostrar
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};

/*
CONFIGURACIÓN DE VISIBILIDAD DEL CATÁLOGO MINORISTA:

ESTADO ACTUAL:
- showRetailCatalog = false (catálogo minorista oculto)
- Solo se muestra el Portal Mayorista

PARA REACTIVAR CATÁLOGO MINORISTA:
1. Cambiar showRetailCatalog a true en la línea 21
2. O descomentar la lógica condicional: || userType === 'admin'
3. Asegurar que ProtectedRoute permita acceso a CATALOG_RETAIL

OPCIONES DE CONFIGURACIÓN:
- Mostrar siempre: showRetailCatalog = true
- Mostrar solo para admin: userType === 'admin'
- Mostrar solo para usuarios logueados: currentUser !== null
- Ocultar completamente: showRetailCatalog = false (actual)

FUNCIONALIDAD ACTUAL:
- Botón "Ver Catálogo" redirige a /login (no a /catalogo)
- Portal Mayorista funciona normalmente
- Panel de control admin visible solo en desarrollo

PERSONALIZACIÓN:
- Modificar los gradientes de color de las tarjetas
- Cambiar textos descriptivos
- Ajustar animaciones y efectos hover
- Cambiar rutas de redirección según necesidades
*/
