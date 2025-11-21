import { useState } from 'react';
import { Search, ShoppingCart, Cookie, Cake, Wheat, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BackToPanelButton } from '@/components/ui/back-to-panel-button';
import { Input } from '@/components/ui/input';
import { WholesaleCatalog } from '@/components/wholesale/WholesaleCatalog';
import { WholesaleStickyCart } from '@/components/wholesale/WholesaleStickyCart';
import { WholesaleCartProvider } from '@/contexts/WholesaleCartContext';
import { useWholesaleCategories } from '@/hooks/useWholesaleCategories';
import { Skeleton } from '@/components/ui/skeleton';

interface CatalogModuleContentProps {
  onBack?: () => void;
}

const CatalogModuleContent = ({ onBack }: CatalogModuleContentProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const { categories, loading: categoriesLoading } = useWholesaleCategories();

  return (
    <div className="min-h-screen bg-background">
      {!onBack && <BackToPanelButton />}
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">Catálogo de Productos</h1>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {onBack && (
                <Button variant="outline" size="sm" onClick={onBack}>
                  Volver
                </Button>
              )}
            </div>
          </div>

          {/* Mobile Search */}
          <div className="mt-3 md:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Category Selector */}
        <div className="mb-6">
          {categoriesLoading ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-32 rounded-xl flex-shrink-0" />
              ))}
            </div>
          ) : (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => {
                const getCategoryIcon = (name: string) => {
                  const lower = name.toLowerCase();
                  if (lower.includes('brownie') || lower.includes('postre')) return Cookie;
                  if (lower.includes('galleta')) return Cookie;
                  if (lower.includes('cereal') || lower.includes('granola')) return Wheat;
                  if (lower.includes('torta') || lower.includes('cake')) return Cake;
                  return Sparkles;
                };
                const Icon = getCategoryIcon(cat.name);
                const isSelected = selectedCategory === cat.id;
                
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                      transition-all duration-200 flex-shrink-0 shadow-sm
                      ${
                        isSelected
                          ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-blue-200'
                          : 'bg-white text-stone-700 hover:bg-stone-50 border border-stone-200'
                      }
                    `}
                  >
                    <Icon className={`h-4 w-4 ${isSelected ? 'text-white' : 'text-blue-500'}`} />
                    {cat.name}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="w-full">
          {/* Catalog - Centered */}
          <div className="mx-auto">
            <WholesaleCatalog
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />
          </div>
        </div>
      </div>

      {/* Mobile Cart - Floating */}
      <div className="lg:hidden">
        <WholesaleStickyCart />
      </div>
    </div>
  );
};

interface CatalogModuleProps {
  onBack?: () => void;
}

export const CatalogModule = ({ onBack }: CatalogModuleProps) => {
  return (
    <WholesaleCartProvider>
      <CatalogModuleContent onBack={onBack} />
    </WholesaleCartProvider>
  );
};

export default CatalogModule;
