import { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Clock,
  MessageSquare,
  Check,
  ArrowLeft,
  Download,
  AlertCircle,
  Building,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useWholesaleCart } from '@/contexts/WholesaleCartContext';
import { useToast } from '@/hooks/use-toast';

import { db } from '@/config/firebase';
import { ref, onValue, push, set } from 'firebase/database';
import { getAuth } from 'firebase/auth';

interface WholesaleCheckoutProps {
  isOpen: boolean;
  onClose: () => void;
}

type DeliveryLocation = {
  id: string;
  name: string;
  address: string;
  deliveryTime?: string;
  zone?: string;
};

export const WholesaleCheckout = ({ isOpen, onClose }: WholesaleCheckoutProps) => {
  const [step, setStep] = useState<'delivery' | 'confirmation' | 'confirmed'>('delivery');

  const [clientId, setClientId] = useState<string>('');
  const [locations, setLocations] = useState<DeliveryLocation[]>([]);
  const [defaultSiteId, setDefaultSiteId] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<string>('');

  const [customerObservations, setCustomerObservations] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const { items, finalTotal, itemCount, clearCart } = useWholesaleCart();
  const { toast } = useToast();

  // Acepta address como string o como objeto { street, district, province }
  const formatAddress = (addr: any) => {
    if (!addr) return '';
    if (typeof addr === 'string') return addr;
    const parts = [addr?.street, addr?.district, addr?.province].filter(Boolean);
    return parts.join(', ');
  };

  // Lee clientId del usuario y luego las sedes reales del cliente (solo cuando el modal está abierto)
  useEffect(() => {
    if (!isOpen) return;

    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const userRef = ref(db, `wholesale/users/${uid}`);
    let unSubClient: (() => void) | null = null;

    const unSubUser = onValue(userRef, (snap) => {
      const cId = snap.val()?.clientId as string | undefined;
      setClientId(cId || '');

      if (unSubClient) {
        unSubClient();
        unSubClient = null;
      }

      if (!cId) {
        setLocations([]);
        setDefaultSiteId('');
        setSelectedLocation('');
        return;
      }

      const clientRef = ref(db, `wholesale/clients/${cId}`);
      unSubClient = onValue(clientRef, (snap2) => {
        const v = snap2.val() || {};

        // Si tus sedes están en un array: v.sites = [{ id, name, address, ...}]
        const sites: DeliveryLocation[] = Array.isArray(v?.sites)
          ? (v.sites as any[])
              .filter(Boolean)
              .map((s) => ({
                id: s?.id || crypto.randomUUID(),
                name: s?.name || '',
                address: formatAddress(s?.address),
                deliveryTime: s?.deliveryHours || s?.deliveryTime || '',
                zone: s?.zone || '',
              }))
          : [];

        const defId = v?.defaultSiteId || '';

        setLocations(sites);
        setDefaultSiteId(defId);
        setSelectedLocation((curr) => curr || defId || (sites[0]?.id ?? ''));
      });
    });

    return () => {
      unSubUser?.();
      if (unSubClient) unSubClient();
    };
  }, [isOpen]);

  const selectedLocationData = useMemo(
    () => locations.find((loc) => loc.id === selectedLocation),
    [locations, selectedLocation]
  );

  const handleConfirmDelivery = () => {
    if (!selectedLocation) {
      toast({
        title: 'Selecciona una sede',
        description: 'Debes seleccionar una sede para la entrega',
        variant: 'destructive',
      });
      return;
    }
    setStep('confirmation');
  };

  // === GUARDA EL PEDIDO EN RTDB ===
  const handleConfirmOrder = async () => {
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    if (!uid || !clientId || !selectedLocationData) {
      toast({
        title: 'Falta información',
        description: 'Usuario, cliente o sede no disponibles.',
        variant: 'destructive',
      });
      return;
    }

    // --- Normalización para que el panel Admin muestre cantidad × precio y total ---
    const currency = 'PEN';
    const itemsNormalized = items.map((i) => {
      const quantity = i.quantity;
      const price =
        i.unitPrice ?? Number((i.finalPrice / Math.max(1, quantity)).toFixed(2)); // unitario
      const subtotal = Number(i.finalPrice.toFixed(2));
      return {
        id: i.product.id,
        name: i.product.name,
        quantity,
        price,
        subtotal,
      };
    });
    const itemsCountNorm = itemsNormalized.reduce((a, it) => a + (Number(it.quantity) || 0), 0);
    const subtotal = itemsNormalized.reduce((a, it) => a + (Number(it.subtotal) || 0), 0);
    const total = Number(finalTotal.toFixed(2));

    // Generar ID de pedido mayorista
    const wholesaleOrdersRef = ref(db, 'wholesale/orders');
    const newRef = push(wholesaleOrdersRef);
    const orderId = newRef.key!;
    const orderNum = `MW-${orderId.slice(-8).toUpperCase()}`;
    const now = Date.now();

    // timeline inicial como objeto (clave = timestamp string)
    const timelineKey = String(now);
    const firstEvent = {
      at: now,
      status: 'pendiente',
      message: 'Pedido registrado y en cola de revisión',
    };

    // Payload mayorista (mantiene compatibilidad con tu estructura)
    const wholesalePayload = {
      id: orderId,
      orderNumber: orderNum,
      userId: uid,
      clientId,
      siteId: selectedLocationData.id,
      site: {
        name: selectedLocationData.name,
        address: selectedLocationData.address,
        deliveryTime: selectedLocationData.deliveryTime || '',
        zone: selectedLocationData.zone || '',
      },
      // guardo claves antiguas y nuevas para no romper nada
      items: itemsNormalized.map((it) => ({
        id: it.id,
        name: it.name,
        qty: it.quantity,     // compat antigua
        unit: it.price,       // compat antigua (precio unitario)
        total: it.subtotal,   // compat antigua (total de línea)
        // nuevas (las que lee la tarjeta típica)
        quantity: it.quantity,
        price: it.price,
        subtotal: it.subtotal,
      })),
      totals: {
        total,
        items: itemCount,
      },
      // añadidos útiles a nivel raíz
      currency,
      itemsCount: itemsCountNorm,
      subtotal,
      total,
      observations: customerObservations || '',
      status: 'pendiente',
      createdAt: now,
      trackingCode: null as string | null, // opcional
      statusTimeline: {
        [timelineKey]: firstEvent,
      } as Record<string, { at: number; status: string; message?: string }>,
    };

    // Payload admin (cola de pedidos) — con campos que la UI espera
    const adminPayload = {
      id: orderId,
      number: orderNum,
      channel: 'wholesale',
      status: 'pendiente',
      createdAt: now,
      userId: uid,
      clientId,
      shipping: {
        siteId: selectedLocationData.id,
        siteName: selectedLocationData.name,
        address: selectedLocationData.address,
        eta: selectedLocationData.deliveryTime || '',
        zone: selectedLocationData.zone || '',
      },
      // 👇 Claves típicas del panel
      items: itemsNormalized,       // { id, name, quantity, price, subtotal }
      itemsCount: itemsCountNorm,   // total de unidades
      subtotal,
      total,                        // IMPRESCINDIBLE para evitar “S/” vacío
      currency,
      // cliente básico (ajusta si tienes datos del comprador)
      customer: {
        name: selectedLocationData.name ?? '',
        phone: '',
        address: selectedLocationData.address ?? '',
      },
      // compat con tu estructura actual
      totals: wholesalePayload.totals,
      notes: wholesalePayload.observations,
      statusTimeline: wholesalePayload.statusTimeline,
    };

    try {
      // 1) guarda en mayorista
      await set(newRef, wholesalePayload);
      // índices para historial
      await set(ref(db, `wholesale/userOrders/${uid}/${orderId}`), true);
      await set(ref(db, `wholesale/clientOrders/${clientId}/${orderId}`), true);

      // 2) crea espejo para el panel admin
      await set(ref(db, `orders/${orderId}`), adminPayload);
      await set(ref(db, `ordersByStatus/pendiente/${orderId}`), true);

      setOrderNumber(orderNum);
      setStep('confirmed');

      toast({
        title: '¡Pedido enviado!',
        description: `Orden ${orderNum} registrada.`,
      });
    } catch (e) {
      console.error(e);
      toast({
        title: 'Error',
        description: 'No se pudo registrar el pedido.',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadPDF = () => {
    import('jspdf').then(({ jsPDF }) => {
      const doc = new jsPDF();

      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('PECADITOS INTEGRALES S.A.C.', 20, 30);

      doc.setFontSize(16);
      doc.setFont('helvetica', 'normal');
      doc.text('ORDEN DE PEDIDO MAYORISTA', 20, 45);

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text(`Orden N°: ${orderNumber}`, 20, 65);
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-PE')}`, 20, 75);

      doc.setFont('helvetica', 'normal');
      doc.text('INFORMACIÓN DE ENTREGA:', 20, 95);
      doc.text(`Sede: ${selectedLocationData?.name ?? '-'}`, 25, 105);
      doc.text(`Dirección: ${selectedLocationData?.address ?? '-'}`, 25, 115);
      doc.text(`Tiempo estimado: ${selectedLocationData?.deliveryTime || '—'}`, 25, 125);

      doc.text('PRODUCTOS SOLICITADOS:', 20, 145);
      let yPos = 155;
      items.forEach((item, index) => {
        doc.text(`${index + 1}. ${item.product.name}`, 25, yPos);
        doc.text(
          `   Cantidad: ${item.quantity} | Precio: S/ ${item.finalPrice.toFixed(2)}`,
          25,
          yPos + 10
        );
        yPos += 20;
      });

      doc.setFont('helvetica', 'bold');
      doc.text(`TOTAL: S/ ${finalTotal.toFixed(2)}`, 20, yPos + 20);

      if (customerObservations) {
        doc.setFont('helvetica', 'normal');
        doc.text('OBSERVACIONES:', 20, yPos + 40);
        const splitText = doc.splitTextToSize(customerObservations, 170);
        doc.text(splitText, 25, yPos + 50);
      }

      doc.setFontSize(10);
      doc.text('IMPORTANTE: Este pedido será confirmado en las próximas 2 horas.', 20, 270);
      doc.text('Para consultas: WhatsApp 999-888-777', 20, 280);

      doc.save(`Pedido-${orderNumber}.pdf`);
    });
  };

  const handleBackToShopping = () => {
    clearCart();
    onClose();
    toast({
      title: 'Nuevo pedido disponible',
      description: 'Puedes iniciar un nuevo pedido mayorista',
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
              <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h2 className="text-xl font-bold text-stone-800">
              {step === 'delivery' && 'Configurar Entrega'}
              {step === 'confirmation' && 'Confirmar Pedido'}
              {step === 'confirmed' && 'Pedido Confirmado'}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${step === 'delivery' ? 'bg-blue-500' : 'bg-green-500'}`} />
            <div
              className={`w-3 h-3 rounded-full ${
                step === 'confirmation' ? 'bg-blue-500' : step === 'confirmed' ? 'bg-green-500' : 'bg-stone-300'
              }`}
            />
            <div className={`w-3 h-3 rounded-full ${step === 'confirmed' ? 'bg-green-500' : 'bg-stone-300'}`} />
          </div>
        </div>

        <div className="p-6">
          {/* Paso 1 */}
          {step === 'delivery' && (
            <div className="space-y-6">
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

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-blue-500" />
                    Seleccionar Sede de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Label>Sede disponible para tu zona:</Label>
                  <Select
                    value={selectedLocation}
                    onValueChange={setSelectedLocation}
                    disabled={locations.length === 0}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={locations.length ? 'Selecciona una sede…' : 'No hay sedes configuradas'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((location) => (
                        <SelectItem key={location.id} value={location.id}>
                          <div className="flex flex-col">
                            <span className="font-medium">
                              {location.name}
                              {defaultSiteId && defaultSiteId === location.id ? ' • Predeterminada' : ''}
                            </span>
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
                          Tiempo estimado: {selectedLocationData.deliveryTime || 'Según programación'}
                        </span>
                      </div>
                      <p className="text-sm text-blue-700">
                        📍 {selectedLocationData.address}
                        {selectedLocationData.zone ? ` • ${selectedLocationData.zone}` : ''}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-blue-500" />
                    Observaciones Adicionales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="observations">Comentarios especiales para tu pedido (opcional):</Label>
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

              <Button
                onClick={handleConfirmDelivery}
                disabled={!selectedLocation}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3"
              >
                Continuar a Confirmación
              </Button>
            </div>
          )}

          {/* Paso 2 */}
          {step === 'confirmation' && (
            <div className="space-y-6">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-amber-800 mb-1">Importante: Plazo de confirmación</h3>
                    <p className="text-sm text-amber-700">
                      Tienes <strong>24 horas</strong> para confirmar este pedido. Después de este tiempo, deberás
                      generar un nuevo pedido.
                    </p>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Resumen Final del Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium text-stone-800 mb-2">📍 Entrega</h4>
                      <p className="text-sm text-stone-600">{selectedLocationData?.name}</p>
                      <p className="text-xs text-stone-500">{selectedLocationData?.address}</p>
                      <p className="text-xs text-blue-600 mt-1">
                        ⏱️ {selectedLocationData?.deliveryTime || '—'}
                      </p>
                    </div>
                    <div>
                      <h4 className="font-medium text-stone-800 mb-2">💰 Total</h4>
                      <p className="text-lg font-bold text-stone-800">S/ {finalTotal.toFixed(2)}</p>
                      <p className="text-sm text-green-600">{itemCount} productos</p>
                    </div>
                  </div>

                  {customerObservations && (
                    <div>
                      <h4 className="font-medium text-stone-800 mb-2">💬 Observaciones</h4>
                      <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg">{customerObservations}</p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-stone-800 mb-2">📦 Productos</h4>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {items.map((item) => (
                        <div key={item.product.id} className="flex justify-between text-sm">
                          <span>
                            {item.product.name} x {item.quantity}
                          </span>
                          <span className="font-medium">S/ {item.finalPrice.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep('delivery')} className="flex-1">
                  Volver a Entrega
                </Button>
                <Button onClick={handleConfirmOrder} className="flex-1 bg-green-500 hover:bg-green-600 text-white">
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar Pedido
                </Button>
              </div>
            </div>
          )}

          {/* Paso 3 */}
          {step === 'confirmed' && (
            <div className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Check className="h-10 w-10 text-green-600" />
              </div>

              <div>
                <h3 className="text-2xl font-bold text-green-600 mb-2">¡Pedido Confirmado!</h3>
                <p className="text-stone-600">Tu pedido mayorista ha sido registrado exitosamente</p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-stone-600 mb-1">Número de Orden:</p>
                    <p className="text-3xl font-bold text-blue-600 mb-4">{orderNumber}</p>

                    <div className="grid md:grid-cols-2 gap-4 text-left">
                      <div>
                        <p className="text-sm font-medium text-stone-800">📍 Entrega en:</p>
                        <p className="text-sm text-stone-600">{selectedLocationData?.name}</p>
                        <p className="text-xs text-stone-500">{selectedLocationData?.deliveryTime || '—'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-stone-800">💰 Total pagado:</p>
                        <p className="text-lg font-bold text-stone-800">S/ {finalTotal.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>⏰ Confirmación pendiente:</strong> Tu pedido será confirmado por nuestro equipo dentro de las
                  próximas <strong>2 horas</strong>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleDownloadPDF} variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Descargar PDF
                </Button>
                <Button onClick={handleBackToShopping} className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
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
