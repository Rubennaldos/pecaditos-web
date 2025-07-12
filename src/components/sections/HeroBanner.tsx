
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Banners de ejemplo - pueden ser editados fácilmente
const banners = [
  {
    id: 1,
    title: '¡Nuevos Sabores Tropicales!',
    subtitle: 'Descubre nuestras galletas de maracuyá y frutos rojos',
    image: '/placeholder-banner-tropical.jpg',
    buttonText: 'Ver Productos',
    buttonAction: () => console.log('Ver productos tropicales')
  },
  {
    id: 2,
    title: 'Combo Familiar 20% OFF',
    subtitle: '12 galletas variadas perfectas para compartir',
    image: '/placeholder-banner-combo.jpg',
    buttonText: 'Aprovechar Oferta',
    buttonAction: () => console.log('Ver combo familiar')
  },
  {
    id: 3,
    title: 'Delivery Gratis',
    subtitle: 'En pedidos mayores a S/ 100 en distritos seleccionados',
    image: '/placeholder-banner-delivery.jpg',
    buttonText: 'Conocer Más',
    buttonAction: () => console.log('Ver condiciones delivery')
  }
];

export const HeroBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-cambiar banner cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const nextBanner = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const prevBanner = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  return (
    <section className="relative w-full h-80 lg:h-96 overflow-hidden bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-700">
      {/* Banner actual */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute inset-0 bg-black/20"></div>
        
        {/* Contenido del banner */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <h1 className="text-3xl lg:text-5xl font-display font-bold text-white mb-4 drop-shadow-lg">
            {banners[currentBanner].title}
          </h1>
          <p className="text-lg lg:text-xl text-white/90 mb-6 drop-shadow">
            {banners[currentBanner].subtitle}
          </p>
          <Button 
            size="lg" 
            className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            onClick={banners[currentBanner].buttonAction}
          >
            {banners[currentBanner].buttonText}
          </Button>
        </div>

        {/* Controles de navegación */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
          onClick={prevBanner}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
          onClick={nextBanner}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Indicadores de puntos */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-10">
        {banners.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === currentBanner 
                ? 'bg-white' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            onClick={() => setCurrentBanner(index)}
          />
        ))}
      </div>
    </section>
  );
};
