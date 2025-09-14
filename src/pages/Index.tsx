import { useState } from 'react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection'; // import default
import { MainCards } from '@/components/sections/MainCards';
import { OrderTracking } from '@/components/sections/OrderTracking';
import { SocialMedia } from '@/components/sections/SocialMedia';
import { OrderTrackingModal } from '@/components/modals/OrderTrackingModal';

const Index = () => {
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const handleOpenTrackingModal = () => setIsTrackingModalOpen(true);
  const handleCloseTrackingModal = () => setIsTrackingModalOpen(false);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <HeroSection />
        <MainCards />
        <OrderTracking onOpenModal={handleOpenTrackingModal} />
        <SocialMedia />
      </main>
      <Footer />

      <OrderTrackingModal isOpen={isTrackingModalOpen} onClose={handleCloseTrackingModal} />
    </div>
  );
};

export default Index;
