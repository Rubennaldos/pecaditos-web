import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Calendar, Download, TrendingUp, Package, Clock, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { useState } from 'react';

interface OrdersDashboardProps {
  orders: any[];
  onExportReport?: (reportType: string) => void;
}

const OrdersDashboard = ({ orders, onExportReport }: OrdersDashboardProps) => {
  const [dateFilter, setDateFilter] = useState('semana');
  const [showExportDialog, setShowExportDialog] = useState(false);

  // --- Todos los datos en cero o vacíos
  const statusCounts = {
    entregados: 0,
    listos: 0,
    preparacion: 0,
    pendientes: 0,
  };

  const pieData = [
    { name: 'Entregados', value: 0, color: '#10B981' },
    { name: 'Listos', value: 0, color: '#3B82F6' },
    { name: 'En Preparación', value: 0, color: '#F59E0B' },
    { name: 'Pendientes', value: 0, color: '#EF4444' }
  ];

  // Todos los días de la semana en cero
  const weeklyData = [
    { day: 'Lun', entregados: 0, preparacion: 0, pendientes: 0 },
    { day: 'Mar', entregados: 0, preparacion: 0, pendientes: 0 },
    { day: 'Mié', entregados: 0, preparacion: 0, pendientes: 0 },
    { day: 'Jue', entregados: 0, preparacion: 0, pendientes: 0 },
    { day: 'Vie', entregados: 0, preparacion: 0, pendientes: 0 },
    { day: 'Sáb', entregados: 0, preparacion: 0, pendientes: 0 },
    { day: 'Dom', entregados: 0, preparacion: 0, pendientes: 0 }
  ];

  const exportReports = [
    { id: 'pedidos_mes', name: 'Pedidos del Mes', description: 'Todos los pedidos del mes actual' },
    { id: 'pedidos_urgentes', name: 'Pedidos Urgentes', description: 'Pedidos vencidos y próximos a vencer' },
    { id: 'rendimiento_semanal', name: 'Rendimiento Semanal', description: 'Estadísticas de la semana' },
    { id: 'clientes_frecuentes', name: 'Clientes Frecuentes', description: 'Top 10 clientes con más pedidos' },
    { id: 'productos_populares', name: 'Productos Populares', description: 'Productos más solicitados' }
  ];

  const handleExportReport = (reportType: string) => {
    onExportReport?.(reportType);
    setShowExportDialog(false);
  };

  return (
    <div className="space-y-6">
      {/* Header con filtros y exportación */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-brown-900">Dashboard de Pedidos</h2>
          <p className="text-brown-700">Análisis visual y estadísticas de rendimiento</p>
        </div>
        <div className="flex gap-3">
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mes</SelectItem>
              <SelectItem value="trimestre">Este trimestre</SelectItem>
            </SelectContent>
          </Select>

          {/* Botón de exportar reportes */}
          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Download className="h-4 w-4 mr-2" />
                Exportar Reportes
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-green-600" />
                  Exportar Reportes
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-stone-600">
                  Seleccione el tipo de reporte que desea exportar:
                </p>
                <div className="space-y-2">
                  {exportReports.map((report) => (
                    <Button
                      key={report.id}
                      onClick={() => handleExportReport(report.id)}
                      variant="outline"
                      className="w-full justify-start h-auto p-4"
                    >
                      <div className="text-left">
                        <div className="font-medium">{report.name}</div>
                        <div className="text-xs text-stone-500">{report.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{0}</div>
            <p className="text-xs text-muted-foreground">
              +0% desde la semana pasada
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{0}</div>
            <p className="text-xs text-muted-foreground">
              0% tasa de entrega
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{0}</div>
            <p className="text-xs text-muted-foreground">
              Tiempo promedio: 0 días
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">0%</div>
            <p className="text-xs text-muted-foreground">
              +0% desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de torta - Estado de pedidos */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>Vista general del estado actual de todos los pedidos</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Gráfico de barras - Rendimiento semanal */}
        <Card>
          <CardHeader>
            <CardTitle>Rendimiento Semanal</CardTitle>
            <CardDescription>Pedidos procesados por día de la semana</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="entregados" stackId="a" fill="#10B981" name="Entregados" />
                <Bar dataKey="preparacion" stackId="a" fill="#F59E0B" name="En Preparación" />
                <Bar dataKey="pendientes" stackId="a" fill="#EF4444" name="Pendientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias y análisis adicional */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Entregas</CardTitle>
          <CardDescription>Evolución de entregas completadas en los últimos 7 días</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="entregados" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersDashboard;
