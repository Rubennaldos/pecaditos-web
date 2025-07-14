import { Users, ArrowRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export const MainCards = () => {
  const navigate = useNavigate();

  const handleWholesaleClick = () => {
    navigate('/mayorista');
  };

  const handleLocationsClick = () => {
    navigate('/donde-nos-ubicamos');
  };

  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Qué necesitas hoy?
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Elige la opción que mejor se adapte a ti
          </p>
        </div>

        {/* Grid centrado para las cards (solo dos cards) */}
        <div className="grid md:grid-cols-2 gap-8 justify-items-center">
          {/* PORTAL MAYORISTA */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-blue-200 bg-gradient-to-br from-white to-blue-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Users className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Portal Mayorista
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Precios especiales para distribuidores. Mínimo S/ 300
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>💼 Precios mayoristas exclusivos</li>
                <li>📦 Múltiplos de 6 unidades</li>
                <li>🚚 Descuentos por volumen</li>
                <li>🤝 Atención personalizada</li>
              </ul>
              <Button 
                onClick={handleWholesaleClick}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:shadow-lg transition-all"
              >
                Acceder al Portal
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>

          {/* DÓNDE NOS UBICAMOS */}
          <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-purple-200 bg-gradient-to-br from-white to-purple-50">
            <CardHeader className="text-center pb-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <CardTitle className="text-xl font-bold text-foreground">
                Dónde nos ubicamos
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Encuentra nuestros productos cerca de ti
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <ul className="text-sm text-muted-foreground mb-6 space-y-2">
                <li>🏪 Puntos de venta autorizados</li>
                <li>📍 Ubicaciones por distrito</li>
                <li>🗺️ Mapas y direcciones</li>
                <li>📞 Contacto directo</li>
              </ul>
              <Button 
                onClick={handleLocationsClick}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:shadow-lg transition-all"
              >
                Ver Ubicaciones
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Información adicional */}
        <div className="mt-12 text-center">
          <p className="text-muted-foreground text-sm max-w-2xl mx-auto">
            ¿Tienes dudas? Contáctanos por WhatsApp: 
            <a href="https://wa.me/51999888777" className="text-green-600 hover:text-green-700 font-medium ml-1">
               +51 999 888 777
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
