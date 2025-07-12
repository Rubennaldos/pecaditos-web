
import { useState } from 'react';
import { Search, ShoppingCart, Menu, X, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart, CartItem } from '@/contexts/CartContext';

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
      items: [] as CartItem[],
      totalItems: 0
    };
  }
};

export const CatalogHeader = ({ searchQuery, onSearchChange, isMayorista = false }: CatalogHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Usar hook seguro que no falla si no hay CartProvider
  const { items } = useSafeCart();
  
  // Corregir el cálculo de totalItems con tipos correctos
  const totalItems = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-stone-800">
                Pecaditos {isMayorista ? 'Mayoristas' : 'Integrales'}
              </h1>
              {isMayorista && (
                <span className="text-xs text-blue-600 font-medium">Portal Mayorista</span>
              )}
            </div>
          </div>

          {/* Search bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                type="text"
                placeholder={isMayorista ? "Buscar productos mayoristas..." : "Buscar productos..."}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 bg-stone-50 border-stone-200 focus:border-amber-300"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center space-x-3">
            {/* Login/Account */}
            <Button variant="outline" size="sm" className="hidden md:flex">
              <User className="h-4 w-4 mr-2" />
              <span>Mi cuenta</span>
            </Button>

            {/* Cart - Solo mostrar si hay contexto de carrito disponible */}
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile search */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              type="text"
              placeholder={isMayorista ? "Buscar productos mayoristas..." : "Buscar productos..."}
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 bg-stone-50 border-stone-200 focus:border-amber-300"
            />
          </div>
        </div>

        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-stone-50 rounded-lg">
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
