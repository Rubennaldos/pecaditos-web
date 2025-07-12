
/**
 * BANNERS PROMOCIONALES
 * 
 * Dos banners grandes debajo de las categorías para mostrar
 * promociones especiales, novedades o campañas.
 * 
 * PARA PERSONALIZAR:
 * - Cambiar imágenes de fondo
 * - Modificar textos promocionales
 * - Ajustar enlaces y acciones
 */

export const PromoBanners = () => {
  return (
    <section className="py-8 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Banner 1: Promoción especial */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-100 to-rose-200 p-8 min-h-[250px] flex flex-col justify-between">
            <div>
              <span className="inline-block bg-rose-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
                ¡OFERTA ESPECIAL!
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-stone-800 mb-3">
                10% OFF en combos familiares
              </h3>
              <p className="text-stone-700 mb-4">
                Perfecto para compartir momentos especiales. 
                Variedad de sabores en un solo pack.
              </p>
            </div>
            <button className="self-start bg-rose-500 hover:bg-rose-600 text-white px-6 py-2 rounded-full font-semibold transition-colors">
              Ver combos
            </button>
            
            {/* Decoración */}
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full"></div>
          </div>

          {/* Banner 2: Producto nuevo */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-200 p-8 min-h-[250px] flex flex-col justify-between">
            <div>
              <span className="inline-block bg-emerald-500 text-white px-3 py-1 rounded-full text-sm font-semibold mb-3">
                ¡NUEVO!
              </span>
              <h3 className="text-2xl md:text-3xl font-display font-bold text-stone-800 mb-3">
                Galletas de Quinua Energéticas
              </h3>
              <p className="text-stone-700 mb-4">
                Con superalimentos peruanos. Ideales para deportistas 
                y personas activas.
              </p>
            </div>
            <button className="self-start bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-full font-semibold transition-colors">
              Probar ahora
            </button>

            {/* Decoración */}
            <div className="absolute -left-8 -top-8 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="absolute -left-4 -bottom-4 w-20 h-20 bg-white/10 rounded-full"></div>
          </div>
        </div>
      </div>
    </section>
  );
};
