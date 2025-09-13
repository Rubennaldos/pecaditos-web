import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Calendar, Download, TrendingUp, Package, Clock, CheckCircle, FileSpreadsheet } from 'lucide-react';
import { useState, useMemo } from 'react';

export interface OrdersDashboardStats {
  total: number;
  pendientes: number;
  enPreparacion: number;
  listos: number;
  vencidos: number;
  urgentes: number;
  alertas: number;
}

type Order = {
  id: string;
  status: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | string;
  createdAt?: string | number;
  acceptedAt?: string | number;
  readyAt?: string | number;
  deliveredAt?: string | number;
  // otros campos no usados aquí…
};

interface OrdersDashboardProps {
  stats: OrdersDashboardStats;
  orders: Order[];
  onExportReport?: (reportType: string) => void;
}

const parseTs = (v?: string | number): number => {
  if (typeof v === 'number') return v;
  if (!v) return 0;
  const n = Date.parse(v);
  return Number.isFinite(n) ? n : 0;
};

const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
const addDays = (t: number, days: number) => t + days * 24 * 60 * 60 * 1000;

const weekdayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

const OrdersDashboard = ({ stats, orders, onExportReport }: OrdersDashboardProps) => {
  const [dateFilter, setDateFilter] = useState<'hoy' | 'semana' | 'mes' | 'trimestre'>('semana');
  const [showExportDialog, setShowExportDialog] = useState(false);

  // Ventana temporal según filtro
  const { fromTs, toTs } = useMemo(() => {
    const now = Date.now();
    const today0 = startOfDay(new Date(now));
    switch (dateFilter) {
      case 'hoy':
        return { fromTs: today0, toTs: addDays(today0, 1) };
      case 'semana': {
        // Lunes a Domingo de la semana actual
        const day = new Date(today0).getDay() || 7; // 1..7 (Lun..Dom)
        const monday0 = addDays(today0, -(day - 1));
        return { fromTs: monday0, toTs: addDays(monday0, 7) };
      }
      case 'mes': {
        const d = new Date(today0);
        const first = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        const next = new Date(d.getFullYear(), d.getMonth() + 1, 1).getTime();
        return { fromTs: first, toTs: next };
      }
      case 'trimestre': {
        const d = new Date(today0);
        const m = d.getMonth();
        const qStartMonth = m - (m % 3);
        const first = new Date(d.getFullYear(), qStartMonth, 1).getTime();
        const next = new Date(d.getFullYear(), qStartMonth + 3, 1).getTime();
        return { fromTs: first, toTs: next };
      }
      default:
        return { fromTs: 0, toTs: now };
    }
  }, [dateFilter]);

  // Filtrar pedidos por createdAt dentro de la ventana
  const filteredOrders = useMemo(
    () =>
      orders.filter(o => {
        const t = parseTs(o.createdAt);
        return t >= fromTs && t < toTs;
      }),
    [orders, fromTs, toTs]
  );

  // Pie Chart Dinámico
  const pieData = useMemo(
    () => [
      { name: 'Entregados', value: filteredOrders.filter(o => o.status === 'entregado').length, color: '#10B981' },
      { name: 'Listos', value: filteredOrders.filter(o => o.status === 'listo').length, color: '#3B82F6' },
      { name: 'En Preparación', value: filteredOrders.filter(o => o.status === 'en_preparacion').length, color: '#F59E0B' },
      { name: 'Pendientes', value: filteredOrders.filter(o => o.status === 'pendiente').length, color: '#EF4444' }
    ],
    [filteredOrders]
  );

  // Weekly data (Lun..Dom) dentro de la ventana
  const weeklyData = useMemo(() => {
    // base
    const base = weekdayLabels.map(day => ({
      day,
      entregados: 0,
      preparacion: 0,
      pendientes: 0
    }));

    filteredOrders.forEach(o => {
      const t = parseTs(o.createdAt);
      if (!t) return;
      const w = new Date(t).getDay(); // 0..6 (Dom..Sáb)
      const idx = (w === 0 ? 6 : w - 1); // 0..6 (Lun..Dom)
      if (o.status === 'entregado') base[idx].entregados += 1;
      else if (o.status === 'en_preparacion') base[idx].preparacion += 1;
      else if (o.status === 'pendiente') base[idx].pendientes += 1;
    });

    return base;
  }, [filteredOrders]);

  // Métricas adicionales
  const eficiencia = stats.total === 0 ? 0 : Math.round((pieData[0].value / stats.total) * 100);

  // Tiempo promedio en preparación (hrs) entre acceptedAt → readyAt
  const avgPrepHours = useMemo(() => {
    const pairs = filteredOrders
      .map(o => {
        const a = parseTs(o.acceptedAt);
        const r = parseTs(o.readyAt);
        return a && r ? (r - a) / (1000 * 60 * 60) : null;
      })
      .filter((v): v is number => typeof v === 'number' && isFinite(v) && v >= 0);

    if (!pairs.length) return 0;
    const avg = pairs.reduce((s, v) => s + v, 0) / pairs.length;
    return Math.round(avg * 10) / 10; // 1 decimal
  }, [filteredOrders]);

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
          <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Rango de fechas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Esta semana</SelectItem>
              <SelectItem value="mes">Este mes</SelectItem>
              <SelectItem value="trimestre">Este trimestre</SelectItem>
            </SelectContent>
          </Select>

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
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">+0% desde la semana pasada</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregados</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{pieData[0].value}</div>
            <p className="text-xs text-muted-foreground">{eficiencia}% tasa de entrega</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Proceso</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {pieData[2].value + pieData[1].value}
            </div>
            <p className="text-xs text-muted-foreground">
              Tiempo promedio: {avgPrepHours} h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eficiencia</CardTitle>
            <TrendingUp className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{eficiencia}%</div>
            <p className="text-xs text-muted-foreground">+0% desde el mes pasado</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de torta */}
        <Card>
          <CardHeader>
            <CardTitle>Distribución por Estado</CardTitle>
            <CardDescription>Vista general del estado actual de los pedidos ({dateFilter})</CardDescription>
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
            <CardDescription>Pedidos por día ({dateFilter})</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="entregados" stackId="a" fill="#10B981" name="Entregados" />
                <Bar dataKey="preparacion" stackId="a" fill="#F59E0B" name="En Preparación" />
                <Bar dataKey="pendientes" stackId="a" fill="#EF4444" name="Pendientes" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias */}
      <Card>
        <CardHeader>
          <CardTitle>Tendencia de Entregas</CardTitle>
          <CardDescription>Últimos 7 días ({dateFilter})</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
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
