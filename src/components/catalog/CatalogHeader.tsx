
import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';

interface CatalogHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  isMayorista?: boolean;
}

// Hook seguro para usar el carrito - no lanza error si no hay CartProvider
const useSafeCart = () => {
  try {
    return useCart();
  } catch (error) {
    // Si no hay CartProvider disponible, retorna valores por defecto
    return {
      items: [],
      totalItems: 0
    };
  }
};

export const CatalogHeader = ({ searchQuery, onSearchChange, isMayorista = false }: CatalogHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Usar hook seguro que no falla si no hay CartProvider
  const { items } = useSafeCart();
  
  const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">Pecaditos Integrales</h1>
              {isMayorista && (
                <span className="text-xs text-amber-600 font-medium">Portal Mayorista</span>
              )}
            </div>
          </div>

          {/* Search - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-4">
            {/* Login/Profile */}
            <Button variant="ghost" size="sm" className="hidden md:flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Mi cuenta</span>
            </Button>

            {/* Cart - Solo mostrar si hay contexto de carrito disponible */}
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
              <span className="hidden sm:inline ml-2">Carrito</span>
            </Button>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-stone-200 pt-4">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Mi cuenta
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
