
export const PromoBanners = () => {
  const banners = [
    {
      id: 1,
      title: '¡Envío Gratis!',
      subtitle: 'En pedidos mayores a S/ 100',
      image: '/placeholder-promo-delivery.jpg',
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 2,
      title: 'Combo Especial',
      subtitle: '12 galletas por S/ 120',
      image: '/placeholder-promo-combo.jpg',
      color: 'from-purple-400 to-pink-500'
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
                relative h-32 lg:h-40 rounded-2xl overflow-hidden cursor-pointer
                bg-gradient-to-r ${banner.color} 
                hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl
              `}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              <div className="relative z-10 h-full flex items-center justify-center text-center px-6">
                <div>
                  <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">
                    {banner.title}
                  </h3>
                  <p className="text-white/90 text-sm lg:text-base">
                    {banner.subtitle}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
