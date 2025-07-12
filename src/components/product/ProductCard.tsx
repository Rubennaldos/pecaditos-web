
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Minus, Plus, ShoppingCart } from 'lucide-react';
import { Product, discountRules } from '@/data/mockData';
import { useCart } from '@/contexts/CartContext';

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export const ProductCard = ({ product, featured = false }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  // Calcular precio con descuento
  const calculateDiscountedPrice = (qty: number, unitPrice: number) => {
    let discount = 0;
    if (qty >= discountRules.quantity12.minQuantity) {
      discount = discountRules.quantity12.discount;
    } else if (qty >= discountRules.quantity6.minQuantity) {
      discount = discountRules.quantity6.discount;
    }
    
    const originalTotal = qty * unitPrice;
    const discountAmount = originalTotal * discount;
    const finalPrice = originalTotal - discountAmount;
    
    return {
      originalTotal,
      discountAmount,
      finalPrice,
      discountPercentage: discount * 100
    };
  };

  const priceInfo = calculateDiscountedPrice(quantity, product.price);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setQuantity(1); // Reset quantity after adding
  };

  const incrementQuantity = () => setQuantity(prev => prev + 1);
  const decrementQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <Card className={`
      group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 
      ${featured ? 'border-amber-200 dark:border-amber-800 shadow-lg' : ''}
      ${!product.available ? 'opacity-50' : ''}
    `}>
      <CardContent className="p-0">
        {/* Imagen del producto */}
        <div className="relative aspect-square overflow-hidden rounded-t-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-700">
          <div className="absolute inset-0 flex items-center justify-center text-6xl">
            🍪
          </div>
          
          {/* Badges */}
          <div className="absolute top-2 right-2 flex flex-col space-y-1">
            {product.featured && (
              <Badge className="bg-amber-500 text-white">Destacado</Badge>
            )}
            {!product.available && (
              <Badge variant="destructive">Agotado</Badge>
            )}
          </div>
        </div>

        {/* Información del producto */}
        <div className="p-4">
          <h3 className="font-semibold text-lg text-foreground mb-2 line-clamp-2">
            {product.name}
          </h3>
          
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Ingredientes */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {product.ingredients.slice(0, 2).map((ingredient, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {ingredient}
                </Badge>
              ))}
              {product.ingredients.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{product.ingredients.length - 2} más
                </Badge>
              )}
            </div>
          </div>

          {/* Precio y controles */}
          <div className="space-y-3">
            {/* Selector de cantidad */}
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Cantidad:</span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={decrementQuantity}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center font-medium">{quantity}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={incrementQuantity}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Información de precio */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Precio unitario:</span>
                <span className="font-medium">S/ {product.price.toFixed(2)}</span>
              </div>
              
              {priceInfo.discountAmount > 0 && (
                <>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span className="line-through text-muted-foreground">
                      S/ {priceInfo.originalTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-green-600 font-medium">
                      Descuento ({priceInfo.discountPercentage}%):
                    </span>
                    <span className="text-green-600 font-medium">
                      -S/ {priceInfo.discountAmount.toFixed(2)}
                    </span>
                  </div>
                </>
              )}
              
              <div className="flex justify-between items-center pt-2 border-t">
                <span className="font-semibold text-foreground">Total:</span>
                <span className="font-bold text-lg text-amber-600">
                  S/ {priceInfo.finalPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Mensaje de descuento */}
            {quantity < discountRules.quantity6.minQuantity && (
              <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                💡 Agrega {discountRules.quantity6.minQuantity - quantity} más para obtener 5% de descuento
              </p>
            )}
            
            {quantity >= discountRules.quantity6.minQuantity && quantity < discountRules.quantity12.minQuantity && (
              <p className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                💡 Agrega {discountRules.quantity12.minQuantity - quantity} más para obtener 10% de descuento
              </p>
            )}

            {/* Botón agregar al carrito */}
            <Button
              className="w-full bg-amber-500 hover:bg-amber-600 text-white"
              onClick={handleAddToCart}
              disabled={!product.available}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {product.available ? 'Agregar al Carrito' : 'No Disponible'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
