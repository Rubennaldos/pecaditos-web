import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Product } from '@/data/mockData';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';
import { toast } from '@/components/ui/use-toast';

interface WholesaleProductCardProps {
  product: Product;
}

export const WholesaleProductCard = ({ product }: WholesaleProductCardProps) => {
  const [quantity, setQuantity] = useState(0);
  const { addItem, updateQuantity, removeItem, items } = useWholesaleCart();

  const updateProductQuantity = (newQuantity: number) => {
    // Asegurar que las cantidades sean múltiplos de 6
    const validQuantity = Math.max(0, Math.floor(newQuantity / 6) * 6);
    
    if (newQuantity > 0 && newQuantity !== validQuantity) {
      toast({
        title: "Cantidad ajustada",
        description: "Las cantidades mayoristas deben ser múltiplos de 6 unidades",
        variant: "default"
      });
    }
    
    setQuantity(validQuantity);
    
    // Verificar si el producto ya existe en el carrito
    const existingItem = items.find(item => item.product.id === product.id);
    
    try {
      if (validQuantity > 0) {
        if (existingItem) {
          // Producto existe, actualizar cantidad
          updateQuantity(product.id, validQuantity);
        } else {
          // Producto no existe, agregarlo
          addItem(product, validQuantity);
        }
      } else {
        // Cantidad es 0, remover del carrito
        if (existingItem) {
          removeItem(product.id);
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Error al gestionar el producto",
        variant: "destructive"
      });
    }
  };

  // Calcular descuento por cantidad
  const calculateDiscount = (qty: number) => {
    if (qty >= 50) return 0.15; // 15% descuento
    if (qty >= 20) return 0.10; // 10% descuento
    if (qty >= 10) return 0.05; // 5% descuento
    return 0;
  };

  const discount = calculateDiscount(quantity);
  const wholesalePrice = product.wholesalePrice || product.price * 0.8;
  const discountedPrice = wholesalePrice * (1 - discount);

  return (
    <Card className="w-full max-w-xs bg-white border shadow-sm hover:shadow-md transition-all duration-200 mx-auto aspect-square">
      <div className="h-48 relative overflow-hidden rounded-t-lg">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4 flex-1 flex flex-col">
        <h3 className="font-semibold text-gray-900 mb-2 text-center line-clamp-2">{product.name}</h3>
        
        {/* Precio unitario y descripción */}
        <div className="text-center mb-3">
          <p className="text-sm text-gray-600 mb-1">Precio unitario: S/ 6.00</p>
          <p className="text-xs text-gray-500 mb-2">Deliciosas galletas de avena artesanales</p>
          <div className="text-center">
            <p className="text-xl font-bold text-amber-600">
              S/ {(product.wholesalePrice || product.price * 0.8).toFixed(2)}
            </p>
          </div>
        </div>
        
        <div className="space-y-3 mt-auto">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateProductQuantity(Math.max(0, quantity - 6))}
              disabled={quantity <= 0}
              className="h-8 w-8 p-0"
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input
              type="number"
              value={quantity}
              onChange={(e) => updateProductQuantity(Math.max(0, parseInt(e.target.value) || 0))}
              className="flex-1 text-center h-8"
              min="0"
              step="6"
              placeholder="Múltiplos de 6"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateProductQuantity(quantity + 6)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
          <p className="text-xs text-stone-500 text-center">
            Cantidades en múltiplos de 6 unidades
          </p>
          
          {quantity > 0 && (
            <div className="bg-amber-50 p-2 rounded-lg text-center">
              {discount > 0 && (
                <p className="text-xs text-green-600 mb-1">
                  {(discount * 100).toFixed(0)}% descuento aplicado
                </p>
              )}
              <p className="text-sm font-medium text-amber-800">
                {discount > 0 ? (
                  <>
                    <span className="line-through text-gray-500">
                      S/ {(wholesalePrice * quantity).toFixed(2)}
                    </span>
                    {' '}
                    <span className="text-green-600">
                      S/ {(discountedPrice * quantity).toFixed(2)}
                    </span>
                  </>
                ) : (
                  `Subtotal: S/ ${(wholesalePrice * quantity).toFixed(2)}`
                )}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};