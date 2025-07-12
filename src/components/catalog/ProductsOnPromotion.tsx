
import { mockProducts } from '@/data/mockData';
import { ProductCard } from '@/components/catalog/ProductCard';

/**
 * PRODUCTOS EN PROMOCIÓN
 * 
 * Sección destacada que muestra productos con ofertas especiales.
 * Se muestran antes del catálogo principal para mayor visibilidad.
 * 
 * PARA PERSONALIZAR:
 * - Modificar lógica de productos en promoción
 * - Cambiar diseño de cards promocionales
 * - Agregar temporizadores de ofertas limitadas
 */

export const ProductsOnPromotion = () => {
  // Filtrar productos destacados/en promoción
  const promoProducts = mockProducts.filter(product => product.featured);

  if (promoProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 bg-gradient-to-r from-amber-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-amber-500 text-white px-4 py-2 rounded-full font-semibold mb-4">
            <span className="animate-pulse">⚡</span>
            ¡PRODUCTOS EN PROMOCIÓN!
            <span className="animate-pulse">⚡</span>
          </div>
          <h2 className="text-3xl font-display font-bold text-stone-800 mb-2">
            Ofertas Especiales
          </h2>
          <p className="text-stone-600 max-w-2xl mx-auto">
            No te pierdas estas increíbles ofertas por tiempo limitado. 
            Los mejores precios en nuestros productos más populares.
          </p>
        </div>

        {/* Grid de productos en promoción */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {promoProducts.map((product) => (
            <div key={product.id} className="relative">
              {/* Badge de promoción */}
              <div className="absolute -top-2 -right-2 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
                OFERTA
              </div>
              
              <div className="transform hover:scale-105 transition-transform duration-200">
                <ProductCard 
                  product={product} 
                  isPromoted={true}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Mensaje adicional */}
        <div className="text-center mt-8">
          <p className="text-stone-600 text-sm">
            * Promociones válidas hasta agotar stock. Descuentos automáticos por cantidad aplicables.
          </p>
        </div>
      </div>
    </section>
  );
};
