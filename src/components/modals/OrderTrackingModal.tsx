
import { useState } from 'react';
import { X, Search, Package, Clock, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Mock data para ejemplificar el funcionamiento
const mockOrders = {
  'ORD001': {
    orderNumber: 'ORD001',
    status: 'En camino',
    statusStep: 3,
    date: '2024-01-15',
    items: ['Galletas Chocochips x6', 'Combo Familiar x1'],
    total: 'S/ 85.00',
    estimatedDelivery: '2024-01-16 15:00'
  },
  'ORD002': {
    orderNumber: 'ORD002',
    status: 'Entregado',
    statusStep: 4,
    date: '2024-01-10',
    items: ['Galletas Avena x12'],
    total: 'S/ 72.00',
    estimatedDelivery: 'Entregado el 2024-01-11'
  }
};

export const OrderTrackingModal = ({ isOpen, onClose }: OrderTrackingModalProps) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;
    
    setIsSearching(true);
    setNotFound(false);
    setTimeout(() => {
      const result = mockOrders[orderNumber.toUpperCase() as keyof typeof mockOrders];
      if (result) {
        setSearchResult(result);
        setNotFound(false);
      } else {
        setSearchResult(null);
        setNotFound(true);
      }
      setIsSearching(false);
    }, 1500);
  };

  const resetModal = () => {
    setOrderNumber('');
    setSearchResult(null);
    setNotFound(false);
    setIsSearching(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const getStatusIcon = (step: number, currentStep: number) => {
    if (step < currentStep) return <CheckCircle className="w-6 h-6 text-green-500" />;
    if (step === currentStep) {
      if (step === 1) return <Package className="w-6 h-6 text-blue-500" />;
      if (step === 2) return <Clock className="w-6 h-6 text-yellow-500" />;
      if (step === 3) return <Truck className="w-6 h-6 text-purple-500" />;
      if (step === 4) return <CheckCircle className="w-6 h-6 text-green-500" />;
    }
    return <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>;
  };

  const statusSteps = [
    { step: 1, title: 'Pedido Recibido', desc: 'Confirmamos tu pedido' },
    { step: 2, title: 'Preparando', desc: 'Horneando con amor' },
    { step: 3, title: 'En Camino', desc: 'Directo a tu puerta' },
    { step: 4, title: 'Entregado', desc: '¡Disfruta tus galletas!' }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle
            className="text-2xl font-bold text-center flex items-center justify-center space-x-2"
            style={{ color: "#573813" }}
          >
            <Package className="w-6 h-6 text-amber-600" />
            <span>Seguimiento de Pedido</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Formulario de búsqueda */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: "#573813" }}>
                Número de Pedido
              </label>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  placeholder="Ej: ORD001"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="flex-1"
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  style={{ color: "#573813" }}
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isSearching || !orderNumber.trim()}
                  className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                >
                  {isSearching ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  ) : (
                    <Search className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Ejemplos para probar */}
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm mb-2" style={{ color: "#573813" }}>
                <strong>💡 Para probar:</strong> Usa uno de estos números de ejemplo:
              </p>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => setOrderNumber('ORD001')}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                >
                  ORD001
                </button>
                <button 
                  onClick={() => setOrderNumber('ORD002')}
                  className="px-3 py-1 bg-blue-100 dark:bg-blue-800 text-blue-800 dark:text-blue-200 rounded text-xs hover:bg-blue-200 dark:hover:bg-blue-700 transition-colors"
                >
                  ORD002
                </button>
              </div>
            </div>
          </div>

          {/* Resultado de búsqueda */}
          {isSearching && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-base" style={{ color: "#573813" }}>Buscando tu pedido...</p>
            </div>
          )}

          {notFound && (
            <div className="text-center py-8 space-y-4">
              <div className="text-6xl">😔</div>
              <div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: "#573813" }}>
                  Pedido no encontrado
                </h3>
                <p className="text-base" style={{ color: "#573813" }}>
                  Verifica que el número de pedido sea correcto o contáctanos por WhatsApp.
                </p>
              </div>
            </div>
          )}

          {searchResult && (
            <div className="space-y-6">
              
              {/* Información del pedido */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-xl border border-green-200 dark:border-green-800">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2" style={{ color: "#573813" }}>
                      Pedido #{searchResult.orderNumber}
                    </h3>
                    <p className="text-sm" style={{ color: "#573813" }}>
                      Fecha: {searchResult.date}
                    </p>
                    <p className="text-sm" style={{ color: "#573813" }}>
                      Total: {searchResult.total}
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1" style={{ color: "#573813" }}>Productos:</h4>
                    <ul className="text-sm space-y-1" style={{ color: "#573813" }}>
                      {searchResult.items.map((item: string, index: number) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Estado actual destacado */}
              <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <h3 className="text-xl font-bold mb-2" style={{ color: "#573813" }}>
                  Estado: {searchResult.status}
                </h3>
                <p className="text-base" style={{ color: "#573813" }}>
                  {searchResult.estimatedDelivery}
                </p>
              </div>

              {/* Progress de estados */}
              <div className="space-y-4">
                <h4 className="font-semibold" style={{ color: "#573813" }}>Progreso del Pedido:</h4>
                <div className="space-y-4">
                  {statusSteps.map((step, index) => (
                    <div key={step.step} className="flex items-center space-x-4">
                      {getStatusIcon(step.step, searchResult.statusStep)}
                      <div className="flex-1">
                        <h5 className={`font-medium ${step.step <= searchResult.statusStep ? 'text-gray-900' : 'text-gray-400'}`}>
                          {step.title}
                        </h5>
                        <p className={`text-sm ${step.step <= searchResult.statusStep ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
