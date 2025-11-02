import { useState } from 'react';
import { Search, Package, Clock, Truck, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// *** INTEGRACIÓN REAL: aquí se busca en Firebase ***
async function findOrderByNumber(orderNumber: string) {
  // TODO: Reemplazar con tu función real que busca el pedido en Firebase
  // Por ahora, retorna null para que no haya pedidos hasta que integres Firebase
  return null;
}

export const OrderTrackingModal = ({ isOpen, onClose }: OrderTrackingModalProps) => {
  const [orderNumber, setOrderNumber] = useState('');
  const [searchResult, setSearchResult] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const handleSearch = async () => {
    if (!orderNumber.trim()) return;

    setIsSearching(true);
    setNotFound(false);

    // Buscar pedido en Firebase (aún no implementado)
    const result = await findOrderByNumber(orderNumber.trim().toUpperCase());
    if (result) {
      setSearchResult(result);
      setNotFound(false);
    } else {
      setSearchResult(null);
      setNotFound(true);
    }
    setIsSearching(false);
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
          </div>

          {/* Estado: buscando */}
          {isSearching && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-500 border-t-transparent mx-auto mb-4"></div>
              <p className="text-base" style={{ color: "#573813" }}>Buscando tu pedido...</p>
            </div>
          )}

          {/* Estado: no encontrado */}
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

          {/* Estado: encontrado */}
          {searchResult && (
            <div className="space-y-6">
              {/* Aquí renderiza la info real cuando conectes con Firebase */}
              {/* Puedes copiar el diseño anterior y mapear los campos reales */}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
