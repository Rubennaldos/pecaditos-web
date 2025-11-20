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
  status?: 'pendiente' | 'en_preparacion' | 'listo' | 'entregado' | string;
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
    <div className="space-y-4">
      {/* Header compacto */}
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">Resumen</h2>
        </div>
        <div className="flex gap-2">
          <Select value={dateFilter} onValueChange={(v: any) => setDateFilter(v)}>
            <SelectTrigger className="w-40 h-9 text-sm">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hoy">Hoy</SelectItem>
              <SelectItem value="semana">Semana</SelectItem>
              <SelectItem value="mes">Mes</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="h-9">
                <Download className="h-3.5 w-3.5 sm:mr-2" />
                <span className="hidden sm:inline">Exportar</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-neutral-700" />
                  Exportar Reportes
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3">
                <p className="text-sm text-neutral-600">
                  Seleccione el tipo de reporte:
                </p>
                <div className="space-y-2">
                  {exportReports.map((report) => (
                    <Button
                      key={report.id}
                      onClick={() => handleExportReport(report.id)}
                      variant="outline"
                      className="w-full justify-start h-auto p-3"
                    >
                      <div className="text-left">
                        <div className="font-medium text-sm">{report.name}</div>
                        <div className="text-xs text-neutral-500">{report.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Métricas principales - Más compactas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-600">Total</span>
              <Package className="h-4 w-4 text-neutral-400" />
            </div>
            <div className="text-2xl font-bold text-neutral-900">{stats.total}</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-600">Entregados</span>
              <CheckCircle className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600">{pieData[0].value}</div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-600">En Proceso</span>
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-amber-600">
              {pieData[2].value + pieData[1].value}
            </div>
          </CardContent>
        </Card>

        <Card className="border-neutral-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-neutral-600">Eficiencia</span>
              <TrendingUp className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{eficiencia}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos más compactos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Gráfico de torta - Más pequeño */}
        <Card className="border-neutral-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900">Distribución</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  outerRadius={60}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Leyenda manual compacta */}
            <div className="grid grid-cols-2 gap-2 mt-2 text-xs">
              {pieData.map((entry) => (
                <div key={entry.name} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-neutral-600 truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de barras - Más pequeño */}
        <Card className="border-neutral-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-neutral-900">Semanal</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12 }} />
                <Bar dataKey="entregados" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="preparacion" stackId="a" fill="#F59E0B" />
                <Bar dataKey="pendientes" stackId="a" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tendencias - Opcional en mobile, más compacta */}
      <Card className="border-neutral-200 hidden sm:block">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-neutral-900">Tendencia</CardTitle>
        </CardHeader>
        <CardContent className="pb-4">
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="entregados"
                stroke="#10B981"
                strokeWidth={2}
                dot={{ fill: '#10B981', r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersDashboard;
