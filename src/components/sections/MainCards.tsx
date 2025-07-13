
import { Users, Phone, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

/**
 * TARJETAS PRINCIPALES DE LA LANDING PAGE
 * 
 * CONFIGURACIÓN ACTUALIZADA:
 * - Catálogo Minorista: COMPLETAMENTE OCULTO
 * - Portal Mayorista: Visible y activo
 * - Seguimiento: Público 
 * - Donde nos ubicamos: NUEVA PÁGINA agregada
 * 
 * EDITAR AQUÍ:
 * - Para reactivar catálogo minorista: cambiar showRetailCatalog a true (línea 25)
 * - Para modificar textos y descripciones: líneas 60-120
 * - Para cambiar colores y estilos: className en cada Card
 * - Para agregar nuevas tarjetas: duplicar estructura existente
 */

export const MainCards = () => {
  const navigate = useNavigate();
  
  // CONFIGURACIÓN DE VISIBILIDAD
  // EDITAR AQUÍ: Cambiar a true para reactivar catálogo minorista
  const showRetailCatalog = false; // MANTENER false = catálogo oculto

  const handleCatalogClick = () => {
    // Redirige a login porque el catálogo está oculto
    navigate('/login');
  };

  const handleWholesaleClick = () => {
    navigate('/mayorista');
  };

  const handleTrackingClick = () => {
    navigate('/seguimiento');
  };

  const handleWhereToFindUsClick = () => {
    navigate('/donde-nos-ubicamos');
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-stone-800 mb-4">
            ¿Qué necesitas hoy?
          </h2>
          <p className="text-stone-600 text-lg max-w-2xl mx-auto">
            Elige la opción que mejor se adapte a ti
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* CATÁLOGO MINORISTA - COMPLETAMENTE OCULTO */}
          {showRetailCatalog && (
            <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-amber-200 bg-gradient-to-br from-white to-amber-50">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <span className="text-white font-bold text-xl">🛒</span>
                </div>
                <CardTitle className="text-xl font-bold text-stone-800">
                  Catálogo Personal
                </CardTitle>
                <CardDescription className="text-stone-600">
                  Compra directa para tu hogar. Mínimo S/ 70
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <ul className="text-sm text-stone-600 mb-6 space-y-2">
                  <li>🏠 Entrega a domicilio</li>
                  <li>💳 Pago contra entrega</li>
                  <li>📱 Seguimiento en tiempo real</li>
                  <li>🎁 Descuentos por cantidad</li>
                </ul>
                <Button 
                  onClick={handleCatalogClick}
                  className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white group-hover:shadow-lg transition-all"
                >
                  Ver Productos
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* PORTAL MAYORISTA - PRINCIPAL */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-stone-800">
                Portal Mayorista
              </CardTitle>
              <CardDescription className="text-stone-600">
                Precios especiales para distribuidores. Mínimo S/ 300
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-stone-600 mb-6 space-y-2">
                <li>💼 Precios mayoristas exclusivos</li>
                <li>📦 Múltiplos de 6 unidades</li>
                <li>🚚 Descuentos por volumen</li>
                <li>🤝 Atención personalizada</li>
              </ul>
              <Button 
                onClick={handleWholesaleClick}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white group-hover:shadow-lg transition-all"
              >
                Acceder al Portal
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* DONDE NOS UBICAMOS - NUEVA PÁGINA */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-stone-800">
                Donde nos ubicamos
              </CardTitle>
              <CardDescription className="text-stone-600">
                Encuentra puntos de venta cercanos a ti
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-stone-600 mb-6 space-y-2">
                <li>🏪 Tiendas y supermercados</li>
                <li>📍 Ubicaciones en Google Maps</li>
                <li>⏰ Horarios de atención</li>
                <li>📞 Contacto directo</li>
              </ul>
              <Button 
                onClick={handleWhereToFindUsClick}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white group-hover:shadow-lg transition-all"
              >
                Ver Ubicaciones
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* SEGUIMIENTO DE PEDIDOS - PÚBLICO */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-green-200 bg-gradient-to-br from-white to-green-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-stone-800">
                Seguir mi Pedido
              </CardTitle>
              <CardDescription className="text-stone-600">
                Rastrea tu pedido en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-stone-600 mb-6 space-y-2">
                <li>📍 Ubicación en tiempo real</li>
                <li>⏰ Estado actualizado</li>
                <li>📞 Contacto directo</li>
                <li>📄 Descarga tu comprobante</li>
              </ul>
              <Button 
                onClick={handleTrackingClick}
                variant="outline" 
                className="w-full border-green-500 text-green-600 hover:bg-green-50 hover:border-green-600 group-hover:shadow-lg transition-all"
              >
                Rastrear Pedido
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-amber-800 mb-2">
              ¿Necesitas ayuda?
            </h3>
            <p className="text-amber-700 mb-4">
              Nuestro equipo está disponible para apoyarte en todo lo que necesites
            </p>
            <a 
              href="https://wa.me/51999888777?text=Hola, necesito información sobre productos Pecaditos"
              className="inline-flex items-center text-green-600 hover:text-green-700 font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              📱 WhatsApp: +51 999 888 777
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

/*
CONFIGURACIÓN ACTUAL DE TARJETAS:

TARJETAS ACTIVAS:
✅ Portal Mayorista (principal)
✅ Donde nos ubicamos (nueva página)
✅ Seguir mi Pedido (público)

TARJETAS OCULTAS:
❌ Catálogo Personal (showRetailCatalog = false)

CAMBIOS REALIZADOS:
- Catálogo minorista completamente oculto
- Nueva tarjeta "Donde nos ubicamos" agregada
- Diseño unificado con gradientes y efectos hover
- Colores diferenciados por funcionalidad
- Iconos actualizados y consistentes

PARA EDITAR:
1. REACTIVAR CATÁLOGO MINORISTA:
   - Cambiar showRetailCatalog a true (línea 25)
   - Descomentar lógica en ProtectedRoute.tsx

2. MODIFICAR TEXTOS:
   - CardTitle y CardDescription en cada sección
   - Lista de características (li items)
   - Botones y llamadas a la acción

3. CAMBIAR COLORES:
   - Gradientes de fondo: from-color to-color
   - Bordes hover: border-color
   - Botones: bg-gradient-to-r from-color to-color

4. AGREGAR NUEVAS TARJETAS:
   - Duplicar estructura Card existente
   - Cambiar icono, colores y contenido
   - Agregar función de navegación

DISEÑO PREMIUM:
- Efectos hover suaves y elegantes
- Gradientes sutiles y profesionales
- Sombras y transiciones fluidas
- Iconos coherentes y atractivos
- Colores que transmiten confianza
*/
