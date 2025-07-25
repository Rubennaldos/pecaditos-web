import { useState } from 'react';
import { 
  MapPin, 
  Clock, 
  MessageSquare, 
  Check, 
  ArrowLeft, 
  Download,
  AlertCircle,
  Building
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';
import { useToast } from '@/hooks/use-toast';

/**
 * MÓDULO DE CHECKOUT MAYORISTA
 * 
 * Módulo completo de pago/entrega con:
 * - Selección de sede (si hay múltiples)
 * - Observaciones del cliente
 * - Tiempo de entrega aproximado
 * - Confirmación con 24 horas de plazo
 * - Generación de número de orden
 * - Descarga de PDF
 */

interface WholesaleCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DeliveryLocation {
  id: string;
  name: string;
  address: string;
  deliveryTime: string;
  zone: string;
}

// Sedes disponibles para entrega
const DELIVERY_LOCATIONS: DeliveryLocation[] = [
  {
    id: 'miraflores',
    name: 'Sede Miraflores',
    address: 'Av. Larco 1234, Miraflores',
    deliveryTime: '2-3 horas',
    zone: 'Zona 1'
  },
  {
    id: 'san-isidro',
    name: 'Sede San Isidro', 
    address: 'Av. Conquistadores 456, San Isidro',
    deliveryTime: '3-4 horas',
    zone: 'Zona 1'
  },
  {
    id: 'surco',
    name: 'Sede Surco',
    address: 'Av. Primavera 789, Surco', 
    deliveryTime: '4-5 horas',
    zone: 'Zona 2'
  }
];

export const WholesaleCheckout = ({ isOpen, onClose }: WholesaleCheckoutProps) => {
  const [step, setStep] = useState<'delivery' | 'confirmation' | 'confirmed'>('delivery');
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [customerObservations, setCustomerObservations] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  
  const { items, finalTotal, itemCount, clearCart } = useWholesaleCart();
  const { toast } = useToast();

  const selectedLocationData = DELIVERY_LOCATIONS.find(loc => loc.id === selectedLocation);

  const handleConfirmDelivery = () => {
    if (!selectedLocation) {
      toast({
        title: "Selecciona una sede",
        description: "Debes seleccionar una sede para la entrega",
        variant: "destructive"
      });
      return;
    }
    setStep('confirmation');
  };

  const handleConfirmOrder = () => {
    // Generar número de orden único - PENDIENTE DE CONFIRMACIÓN
    const orderNum = `MW-${Date.now().toString().slice(-8)}`;
    setOrderNumber(orderNum);
    setStep('confirmed');
    
    // Notificar al área de pedidos para confirmación
    console.log('🔔 NUEVO PEDIDO MAYORISTA PENDIENTE CONFIRMACIÓN:', {
      orderId: orderNum,
      customer: 'Usuario Mayorista',
      total: finalTotal,
      items: items.length,
      location: selectedLocation,
      timestamp: new Date().toISOString(),
      status: 'pendiente_confirmacion_2h'
    });
    
    toast({
      title: "¡Pedido enviado!",
      description: `Orden ${orderNum} enviada. Será confirmada en 2 horas.`,
    });
  };

  const handleDownloadPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();
      
      // Configurar PDF
      doc.setFontSize(20);
      doc.setFont("helvetica", "bold");
      doc.text('PECADITOS INTEGRALES S.A.C.', 20, 30);
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "normal");
      doc.text('ORDEN DE PEDIDO MAYORISTA', 20, 45);
      
      // Número de orden
      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.text(`Orden N°: ${orderNumber}`, 20, 65);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 20, 75);
      
      // Información de entrega
      doc.setFont("helvetica", "normal");
      doc.text('INFORMACIÓN DE ENTREGA:', 20, 95);
      doc.text(`Sede: ${selectedLocationData?.name}`, 25, 105);
      doc.text(`Dirección: ${selectedLocationData?.address}`, 25, 115);
      doc.text(`Tiempo estimado: ${selectedLocationData?.deliveryTime}`, 25, 125);
      
      // Lista de productos
      doc.text('PRODUCTOS SOLICITADOS:', 20, 145);
      let yPos = 155;
      items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.product.name}`, 25, yPos);
        doc.text(`   Cantidad: ${item.quantity} | Precio: S/ ${item.finalPrice.toFixed(2)}`, 25, yPos + 10);
        yPos += 20;
      });
      
      // Total
      doc.setFont("helvetica", "bold");
      doc.text(`TOTAL: S/ ${finalTotal.toFixed(2)}`, 20, yPos + 20);
      
      // Observaciones
      if (customerObservations) {
        doc.setFont("helvetica", "normal");
        doc.text('OBSERVACIONES:', 20, yPos + 40);
        const splitText = doc.splitTextToSize(customerObservations, 170);
        doc.text(splitText, 25, yPos + 50);
      }
      
      // Términos
      doc.setFontSize(10);
      doc.text('IMPORTANTE: Este pedido será confirmado en las próximas 2 horas.', 20, 270);
      doc.text('Para consultas: WhatsApp 999-888-777', 20, 280);
      
      // Descargar
      doc.save(`Pedido-${orderNumber}.pdf`);
      
      toast({
        title: "PDF Descargado",
        description: "Tu orden ha sido descargada exitosamente",
      });
    });
  };

  const handleBackToShopping = () => {
    clearCart();
    onClose();
    toast({
      title: "Nuevo pedido disponible",
      description: "Puedes iniciar un nuevo pedido mayorista",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[95vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {step !== 'confirmed' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-xl font-bold text-stone-800">
              {step === 'delivery' && 'Configurar Entrega'}
              {step === 'confirmation' && 'Confirmar Pedido'}
              {step === 'confirmed' && 'Pedido Confirmado'}
            </h2>
          </div>
          
          {/* Indicador de pasos */}
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${step === 'delivery' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'confirmation' ? 'bg-blue-500' : step === 'confirmed' ? 'bg-green-500' : 'bg-stone-300'}`} />
            <div className={`w-3 h-3 rounded-full ${step === 'confirmed' ? 'bg-green-500' : 'bg-stone-300'}`} />
          </div>
        </div>

        <div className="p-6">
          {/* PASO 1: Configuración de entrega */}
          {step === 'delivery' && (
            <div className="space-y-6">
              
              {/* Resumen del pedido */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-blue-500" />
                    Resumen del Pedido
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-stone-600">{itemCount} productos</p>
                      <p className="text-lg font-bold text-stone-800">Total: S/ {finalTotal.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-green-600">✓ Pedido mínimo alcanzado</p>
                      <p className="text-xs text-stone-500">Descuentos mayoristas aplicados</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Selección de sede */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Seleccionar Sede de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>Sede disponible para tu zona:</Label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una sede..." />
                    </SelectTrigger>
                    <SelectContent>
                      {DELIVERY_LOCATIONS.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">{location.name}</span>
                            <span className="text-sm text-stone-500">{location.address}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {selectedLocationData && (
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span className="font-medium text-blue-800">
                          Tiempo estimado: {selectedLocationData.deliveryTime}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        📍 {selectedLocationData.address} • {selectedLocationData.zone}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Observaciones del cliente */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Observaciones Adicionales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="observations">
                    Comentarios especiales para tu pedido (opcional):
                  </Label>
                  <Textarea
                    id="observations"
                    placeholder="Ej: Entregar en horario de mañana, solicitar factura, instrucciones especiales..."
                    value={customerObservations}
                    onChange={(e) => setCustomerObservations(e.target.value)}
                    className="mt-2"
                    rows={4}
                  />
                </CardContent>
              </Card>

              {/* Botón continuar */}
              <Button
                onClick={handleConfirmDelivery}
                disabled={!selectedLocation}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
              >
                Continuar a Confirmación
              </Button>
            </div>
          )}

          {/* PASO 2: Confirmación final */}
          {step === 'confirmation' && (
            <div className="space-y-6">
              
              {/* Aviso importante */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">
                      Importante: Plazo de confirmación
                    </h3>
                    <p className="text-sm text-amber-700">
                      Tienes <strong>24 horas</strong> para confirmar este pedido. 
                      Después de este tiempo, deberás generar un nuevo pedido.
                    </p>
                  </div>
                </div>
              </div>

              {/* Resumen completo */}
              <Card>
                <CardHeader>
                  <CardTitle>Resumen Final del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Información de entrega */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-stone-800 mb-2">📍 Entrega</h4>
                      <p className="text-sm text-stone-600">{selectedLocationData?.name}</p>
                      <p className="text-xs text-stone-500">{selectedLocationData?.address}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        ⏱️ {selectedLocationData?.deliveryTime}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-stone-800 mb-2">💰 Total</h4>
                      <p className="text-lg font-bold text-stone-800">S/ {finalTotal.toFixed(2)}</p>
                      <p className="text-sm text-green-600">{itemCount} productos</p>
                    </div>
                  </div>

                  {/* Observaciones */}
                  {customerObservations && (
                    <div>
                      <h4 className="font-medium text-stone-800 mb-2">💬 Observaciones</h4>
                      <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">
                        {customerObservations}
                      </p>
                    </div>
                  )}

                  {/* Lista de productos resumida */}
                  <div>
                    <h4 className="font-medium text-stone-800 mb-2">📦 Productos</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex justify-between text-sm">
                          <span>{item.product.name} x {item.quantity}</span>
                          <span className="font-medium">S/ {item.finalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Botones */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('delivery')}
                  className="flex-1"
                >
                  Volver a Entrega
                </Button>
                <Button
                  onClick={handleConfirmOrder}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar Pedido
                </Button>
              </div>
            </div>
          )}

          {/* PASO 3: Pedido confirmado */}
          {step === 'confirmed' && (
            <div className="text-center space-y-6">
              
              {/* Icono de éxito */}
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-green-600" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">
                  ¡Pedido Confirmado!
                </h3>
                <p className="text-stone-600">
                  Tu pedido mayorista ha sido registrado exitosamente
                </p>
              </div>

              {/* Número de orden */}
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-stone-600 mb-1">Número de Orden:</p>
                    <p className="text-3xl font-bold text-blue-600 mb-4">{orderNumber}</p>
                    
                    <div className="grid md:grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-sm font-medium text-stone-800">📍 Entrega en:</p>
                        <p className="text-sm text-stone-600">{selectedLocationData?.name}</p>
                        <p className="text-xs text-stone-500">{selectedLocationData?.deliveryTime}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800">💰 Total pagado:</p>
                        <p className="text-lg font-bold text-stone-800">S/ {finalTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Aviso de confirmación en 2 horas */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>⏰ Confirmación pendiente:</strong> Tu pedido será confirmado por nuestro equipo dentro de las próximas <strong>2 horas</strong>. 
                  Te notificaremos por WhatsApp o a través de tu perfil mayorista.
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button
                  onClick={handleBackToShopping}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Nuevo Pedido
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};