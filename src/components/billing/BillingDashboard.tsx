
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Users,
  Calendar
} from 'lucide-react';

export const BillingDashboard = () => {
  // Mock KPIs data
  const kpis = [
    {
      title: "Total por Cobrar",
      value: "S/ 8,450.00",
      icon: DollarSign,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    },
    {
      title: "Morosidad",
      value: "12.5%",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100"
    },
    {
      title: "Tiempo Promedio",
      value: "18 días",
      icon: Clock,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Cobrado Este Mes",
      value: "S/ 15,230.00",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Clientes Activos",
      value: "45",
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Compromisos Hoy",
      value: "3",
      icon: Calendar,
      color: "text-amber-600",
      bgColor: "bg-amber-100"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Dashboard Financiero</h2>
        <p className="text-stone-600">Resumen general de cobranzas y estado financiero</p>
      </div>

      {/* KPIs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Urgent Alerts */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Urgentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border-l-4 border-red-500">
              <div>
                <p className="font-medium text-red-800">Distribuidora El Sol SAC</p>
                <p className="text-sm text-red-600">Vencida hace 15 días - S/ 345.00</p>
              </div>
              <div className="animate-pulse bg-red-500 h-3 w-3 rounded-full"></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-white rounded-lg border-l-4 border-orange-500">
              <div>
                <p className="font-medium text-orange-800">Minimarket Los Andes</p>
                <p className="text-sm text-orange-600">Compromiso de pago hoy - S/ 750.00</p>
              </div>
              <div className="animate-pulse bg-orange-500 h-3 w-3 rounded-full"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border-l-4 border-green-500 bg-green-50 rounded-lg">
              <div>
                <p className="font-medium text-green-800">Bodega Don Carlos</p>
                <p className="text-sm text-green-600">Pago recibido - S/ 480.00</p>
              </div>
              <span className="text-xs text-green-600">Hace 2 horas</span>
            </div>
            <div className="flex items-center justify-between p-3 border-l-4 border-blue-500 bg-blue-50 rounded-lg">
              <div>
                <p className="font-medium text-blue-800">Restaurante La Plaza</p>
                <p className="text-sm text-blue-600">Factura generada - S/ 1,200.00</p>
              </div>
              <span className="text-xs text-blue-600">Hace 4 horas</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
