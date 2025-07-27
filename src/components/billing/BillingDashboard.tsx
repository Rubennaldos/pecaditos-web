import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DollarSign, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Download,
  BarChart3,
  PieChart,
  Trophy
} from 'lucide-react';

// FIREBASE
import { getDatabase, ref, onValue } from 'firebase/database';
import { app } from '@/config/firebase'; // Ajusta la ruta según tu estructura

export const BillingDashboard = () => {
  // Estados para datos de dashboard
  const [kpis, setKpis] = useState<any[]>([]);
  const [topPayers, setTopPayers] = useState<any[]>([]);
  const [worstPayers, setWorstPayers] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);

  // Lectura desde RTDB
  useEffect(() => {
    const db = getDatabase(app);

    // KPIs
    onValue(ref(db, 'billingDashboard/kpis'), (snapshot) => {
      const data = snapshot.val();
      setKpis(Array.isArray(data) ? data : (data ? Object.values(data) : []));
    });

    // Mejores pagadores
    onValue(ref(db, 'billingDashboard/topPayers'), (snapshot) => {
      const data = snapshot.val();
      setTopPayers(Array.isArray(data) ? data : (data ? Object.values(data) : []));
    });

    // Peores pagadores
    onValue(ref(db, 'billingDashboard/worstPayers'), (snapshot) => {
      const data = snapshot.val();
      setWorstPayers(Array.isArray(data) ? data : (data ? Object.values(data) : []));
    });

    // Alertas y compromisos
    onValue(ref(db, 'billingDashboard/alerts'), (snapshot) => {
      const data = snapshot.val();
      setAlerts(Array.isArray(data) ? data : (data ? Object.values(data) : []));
    });
  }, []);

  // Excel Export
  const exportDashboard = () => {
    alert('Exportando dashboard a Excel (implementa aquí tu lógica de exportación)');
  };

  // Renderiza estrellas
  const renderStars = (score: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < score ? "text-yellow-500" : "text-gray-300"}>★</span>
    ));
  };

  // Renderiza resumen de distribución de deuda
  const renderDistribution = () => {
    if (!kpis || kpis.length === 0) return null;
    // Busca los 3 KPIs principales para la gráfica
    // Puedes adaptar los nombres según tu RTDB
    const vencidas = kpis.find(k => k.key === 'debtOverdue');
    const porVencer = kpis.find(k => k.key === 'debtDueSoon');
    const vigentes = kpis.find(k => k.key === 'debtCurrent');
    return (
      <div className="space-y-4">
        {vencidas && (
          <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
            <span className="text-red-800 font-medium">Vencidas</span>
            <span className="text-red-700 font-bold">{vencidas.value} ({vencidas.percent})</span>
          </div>
        )}
        {porVencer && (
          <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
            <span className="text-yellow-800 font-medium">Por Vencer (7 días)</span>
            <span className="text-yellow-700 font-bold">{porVencer.value} ({porVencer.percent})</span>
          </div>
        )}
        {vigentes && (
          <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
            <span className="text-green-800 font-medium">Vigentes</span>
            <span className="text-green-700 font-bold">{vigentes.value} ({vigentes.percent})</span>
          </div>
        )}
      </div>
    );
  };

  // Renderiza histórico mensual ficticio (¡puedes traerlo también de Firebase!)
  const renderMonthlyHistoric = () => (
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
  );

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
        {kpis.map((kpi: any, index: number) => {
          const Icon = {
            DollarSign,
            AlertTriangle,
            Clock,
            TrendingUp
          }[kpi.icon as keyof typeof import('lucide-react')];

          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-stone-600">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                  {Icon ? <Icon className={`h-4 w-4 ${kpi.color}`} /> : null}
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
            {renderDistribution()}
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
            {renderMonthlyHistoric()}
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
              {topPayers.map((client: any, index: number) => (
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
              {worstPayers.map((client: any, index: number) => (
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
            {alerts.map((alert: any, idx: number) => (
              <div key={idx}
                className={`flex items-center justify-between p-3 bg-white rounded-lg border-l-4
                  ${alert.type === 'vencido' ? 'border-red-500' : 'border-orange-500'}`}>
                <div>
                  <p className={`font-medium ${alert.type === 'vencido' ? 'text-red-800' : 'text-orange-800'}`}>{alert.title}</p>
                  <p className={`text-sm ${alert.type === 'vencido' ? 'text-red-600' : 'text-orange-600'}`}>{alert.desc}</p>
                </div>
                <div className={`animate-pulse h-3 w-3 rounded-full
                  ${alert.type === 'vencido' ? 'bg-red-500' : 'bg-orange-500'}`}></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
