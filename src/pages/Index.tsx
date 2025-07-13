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
    // CAMBIA la clase de fondo y elimina todas las referencias a "dark:"
    <div className="min-h-screen bg-[#F7F1E5]">
      {/* Header */}
      <Header />
      
      {/* Hero Section */}
      <HeroSection />
      
      {/* Main Cards */}
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
