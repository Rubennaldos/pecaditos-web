
import { mockProducts } from '@/data/mockData';
import { ProductCard } from '@/components/catalog/ProductCard';
import { useState, useMemo } from 'react';

/**
 * CATÁLOGO PRINCIPAL DE PRODUCTOS
 * 
 * Muestra todos los productos filtrados por:
 * - Categoría seleccionada
 * - Búsqueda por texto
 * - Disponibilidad
 * 
 * PARA PERSONALIZAR:
 * - Modificar filtros de productos
 * - Agregar ordenamiento (precio, nombre, etc.)
 * - Implementar paginación para muchos productos
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
      // Filtrar por categoría
      const categoryMatch = selectedCategory === 'todas' || product.category === selectedCategory;
      
      // Filtrar por búsqueda
      const searchMatch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.ingredients.some(ingredient => 
          ingredient.toLowerCase().includes(searchQuery.toLowerCase())
        );

      return categoryMatch && searchMatch;
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-display font-bold text-stone-800 mb-2">
            {selectedCategory === 'todas' ? 'Todos los Productos' : 
             selectedCategory === 'clasicas' ? 'Galletas Clásicas' :
             selectedCategory === 'especiales' ? 'Galletas Especiales' :
             selectedCategory === 'combos' ? 'Combos Familiares' : 'Productos'}
          </h2>
          <p className="text-stone-600">
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''} 
            {searchQuery && ` encontrado${filteredProducts.length !== 1 ? 's' : ''} para "${searchQuery}"`}
          </p>
        </div>

        {/* Selector de ordenamiento */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-stone-700">
            Ordenar por:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'price' | 'category')}
            className="px-3 py-1 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="name">Nombre</option>
            <option value="price">Precio</option>
            <option value="category">Categoría</option>
          </select>
        </div>
      </div>

      {/* Grid de productos */}
      {filteredProducts.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard 
              key={product.id} 
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
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
    </section>
  );
};
