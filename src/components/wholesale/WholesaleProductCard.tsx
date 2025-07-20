import { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Product } from '@/data/mockData';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';

interface WholesaleProductCardProps {
  product: Product;
}

export const WholesaleProductCard = ({ product }: WholesaleProductCardProps) => {
  const [quantity, setQuantity] = useState(0);
  const { addItem, updateQuantity } = useWholesaleCart();

  const updateProductQuantity = (newQuantity: number) => {
    setQuantity(newQuantity);
    if (newQuantity > 0) {
      addItem(product, newQuantity);
    } else {
      updateQuantity(product.id, 0);
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
    <Card className="w-full max-w-xs bg-white border shadow-sm hover:shadow-md transition-all duration-200 mx-auto">
      <div className="aspect-square relative overflow-hidden rounded-t-lg">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
        />
      </div>
      <CardContent className="p-4">
        <h3 className="font-semibold text-gray-900 mb-2 text-center line-clamp-2">{product.name}</h3>
        <div className="space-y-3">
          <div className="text-center">
            <p className="text-xl font-bold text-amber-600">
              S/ {(product.wholesalePrice || product.price * 0.8).toFixed(2)}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateProductQuantity(Math.max(0, quantity - 1))}
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
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateProductQuantity(quantity + 1)}
              className="h-8 w-8 p-0"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          
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