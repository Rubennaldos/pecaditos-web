import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';

interface HeroBannerProps {
  isMayorista?: boolean;
}

export const HeroBanner = ({ isMayorista = false }: HeroBannerProps) => {
  // Mock data para banners - EDITAR AQUÍ para cambiar las imágenes y textos
  const banners = [
    {
      id: 1,
      title: isMayorista ? "¡Precios Especiales para Mayoristas!" : "¡Nuevos Sabores Disponibles!",
      subtitle: isMayorista ? "Descuentos por volumen hasta 20%" : "Galletas artesanales con ingredientes naturales",
      image: "/placeholder-banner-1.jpg",
      bgColor: "bg-gradient-to-r from-amber-100 to-orange-100"
    },
    {
      id: 2,
      title: isMayorista ? "Pedidos Mínimos desde S/ 300" : "¡Promoción Especial!",
      subtitle: isMayorista ? "Entrega directa a tu negocio" : "Lleva 12 unidades y obtén 10% de descuento",
      image: "/placeholder-banner-2.jpg",
      bgColor: "bg-gradient-to-r from-green-100 to-emerald-100"
    },
    {
      id: 3,
      title: isMayorista ? "Soporte Personalizado" : "Ingredientes 100% Naturales",
      subtitle: isMayorista ? "Atención especializada para tu negocio" : "Sin preservantes ni colorantes artificiales",
      image: "/placeholder-banner-3.jpg",
      bgColor: "bg-gradient-to-r from-blue-100 to-cyan-100"
    }
  ];

  return (
    <section className="w-full py-8">
      <Carousel className="w-full max-w-6xl mx-auto">
        <CarouselContent>
          {banners.map((banner) => (
            <CarouselItem key={banner.id}>
              <div className={`${banner.bgColor} rounded-2xl p-8 md:p-12 text-center min-h-[300px] flex flex-col justify-center items-center`}>
                <h2 className="text-3xl md:text-5xl font-bold text-stone-800 mb-4">
                  {banner.title}
                </h2>
                <p className="text-lg md:text-xl text-stone-600 max-w-2xl">
                  {banner.subtitle}
                </p>
                {/* Placeholder para imagen - reemplazar con imagen real */}
                <div className="mt-6 w-full max-w-md h-32 bg-stone-200 rounded-lg flex items-center justify-center text-stone-500">
                  {banner.image}
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>
    </section>
  );
};
