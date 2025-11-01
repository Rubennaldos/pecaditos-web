import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ClientCatalogManager } from '@/components/admin/ClientCatalogManager';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ClientCatalogPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-purple-50 to-stone-50">
      <Header />
      <main className="py-8 px-4">
        <div className="max-w-7xl mx-auto">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/dashboard')} 
            className="mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al Dashboard
          </Button>
          <ClientCatalogManager />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClientCatalogPage;
