
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  History
} from 'lucide-react';

interface ProductCardProps {
  product: any;
  onAddStock: (productId: string) => void;
  onShowHistory: (productId: string) => void;
  isInfrequent?: boolean;
}

export const ProductCard = ({ product, onAddStock, onShowHistory, isInfrequent = false }: ProductCardProps) => {
  const getStockStatus = (product: any) => {
    const { currentStock, alertLevels } = product;
    
    if (currentStock <= alertLevels.critical) {
      return {
        status: 'critical',
        color: 'bg-red-100 border-red-500 text-red-800',
        bgColor: 'bg-red-500',
        icon: AlertTriangle,
        pulse: true,
        text: 'CRÍTICO',
        urgency: 1
      };
    } else if (currentStock <= alertLevels.low) {
      return {
        status: 'low',
        color: 'bg-orange-100 border-orange-500 text-orange-800',
        bgColor: 'bg-orange-500',
        icon: TrendingDown,
        pulse: false,
        text: 'BAJO',
        urgency: 2
      };
    } else if (currentStock >= alertLevels.excellent) {
      return {
        status: 'excellent',
        color: 'bg-green-100 border-green-600 text-green-900',
        bgColor: 'bg-green-600',
        icon: TrendingUp,
        pulse: false,
        text: 'EXCELENTE',
        urgency: 4
      };
    } else if (currentStock >= alertLevels.good) {
      return {
        status: 'good',
        color: 'bg-green-100 border-green-400 text-green-700',
        bgColor: 'bg-green-400',
        icon: CheckCircle,
        pulse: false,
        text: 'BUENO',
        urgency: 3
      };
    } else {
      return {
        status: 'normal',
        color: 'bg-blue-100 border-blue-400 text-blue-700',
        bgColor: 'bg-blue-400',
        icon: Package2,
        pulse: false,
        text: 'NORMAL',
        urgency: 3
      };
    }
  };

  const status = getStockStatus(product);
  const IconComponent = status.icon;

  return (
    <Card 
      className={`${status.color} border-2 ${status.pulse ? 'animate-pulse' : ''} hover:shadow-lg transition-all ${isInfrequent ? 'opacity-80' : ''}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-bold">
              {product.flavor}
            </CardTitle>
            <p className="text-sm text-stone-600 mt-1">
              {product.name}
            </p>
          </div>
          <div className={`w-12 h-12 ${status.bgColor} rounded-full flex items-center justify-center`}>
            <IconComponent className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Stock Actual y Óptimo */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">Stock Actual:</span>
            <Badge className={status.color}>
              {product.currentStock} unidades
            </Badge>
          </div>
          
          {/* ÓPTIMO DESTACADO */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-amber-800">Óptimo Ideal:</span>
              <Badge className="bg-amber-500 text-white text-base px-3 py-1">
                {product.optimalStock} unidades
              </Badge>
            </div>
            <div className="mt-2 w-full bg-amber-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${status.bgColor} transition-all duration-500`}
                style={{ 
                  width: `${Math.min((product.currentStock / product.optimalStock) * 100, 100)}%` 
                }}
              ></div>
            </div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <span>Requerido:</span>
            <span className="font-medium">{product.requiredStock}</span>
          </div>
        </div>

        {/* Estado Visual */}
        <div className="text-center">
          <Badge variant="outline" className="text-xs font-medium">
            {status.text}
          </Badge>
        </div>

        {/* Botones de Acción */}
        <div className="flex gap-2">
          <Button
            onClick={() => onAddStock(product.id)}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Agregar Stock
          </Button>
          
          <Button
            onClick={() => onShowHistory(product.id)}
            variant="outline"
            size="sm"
            className="px-3"
          >
            <History className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
