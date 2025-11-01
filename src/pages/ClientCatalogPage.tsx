import { ClientCatalogManager } from '@/components/admin/ClientCatalogManager';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ClientCatalogPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-purple-50 to-stone-50">
      <div className="p-8">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/dashboard')} 
          className="mb-4"
        >
          Volver a Módulos
        </Button>
        <ClientCatalogManager />
      </div>
    </div>
  );
};

export default ClientCatalogPage;
