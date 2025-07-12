
import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { HeroSection } from '@/components/sections/HeroSection';
import { MainCards } from '@/components/sections/MainCards';
import { OrderTracking } from '@/components/sections/OrderTracking';
import { SocialMedia } from '@/components/sections/SocialMedia';
import { Footer } from '@/components/layout/Footer';
import { OrderTrackingModal } from '@/components/modals/OrderTrackingModal';

const Index = () => {
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50 dark:from-stone-900 dark:via-stone-800 dark:to-stone-900">
      {/* Header - Solo para móvil como navegación básica */}
      <Header />
      
      {/* Hero Section - Logo, eslogan y texto de bienvenida */}
      <HeroSection />
      
      {/* Main Cards - Catálogo y Login */}
      <MainCards />
      
      {/* Order Tracking Button */}
      <OrderTracking onOpenModal={() => setIsTrackingModalOpen(true)} />
      
      {/* Social Media */}
      <SocialMedia />
      
      {/* Footer */}
      <Footer />
      
      {/* Order Tracking Modal */}
      <OrderTrackingModal 
        isOpen={isTrackingModalOpen} 
        onClose={() => setIsTrackingModalOpen(false)} 
      />
    </div>
  );
};

export default Index;
