
import { Shield, Settings, Users, MessageSquare, Eye, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminDelivery } from '@/contexts/AdminDeliveryContext';

interface AdminModeToggleProps {
  onEditDelivery: (orderId: string) => void;
  onViewHistory: (orderId: string) => void;
  onDeleteDelivery: (orderId: string) => void;
  onManagePersons: () => void;
  onSendMessage: () => void;
  totalDeliveries: number;
  totalPersons: number;
}

export const AdminModeToggle = ({
  onEditDelivery,
  onViewHistory,
  onDeleteDelivery,
  onManagePersons,
  onSendMessage,
  totalDeliveries,
  totalPersons
}: AdminModeToggleProps) => {
  const { isAdminMode, setIsAdminMode, deliveryHistory } = useAdminDelivery();

  if (!isAdminMode) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsAdminMode(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg"
          size="lg"
        >
          <Shield className="h-5 w-5 mr-2" />
          Activar Modo Admin
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-2xl border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-600" />
              <span className="font-semibold text-purple-800">Modo SuperAdmin</span>
            </div>
            <Button
              onClick={() => setIsAdminMode(false)}
              variant="ghost"
              size="sm"
              className="text-purple-600 hover:text-purple-700"
            >
              <Eye className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <div className="text-center p-2 bg-blue-50 rounded">
              <div className="text-sm font-medium text-blue-800">Entregas</div>
              <div className="text-lg font-bold text-blue-600">{totalDeliveries}</div>
            </div>
            <div className="text-center p-2 bg-green-50 rounded">
              <div className="text-sm font-medium text-green-800">Repartidores</div>
              <div className="text-lg font-bold text-green-600">{totalPersons}</div>
            </div>
          </div>

          {deliveryHistory.length > 0 && (
            <div className="mb-4">
              <Badge variant="outline" className="text-xs">
                <History className="h-3 w-3 mr-1" />
                {deliveryHistory.length} acciones registradas
              </Badge>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={onManagePersons}
              variant="outline"
              size="sm"
              className="border-blue-500 text-blue-600 hover:bg-blue-50"
            >
              <Users className="h-4 w-4 mr-1" />
              Repartidores
            </Button>
            <Button
              onClick={onSendMessage}
              variant="outline"
              size="sm"
              className="border-green-500 text-green-600 hover:bg-green-50"
            >
              <MessageSquare className="h-4 w-4 mr-1" />
              Mensajes
            </Button>
          </div>

          <div className="mt-3 text-xs text-stone-500 text-center">
            Click en cualquier entrega para opciones avanzadas
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
