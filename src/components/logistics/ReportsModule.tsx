import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToPanelButton } from '@/components/ui/back-to-panel-button';
import { BarChart3, TrendingUp, AlertTriangle, Download } from 'lucide-react';
import { useLogistics } from '@/contexts/LogisticsContext';

export const ReportsModule = () => {
  const { inventory, movements, alerts } = useLogistics();

  const lowStockCount = inventory.filter(item => item.currentQuantity <= item.minQuantity).length;
  const totalValue = inventory.reduce((sum, item) => sum + (item.currentQuantity * item.cost), 0);
  const totalMovements = movements.length;

  return (
    <div className="space-y-6">
      {/* <BackToPanelButton /> - Removido porque este módulo está dentro de LogisticsPanel */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Reportes y Estadísticas</h1>
          <p className="text-muted-foreground">Análisis del inventario y movimientos</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar Reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valor Total Inventario</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">S/ {totalValue.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">{inventory.length} productos en stock</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos con Stock Bajo</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">Requieren reposición urgente</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Movimientos del Mes</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalMovements}</div>
            <p className="text-xs text-muted-foreground">Ingresos y egresos registrados</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos Más Rotados</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {inventory.slice(0, 5).map(item => (
              <div key={item.id} className="flex justify-between items-center">
                <span>{item.name}</span>
                <span className="text-muted-foreground">{item.currentQuantity} unidades</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};