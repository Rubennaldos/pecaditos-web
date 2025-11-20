import { Carousel, CarouselContent, CarouselItem } from '@/components/ui/carousel';
import { Sparkles, TrendingUp, Shield, Zap } from 'lucide-react';

interface HeroBannerProps {
  isMayorista?: boolean;
}

export const HeroBanner = ({ isMayorista = false }: HeroBannerProps) => {
  const banners = [
    {
      id: 1,
      title: isMayorista ? "Precios Especiales" : "¡Nuevos Sabores!",
      subtitle: isMayorista ? "Descuentos hasta 20%" : "100% Naturales",
      icon: Sparkles,
      gradient: "from-amber-400 via-orange-500 to-red-500",
      bgGradient: "from-amber-50 to-orange-50"
    },
    {
      id: 2,
      title: isMayorista ? "Pedidos Mínimos" : "Promoción Especial",
      subtitle: isMayorista ? "Desde S/ 300" : "12 unid = 10% OFF",
      icon: TrendingUp,
      gradient: "from-green-400 via-emerald-500 to-teal-500",
      bgGradient: "from-green-50 to-emerald-50"
    },
    {
      id: 3,
      title: isMayorista ? "Soporte 24/7" : "Ingredientes Premium",
      subtitle: isMayorista ? "Atención personalizada" : "Sin preservantes",
      icon: Shield,
      gradient: "from-blue-400 via-indigo-500 to-purple-500",
      bgGradient: "from-blue-50 to-indigo-50"
    }
  ];

  return (
    <section className="w-full py-4 px-4">
      <Carousel 
        className="w-full max-w-6xl mx-auto"
        opts={{
          align: "start",
          loop: true,
        }}
      >
        <CarouselContent>
          {banners.map((banner) => {
            const Icon = banner.icon;
            return (
              <CarouselItem key={banner.id}>
                <div className={`bg-gradient-to-br ${banner.bgGradient} rounded-3xl p-6 md:p-10 min-h-[180px] md:min-h-[240px] flex items-center justify-between overflow-hidden relative border-2 border-white shadow-xl`}>
                  {/* Background Pattern */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                  </div>

                  {/* Content */}
                  <div className="relative z-10 flex-1">
                    <div className={`inline-flex items-center gap-2 bg-gradient-to-r ${banner.gradient} text-white px-4 py-2 rounded-full mb-4 shadow-lg`}>
                      <Icon className="w-4 h-4" />
                      <span className="text-sm font-bold">DESTACADO</span>
                    </div>
                    <h2 className="text-2xl md:text-4xl font-black text-stone-800 mb-2 leading-tight">
                      {banner.title}
                    </h2>
                    <p className="text-base md:text-xl text-stone-600 font-semibold">
                      {banner.subtitle}
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button className={`bg-gradient-to-r ${banner.gradient} text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:scale-105 transition-transform shadow-lg`}>
                        Ver más
                      </button>
                    </div>
                  </div>

                  {/* Icon decoration */}
                  <div className={`hidden md:block relative z-10 w-32 h-32 bg-gradient-to-br ${banner.gradient} rounded-3xl flex items-center justify-center shadow-2xl transform rotate-12 hover:rotate-0 transition-transform`}>
                    <Icon className="w-16 h-16 text-white" />
                  </div>
                </div>
              </CarouselItem>
            );
          })}
        </CarouselContent>
        
        {/* Indicators */}
        <div className="flex justify-center gap-2 mt-4">
          {banners.map((_, index) => (
            <div key={index} className="w-2 h-2 rounded-full bg-stone-300"></div>
          ))}
        </div>
      </Carousel>
    </section>
  );
};
