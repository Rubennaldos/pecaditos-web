
import { mockProducts } from '@/data/mockData';
import { ProductCard } from '@/components/product/ProductCard';

export const RecommendedProducts = () => {
  // Productos recomendados (featured products)
  const recommendedProducts = mockProducts.filter(product => product.featured).slice(0, 4);

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-900 dark:to-stone-800">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-display font-semibold text-foreground mb-2">
            Productos Recomendados
          </h2>
          <p className="text-muted-foreground">
            Los favoritos de nuestros clientes
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} featured />
          ))}
        </div>
      </div>
    </section>
  );
};
