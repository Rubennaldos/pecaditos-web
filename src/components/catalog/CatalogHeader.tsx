
import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCart } from '@/contexts/CartContext';
import { Link } from 'react-router-dom';

/**
 * HEADER DEL CATÁLOGO
 * 
 * Incluye:
 * - Logo y navegación a home
 * - Buscador de productos
 * - Botón de login
 * - Carrito con contador de productos
 * - Menú hamburguesa para móvil
 */

interface CatalogHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const CatalogHeader = ({ searchQuery, onSearchChange }: CatalogHeaderProps) => {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">P</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-display text-xl font-bold text-stone-800">
                Pecaditos Integrales
              </h1>
              <p className="text-xs text-stone-600">Catálogo de productos</p>
            </div>
          </Link>

          {/* Buscador - Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Buscar galletas, combos..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 pr-4 w-full"
              />
            </div>
          </div>

          {/* Botones de acción - Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Login */}
            <Button variant="ghost" size="sm" className="text-stone-700 hover:text-stone-900">
              <User className="h-4 w-4 mr-2" />
              Iniciar Sesión
            </Button>

            {/* Carrito */}
            <Button variant="outline" size="sm" className="relative">
              <ShoppingCart className="h-4 w-4 mr-2" />
              Carrito
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>

          {/* Botones móvil */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Carrito móvil */}
            <Button variant="ghost" size="sm" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Button>

            {/* Menú hamburguesa */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Buscador móvil */}
        <div className="md:hidden mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Buscar productos..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 w-full"
            />
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-stone-200">
            <div className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Iniciar Sesión
              </Button>
              <Link to="/" className="block">
                <Button variant="ghost" className="w-full justify-start">
                  Volver al Inicio
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
