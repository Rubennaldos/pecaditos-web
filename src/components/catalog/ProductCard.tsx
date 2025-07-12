
import { useState } from 'react';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product, discountRules } from '@/data/mockData';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/components/ui/use-toast';

/**
 * TARJETA DE PRODUCTO
 * 
 * Card individual para cada producto con:
 * - Imagen del producto
 * - Nombre y descripción
 * - Precio unitario
 * - Selector de cantidad
 * - Descuentos automáticos
 * - Botón agregar al carrito
 * 
 * PARA PERSONALIZAR:
 * - Modificar diseño de la card
 * - Cambiar colores de promoción
 * - Agregar más información del producto
 */

interface ProductCardProps {
  product: Product;
  isPromoted?: boolean;
}

export const ProductCard = ({ product, isPromoted = false }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  // Calcular precio con descuento por cantidad
  const getDiscountedPrice = (qty: number) => {
    const basePrice = product.price * qty;
    
    if (qty >= discountRules.quantity12.minQuantity) {
      const discount = basePrice * discountRules.quantity12.discount;
      return { 
        originalPrice: basePrice, 
        discountedPrice: basePrice - discount, 
        discountPercent: discountRules.quantity12.discount * 100 
      };
    } else if (qty >= discountRules.quantity6.minQuantity) {
      const discount = basePrice * discountRules.quantity6.discount;
      return { 
        originalPrice: basePrice, 
        discountedPrice: basePrice - discount, 
        discountPercent: discountRules.quantity6.discount * 100 
      };
    }
    
    return { 
      originalPrice: basePrice, 
      discountedPrice: basePrice, 
      discountPercent: 0 
    };
  };

  const priceInfo = getDiscountedPrice(quantity);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Producto agregado",
      description: `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} de ${product.name} agregado${quantity === 1 ? '' : 's'} al carrito`,
    });
    setQuantity(1); // Reset quantity after adding
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <Card className={`
      group overflow-hidden transition-all duration-300 hover:shadow-xl
      ${isPromoted ? 'ring-2 ring-amber-300 shadow-lg' : 'hover:shadow-lg'}
      ${!product.available ? 'opacity-60' : ''}
    `}>
      <CardContent className="p-0">
        {/* Imagen del producto */}
        <div className="relative overflow-hidden bg-stone-100 aspect-square">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              // Placeholder si la imagen no carga
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Badge de no disponible */}
          {!product.available && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <span className="text-white font-semibold bg-red-500 px-3 py-1 rounded-full">
                No disponible
              </span>
            </div>
          )}

          {/* Badge de promoción */}
          {isPromoted && (
            <div className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
              OFERTA
            </div>
          )}
        </div>

        {/* Información del producto */}
        <div className="p-4">
          <h3 className="font-semibold text-stone-800 mb-2 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-sm text-stone-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Ingredientes */}
          <div className="mb-4">
            <p className="text-xs text-stone-500 mb-1">Ingredientes principales:</p>
            <div className="flex flex-wrap gap-1">
              {product.ingredients.slice(0, 3).map((ingredient, index) => (
                <span key={index} className="text-xs bg-stone-100 text-stone-600 px-2 py-1 rounded-full">
                  {ingredient}
                </span>
              ))}
              {product.ingredients.length > 3 && (
                <span className="text-xs text-stone-400">+{product.ingredients.length - 3} más</span>
              )}
            </div>
          </div>

          {/* Precio */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-stone-800">
                S/ {priceInfo.discountedPrice.toFixed(2)}
              </span>
              {priceInfo.discountPercent > 0 && (
                <>
                  <span className="text-sm text-stone-500 line-through">
                    S/ {priceInfo.originalPrice.toFixed(2)}
                  </span>
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-semibold">
                    -{priceInfo.discountPercent}%
                  </span>
                </>
              )}
            </div>
            <p className="text-xs text-stone-500 mt-1">
              Precio unitario: S/ {product.price.toFixed(2)}
            </p>
          </div>

          {/* Selector de cantidad */}
          {product.available && (
            <div className="mb-4">
              <label className="text-sm font-medium text-stone-700 mb-2 block">
                Cantidad:
              </label>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={decreaseQuantity}
                  disabled={quantity <= 1}
                  className="h-8 w-8 p-0"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                
                <span className="font-semibold text-lg min-w-[2rem] text-center">
                  {quantity}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={increaseQuantity}
                  className="h-8 w-8 p-0"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>

              {/* Mensaje de descuento próximo */}
              {quantity < discountRules.quantity6.minQuantity && (
                <p className="text-xs text-amber-600 mt-2">
                  Agrega {discountRules.quantity6.minQuantity - quantity} más para obtener 5% de descuento
                </p>
              )}
              {quantity >= discountRules.quantity6.minQuantity && quantity < discountRules.quantity12.minQuantity && (
                <p className="text-xs text-amber-600 mt-2">
                  Agrega {discountRules.quantity12.minQuantity - quantity} más para obtener 10% de descuento
                </p>
              )}
            </div>
          )}

          {/* Botón agregar al carrito */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.available}
            className={`
              w-full font-semibold transition-all duration-200
              ${isPromoted 
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600' 
                : 'bg-amber-500 hover:bg-amber-600'
              }
              text-white
            `}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {product.available ? 'Agregar al carrito' : 'No disponible'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
