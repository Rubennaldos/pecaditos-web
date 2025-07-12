
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

/**
 * BANNER HERO PROMOCIONAL
 * 
 * Banner grande con slider para promociones y anuncios.
 * 
 * PARA PERSONALIZAR:
 * - Cambiar las imágenes en el array 'banners'
 * - Modificar textos y enlaces
 * - Ajustar colores de fondo
 */

const banners = [
  {
    id: 1,
    title: "¡Nueva línea de galletas de frutas!",
    subtitle: "Maracuyá, higo y frutos rojos disponibles",
    description: "Sabores únicos con ingredientes naturales peruanos",
    buttonText: "Ver productos",
    backgroundColor: "from-amber-100 to-orange-100",
    textColor: "text-stone-800"
  },
  {
    id: 2,
    title: "Combos familiares con descuento",
    subtitle: "12 unidades por solo S/ 118.80",
    description: "10% de descuento automático en combos grandes",
    buttonText: "Ver combos",
    backgroundColor: "from-emerald-100 to-teal-100",
    textColor: "text-stone-800"
  },
  {
    id: 3,
    title: "Entrega gratuita en tu distrito",
    subtitle: "San Borja, Miraflores, San Isidro y más",
    description: "Recibe tus galletas favoritas en la puerta de tu casa",
    buttonText: "Ver zonas",
    backgroundColor: "from-blue-100 to-indigo-100",
    textColor: "text-stone-800"
  }
];

export const HeroBanner = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-slide cada 5 segundos
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentBanner((prev) => (prev + 1) % banners.length);
  };

  const currentSlide = banners[currentBanner];

  return (
    <section className="relative overflow-hidden">
      <div className={`bg-gradient-to-r ${currentSlide.backgroundColor} transition-all duration-500`}>
        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className={`text-4xl md:text-6xl font-display font-bold mb-4 ${currentSlide.textColor}`}>
              {currentSlide.title}
            </h1>
            <p className={`text-xl md:text-2xl mb-4 ${currentSlide.textColor} opacity-90`}>
              {currentSlide.subtitle}
            </p>
            <p className={`text-lg mb-8 ${currentSlide.textColor} opacity-75 max-w-2xl mx-auto`}>
              {currentSlide.description}
            </p>
            
            <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 text-lg font-semibold rounded-full">
              {currentSlide.buttonText}
            </Button>
          </div>
        </div>
      </div>

      {/* Controles del slider */}
      <div className="absolute inset-y-0 left-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToPrevious}
          className="rounded-full bg-white/80 hover:bg-white shadow-md"
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      </div>

      <div className="absolute inset-y-0 right-4 flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={goToNext}
          className="rounded-full bg-white/80 hover:bg-white shadow-md"
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Indicadores */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentBanner(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentBanner ? 'bg-amber-500' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </section>
  );
};
