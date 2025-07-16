
import { Shield, Settings, History, Eye, BarChart3 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useAdminProduction } from '@/contexts/AdminProductionContext';

interface AdminModeToggleProps {
  onEditRecord: (recordId: string) => void;
  onViewHistory: (recordId: string) => void;
  onDeleteRecord: (recordId: string) => void;
  totalRecords: number;
}

export const AdminModeToggle = ({
  onEditRecord,
  onViewHistory,
  onDeleteRecord,
  totalRecords
}: AdminModeToggleProps) => {
  const { isAdminMode, setIsAdminMode, productionHistory } = useAdminProduction();

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className="w-80 shadow-2xl border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-600" />
              <span className="font-semibold text-green-800">Modo SuperAdmin</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-stone-500" />
              <Switch
                checked={isAdminMode}
                onCheckedChange={setIsAdminMode}
              />
            </div>
          </div>

          {isAdminMode && (
            <>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="text-center p-2 bg-green-50 rounded">
                  <div className="text-sm font-medium text-green-800">Registros</div>
                  <div className="text-lg font-bold text-green-600">{totalRecords}</div>
                </div>
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="text-sm font-medium text-blue-800">Productos</div>
                  <div className="text-lg font-bold text-blue-600">7</div>
                </div>
              </div>

              {productionHistory.length > 0 && (
                <div className="mb-4">
                  <Badge variant="outline" className="text-xs">
                    <History className="h-3 w-3 mr-1" />
                    {productionHistory.length} acciones registradas
                  </Badge>
                </div>
              )}

              <div className="mt-3 text-xs text-stone-500 text-center">
                <BarChart3 className="h-4 w-4 mx-auto mb-1" />
                Modo admin activo - Control total de producción
              </div>
            </>
          )}

          {!isAdminMode && (
            <div className="text-center text-sm text-stone-600">
              Activar para controles avanzados
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
