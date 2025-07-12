
import { useState } from 'react';
import { Menu, X, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md border-b border-stone-200 dark:border-stone-700">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo móvil */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <span className="font-semibold text-stone-800 dark:text-stone-200">Pecaditos</span>
        </div>

        {/* Controles */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            className="p-2"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2"
          >
            {isMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {isMenuOpen && (
        <div className="bg-white dark:bg-stone-900 border-t border-stone-200 dark:border-stone-700 px-4 py-3">
          <nav className="space-y-2">
            <a href="#inicio" className="block py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 transition-colors">
              Inicio
            </a>
            <a href="#contacto" className="block py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 transition-colors">
              Contacto
            </a>
            <a href="#nosotros" className="block py-2 text-stone-700 dark:text-stone-300 hover:text-amber-600 transition-colors">
              Quiénes somos
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
