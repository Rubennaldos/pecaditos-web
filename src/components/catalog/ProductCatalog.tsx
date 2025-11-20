
import { mockProducts } from '@/data/mockData';
import { ProductCard } from '@/components/catalog/ProductCard';
import { useState, useMemo } from 'react';
import { SlidersHorizontal } from 'lucide-react';

/**
 * CATÁLOGO PRINCIPAL - DISEÑO MODERNO OPTIMIZADO PARA MÓVILES
 */

interface ProductCatalogProps {
  selectedCategory: string;
  searchQuery: string;
}

export const ProductCatalog = ({ selectedCategory, searchQuery }: ProductCatalogProps) => {
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');

  // Filtrar y ordenar productos
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts.filter(product => {
      const categoryMatch = selectedCategory === 'todas' || product.category === selectedCategory;
      const searchMatch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchQuery.toLowerCase())
        );
      return categoryMatch && searchMatch;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'category':
          return a.category.localeCompare(b.category);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    return filtered;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <section className="space-y-6 animate-fade-in">
      {/* Header con contador y filtros */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-stone-200/50">
        <div>
          <h2 className="text-xl font-black text-stone-800 mb-1">
            {selectedCategory === 'todas' ? '✨ Todos los Productos' : 
             selectedCategory === 'clasicas' ? '🍪 Galletas Clásicas' :
             selectedCategory === 'especiales' ? '⭐ Galletas Especiales' :
             selectedCategory === 'combos' ? '📦 Combos Familiares' : 'Productos'}
          </h2>
          <p className="text-sm text-stone-600">
            <span className="font-semibold text-amber-600">{filteredProducts.length}</span> producto{filteredProducts.length !== 1 ? 's' : ''} 
            {searchQuery && <span className="text-stone-500"> · Búsqueda: "{searchQuery}"</span>}
          </p>
        </div>

        {/* Selector de ordenamiento moderno */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-stone-500" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'category')}
            className="px-4 py-2 bg-white border-2 border-stone-200 rounded-xl text-sm font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 cursor-pointer hover:border-amber-300 transition-colors"
          >
            <option value="name">Nombre A-Z</option>
            <option value="price">Precio</option>
            <option value="category">Categoría</option>
          </select>
        </div>
      </div>

      {/* Grid de productos - Optimizado para móviles */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4">
          <div className="max-w-md mx-auto bg-white rounded-3xl p-8 shadow-xl border border-stone-200/50">
            <div className="text-7xl mb-4 animate-bounce">🔍</div>
            <h3 className="text-2xl font-black text-stone-800 mb-3">
              No encontramos productos
            </h3>
            <p className="text-stone-600 mb-2">
              {searchQuery 
                ? `No hay productos que coincidan con "${searchQuery}"`
                : 'No hay productos disponibles en esta categoría'
              }
            </p>
            <p className="text-sm text-stone-500 mt-4">
              💡 Intenta con otros términos de búsqueda o explora diferentes categorías
            </p>
          </div>
        </div>
      )}
    </section>
  );
};
