
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
            <Package className="w-8 h-8 text-amber-600" />
            <h2 className="text-3xl font-bold text-stone-800 dark:text-stone-200">
              Seguimiento de Pedido
            </h2>
          </div>
          <p className="text-lg text-stone-600 dark:text-stone-400">
            ¿Ya realizaste tu pedido? Rastrea su estado en tiempo real
          </p>
        </div>

        {/* Botón principal de seguimiento */}
        <div className="relative">
          <Button
            onClick={onOpenModal}
            size="lg"
            className="group relative overflow-hidden bg-gradient-to-r from-green-500 via-emerald-500 to-cyan-500 hover:from-green-600 hover:via-emerald-600 hover:to-cyan-600 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl transform transition-all duration-300 hover:scale-105 hover:shadow-2xl"
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
        <div className="mt-6 p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-stone-800 dark:to-stone-700 rounded-xl border border-amber-200 dark:border-stone-600">
          <p className="text-sm text-stone-600 dark:text-stone-400">
            💡 <strong>Tip:</strong> Solo necesitas tu número de pedido para hacer el seguimiento
          </p>
        </div>

        {/* Estados de ejemplo (visual) */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { status: 'Recibido', icon: '📋', color: 'blue' },
            { status: 'Preparando', icon: '👨‍🍳', color: 'yellow' },
            { status: 'En camino', icon: '🚚', color: 'purple' },
            { status: 'Entregado', icon: '✅', color: 'green' }
          ].map((item, index) => (
            <div key={index} className={`p-3 rounded-lg bg-${item.color}-50 dark:bg-${item.color}-900/20 border border-${item.color}-200 dark:border-${item.color}-800`}>
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className={`text-sm font-medium text-${item.color}-700 dark:text-${item.color}-300`}>
                {item.status}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
