
import { mockProducts } from '@/data/mockData';
import { ProductCard } from '@/components/product/ProductCard';

export const ProductsOnPromotion = () => {
  // Filtrar productos en promoción
  const promotionProducts = mockProducts.filter(product => product.onPromotion);

  if (promotionProducts.length === 0) {
    return null;
  }

  return (
    <section className="py-8 px-4">
      <div className="container mx-auto">
        {/* Título destacado */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-2 rounded-full shadow-lg">
            <span className="text-lg">🔥</span>
            <h2 className="text-xl font-bold">¡Productos en Promoción!</h2>
            <span className="text-lg">🔥</span>
          </div>
          <p className="text-muted-foreground mt-2">
            Aprovecha estas ofertas especiales por tiempo limitado
          </p>
        </div>

        {/* Grid de productos en promoción */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {promotionProducts.map((product) => (
            <div key={product.id} className="relative">
              {/* Badge de promoción */}
              <div className="absolute top-2 left-2 z-10 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold shadow-lg">
                ¡OFERTA!
              </div>
              <ProductCard product={product} featured />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
