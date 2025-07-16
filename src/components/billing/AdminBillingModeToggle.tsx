
import { Shield, Settings } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent } from '@/components/ui/card';
import { useAdminBilling } from '@/contexts/AdminBillingContext';

export const AdminBillingModeToggle = () => {
  const { isAdminMode, setIsAdminMode } = useAdminBilling();

  return (
    <div className="fixed top-20 right-4 z-50">
      <Card className="bg-white shadow-lg border-2 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Shield className={`h-5 w-5 ${isAdminMode ? 'text-red-600' : 'text-blue-600'}`} />
              <span className={`text-sm font-medium ${isAdminMode ? 'text-red-600' : 'text-blue-600'}`}>
                {isAdminMode ? 'Modo Admin' : 'Modo Normal'}
              </span>
            </div>
            <Switch
              checked={isAdminMode}
              onCheckedChange={setIsAdminMode}
              className="data-[state=checked]:bg-red-600"
            />
            {isAdminMode && (
              <Settings className="h-4 w-4 text-red-600 animate-spin" />
            )}
          </div>
          {isAdminMode && (
            <div className="mt-2 text-xs text-red-600 font-medium">
              Control total activado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
