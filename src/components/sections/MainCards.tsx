
import { useState } from 'react';
import { ShoppingCart, User, Cookie } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const MainCards = () => {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  // Simular navegación (en una app real iría a rutas)
  const handleCatalogClick = () => {
    console.log('Navegando al catálogo de productos...');
    // TODO: Aquí iría la navegación al catálogo en la siguiente etapa
    alert('🛍️ El catálogo de productos estará disponible en la siguiente etapa');
  };

  const handleLoginClick = () => {
    console.log('Navegando al login...');
    // TODO: Aquí iría la navegación al login
    alert('🔐 El sistema de login estará disponible próximamente');
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row justify-center items-center gap-8 lg:gap-12">
        
        {/* Card Catálogo de Productos */}
        <Card 
          className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:rotate-1 w-full max-w-sm
            ${hoveredCard === 'catalog' ? 'shadow-2xl shadow-amber-200 dark:shadow-amber-900' : 'shadow-lg hover:shadow-xl'}
            bg-gradient-to-br from-white to-amber-50 dark:from-stone-800 dark:to-stone-700 
            border-2 border-transparent hover:border-amber-300 dark:hover:border-amber-600`}
          onMouseEnter={() => setHoveredCard('catalog')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={handleCatalogClick}
        >
          <CardContent className="p-8 text-center space-y-6">
            
            {/* Ícono animado */}
            <div className="relative">
              <div className={`w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`}>
                <Cookie className="w-10 h-10 text-white" />
              </div>
              
              {/* Ícono carrito flotante */}
              <div className={`absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center transform transition-all duration-500 ${
                hoveredCard === 'catalog' ? 'scale-100 rotate-0' : 'scale-0 rotate-180'
              }`}>
                <ShoppingCart className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Contenido */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-200 group-hover:text-amber-600 transition-colors">
                Catálogo de Productos
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Explora nuestra deliciosa variedad de galletas integrales, combos especiales y promociones exclusivas.
              </p>
            </div>

            {/* Botón */}
            <Button 
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
            >
              Ver Productos
            </Button>

            {/* Indicadores de beneficios */}
            <div className="flex justify-center space-x-4 text-xs">
              <span className="text-green-600 dark:text-green-400 font-medium">✓ Descuentos por cantidad</span>
              <span className="text-blue-600 dark:text-blue-400 font-medium">✓ Envío disponible</span>
            </div>
          </CardContent>
        </Card>

        {/* Card Login */}
        <Card 
          className={`group cursor-pointer transition-all duration-500 hover:scale-105 hover:-rotate-1 w-full max-w-sm
            ${hoveredCard === 'login' ? 'shadow-2xl shadow-blue-200 dark:shadow-blue-900' : 'shadow-lg hover:shadow-xl'}
            bg-gradient-to-br from-white to-blue-50 dark:from-stone-800 dark:to-stone-700
            border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600`}
          onMouseEnter={() => setHoveredCard('login')}
          onMouseLeave={() => setHoveredCard(null)}
          onClick={handleLoginClick}
        >
          <CardContent className="p-8 text-center space-y-6">
            
            {/* Ícono animado */}
            <div className="relative">
              <div className={`w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:-rotate-12`}>
                <User className="w-10 h-10 text-white" />
              </div>
              
              {/* Indicador de seguridad */}
              <div className={`absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-green-500 rounded-full flex items-center justify-center transform transition-all duration-500 ${
                hoveredCard === 'login' ? 'scale-100 rotate-0' : 'scale-0 -rotate-90'
              }`}>
                <span className="text-white text-xs font-bold">✓</span>
              </div>
            </div>

            {/* Contenido */}
            <div className="space-y-3">
              <h3 className="text-2xl font-bold text-stone-800 dark:text-stone-200 group-hover:text-blue-600 transition-colors">
                Inicia Sesión
              </h3>
              <p className="text-stone-600 dark:text-stone-400 leading-relaxed">
                Accede a tu cuenta para ver tus pedidos, historial de compras y ofertas personalizadas.
              </p>
            </div>

            {/* Botón destacado */}
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
            >
              Entrar Ahora
            </Button>

            {/* Beneficios de login */}
            <div className="flex justify-center space-x-4 text-xs">
              <span className="text-purple-600 dark:text-purple-400 font-medium">✓ Ofertas exclusivas</span>
              <span className="text-pink-600 dark:text-pink-400 font-medium">✓ Historial completo</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
