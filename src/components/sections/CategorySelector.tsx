
import { productCategories } from '@/data/mockData';
import { Button } from '@/components/ui/button';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

export const CategorySelector = ({ selectedCategory, onCategoryChange }: CategorySelectorProps) => {
  return (
    <section className="py-8 px-4 bg-background">
      <div className="container mx-auto">
        {/* Título de la sección */}
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-display font-semibold text-foreground mb-2">
            Nuestras Categorías
          </h2>
          <p className="text-muted-foreground">
            Descubre todos nuestros deliciosos sabores
          </p>
        </div>

        {/* Grid de categorías */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-6xl mx-auto">
          {productCategories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              className={`
                h-auto p-4 flex flex-col items-center space-y-2 transition-all duration-300 hover:scale-105 hover:shadow-md
                ${selectedCategory === category.id 
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg' 
                  : 'hover:bg-amber-50 dark:hover:bg-stone-800'
                }
              `}
              onClick={() => onCategoryChange(category.id)}
            >
              {/* Icono representativo por categoría */}
              <div className="w-8 h-8 flex items-center justify-center">
                {category.id === 'todas' && '🍪'}
                {category.id === 'clasicas' && '🥨'}
                {category.id === 'tropicales' && '🥭'}
                {category.id === 'especiales' && '⭐'}
                {category.id === 'combos' && '📦'}
                {category.id === 'promociones' && '🏷️'}
              </div>
              
              {/* Nombre y descripción */}
              <div className="text-center">
                <div className="font-semibold text-sm">
                  {category.name}
                </div>
                <div className="text-xs opacity-80 hidden sm:block">
                  {category.description}
                </div>
              </div>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
};
