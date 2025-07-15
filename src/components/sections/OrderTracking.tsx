import { Package, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrderTrackingProps {
  onOpenModal: () => void;
}

export const OrderTracking = ({ onOpenModal }: OrderTrackingProps) => {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        
        {/* Título y descripción */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-center space-x-3">
            <Package className="w-8 h-8 text-primary" />
            <h2 className="text-3xl font-bold" style={{ color: "#573813" }}>
              Seguimiento de Pedido
            </h2>
          </div>
          <p className="text-lg" style={{ color: "#573813" }}>
            ¿Ya realizaste tu pedido? Rastrea su estado en tiempo real
          </p>
        </div>

        {/* Botón principal de seguimiento - centrado */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={onOpenModal}
            size="lg"
            className="group relative overflow-hidden bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 py-4 rounded-2xl shadow-warm transform transition-all duration-300 hover:scale-105 hover-lift"
          >
            {/* Efecto de brillo animado */}
            <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            
            {/* Contenido del botón */}
            <div className="relative flex items-center space-x-3">
              <Search className="w-6 h-6" />
              <span className="text-lg">Buscar mi Pedido</span>
            </div>
          </Button>
        </div>

        {/* Información adicional */}
        <div className="mb-8 p-4 bg-secondary rounded-xl border border-border">
          <p className="text-sm" style={{ color: "#573813" }}>
            💡 <strong>Tip:</strong> Solo necesitas tu número de pedido para hacer el seguimiento
          </p>
        </div>

        {/* Estados de ejemplo (visual) - centrados */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
          {[
            { status: 'Recibido', icon: '📋', bgColor: 'bg-blue-50', textColor: 'text-blue-700', borderColor: 'border-blue-200' },
            { status: 'Preparando', icon: '👨‍🍳', bgColor: 'bg-yellow-50', textColor: 'text-yellow-700', borderColor: 'border-yellow-200' },
            { status: 'En camino', icon: '🚚', bgColor: 'bg-purple-50', textColor: 'text-purple-700', borderColor: 'border-purple-200' },
            { status: 'Entregado', icon: '✅', bgColor: 'bg-green-50', textColor: 'text-green-700', borderColor: 'border-green-200' }
          ].map((item, index) => (
            <div key={index} className={`p-3 rounded-lg ${item.bgColor} border ${item.borderColor}`}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className={`text-sm font-medium ${item.textColor}`}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
