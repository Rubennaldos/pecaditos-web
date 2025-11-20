import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Product } from '@/data/mockData';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductDetailModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductDetailModal = ({ product, isOpen, onClose }: ProductDetailModalProps) => {
  if (!product) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-stone-800 pr-8">
            {product.name}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 mt-4">
          {/* Imagen del producto */}
          <div className="relative overflow-hidden bg-stone-100 rounded-lg aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            {!product.available && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive" className="text-lg px-4 py-2">
                  No disponible
                </Badge>
              </div>
            )}
          </div>

          {/* Información detallada */}
          <div className="space-y-4">
            {/* Estado */}
            <div>
              <Badge variant={product.available ? 'default' : 'secondary'}>
                {product.available ? 'Disponible' : 'No disponible'}
              </Badge>
            </div>

            {/* Categoría */}
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-1">Categoría</h3>
              <p className="text-stone-600 capitalize">{product.category}</p>
            </div>

            {/* Descripción completa */}
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Descripción</h3>
              <p className="text-stone-600 whitespace-pre-line leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Ingredientes */}
            <div>
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Ingredientes</h3>
              <div className="flex flex-wrap gap-2">
                {product.ingredients.map((ingredient, index) => (
                  <span
                    key={index}
                    className="text-xs bg-amber-50 text-amber-700 px-3 py-1.5 rounded-full border border-amber-200"
                  >
                    {ingredient}
                  </span>
                ))}
              </div>
            </div>

            {/* Precio */}
            <div className="pt-4 border-t">
              <h3 className="text-sm font-semibold text-stone-700 mb-2">Precio</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-stone-800">
                  S/ {product.price.toFixed(2)}
                </span>
                <span className="text-sm text-stone-500">por unidad</span>
              </div>
              <p className="text-xs text-stone-500 mt-2">
                * Descuentos disponibles por cantidad (6+ unidades: 5% | 12+ unidades: 10%)
              </p>
            </div>
          </div>
        </div>

        {/* Información adicional */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="text-sm font-semibold text-blue-800 mb-2">💡 Información importante</h3>
          <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
            <li>Descuentos automáticos al agregar más unidades</li>
            <li>Productos artesanales elaborados con ingredientes naturales</li>
            <li>Envíos disponibles a todo Lima Metropolitana</li>
          </ul>
        </div>
      </DialogContent>
    </Dialog>
  );
};
