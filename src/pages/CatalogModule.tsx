import { useState } from 'react';
import { Search, ShoppingCart, User, LogOut, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WholesaleCatalog } from '@/components/wholesale/WholesaleCatalog';
import { WholesaleStickyCart } from '@/components/wholesale/WholesaleStickyCart';
import { WholesaleCartProvider } from '@/contexts/WholesaleCartContext';
import { useWholesaleCategories } from '@/hooks/useWholesaleCategories';
import { Card, CardContent } from '@/components/ui/card';
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
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-10 w-24 rounded-full flex-shrink-0" />
              ))}
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <Button
                  key={cat.id}
                  variant={selectedCategory === cat.id ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.id)}
                  className="whitespace-nowrap rounded-full"
                >
                  {cat.name}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex gap-6">
          {/* Catalog */}
          <div className="flex-1">
            <WholesaleCatalog
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />
          </div>

          {/* Sticky Cart - Desktop */}
          <div className="hidden lg:block w-96 flex-shrink-0">
            <div className="sticky top-24">
              <WholesaleStickyCart />
            </div>
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
