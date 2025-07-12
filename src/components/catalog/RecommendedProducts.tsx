
import { mockProducts } from '@/data/mockData';
import { ProductCard } from '@/components/catalog/ProductCard';

/**
 * PRODUCTOS RECOMENDADOS
 * 
 * Sección que muestra productos sugeridos basados en:
 * - Productos más populares
 * - Combos relacionados
 * - Productos complementarios
 * 
 * PARA PERSONALIZAR:
 * - Implementar lógica de recomendación inteligente
 * - Conectar con historial de compras del usuario
 * - Mostrar productos relacionados por categoría
 */

export const RecommendedProducts = () => {
  // Simular productos recomendados (en producción sería lógica más sofisticada)
  const recommendedProducts = mockProducts
    .filter(product => product.available)
    .slice(0, 3); // Mostrar solo 3 productos

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 border-t border-stone-200 mt-12">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-display font-bold text-stone-800 mb-2">
          También te puede interesar
        </h2>
        <p className="text-stone-600">
          Productos que otros clientes han disfrutado junto con tu selección
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {recommendedProducts.map((product) => (
          <ProductCard 
            key={`recommended-${product.id}`} 
            product={product}
          />
        ))}
      </div>

      {/* Call to action */}
      <div className="text-center mt-8">
        <p className="text-stone-600 text-sm mb-4">
          ¿No encuentras lo que buscas?
        </p>
        <button className="text-amber-600 hover:text-amber-700 font-semibold text-sm underline">
          Solicitar cotización especial
        </button>
      </div>
    </section>
  );
};
