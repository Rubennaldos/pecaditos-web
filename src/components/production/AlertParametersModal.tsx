
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingDown, CheckCircle, TrendingUp, Save, X } from 'lucide-react';

interface AlertParametersModalProps {
  onClose: () => void;
  onSave: (parameters: any) => void;
  currentParameters: any;
}

export const AlertParametersModal = ({ onClose, onSave, currentParameters }: AlertParametersModalProps) => {
  const [parameters, setParameters] = useState({
    critical: currentParameters.critical || 5,
    low: currentParameters.low || 40,
    good: currentParameters.good || 100,
    excellent: currentParameters.excellent || 200
  });

  const handleSave = () => {
    onSave(parameters);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold text-stone-800">
            Configurar Parámetros de Alertas
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-800">
              <strong>Nota:</strong> Estos parámetros se aplicarán a todos los productos. 
              Solo el administrador general puede modificar estos valores.
            </p>
          </div>

          {/* Preview de colores */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <div className="font-bold text-red-800">CRÍTICO</div>
              <div className="text-xs text-red-600 mt-1">Parpadeo rojo</div>
            </div>
            <div className="text-center p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <TrendingDown className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="font-bold text-orange-800">BAJO</div>
              <div className="text-xs text-orange-600 mt-1">Naranja</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="font-bold text-green-800">BUENO</div>
              <div className="text-xs text-green-600 mt-1">Verde</div>
            </div>
            <div className="text-center p-4 bg-green-50 border border-green-300 rounded-lg">
              <TrendingUp className="h-8 w-8 text-green-700 mx-auto mb-2" />
              <div className="font-bold text-green-900">EXCELENTE</div>
              <div className="text-xs text-green-700 mt-1">Verde fuerte</div>
            </div>
          </div>

          {/* Configuración de parámetros */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-red-800">
                  Stock Crítico (≤ unidades)
                </label>
                <Input
                  type="number"
                  value={parameters.critical}
                  onChange={(e) => setParameters({...parameters, critical: parseInt(e.target.value) || 0})}
                  className="border-red-300 focus:border-red-500"
                />
                <p className="text-xs text-red-600">Cuando el stock sea igual o menor a este valor</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-orange-800">
                  Stock Bajo (≤ unidades)
                </label>
                <Input
                  type="number"
                  value={parameters.low}
                  onChange={(e) => setParameters({...parameters, low: parseInt(e.target.value) || 0})}
                  className="border-orange-300 focus:border-orange-500"
                />
                <p className="text-xs text-orange-600">Entre crítico y este valor</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-green-800">
                  Stock Bueno (≥ unidades)
                </label>
                <Input
                  type="number"
                  value={parameters.good}
                  onChange={(e) => setParameters({...parameters, good: parseInt(e.target.value) || 0})}
                  className="border-green-300 focus:border-green-500"
                />
                <p className="text-xs text-green-600">A partir de este valor se considera bueno</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-green-900">
                  Stock Excelente (≥ unidades)
                </label>
                <Input
                  type="number"
                  value={parameters.excellent}
                  onChange={(e) => setParameters({...parameters, excellent: parseInt(e.target.value) || 0})}
                  className="border-green-400 focus:border-green-600"
                />
                <p className="text-xs text-green-700">Sobrestock o cantidad excelente</p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleSave}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="px-6"
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
