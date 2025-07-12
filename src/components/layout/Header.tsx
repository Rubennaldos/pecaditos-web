
import { useState } from 'react';
import { Search, User, ShoppingCart, Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header = ({ searchQuery, onSearchChange }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { itemCount } = useCart();

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-700 shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display font-bold text-xl text-stone-800 dark:text-stone-200">
                Pecaditos
              </h1>
              <p className="text-xs text-stone-600 dark:text-stone-400 -mt-1">
                Integrales
              </p>
            </div>
          </div>

          {/* Buscador - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 bg-background border-stone-200 dark:border-stone-700 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Controles Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Botón modo oscuro */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-stone-600 dark:text-stone-400 hover:text-amber-600"
            >
              {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Botón Login */}
            <Button
              variant="outline"
              className="border-stone-200 dark:border-stone-700 hover:border-amber-500 hover:text-amber-600"
            >
              <User className="h-4 w-4 mr-2" />
              Ingresar
            </Button>

            {/* Botón Carrito */}
            <Button
              variant="outline"
              className="relative border-stone-200 dark:border-stone-700 hover:border-amber-500 hover:text-amber-600"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrito
              {itemCount > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-5 h-5 p-0 flex items-center justify-center text-xs">
                  {itemCount}
                </Badge>
              )}
            </Button>
          </div>

          {/* Controles Móvil */}
          <div className="flex md:hidden items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleDarkMode}
              className="text-stone-600 dark:text-stone-400"
            >
              {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-stone-600 dark:text-stone-400"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Buscador Móvil */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 w-full bg-background border-stone-200 dark:border-stone-700 focus:border-amber-500"
            />
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-700">
            <nav className="space-y-3">
              <Button
                variant="ghost"
                className="w-full justify-start text-stone-700 dark:text-stone-300 hover:text-amber-600"
              >
                <User className="h-4 w-4 mr-3" />
                Ingresar
              </Button>
              
              <div className="flex justify-between items-center pt-2 border-t border-stone-200 dark:border-stone-700">
                <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                  Items en carrito:
                </span>
                <Badge variant="outline" className="bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                  {itemCount} productos
                </Badge>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
