
import { useState } from 'react';
import { Plus, Minus, ShoppingCart, Info, Zap, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Product, discountRules } from '@/data/mockData';
import { useCart } from '@/contexts/CartContext';
import { toast } from '@/components/ui/use-toast';
import { ProductDetailModal } from './ProductDetailModal';

/**
 * TARJETA DE PRODUCTO - DISEÑO MODERNO Y MÓVIL
 */

interface ProductCardProps {
  product: Product;
  isPromoted?: boolean;
}

export const ProductCard = ({ product, isPromoted = false }: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const { addItem } = useCart();

  // Calcular precio con descuento
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
      title: "✅ ¡Agregado!",
      description: `${quantity} ${quantity === 1 ? 'unidad' : 'unidades'} en tu carrito`,
      duration: 2000,
    });
    setQuantity(1);
  };

  const increaseQuantity = () => setQuantity(prev => prev + 1);
  const decreaseQuantity = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (!target.closest('button') && !target.closest('input')) {
      setIsDetailModalOpen(true);
    }
  };

  return (
    <>
      <Card 
        className={`
          group overflow-hidden transition-all duration-300 cursor-pointer
          ${isPromoted 
            ? 'ring-2 ring-amber-400 shadow-xl shadow-amber-500/20 hover:shadow-2xl hover:shadow-amber-500/30' 
            : 'hover:shadow-xl hover:shadow-stone-300/50'
          }
          ${!product.available ? 'opacity-60' : ''}
          rounded-3xl border-0
        `}
        onClick={handleCardClick}
        title="Toca para ver más detalles"
      >
        <CardContent className="p-0">
          {/* Imagen del producto */}
          <div className="relative overflow-hidden bg-gradient-to-br from-stone-100 to-stone-50 aspect-square">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
              onError={(e) => {
                e.currentTarget.src = '/placeholder.svg';
              }}
            />
            
            {/* Badges superiores */}
            <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
              {isPromoted && (
                <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-1.5 rounded-full text-xs font-black shadow-lg flex items-center gap-1 animate-pulse">
                  <Zap className="w-3 h-3" />
                  OFERTA
                </div>
              )}
              
              {/* Botón favorito */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsFavorite(!isFavorite);
                }}
                className={`ml-auto w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${
                  isFavorite 
                    ? 'bg-red-500 text-white shadow-lg' 
                    : 'bg-white/80 text-stone-400 hover:text-red-500'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            {/* Badge no disponible */}
            {!product.available && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center">
                <span className="text-white font-bold bg-red-500 px-4 py-2 rounded-full shadow-xl">
                  Agotado
                </span>
              </div>
            )}

            {/* Botón info flotante */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsDetailModalOpen(true);
              }}
              className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-md rounded-full flex items-center justify-center text-amber-600 hover:bg-amber-500 hover:text-white transition-all shadow-lg hover:scale-110"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>

          {/* Información del producto */}
          <div className="p-4 space-y-3">
            {/* Nombre */}
            <h3 className="font-bold text-stone-800 group-hover:text-amber-600 transition-colors line-clamp-2 text-base leading-tight">
              {product.name}
            </h3>

            {/* Ingredientes chips */}
            <div className="flex flex-wrap gap-1.5">
              {product.ingredients.slice(0, 2).map((ingredient, index) => (
                <span key={index} className="text-[10px] bg-amber-50 text-amber-700 px-2 py-1 rounded-full font-medium border border-amber-200">
                  {ingredient}
                </span>
              ))}
              {product.ingredients.length > 2 && (
                <span className="text-[10px] text-stone-400 px-2 py-1">+{product.ingredients.length - 2}</span>
              )}
            </div>

            {/* Precio */}
            <div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-black text-stone-800">
                  S/ {priceInfo.discountedPrice.toFixed(2)}
                </span>
                {priceInfo.discountPercent > 0 && (
                  <span className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white px-2 py-1 rounded-full font-bold shadow-md">
                    -{priceInfo.discountPercent}%
                  </span>
                )}
              </div>
              {priceInfo.discountPercent > 0 && (
                <span className="text-xs text-stone-500 line-through block">
                  S/ {priceInfo.originalPrice.toFixed(2)}
                </span>
              )}
              <p className="text-[11px] text-stone-500 mt-1">
                Precio unitario: S/ {product.price.toFixed(2)}
              </p>
            </div>

            {/* Selector de cantidad */}
            {product.available && (
              <div className="space-y-2">
                <div className="flex items-center justify-between bg-stone-50 rounded-2xl p-1.5 border-2 border-stone-200">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      decreaseQuantity();
                    }}
                    disabled={quantity <= 1}
                    className="h-9 w-9 p-0 rounded-xl hover:bg-white disabled:opacity-40"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="font-black text-xl min-w-[3rem] text-center text-stone-800">
                    {quantity}
                  </span>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      increaseQuantity();
                    }}
                    className="h-9 w-9 p-0 rounded-xl hover:bg-white"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {/* Mensaje motivacional de descuento */}
                {quantity < discountRules.quantity6.minQuantity && (
                  <p className="text-[11px] text-amber-600 text-center font-medium animate-pulse">
                    🎉 +{discountRules.quantity6.minQuantity - quantity} para 5% OFF
                  </p>
                )}
                {quantity >= discountRules.quantity6.minQuantity && quantity < discountRules.quantity12.minQuantity && (
                  <p className="text-[11px] text-green-600 text-center font-medium animate-pulse">
                    🔥 +{discountRules.quantity12.minQuantity - quantity} para 10% OFF
                  </p>
                )}
                {quantity >= discountRules.quantity12.minQuantity && (
                  <p className="text-[11px] text-green-600 text-center font-bold">
                    ✨ ¡Máximo descuento activado!
                  </p>
                )}
              </div>
            )}

            {/* Botón agregar al carrito */}
            <Button
              onClick={(e) => {
                e.stopPropagation();
                handleAddToCart();
              }}
              disabled={!product.available}
              className={`
                w-full font-bold transition-all duration-200 h-12 rounded-2xl text-base shadow-lg
                ${isPromoted 
                  ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 hover:from-amber-600 hover:via-orange-600 hover:to-red-600 shadow-amber-500/40' 
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-amber-500/30'
                }
                text-white hover:scale-[1.02] active:scale-95
              `}
            >
              <ShoppingCart className="h-5 w-5 mr-2" />
              {product.available ? 'Agregar' : 'No disponible'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Modal de detalles */}
      <ProductDetailModal
        product={product}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />
    </>
  );
};
