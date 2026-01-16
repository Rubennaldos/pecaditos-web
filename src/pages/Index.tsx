import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLocation } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import HeroSection from '@/components/sections/HeroSection'; // import default
import { MainCards } from '@/components/sections/MainCards';
import { OrderTracking } from '@/components/sections/OrderTracking';
import { SocialMedia } from '@/components/sections/SocialMedia';
import { OrderTrackingModal } from '@/components/modals/OrderTrackingModal';

const Index = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [isTrackingModalOpen, setIsTrackingModalOpen] = useState(false);

  const handleOpenTrackingModal = () => setIsTrackingModalOpen(true);
  const handleCloseTrackingModal = () => setIsTrackingModalOpen(false);

  // 🔴 NO mostrar Header si:
  // 1. Hay un usuario logueado
  // 2. Está cargando la autenticación
  // 3. Estamos en la página de login
  const shouldShowHeader = !user && !loading && !location.pathname.includes('/login');

  return (
    <div className="min-h-screen bg-background">
      {shouldShowHeader && <Header />}
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
