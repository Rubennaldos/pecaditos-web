
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroBanner } from '@/components/sections/HeroBanner';
import { CategorySelector } from '@/components/sections/CategorySelector';
import { PromoBanners } from '@/components/sections/PromoBanners';
import { DashboardSummary } from '@/components/sections/DashboardSummary';
import { ProductsOnPromotion } from '@/components/sections/ProductsOnPromotion';
import { ProductCatalog } from '@/components/sections/ProductCatalog';
import { StickyCart } from '@/components/cart/StickyCart';
import { RecommendedProducts } from '@/components/sections/RecommendedProducts';
import { FAQSection } from '@/components/sections/FAQSection';
import { PromotionalBanners } from '@/components/sections/PromotionalBanners';
import { Footer } from '@/components/layout/Footer';
import { CartProvider } from '@/contexts/CartContext';

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <CartProvider>
      <div className="min-h-screen bg-background">
        {/* Header con logo, buscador, login y carrito */}
        <Header 
          searchQuery={searchQuery} 
          onSearchChange={setSearchQuery}
        />
        
        {/* Banner principal para campañas */}
        <HeroBanner />
        
        {/* Selector de categorías */}
        <CategorySelector 
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />
        
        {/* 2 banners promocionales */}
        <PromoBanners />
        
        {/* Dashboard mini-resumen */}
        <DashboardSummary />
        
        {/* Productos en promoción destacados */}
        <ProductsOnPromotion />
        
        {/* Catálogo principal de productos */}
        <ProductCatalog 
          selectedCategory={selectedCategory}
          searchQuery={searchQuery}
        />
        
        {/* Productos recomendados */}
        <RecommendedProducts />
        
        {/* Preguntas frecuentes */}
        <FAQSection />
        
        {/* Banners promocionales finales */}
        <PromotionalBanners />
        
        {/* Footer */}
        <Footer />
        
        {/* Carrito sticky siempre visible */}
        <StickyCart />
      </div>
    </CartProvider>
  );
};

export default Index;
