
import { useState } from 'react';
import { Shield, Settings, Eye, Edit, Trash2, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAdminOrders } from '@/contexts/AdminOrdersContext';

export const AdminModeToggle = () => {
  const { isAdminMode, setIsAdminMode, deletedOrders } = useAdminOrders();
  const [showControls, setShowControls] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {/* Admin Mode Toggle */}
      <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-purple-200">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="h-4 w-4 text-purple-600" />
            Control SuperAdmin
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Modo Editor</span>
            <Switch
              checked={isAdminMode}
              onCheckedChange={setIsAdminMode}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>
          
          {isAdminMode && (
            <div className="space-y-2">
              <Button
                onClick={() => setShowControls(!showControls)}
                variant="outline"
                size="sm"
                className="w-full text-purple-600 border-purple-300 hover:bg-purple-50"
              >
                <Settings className="h-3 w-3 mr-2" />
                {showControls ? 'Ocultar' : 'Ver'} Controles
              </Button>
              
              {deletedOrders.length > 0 && (
                <Badge variant="secondary" className="w-full justify-center">
                  {deletedOrders.length} en papelera
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Admin Controls Panel */}
      {isAdminMode && showControls && (
        <Card className="bg-white/95 backdrop-blur-sm shadow-lg border-purple-200 w-64">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-purple-800">Herramientas Admin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-300">
                <Eye className="h-3 w-3 mr-1" />
                Ver Todo
              </Button>
              <Button variant="outline" size="sm" className="text-green-600 border-green-300">
                <Edit className="h-3 w-3 mr-1" />
                Editar
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-300">
                <Trash2 className="h-3 w-3 mr-1" />
                Eliminar
              </Button>
              <Button variant="outline" size="sm" className="text-amber-600 border-amber-300">
                <History className="h-3 w-3 mr-1" />
                Historial
              </Button>
            </div>
            
            <div className="text-xs text-stone-500 mt-3 p-2 bg-stone-50 rounded">
              <p className="font-medium mb-1">Modo Activo:</p>
              <ul className="space-y-1">
                <li>• Eliminar cualquier pedido</li>
                <li>• Editar datos completos</li>
                <li>• Ver historial de cambios</li>
                <li>• Acceso a papelera</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
