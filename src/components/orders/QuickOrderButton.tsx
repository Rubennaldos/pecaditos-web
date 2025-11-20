// src/components/orders/QuickOrderButton.tsx
import { useState } from 'react';
import { Zap, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';
import { ref, get } from 'firebase/database';
import { db } from '@/config/firebase';
import { QuickOrderModal } from './QuickOrderModal';
import { OrderConfirmationModal } from './OrderConfirmationModal';

type ClientData = {
  ruc?: string;
  legalName?: string;
  commercialName?: string;
  address?: string;
  phone?: string;
};

export const QuickOrderButton = () => {
  const [showRucInput, setShowRucInput] = useState(false);
  const [rucInput, setRucInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [orderInfo, setOrderInfo] = useState<{
    orderId: string;
    orderNumber: string;
    orderData: any;
  } | null>(null);

  const searchClientByRuc = async (ruc: string) => {
    setLoading(true);
    try {
      // Buscar en usuarios mayoristas
      const usersRef = ref(db, 'users');
      const usersSnapshot = await get(usersRef);
      
      if (usersSnapshot.exists()) {
        const users = usersSnapshot.val();
        
        // Buscar usuario con ese RUC
        const foundUser = Object.entries(users).find(
          ([_, user]: [string, any]) => user?.ruc === ruc && user?.role === 'mayorista'
        );

        if (foundUser) {
          const [_, userData]: [string, any] = foundUser;
          return {
            ruc: userData.ruc,
            legalName: userData.legalName || userData.businessName,
            commercialName: userData.businessName || userData.displayName || userData.email,
            address: userData.address || userData.businessAddress,
            phone: userData.phone || userData.phoneNumber,
          };
        }
      }

      // Si no se encuentra, buscar en wholesaleCustomers
      const customersRef = ref(db, 'wholesaleCustomers');
      const customersSnapshot = await get(customersRef);

      if (customersSnapshot.exists()) {
        const customers = customersSnapshot.val();
        const foundCustomer = Object.entries(customers).find(
          ([_, customer]: [string, any]) => customer?.ruc === ruc
        );

        if (foundCustomer) {
          const [_, customerData]: [string, any] = foundCustomer;
          return {
            ruc: customerData.ruc,
            legalName: customerData.legalName || customerData.businessName,
            commercialName: customerData.businessName || customerData.name,
            address: customerData.address,
            phone: customerData.phone,
          };
        }
      }

      return null;
    } catch (error) {
      console.error('Error buscando cliente:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const handleSearchClient = async () => {
    if (!rucInput.trim()) {
      toast({
        title: 'RUC requerido',
        description: 'Por favor ingresa un RUC o documento',
        variant: 'destructive',
      });
      return;
    }

    const client = await searchClientByRuc(rucInput.trim());

    if (!client) {
      // Si no existe, crear un cliente temporal
      const tempClient: ClientData = {
        ruc: rucInput.trim(),
        legalName: 'Cliente Temporal',
        commercialName: `Cliente - ${rucInput.trim()}`,
        address: '',
        phone: '',
      };
      
      toast({
        title: 'Cliente no encontrado',
        description: 'Se creará un pedido con datos temporales',
      });
      
      setClientData(tempClient);
      setShowRucInput(false);
      setShowOrderModal(true);
      return;
    }

    toast({
      title: 'Cliente encontrado',
      description: `Bienvenido ${client.commercialName || client.legalName}`,
    });

    setClientData(client);
    setShowRucInput(false);
    setShowOrderModal(true);
  };

  const handleOrderCreated = async (orderId: string, orderNumber: string) => {
    // Obtener datos completos del pedido
    const orderRef = ref(db, `orders/${orderId}`);
    const orderSnapshot = await get(orderRef);
    
    if (orderSnapshot.exists()) {
      const orderData = orderSnapshot.val();
      setOrderInfo({
        orderId,
        orderNumber,
        orderData: {
          clientName: clientData?.commercialName || clientData?.legalName || 'Cliente',
          ruc: clientData?.ruc,
          legalName: clientData?.legalName,
          address: clientData?.address,
          phone: clientData?.phone,
          items: orderData.items || [],
          total: orderData.total || 0,
          createdAt: orderData.createdAt,
        },
      });
      setShowOrderModal(false);
      setShowConfirmation(true);
    }
  };

  const handleCloseConfirmation = () => {
    setShowConfirmation(false);
    setOrderInfo(null);
    setClientData(null);
    setRucInput('');
  };

  return (
    <>
      <Button
        onClick={() => setShowRucInput(true)}
        className="bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-700 hover:to-fuchsia-700 text-white shadow-lg hover:shadow-xl transition-all"
      >
        <Zap className="h-4 w-4 mr-2" />
        Pedido Rápido
      </Button>

      {/* Modal de entrada de RUC */}
      <Dialog open={showRucInput} onOpenChange={setShowRucInput}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">Pedido Rápido</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-stone-700 mb-2 block">
                Ingrese RUC o Documento del Cliente
              </label>
              <div className="flex gap-2">
                <Input
                  placeholder="Ej: 20550404517"
                  value={rucInput}
                  onChange={(e) => setRucInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchClient()}
                  className="flex-1"
                  autoFocus
                />
                <Button
                  onClick={handleSearchClient}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  {loading ? (
                    'Buscando...'
                  ) : (
                    <>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar
                    </>
                  )}
                </Button>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                Si el cliente no existe, se creará un pedido temporal
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de pedido rápido */}
      {clientData && (
        <QuickOrderModal
          isOpen={showOrderModal}
          onClose={() => {
            setShowOrderModal(false);
            setClientData(null);
            setRucInput('');
          }}
          clientData={clientData}
          onOrderCreated={handleOrderCreated}
        />
      )}

      {/* Modal de confirmación */}
      {orderInfo && (
        <OrderConfirmationModal
          isOpen={showConfirmation}
          onClose={handleCloseConfirmation}
          orderNumber={orderInfo.orderNumber}
          orderData={orderInfo.orderData}
        />
      )}
    </>
  );
};
