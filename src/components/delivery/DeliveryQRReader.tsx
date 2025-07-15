
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { QrCode, Camera, CameraOff, Smartphone } from 'lucide-react';
import QROrderDetailModal from '@/components/orders/QROrderDetailModal';

interface DeliveryQRReaderProps {
  isOpen: boolean;
  onClose: () => void;
  availableOrders: any[];
  onOrderUpdate: (orderId: string, newStatus: string, notes?: string) => void;
}

const DeliveryQRReader = ({ isOpen, onClose, availableOrders, onOrderUpdate }: DeliveryQRReaderProps) => {
  const [qrInput, setQrInput] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const handleQRRead = (code: string) => {
    // Buscar pedido por ID
    let orderId = code;
    if (code.includes('/seguimiento?pedido=')) {
      orderId = code.split('pedido=')[1];
    }

    const order = availableOrders.find(o => o.id === orderId);
    if (order) {
      setSelectedOrder(order);
      setShowOrderDetail(true);
    } else {
      alert('Pedido no encontrado o no disponible para entrega');
    }
    setQrInput('');
  };

  const startCamera = () => {
    // Simular activación de cámara
    setIsScanning(true);
    
    // Demo: simular lectura después de 3 segundos
    setTimeout(() => {
      if (isScanning && availableOrders.length > 0) {
        handleQRRead(availableOrders[0].id);
        setIsScanning(false);
      }
    }, 3000);
  };

  const stopCamera = () => {
    setIsScanning(false);
  };

  const handleOrderAction = (orderId: string, action: string, notes?: string) => {
    onOrderUpdate(orderId, action, notes);
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  return (
    <>
      <Dialog open={isOpen && !showOrderDetail} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5" />
              Escanear Pedido
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Área de cámara */}
            {!isScanning ? (
              <div className="text-center py-8 space-y-4">
                <Camera className="h-12 w-12 text-blue-600 mx-auto" />
                <div>
                  <p className="text-stone-700 font-medium">Escanear código QR del pedido</p>
                  <p className="text-sm text-stone-500">Solo pedidos listos para entrega</p>
                </div>
                <Button onClick={startCamera} className="bg-blue-600 hover:bg-blue-700">
                  <Camera className="h-4 w-4 mr-2" />
                  Activar Cámara
                </Button>
              </div>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-32 h-32 border-2 border-blue-500 border-dashed rounded-lg mx-auto flex items-center justify-center">
                  <QrCode className="h-16 w-16 text-blue-500 animate-pulse" />
                </div>
                <p className="text-sm text-blue-600 font-medium animate-pulse">
                  Escaneando código QR...
                </p>
                <Button onClick={stopCamera} variant="outline" size="sm">
                  Detener
                </Button>
              </div>
            )}

            {/* Input manual */}
            <div className="space-y-3">
              <div className="text-center">
                <span className="text-sm text-stone-500">--- O ---</span>
              </div>
              <Input
                placeholder="ID del pedido (ej: PEC-2024-001)"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && qrInput && handleQRRead(qrInput)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => handleQRRead(qrInput)}
                disabled={!qrInput}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                Buscar Pedido
              </Button>
              <Button variant="outline" onClick={onClose}>
                Cancelar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalle del pedido */}
      {selectedOrder && (
        <QROrderDetailModal
          isOpen={showOrderDetail}
          onClose={() => {
            setShowOrderDetail(false);
            setSelectedOrder(null);
          }}
          order={selectedOrder}
          onStatusUpdate={handleOrderAction}
        />
      )}
    </>
  );
};

export default DeliveryQRReader;
