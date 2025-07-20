
import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Bookmark, BookmarkCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product } from '@/data/mockData';
import { useWholesaleCart } from '@/contexts/WholesaleCartContext';
import { toast } from '@/components/ui/use-toast';

/**
 * TARJETA DE PRODUCTO MAYORISTA
 * 
 * Card específica para mayoristas con:
 * - Cantidades solo en múltiplos de 6
 * - Precios mayoristas
 * - Botón guardar como frecuente
 * - Descuentos por volumen
 * 
 * PARA PERSONALIZAR:
 * - Modificar múltiplos permitidos
 * - Cambiar estructura de descuentos
 * - Personalizar estilos
 */

interface WholesaleProductCardProps {
  product: Product;
}

export const WholesaleProductCard = ({ product }: WholesaleProductCardProps) => {
  const [quantity, setQuantity] = useState(6); // Mínimo 6 para mayoristas
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useWholesaleCart();

  // Precios mayoristas (20% menos que precio minorista)
  const wholesaleBasePrice = product.price * 0.8;

  // Calcular descuentos mayoristas
  const getWholesalePrice = (qty: number) => {
    const baseTotal = wholesaleBasePrice * qty;
    
    // Descuentos por volumen mayorista
    if (qty >= 24) { // 4 docenas o más: 25% descuento
      const discount = baseTotal * 0.25;
      return {
        originalPrice: baseTotal,
        discountedPrice: baseTotal - discount,
        discountPercent: 25,
        savings: discount
      };
    } else if (qty >= 12) { // 2 docenas o más: 15% descuento
      const discount = baseTotal * 0.15;
      return {
        originalPrice: baseTotal,
        discountedPrice: baseTotal - discount,
        discountPercent: 15,
        savings: discount
      };
    } else if (qty >= 6) { // 1 docena o más: 10% descuento
      const discount = baseTotal * 0.10;
      return {
        originalPrice: baseTotal,
        discountedPrice: baseTotal - discount,
        discountPercent: 10,
        savings: discount
      };
    }
    
    return {
      originalPrice: baseTotal,
      discountedPrice: baseTotal,
      discountPercent: 0,
      savings: 0
    };
  };

  const priceInfo = getWholesalePrice(quantity);

  const handleAddToCart = () => {
    addItem(product, quantity);
    toast({
      title: "Producto agregado",
      description: `${quantity} unidades de ${product.name} agregadas al carrito mayorista`,
    });
  };

  const increaseQuantity = () => {
    setQuantity(prev => prev + 6); // Incrementar de 6 en 6
  };

  const decreaseQuantity = () => {
    setQuantity(prev => Math.max(6, prev - 6)); // Mínimo 6, decrementar de 6 en 6
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    toast({
      title: isFavorite ? "Eliminado de frecuentes" : "Agregado a frecuentes",
      description: isFavorite 
        ? `${product.name} eliminado de tus productos frecuentes`
        : `${product.name} guardado como producto frecuente`,
    });
  };

  const getNextDiscountMessage = () => {
    if (quantity < 12) {
      return `Agrega ${12 - quantity} más unidades para obtener 15% de descuento`;
    } else if (quantity < 24) {
      return `Agrega ${24 - quantity} más unidades para obtener 25% de descuento`;
    }
    return null;
  };

  return (
    <Card className="group overflow-hidden transition-all duration-300 hover:shadow-xl border-2 hover:border-blue-200 w-full max-w-sm mx-auto">
      <CardContent className="p-0">
        {/* Imagen del producto - formato cuadrado */}
        <div className="relative overflow-hidden bg-stone-100 aspect-square w-full">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          {/* Badge Mayorista */}
          <div className="absolute top-3 left-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-md">
            MAYORISTA
          </div>

          {/* Botón favorito */}
          <button
            onClick={toggleFavorite}
            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow-md hover:bg-white transition-colors"
          >
            {isFavorite ? (
              <BookmarkCheck className="h-4 w-4 text-amber-500" />
            ) : (
              <Bookmark className="h-4 w-4 text-stone-400" />
            )}
          </button>
        </div>

        {/* Información del producto */}
        <div className="p-4">
          <h3 className="font-semibold text-stone-800 mb-2 group-hover:text-amber-600 transition-colors">
            {product.name}
          </h3>
          
          <p className="text-sm text-stone-600 mb-3 line-clamp-2">
            {product.description}
          </p>

          {/* Precios mayoristas */}
          <div className="mb-4">
            <div className="flex items-baseline gap-2 mb-1">
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
            <div className="text-xs text-stone-500 space-y-1">
              <p>Precio mayorista unitario: S/ {wholesaleBasePrice.toFixed(2)}</p>
              <p>Precio minorista: S/ {product.price.toFixed(2)}</p>
              {priceInfo.savings > 0 && (
                <p className="text-green-600 font-medium">
                  Ahorras: S/ {priceInfo.savings.toFixed(2)}
                </p>
              )}
            </div>
          </div>

          {/* Selector de cantidad (múltiplos de 6) */}
          <div className="mb-4">
            <label className="text-sm font-medium text-stone-700 mb-2 block">
              Cantidad (múltiplos de 6):
            </label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseQuantity}
                disabled={quantity <= 6}
                className="h-8 w-8 p-0"
              >
                <Minus className="h-3 w-3" />
              </Button>
              
              <div className="text-center">
                <span className="font-semibold text-lg">{quantity}</span>
                <p className="text-xs text-stone-500">
                  {Math.floor(quantity / 6)} docena{Math.floor(quantity / 6) !== 1 ? 's' : ''}
                </p>
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={increaseQuantity}
                className="h-8 w-8 p-0"
              >
                <Plus className="h-3 w-3" />
              </Button>
            </div>

            {/* Mensaje próximo descuento */}
            {getNextDiscountMessage() && (
              <p className="text-xs text-amber-600 mt-2 font-medium">
                💡 {getNextDiscountMessage()}
              </p>
            )}
          </div>

          {/* Información de descuentos */}
          <div className="mb-4 text-xs text-stone-600 bg-stone-50 rounded-lg p-2">
            <p className="font-medium mb-1">Descuentos por volumen:</p>
            <ul className="space-y-1">
              <li className={quantity >= 6 ? 'text-green-600 font-medium' : ''}>
                • 6-11 unidades: 10% descuento
              </li>
              <li className={quantity >= 12 && quantity < 24 ? 'text-green-600 font-medium' : ''}>
                • 12-23 unidades: 15% descuento
              </li>
              <li className={quantity >= 24 ? 'text-green-600 font-medium' : ''}>
                • 24+ unidades: 25% descuento
              </li>
            </ul>
          </div>

          {/* Botón agregar al carrito */}
          <Button
            onClick={handleAddToCart}
            className="w-full font-semibold bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Agregar al Carrito
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
