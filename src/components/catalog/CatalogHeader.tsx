
import { useState } from 'react';
import { Search, ShoppingCart, Menu, X, User, Sparkles } from 'lucide-react';
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
    return {
      items: [] as CartItem[],
      totalItems: 0
    };
  }
};

export const CatalogHeader = ({ searchQuery, onSearchChange, isMayorista = false }: CatalogHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  
  const { items } = useSafeCart();
  const totalItems = items.reduce((sum: number, item: CartItem) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-gradient-to-b from-white via-white/98 to-white/95 backdrop-blur-xl border-b border-stone-200/50 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          {/* Logo Moderno */}
          <div className="flex items-center space-x-2 min-w-fit">
            <div className="relative w-11 h-11 bg-gradient-to-br from-amber-400 via-orange-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 transform hover:scale-105 transition-transform">
              <Sparkles className="w-6 h-6 text-white absolute animate-pulse" />
              <span className="text-white font-black text-xl relative z-10">P</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-black text-stone-800 leading-none bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Pecaditos
              </h1>
              <span className="text-[10px] text-stone-500 font-medium tracking-wide uppercase">
                {isMayorista ? '🏪 Mayorista' : '🍪 Integral'}
              </span>
            </div>
          </div>

          {/* Search bar - Mobile First Design */}
          <div className="flex-1 max-w-2xl">
            <div className={`relative transition-all duration-300 ${isSearchFocused ? 'scale-[1.02]' : ''}`}>
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 transition-colors ${isSearchFocused ? 'text-amber-500' : 'text-stone-400'}`} />
              <Input
                type="text"
                placeholder={searchQuery ? "" : "🔍 Buscar productos..."}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className={`pl-10 pr-4 h-11 bg-gradient-to-r from-stone-50 to-stone-100/50 border-2 transition-all duration-200 rounded-xl ${
                  isSearchFocused 
                    ? 'border-amber-400 shadow-lg shadow-amber-500/20' 
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Right actions - Mobile Optimized */}
          <div className="flex items-center gap-2">
            {/* Cart Button with Animation */}
            <Button 
              variant="outline" 
              size="sm" 
              className="relative h-11 w-11 p-0 rounded-xl border-2 border-stone-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200 group"
            >
              <ShoppingCart className="h-5 w-5 text-stone-600 group-hover:text-amber-600 transition-colors" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg shadow-red-500/40 animate-bounce">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* User Button - Hidden on small mobile */}
            <Button 
              variant="outline" 
              size="sm" 
              className="hidden sm:flex h-11 px-3 rounded-xl border-2 border-stone-200 hover:border-amber-400 hover:bg-amber-50 transition-all duration-200"
            >
              <User className="h-4 w-4 mr-1" />
              <span className="text-sm font-medium">Cuenta</span>
            </Button>
          </div>
        </div>

        {/* Quick Stats Bar - Mobile */}
        <div className="mt-3 flex items-center justify-center gap-4 text-xs text-stone-500">
          <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            <span className="font-medium text-green-700">Envío rápido</span>
          </div>
          <div className="flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
            <span className="font-medium text-blue-700">💯 Natural</span>
          </div>
          <div className="flex items-center gap-1 bg-purple-50 px-3 py-1 rounded-full">
            <span className="font-medium text-purple-700">✨ Artesanal</span>
          </div>
        </div>
      </div>
    </header>
  );
};
