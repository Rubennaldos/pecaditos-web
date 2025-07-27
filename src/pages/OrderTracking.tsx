import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Search, Download, RotateCcw, MessageCircle, CheckCircle, Clock, Truck, Package, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

// Importa tu instancia de firebase
import { database } from '@/firebase';
import { ref, get, child } from 'firebase/database';

interface OrderStatus {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  current: boolean;
}

interface OrderDetails {
  orderNumber: string;
  items: Array<{
    name: string;
    quantity: number;
  }>;
  deliveryAddress: string;
  customerName: string;
  total: number;
  status: string;
  observations?: string;
  createdAt: string;
}

const OrderTracking = () => {
  const { orderId } = useParams();
  const [orderNumber, setOrderNumber] = useState(orderId || '');
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  // Búsqueda automática si hay orderId en URL
  useEffect(() => {
    if (orderId) {
      handleSearch();
    }
    // eslint-disable-next-line
  }, [orderId]);

  const getOrderStatuses = (currentStatus: string): OrderStatus[] => {
    const allStatuses = [
      {
        id: 'recibido',
        name: 'Recibido',
        description: 'Tu pedido ha sido recibido y está en cola de preparación',
        icon: CheckCircle,
        completed: true,
        current: false
      },
      {
        id: 'en_preparacion',
        name: 'En Preparación',
        description: 'Estamos preparando tus galletas con mucho cariño',
        icon: Package,
        completed: ['en_preparacion', 'listo_envio', 'en_reparto', 'entregado', 'observado'].includes(currentStatus),
        current: currentStatus === 'en_preparacion'
      },
      {
        id: 'listo_envio',
        name: 'Listo para Envío',
        description: 'Tu pedido está listo y será enviado pronto',
        icon: Clock,
        completed: ['listo_envio', 'en_reparto', 'entregado'].includes(currentStatus),
        current: currentStatus === 'listo_envio'
      },
      {
        id: 'en_reparto',
        name: 'En Reparto',
        description: 'Tu pedido está en camino hacia tu dirección',
        icon: Truck,
        completed: ['en_reparto', 'entregado'].includes(currentStatus),
        current: currentStatus === 'en_reparto'
      },
      {
        id: 'entregado',
        name: 'Entregado',
        description: '¡Tu pedido ha sido entregado exitosamente!',
        icon: CheckCircle,
        completed: currentStatus === 'entregado',
        current: currentStatus === 'entregado'
      }
    ];
    if (currentStatus === 'observado') {
      allStatuses.push({
        id: 'observado',
        name: 'Observado',
        description: 'Hay una observación importante sobre tu pedido',
        icon: AlertCircle,
        completed: false,
        current: true
      });
    }
    return allStatuses;
  };

  // CONSULTA A FIREBASE RTDB POR orderNumber
  const handleSearch = async () => {
    if (!orderNumber.trim()) {
      toast({
        title: "Error",
        description: "Por favor ingresa un número de pedido",
        variant: "destructive"
      });
      return;
    }
    setIsLoading(true);
    setNotFound(false);
    setOrderDetails(null);

    try {
      // Accede a la rama 'orders'
      const ordersRef = ref(database, 'orders');
      const snapshot = await get(ordersRef);

      let foundOrder: any = null;
      if (snapshot.exists()) {
        const ordersObj = snapshot.val();
        // Busca el pedido por orderNumber (case insensitive)
        for (const key in ordersObj) {
          if (
            ordersObj[key]?.orderNumber &&
            ordersObj[key].orderNumber.trim().toLowerCase() === orderNumber.trim().toLowerCase()
          ) {
            foundOrder = ordersObj[key];
            break;
          }
        }
      }

      if (foundOrder) {
        setOrderDetails(foundOrder);
        toast({
          title: "Pedido encontrado",
          description: `Estado actual: ${foundOrder.status?.replace('_', ' ')}`
        });
      } else {
        setNotFound(true);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Hubo un problema al buscar tu pedido",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPDF = () => {
    // Aquí iría tu lógica real
    toast({
      title: "Descarga iniciada",
      description: "Tu orden de pedido se está descargando"
    });
  };

  const handleRepeatOrder = () => {
    toast({
      title: "Redirigiendo",
      description: "Te llevaremos al catálogo para repetir tu pedido"
    });
    // window.location.href = '/catalogo?repeat=' + orderDetails?.orderNumber;
  };

  const handleContactSupport = () => {
    const message = encodeURIComponent(`Hola, necesito ayuda con mi pedido ${orderNumber}`);
    const whatsappUrl = `https://wa.me/51999888777?text=${message}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sand-50 to-sand-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-primary-dark rounded-full flex items-center justify-center mr-3">
              <span className="text-primary-foreground font-bold text-lg">P</span>
            </div>
            <h1 className="text-3xl font-bold text-brown-900">Seguimiento de Pedido</h1>
          </div>
          <p className="text-brown-700 max-w-2xl mx-auto">
            Ingresa tu número de pedido para conocer el estado actual de tu orden
          </p>
        </div>

        {/* Búsqueda */}
        <Card className="mb-8 border-sand-200 bg-white/80">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brown-900">
              <Search className="h-5 w-5" />
              Buscar Pedido
            </CardTitle>
            <CardDescription className="text-brown-700">
              {orderId ?
                `Buscando información del pedido: ${orderId}` :
                'Ingresa el número de pedido que recibiste al confirmar tu compra'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <Input
                  type="text"
                  placeholder="Ej: PEC-2024-001, PEC-2024-002..."
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  className="h-12 border-sand-300 bg-white focus:border-primary"
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={isLoading}
                className="h-12 px-8 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? 'Buscando...' : 'Buscar'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pedido no encontrado */}
        {notFound && (
          <Card className="border-red-200 bg-red-50/80">
            <CardContent className="pt-6">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Pedido no encontrado
                </h3>
                <p className="text-red-600 mb-4">
                  No encontramos ningún pedido con el número ingresado.
                  Verifica que esté correctamente escrito.
                </p>
                <Button onClick={handleContactSupport} variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Contactar Soporte
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Detalles del pedido */}
        {orderDetails && (
          <div className="space-y-6">
            {/* Información general */}
            <Card className="border-sand-200 bg-white/80">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-brown-900">Pedido {orderDetails.orderNumber}</CardTitle>
                    <CardDescription className="text-brown-700">
                      Realizado el {new Date(orderDetails.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-sm border-primary/20 text-primary">
                    Total: S/ {orderDetails.total}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-brown-900 mb-2">Productos:</h4>
                    <div className="space-y-2">
                      {orderDetails.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-brown-700">
                          <span>{item.name}</span>
                          <span className="font-medium">x{item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-semibold text-brown-900 mb-2">Entrega:</h4>
                    <p className="text-sm text-brown-700">{orderDetails.deliveryAddress}</p>
                    <p className="text-sm text-brown-700 mt-1">Cliente: {orderDetails.customerName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Estado del pedido */}
            <Card className="border-sand-200 bg-white/80">
              <CardHeader>
                <CardTitle className="text-brown-900">Estado del Pedido</CardTitle>
                <CardDescription className="text-brown-700">
                  Sigue el progreso de tu pedido en tiempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {getOrderStatuses(orderDetails.status).map((status, index) => {
                    const Icon = status.icon;
                    return (
                      <div key={status.id} className="flex items-start gap-4">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                          status.completed
                            ? 'bg-green-100 border-green-500 text-green-600'
                            : status.current
                              ? 'bg-primary/10 border-primary text-primary'
                              : 'bg-sand-100 border-sand-300 text-sand-500'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className={`font-semibold ${
                              status.completed || status.current ? 'text-brown-900' : 'text-sand-500'
                            }`}>
                              {status.name}
                            </h4>
                            {status.current && (
                              <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                                Actual
                              </Badge>
                            )}
                          </div>
                          <p className={`text-sm ${
                            status.completed || status.current ? 'text-brown-700' : 'text-sand-500'
                          }`}>
                            {status.description}
                          </p>
                        </div>
                        {index < getOrderStatuses(orderDetails.status).length - 1 && (
                          <div className={`absolute left-9 mt-10 w-0.5 h-6 ${
                            status.completed ? 'bg-green-300' : 'bg-sand-200'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Observaciones */}
                {orderDetails.observations && (
                  <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-amber-800 mb-1">Observación:</h4>
                        <p className="text-sm text-amber-700">{orderDetails.observations}</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Acciones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button onClick={handleDownloadPDF} variant="outline" className="h-12 border-sand-300 text-brown-700 hover:bg-sand-50">
                <Download className="h-4 w-4 mr-2" />
                Descargar Orden
              </Button>
              <Button onClick={handleRepeatOrder} className="h-12 bg-green-600 hover:bg-green-700 text-white">
                <RotateCcw className="h-4 w-4 mr-2" />
                Repetir Pedido
              </Button>
              <Button onClick={handleContactSupport} variant="outline" className="h-12 border-sand-300 text-brown-700 hover:bg-sand-50">
                <MessageCircle className="h-4 w-4 mr-2" />
                Contactar Soporte
              </Button>
            </div>
          </div>
        )}

        {/* Información adicional */}
        <Card className="mt-8 bg-blue-50/80 border-blue-200">
          <CardContent className="pt-6">
            <div className="text-center">
              <h3 className="font-semibold text-blue-800 mb-2">¿Necesitas ayuda?</h3>
              <p className="text-blue-600 text-sm mb-4">
                Nuestro equipo de soporte está disponible para ayudarte con cualquier consulta
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleContactSupport} size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  WhatsApp: +51 999 888 777
                </Button>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                  Email: soporte@pecaditos.com
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OrderTracking;
