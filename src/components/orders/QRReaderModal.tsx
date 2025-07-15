
import { useState, useEffect, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { QrCode, Camera, CameraOff, Smartphone } from 'lucide-react';

interface QRReaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onQRRead: (code: string) => void;
}

const QRReaderModal = ({ isOpen, onClose, onQRRead }: QRReaderModalProps) => {
  const [qrInput, setQrInput] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    // Detectar si es dispositivo móvil
    const checkMobile = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobileKeywords = ['android', 'iphone', 'ipad', 'ipod', 'mobile', 'tablet'];
      return mobileKeywords.some(keyword => userAgent.includes(keyword));
    };

    setIsMobile(checkMobile());

    // Verificar disponibilidad de cámara
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const hasVideoInput = devices.some(device => device.kind === 'videoinput');
          setHasCamera(hasVideoInput);
        })
        .catch(() => {
          setHasCamera(false);
        });
    }
  }, []);

  const startCamera = async () => {
    if (!hasCamera) {
      setCameraError('Cámara no disponible. Solo funciona en dispositivos móviles.');
      return;
    }

    try {
      setIsScanning(true);
      setCameraError('');
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment' // Cámara trasera preferida
        }
      });

      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      // Simular lectura de QR después de 3 segundos (demo)
      setTimeout(() => {
        if (isScanning) {
          const mockQRCode = 'PEC-2024-001'; // Código demo
          onQRRead(mockQRCode);
          stopCamera();
        }
      }, 3000);

    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('No se pudo acceder a la cámara. Verifique los permisos.');
      setIsScanning(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
  };

  const handleManualInput = () => {
    if (qrInput.trim()) {
      onQRRead(qrInput.trim());
      setQrInput('');
    }
  };

  const handleClose = () => {
    stopCamera();
    setQrInput('');
    setCameraError('');
    onClose();
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md mx-4 border-sand-200 bg-white">
        <DialogHeader>
          <DialogTitle className="text-brown-900 flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Leer Código QR
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Área de cámara */}
          <Card className="p-4">
            {!hasCamera && !isMobile ? (
              <div className="text-center py-8 space-y-4">
                <CameraOff className="h-12 w-12 text-stone-400 mx-auto" />
                <div>
                  <p className="text-stone-600 font-medium">Cámara no disponible</p>
                  <p className="text-sm text-stone-500">Solo funciona en dispositivos móviles</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-purple-600">
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">Use su teléfono o tablet</span>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {!isScanning ? (
                  <div className="text-center py-8 space-y-4">
                    <Camera className="h-12 w-12 text-purple-600 mx-auto" />
                    <div>
                      <p className="text-stone-700 font-medium">Escanear código QR</p>
                      <p className="text-sm text-stone-500">Presione para activar la cámara</p>
                    </div>
                    <Button onClick={startCamera} className="bg-purple-600 hover:bg-purple-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Activar Cámara
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="relative bg-black rounded-lg overflow-hidden">
                      <video
                        ref={videoRef}
                        className="w-full h-48 object-cover"
                        autoPlay
                        playsInline
                        muted
                      />
                      <div className="absolute inset-0 border-2 border-purple-500 border-dashed rounded-lg pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                          <div className="w-32 h-32 border-2 border-purple-400 rounded-lg animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-purple-600 font-medium animate-pulse">
                        Escaneando código QR...
                      </p>
                      <Button 
                        onClick={stopCamera} 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                      >
                        Detener
                      </Button>
                    </div>
                  </div>
                )}

                {cameraError && (
                  <div className="text-center py-4">
                    <CameraOff className="h-8 w-8 text-red-500 mx-auto mb-2" />
                    <p className="text-sm text-red-600">{cameraError}</p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Input manual */}
          <div className="space-y-3">
            <div className="text-center">
              <span className="text-sm text-stone-500">--- O ---</span>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-brown-900">
                Ingrese el código manualmente:
              </label>
              <Input
                placeholder="ID del pedido (ej: PEC-2024-001)"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                className="border-sand-300 bg-white focus:border-purple-500"
                onKeyPress={(e) => e.key === 'Enter' && handleManualInput()}
              />
            </div>
          </div>

          {/* Botones de acción */}
          <div className="flex gap-2">
            <Button
              onClick={handleManualInput}
              disabled={!qrInput.trim()}
              className="bg-purple-600 hover:bg-purple-700 text-white flex-1"
            >
              <QrCode className="h-4 w-4 mr-2" />
              Buscar Pedido
            </Button>
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-sand-300 text-brown-700 hover:bg-sand-50"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRReaderModal;
