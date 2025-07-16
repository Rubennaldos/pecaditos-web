import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Download, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Users, 
  DollarSign,
  Calendar,
  Filter,
  Settings,
  Database,
  PieChart,
  Activity
} from 'lucide-react';
import { useAdminBilling } from '@/contexts/AdminBillingContext';

export const BillingReports = () => {
  const { isAdminMode, generateAdvancedReport } = useAdminBilling();
  const [selectedReport, setSelectedReport] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [filterUser, setFilterUser] = useState('todos');
  const [filterAction, setFilterAction] = useState('todos');

  const basicReportTypes = [
    {
      id: 'aging_report',
      name: 'Reporte de Antigüedad de Saldos',
      description: 'Análisis de cuentas por cobrar por períodos de vencimiento',
      icon: BarChart3,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'client_status',
      name: 'Estado de Clientes',
      description: 'Reporte completo del comportamiento de pago de clientes',
      icon: Users,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'cash_flow',
      name: 'Flujo de Caja',
      description: 'Proyección de ingresos y análisis de cobranza',
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  const advancedReportTypes = [
    {
      id: 'detailed_audit',
      name: 'Auditoría Detallada',
      description: 'Registro completo de todas las acciones por usuario y fecha',
      icon: Database,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'user_performance',
      name: 'Rendimiento por Usuario',
      description: 'Análisis de eficiencia y actividad por cada usuario del sistema',
      icon: Activity,
      color: 'bg-indigo-100 text-indigo-800'
    },
    {
      id: 'payment_analysis',
      name: 'Análisis Avanzado de Pagos',
      description: 'Patrones de pago, métodos preferidos y tendencias por cliente',
      icon: PieChart,
      color: 'bg-teal-100 text-teal-800'
    },
    {
      id: 'risk_assessment',
      name: 'Evaluación de Riesgo Crediticio',
      description: 'Análisis predictivo de riesgo por cliente y cartera',
      icon: TrendingUp,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'profitability_analysis',
      name: 'Análisis de Rentabilidad',
      description: 'Margen de ganancia, costos operativos y ROI por cliente',
      icon: DollarSign,
      color: 'bg-yellow-100 text-yellow-800'
    }
  ];

  const availableReports = isAdminMode ? [...basicReportTypes, ...advancedReportTypes] : basicReportTypes;

  const generateReport = (format: 'excel' | 'pdf') => {
    if (!selectedReport) {
      alert('Seleccione un tipo de reporte');
      return;
    }

    const reportConfig = {
      type: selectedReport,
      format,
      dateFrom,
      dateTo,
      filterClient,
      filterStatus,
      filterUser: isAdminMode ? filterUser : undefined,
      filterAction: isAdminMode ? filterAction : undefined,
      timestamp: new Date().toISOString(),
      adminMode: isAdminMode
    };

    console.log('Generando reporte avanzado:', reportConfig);
    
    if (isAdminMode) {
      generateAdvancedReport(reportConfig);
    }
    
    alert(`Generando reporte ${isAdminMode ? 'avanzado' : 'básico'} en formato ${format.toUpperCase()}...`);
  };

  const quickReports = [
    {
      name: 'Morosos del Mes',
      description: 'Clientes con pagos vencidos',
      count: 3,
      color: 'text-red-600'
    },
    {
      name: 'Pagos Pendientes',
      description: 'Facturas por vencer esta semana',
      count: 7,
      color: 'text-yellow-600'
    },
    {
      name: 'Compromisos Hoy',
      description: 'Clientes con compromiso de pago',
      count: 2,
      color: 'text-blue-600'
    },
    {
      name: 'Cobrado Este Mes',
      description: 'Total de pagos recibidos',
      count: 'S/ 15,230',
      color: 'text-green-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Reportes y Análisis</h2>
        <p className="text-stone-600">
          {isAdminMode ? 'Generación de reportes avanzados y análisis detallado' : 'Generación de reportes detallados para análisis financiero'}
        </p>
        {isAdminMode && (
          <Badge className="mt-2 bg-purple-100 text-purple-800">
            <Settings className="h-3 w-3 mr-1" />
            Modo Administrador - Reportes Avanzados Habilitados
          </Badge>
        )}
      </div>

      {/* Quick Reports */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {quickReports.map((report, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-4">
              <div className="text-center">
                <div className={`text-2xl font-bold ${report.color}`}>
                  {report.count}
                </div>
                <div className="text-sm font-medium text-stone-800 mt-1">
                  {report.name}
                </div>
                <div className="text-xs text-stone-500 mt-1">
                  {report.description}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generador de Reportes {isAdminMode && '(Avanzado)'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Report Type Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800">Seleccionar Tipo de Reporte</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableReports.map((report) => {
                const ReportIcon = report.icon;
                return (
                  <Card 
                    key={report.id}
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedReport === report.id ? 'ring-2 ring-green-500 bg-green-50' : ''
                    }`}
                    onClick={() => setSelectedReport(report.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${report.color.replace('text-', 'bg-').replace('-800', '-100')}`}>
                          <ReportIcon className={`h-5 w-5 ${report.color.replace('bg-', 'text-').replace('-100', '-600')}`} />
                        </div>
                        <div>
                          <h4 className="font-medium text-stone-800">{report.name}</h4>
                          <p className="text-sm text-stone-600 mt-1">{report.description}</p>
                          {selectedReport === report.id && (
                            <Badge className="mt-2 bg-green-100 text-green-800">
                              Seleccionado
                            </Badge>
                          )}
                          {advancedReportTypes.some(a => a.id === report.id) && (
                            <Badge className="mt-2 ml-2 bg-purple-100 text-purple-800">
                              <Settings className="h-3 w-3 mr-1" />
                              Avanzado
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Enhanced Filters */}
          <div className="space-y-4">
            <h3 className="font-semibold text-stone-800 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtros {isAdminMode && 'Avanzados'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Desde</label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Fecha Hasta</label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Cliente</label>
                <Input
                  placeholder="Buscar cliente..."
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="pendiente">Pendiente</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="pagado">Pagado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Advanced Admin Filters */}
            {isAdminMode && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-700">Usuario Responsable</label>
                  <Select value={filterUser} onValueChange={setFilterUser}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos los usuarios" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos los usuarios</SelectItem>
                      <SelectItem value="admin@pecaditos.com">admin@pecaditos.com</SelectItem>
                      <SelectItem value="cobranzas@pecaditos.com">cobranzas@pecaditos.com</SelectItem>
                      <SelectItem value="pedidos@pecaditos.com">pedidos@pecaditos.com</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-purple-700">Tipo de Acción</label>
                  <Select value={filterAction} onValueChange={setFilterAction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las acciones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todas las acciones</SelectItem>
                      <SelectItem value="payment_received">Pago Recibido</SelectItem>
                      <SelectItem value="invoice_issued">Factura Emitida</SelectItem>
                      <SelectItem value="payment_commitment">Compromiso de Pago</SelectItem>
                      <SelectItem value="invoice_rejected">Factura Rechazada</SelectItem>
                      <SelectItem value="warning_sent">Advertencia Enviada</SelectItem>
                      <SelectItem value="record_edited">Registro Editado</SelectItem>
                      <SelectItem value="record_deleted">Registro Eliminado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>

          {/* Generation Buttons */}
          <div className="flex gap-4 pt-4 border-t">
            <Button
              onClick={() => generateReport('excel')}
              className="bg-green-600 hover:bg-green-700 text-white flex-1"
              disabled={!selectedReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Generar Excel {isAdminMode && '(Avanzado)'}
            </Button>
            <Button
              onClick={() => generateReport('pdf')}
              variant="outline"
              className="flex-1"
              disabled={!selectedReport}
            >
              <Download className="h-4 w-4 mr-2" />
              Generar PDF {isAdminMode && '(Avanzado)'}
            </Button>
          </div>

          {isAdminMode && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-800 mb-2">Funciones Avanzadas de Admin</h4>
              <ul className="text-sm text-purple-700 space-y-1">
                <li>• Auditoría completa de todas las acciones del sistema</li>
                <li>• Análisis de rendimiento por usuario y fecha</li>
                <li>• Evaluación de riesgo crediticio predictivo</li>
                <li>• Análisis de rentabilidad y ROI por cliente</li>
                <li>• Exportación con datos sensibles y métricas internas</li>
                <li>• Filtros avanzados por usuario, acción y períodos personalizados</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Section */}
      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle>Vista Previa del Reporte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-stone-50 p-4 rounded-lg">
              <div className="text-center text-stone-600">
                <FileText className="h-12 w-12 mx-auto mb-2 text-stone-400" />
                <p>Vista previa del reporte seleccionado</p>
                <p className="text-sm mt-1">
                  {reportTypes.find(r => r.id === selectedReport)?.name}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
