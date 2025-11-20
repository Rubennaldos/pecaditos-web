
import { CartProvider } from '@/contexts/CartContext';
import { CatalogHeader } from '@/components/catalog/CatalogHeader';
import { HeroBanner } from '@/components/catalog/HeroBanner';
import { CategorySelector } from '@/components/catalog/CategorySelector';
import { PromoBanners } from '@/components/catalog/PromoBanners';
import { DashboardSummary } from '@/components/catalog/DashboardSummary';
import { ProductsOnPromotion } from '@/components/catalog/ProductsOnPromotion';
import { ProductCatalog } from '@/components/catalog/ProductCatalog';
import { StickyCart } from '@/components/catalog/StickyCart';
import { RecommendedProducts } from '@/components/catalog/RecommendedProducts';
import { FAQSection } from '@/components/catalog/FAQSection';
import { PromotionalBanners } from '@/components/catalog/PromotionalBanners';
import { useState } from 'react';

/**
 * PÁGINA PRINCIPAL DEL CATÁLOGO - DISEÑO MODERNO Y MÓVIL
 * 
 * Catálogo futurista optimizado para móviles con:
 * - Header interactivo con búsqueda mejorada
 * - Banners promocionales modernos
 * - Categorías con scroll horizontal
 * - Cards de productos con animaciones
 * - Experiencia táctil optimizada
 * - Diseño limpio y profesional
 */
const Catalog = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <CartProvider>
      <div className="min-h-screen bg-gradient-to-b from-white via-stone-50 to-amber-50/30">
        {/* Header moderno sticky */}
        <CatalogHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Banner hero futurista */}
        <HeroBanner />

        {/* Selector de categorías con scroll horizontal */}
        <CategorySelector 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Contenedor principal con diseño optimizado */}
        <div className="container mx-auto px-4 py-6">
          {/* Catálogo principal - Full width en móvil */}
          <div className="space-y-6">
            <ProductCatalog 
              selectedCategory={selectedCategory}
              searchQuery={searchQuery}
            />
          </div>
        </div>

        {/* Carrito flotante móvil */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40">
          <StickyCart />
        </div>

        {/* Carrito desktop sidebar */}
        <div className="hidden lg:block fixed right-4 top-24 w-96 z-40">
          <StickyCart />
        </div>
      </div>
    </CartProvider>
  );
};

export default Catalog;
