
import { Button } from '@/components/ui/button';
import { productCategories } from '@/data/mockData';

/**
 * SELECTOR DE CATEGORÍAS
 * 
 * Permite filtrar productos por categoría.
 * 
 * PARA PERSONALIZAR:
 * - Modificar categorías en src/data/mockData.ts
 * - Cambiar estilos de botones activos/inactivos
 * - Agregar iconos a cada categoría
 */

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategorySelector = ({ selectedCategory, onCategoryChange }: CategorySelectorProps) => {
  return (
    <section className="bg-stone-50 py-8 border-b border-stone-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold text-stone-800 mb-2">
            Nuestras Categorías
          </h2>
          <p className="text-stone-600">
            Encuentra tus galletas favoritas por sabor y tipo
          </p>
        </div>

        {/* Categorías */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {productCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="lg"
              onClick={() => onCategoryChange(category.id)}
              className={`
                px-6 py-3 rounded-full font-semibold transition-all duration-200
                ${selectedCategory === category.id 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md transform scale-105' 
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300 hover:border-amber-400'
                }
              `}
            >
              <span className="text-sm md:text-base">{category.name}</span>
            </Button>
          ))}
        </div>

        {/* Descripción de categoría seleccionada */}
        {selectedCategory !== 'todas' && (
          <div className="text-center mt-4">
            <p className="text-stone-600 text-sm">
              {productCategories.find(cat => cat.id === selectedCategory)?.description}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
