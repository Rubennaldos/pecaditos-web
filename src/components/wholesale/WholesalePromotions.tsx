import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gift, Calendar, Percent, Check } from 'lucide-react';

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  isActive: boolean;
  used: boolean;
  type: 'percentage' | 'fixed' | 'free-shipping';
}

interface WholesalePromotionsProps {
  isOpen: boolean;
  onClose: () => void;
}

const mockPromotions: Promotion[] = [
  {
    id: 'PROMO-001',
    title: 'Descuento por Volumen',
    description: '25% de descuento en pedidos mayores a 24 unidades',
    discount: 25,
    validUntil: '2024-02-28',
    isActive: true,
    used: false,
    type: 'percentage'
  },
  {
    id: 'PROMO-002',
    title: 'Envío Gratis Premium',
    description: 'Envío gratuito en pedidos superiores a S/ 500',
    discount: 0,
    validUntil: '2024-03-15',
    isActive: true,
    used: true,
    type: 'free-shipping'
  },
  {
    id: 'PROMO-003',
    title: 'Cliente Frecuente',
    description: '15% de descuento adicional por fidelidad',
    discount: 15,
    validUntil: '2024-12-31',
    isActive: true,
    used: false,
    type: 'percentage'
  }
];

export const WholesalePromotions = ({ isOpen, onClose }: WholesalePromotionsProps) => {
  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'percentage': return <Percent className="h-4 w-4" />;
      case 'free-shipping': return <Gift className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-blue-600" />
            Promociones y Descuentos Disponibles
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {mockPromotions.map((promo) => (
            <div key={promo.id} className="border border-stone-200 rounded-lg p-4 bg-stone-50">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  {getPromotionIcon(promo.type)}
                  <h3 className="font-semibold text-stone-800">{promo.title}</h3>
                  {promo.used && (
                    <Badge className="bg-green-100 text-green-800">
                      <Check className="h-3 w-3 mr-1" />
                      Utilizada
                    </Badge>
                  )}
                </div>
                {promo.isActive && !promo.used && (
                  <Badge className="bg-blue-100 text-blue-800">
                    Activa
                  </Badge>
                )}
              </div>

              <p className="text-stone-600 mb-3">{promo.description}</p>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4 text-sm text-stone-500">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Válida hasta: {promo.validUntil}
                  </span>
                  {promo.discount > 0 && (
                    <span className="font-bold text-green-600">
                      {promo.discount}% OFF
                    </span>
                  )}
                </div>
                
                {promo.isActive && !promo.used && (
                  <Button size="sm" variant="outline">
                    Aplicar Promoción
                  </Button>
                )}
              </div>
            </div>
          ))}

          <div className="border-2 border-dashed border-stone-300 rounded-lg p-6 text-center">
            <Gift className="h-8 w-8 text-stone-400 mx-auto mb-2" />
            <h3 className="font-medium text-stone-600 mb-1">¡Próximamente más promociones!</h3>
            <p className="text-sm text-stone-500">
              Mantente atento a nuevos descuentos y ofertas especiales para mayoristas.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};