
import { useState, useMemo } from 'react';
import { mockProducts } from '@/data/mockData';
import { WholesaleProductCard } from './WholesaleProductCard';

/**
 * CATÁLOGO MAYORISTA
 * 
 * Catálogo específico para mayoristas con:
 * - Cantidades solo en múltiplos de 6
 * - Pedido mínimo S/ 300
 * - Precios con descuentos mayoristas
 * - Productos frecuentes guardados
 * 
 * PARA PERSONALIZAR:
 * - Modificar múltiplos permitidos
 * - Cambiar pedido mínimo
 * - Agregar más filtros
 */

interface WholesaleCatalogProps {
  selectedCategory: string;
  searchQuery: string;
}

export const WholesaleCatalog = ({ selectedCategory, searchQuery }: WholesaleCatalogProps) => {
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'category'>('name');

  // Filtrar y ordenar productos para mayoristas
  const filteredProducts = useMemo(() => {
    let filtered = mockProducts.filter(product => {
      // Filtrar por categoría
      const categoryMatch = selectedCategory === 'todas' || product.category === selectedCategory;
      
      // Filtrar por búsqueda
      const searchMatch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return categoryMatch && searchMatch && product.available;
    });

    // Ordenar productos
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
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-stone-800 mb-2">
              {selectedCategory === 'todas' ? 'Catálogo Mayorista' : 
               selectedCategory === 'clasicas' ? 'Galletas Clásicas' :
               selectedCategory === 'especiales' ? 'Galletas Especiales' :
               selectedCategory === 'combos' ? 'Combos Mayoristas' : 'Productos'}
            </h2>
            <p className="text-stone-600">
              {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} disponible{filteredProducts.length !== 1 ? 's' : ''}
              {searchQuery && ` para "${searchQuery}"`}
            </p>
            <div className="mt-2 space-y-1">
              <p className="text-sm text-amber-600 font-medium">
                📦 Cantidades mínimas: múltiplos de 6 unidades
              </p>
              <p className="text-sm text-stone-500">
                🛒 Pedido mínimo: S/ 300.00
              </p>
            </div>
          </div>

          {/* Selector de ordenamiento */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-stone-700">
              Ordenar por:
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'category')}
              className="px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
            >
              <option value="name">Nombre</option>
              <option value="price">Precio</option>
              <option value="category">Categoría</option>
            </select>
          </div>
        </div>

        {/* Grid de productos mayoristas */}
        {filteredProducts.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <WholesaleProductCard 
                key={product.id} 
                product={product}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="max-w-md mx-auto">
              <div className="text-6xl mb-4">🍪</div>
              <h3 className="text-xl font-semibold text-stone-800 mb-2">
                No se encontraron productos
              </h3>
              <p className="text-stone-600 mb-4">
                {searchQuery 
                  ? `No hay productos que coincidan con "${searchQuery}"`
                  : 'No hay productos disponibles en esta categoría'
                }
              </p>
              {searchQuery && (
                <p className="text-sm text-stone-500">
                  Intenta con otros términos de búsqueda o explora diferentes categorías.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Información adicional para mayoristas */}
        <div className="mt-12 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6">
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-amber-600 mb-2">6+</div>
              <p className="text-sm text-stone-700">Múltiplos mínimos por producto</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 mb-2">S/ 300</div>
              <p className="text-sm text-stone-700">Pedido mínimo mayorista</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">15%</div>
              <p className="text-sm text-stone-700">Descuento adicional +S/ 500</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
