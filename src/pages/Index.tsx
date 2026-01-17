import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Footer } from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection';
import { MainCards } from '@/components/sections/MainCards';
import { OrderTracking } from '@/components/sections/OrderTracking';
import { SocialMedia } from '@/components/sections/SocialMedia';
import { OrderTrackingModal } from '@/components/modals/OrderTrackingModal';

const Index = () => {
  const { user, loading } = useAuth();
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const handleOpenTrackingModal = () => setIsTrackingModalOpen(true);
  const handleCloseTrackingModal = () => setIsTrackingModalOpen(false);

  // 🔴 NO mostrar Header si hay usuario logueado o está cargando
  const shouldHideHeader = user || loading;

  return (
    <div className="min-h-screen bg-background">
      {/* 🔴 SIN HEADER - Completamente eliminado */}
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
