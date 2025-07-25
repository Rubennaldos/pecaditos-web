
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '@/contexts/AdminContext';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BillingSidebar } from '@/components/billing/BillingSidebar';
import { BillingDashboard } from '@/components/billing/BillingDashboard';
import { BillingOrdersAdmin } from '@/components/billing/BillingOrdersAdmin';
import { BillingToBePaidAdmin } from '@/components/billing/BillingToBePaidAdmin';
import { BillingPaid } from '@/components/billing/BillingPaid';
import { BillingClients } from '@/components/billing/BillingClients';
import { BillingHistory } from '@/components/billing/BillingHistory';
import { BillingReports } from '@/components/billing/BillingReports';
import { AdminBillingProvider } from '@/contexts/AdminBillingContext';

const BillingPanel = () => {
  const navigate = useNavigate();
  const { logout } = useAdmin();
  const [activeSection, setActiveSection] = useState('dashboard');

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <BillingDashboard />;
      case 'orders':
        return <BillingOrdersAdmin />;
      case 'to-be-paid':
        return <BillingToBePaidAdmin />;
      case 'paid':
        return <BillingPaid />;
      case 'clients':
        return <BillingClients />;
      case 'history':
        return <BillingHistory />;
      case 'reports':
        return <BillingReports />;
      default:
        return <BillingDashboard />;
    }
  };

  return (
    <AdminBillingProvider>
      <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
        {/* Admin Mode Toggle - REMOVIDO según instrucciones */}
        
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">₡</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-stone-800">Panel de Cobranzas</h1>
                  <p className="text-stone-600">Gestión financiera integral</p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-stone-600 border-stone-300 hover:bg-stone-50"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex">
          {/* Sidebar */}
          <BillingSidebar 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
          
          {/* Content */}
          <div className="flex-1 p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </AdminBillingProvider>
  );
};

export default BillingPanel;
