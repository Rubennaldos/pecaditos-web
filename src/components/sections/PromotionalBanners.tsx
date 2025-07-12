
export const PromotionalBanners = () => {
  const banners = [
    {
      id: 1,
      title: '¡Suscríbete y Ahorra!',
      subtitle: 'Recibe ofertas exclusivas y descuentos especiales',
      cta: 'Suscribirse',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 2,
      title: 'Síguenos en Redes',
      subtitle: 'Entérate de nuevos sabores y promociones',
      cta: 'Seguir',
      color: 'from-pink-400 to-rose-500'
    }
  ];

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`
                relative h-32 rounded-2xl overflow-hidden cursor-pointer
                bg-gradient-to-r ${banner.color}
                hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl
              `}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6">
                <h3 className="text-xl font-bold text-white mb-2">
                  {banner.title}
                </h3>
                <p className="text-white/90 text-sm mb-3">
                  {banner.subtitle}
                </p>
                <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-1 rounded-full text-sm font-medium transition-colors">
                  {banner.cta}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
