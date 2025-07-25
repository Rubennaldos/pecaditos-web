
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Users,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  Trophy
} from 'lucide-react';

export const BillingDashboard = () => {
  // Mock KPIs data with more detailed metrics
  const kpis = [
    {
      title: "Total por Cobrar",
      value: "S/ 8,450.00",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
      trend: "+12%"
    },
    {
      title: "Morosidad",
      value: "12.5%",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
      trend: "-3%"
    },
    {
      title: "Tiempo Promedio",
      value: "18 días",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      trend: "+2 días"
    },
    {
      title: "Cobrado Este Mes",
      value: "S/ 15,230.00",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100",
      trend: "+25%"
    }
  ];

  // Mock ranking data
  const topPayers = [
    { name: "Bodega Don Carlos", score: 5, amount: "S/ 2,400" },
    { name: "Restaurante La Plaza", score: 4.5, amount: "S/ 1,850" },
    { name: "Minimarket Central", score: 4, amount: "S/ 1,200" }
  ];

  const worstPayers = [
    { name: "Distribuidora El Sol SAC", overdue: 15, amount: "S/ 780" },
    { name: "Minimarket Los Andes", overdue: 7, amount: "S/ 450" }
  ];

  const exportDashboard = () => {
    console.log('Exportando dashboard a Excel...');
    // TODO: Implement Excel export with current filters
  };

  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < score ? "text-yellow-500" : "text-gray-300"}>★</span>
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Dashboard Financiero</h2>
          <p className="text-stone-600">Resumen general de cobranzas y métricas clave</p>
        </div>
        <Button onClick={exportDashboard} className="bg-green-600 hover:bg-green-700 text-white">
          <Download className="h-4 w-4 mr-2" />
          Exportar Dashboard
        </Button>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-stone-600">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                  <Icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.value}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  Tendencia: {kpi.trend}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Distribución de Deuda
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <span className="text-red-800 font-medium">Vencidas</span>
                <span className="text-red-700 font-bold">S/ 1,230 (14.5%)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                <span className="text-yellow-800 font-medium">Por Vencer (7 días)</span>
                <span className="text-yellow-700 font-bold">S/ 2,450 (29%)</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <span className="text-green-800 font-medium">Vigentes</span>
                <span className="text-green-700 font-bold">S/ 4,770 (56.5%)</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Historic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Histórico Mensual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Enero 2024</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div className="w-4/5 h-full bg-green-500"></div>
                  </div>
                  <span className="text-sm font-medium">80%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Diciembre 2023</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div className="w-3/5 h-full bg-yellow-500"></div>
                  </div>
                  <span className="text-sm font-medium">65%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Noviembre 2023</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-2 bg-green-200 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-green-600"></div>
                  </div>
                  <span className="text-sm font-medium">95%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rankings Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Payers */}
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Mejores Pagadores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topPayers.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">{client.name}</p>
                    <div className="flex items-center gap-1">
                      {renderStars(client.score)}
                      <span className="text-xs text-green-600 ml-2">({client.score}/5)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-700">{client.amount}</p>
                    <p className="text-xs text-green-600">Este mes</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Worst Payers */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Clientes Morosos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {worstPayers.map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg animate-pulse">
                  <div>
                    <p className="font-medium text-red-800">{client.name}</p>
                    <p className="text-xs text-red-600">Vencido hace {client.overdue} días</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-700">{client.amount}</p>
                    <div className="animate-pulse bg-red-500 h-2 w-2 rounded-full ml-auto"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Urgent Alerts */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Urgentes y Compromisos Hoy
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border-l-4 border-red-500">
              <div>
                <p className="font-medium text-red-800">Compromiso vencido: Distribuidora El Sol SAC</p>
                <p className="text-sm text-red-600">Compromiso para el 15/01 - S/ 345.00</p>
              </div>
              <div className="animate-pulse bg-red-500 h-3 w-3 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border-l-4 border-orange-500">
              <div>
                <p className="font-medium text-orange-800">Compromiso hoy: Minimarket Los Andes</p>
                <p className="text-sm text-orange-600">Debe contactar hoy - S/ 750.00</p>
              </div>
              <div className="animate-pulse bg-orange-500 h-3 w-3 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
