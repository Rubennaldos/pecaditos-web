
import { mockProducts, productCategories } from '@/data/mockData';
import { ProductCard } from '@/components/product/ProductCard';

interface ProductCatalogProps {
  selectedCategory: string;
  searchQuery: string;
}

export const ProductCatalog = ({ selectedCategory, searchQuery }: ProductCatalogProps) => {
  // Filtrar productos por categoría y búsqueda
  const filteredProducts = mockProducts.filter(product => {
    const matchesCategory = selectedCategory === 'todas' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  const currentCategory = productCategories.find(cat => cat.id === selectedCategory);

  return (
    <section className="py-8 px-4 bg-background">
      <div className="container mx-auto">
        {/* Título de la sección */}
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-display font-semibold text-foreground mb-2">
            {currentCategory?.name || 'Catálogo de Productos'}
          </h2>
          <p className="text-muted-foreground">
            {currentCategory?.description || 'Todos nuestros deliciosos productos'}
          </p>
          {searchQuery && (
            <p className="text-sm text-amber-600 mt-2">
              Mostrando resultados para: "{searchQuery}"
            </p>
          )}
        </div>

        {/* Resultados */}
        {filteredProducts.length > 0 ? (
          <>
            <div className="text-center mb-6">
              <span className="text-sm text-muted-foreground">
                {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} 
                {selectedCategory !== 'todas' && ` en ${currentCategory?.name}`}
              </span>
            </div>

            {/* Grid de productos */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No se encontraron productos
            </h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `No hay productos que coincidan con "${searchQuery}"`
                : `No hay productos en la categoría ${currentCategory?.name}`
              }
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
