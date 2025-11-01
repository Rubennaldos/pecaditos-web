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

const ClientCatalogPage = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        {/* Header del catálogo */}
        <CatalogHeader 
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

        {/* Banner hero promocional */}
        <HeroBanner />

        {/* Selector de categorías */}
        <CategorySelector 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Banners promocionales */}
        <PromoBanners />

        {/* Dashboard con resumen del usuario */}
        <DashboardSummary />

        {/* Productos en promoción */}
        <ProductsOnPromotion />

        <div className="container mx-auto px-4 py-8">
          <div className="flex gap-8">
            {/* Catálogo principal */}
            <div className="flex-1">
              <ProductCatalog 
                selectedCategory={selectedCategory}
                searchQuery={searchQuery}
              />
              
              {/* Productos recomendados */}
              <RecommendedProducts />
              
              {/* Preguntas frecuentes */}
              <FAQSection />
            </div>

            {/* Carrito sticky */}
            <div className="hidden lg:block w-80">
              <StickyCart />
            </div>
          </div>
        </div>

        {/* Banners promocionales del final */}
        <PromotionalBanners />

        {/* Carrito móvil flotante */}
        <div className="lg:hidden">
          <StickyCart />
        </div>
      </div>
    </CartProvider>
  );
};

export default ClientCatalogPage;
