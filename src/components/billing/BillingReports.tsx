import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { 
  BarChart3,
  Download,
  FileText,
  DollarSign,
  Users,
  AlertTriangle,
  CheckCircle,
  Target
} from 'lucide-react';
import { useBilling } from '@/hooks/useBilling';
import { useAdminBilling } from '@/contexts/AdminBillingContext';

export const BillingReports = () => {
  const { generateAdvancedReport } = useAdminBilling();
  const { invoices, stats } = useBilling();
  
  const [reportType, setReportType] = useState('summary');
  const [reportPeriod, setReportPeriod] = useState('month');
  const [isGenerating, setIsGenerating] = useState(false);

  const summaryReport = useMemo(() => {
    const totalInvoices = invoices.length;
    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const overdueInvoices = invoices.filter(inv => inv.status === 'overdue');
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');
    
    const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    const collectionRate = totalInvoices > 0 ? (paidInvoices.length / totalInvoices) * 100 : 0;

    return {
      totalInvoices,
      totalAmount,
      paidInvoices: paidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      pendingInvoices: pendingInvoices.length,
      totalPaid,
      totalOverdue,
      collectionRate
    };
  }, [invoices]);

  const generateReport = async () => {
    setIsGenerating(true);
    
    try {
      const filters = { reportType, period: reportPeriod };
      generateAdvancedReport(filters);
      
      setTimeout(() => {
        alert('Reporte generado exitosamente.');
        setIsGenerating(false);
      }, 2000);
      
    } catch (error) {
      alert('Error al generar el reporte.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-stone-800 mb-2">Reportes y Análisis</h2>
        <p className="text-stone-600">Análisis completo del desempeño financiero</p>
      </div>

      {/* Report Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Configuración del Reporte
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de reporte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Resumen Ejecutivo</SelectItem>
                <SelectItem value="clients">Análisis por Cliente</SelectItem>
                <SelectItem value="collections">Evolución de Cobranzas</SelectItem>
                <SelectItem value="overdue">Cuentas Vencidas</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={reportPeriod} onValueChange={setReportPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Última Semana</SelectItem>
                <SelectItem value="month">Último Mes</SelectItem>
                <SelectItem value="quarter">Último Trimestre</SelectItem>
                <SelectItem value="year">Último Año</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              onClick={generateReport}
              disabled={isGenerating}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isGenerating ? 'Generando...' : 'Generar Reporte'}
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Excel
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              PDF
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Report */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen Ejecutivo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-blue-200 bg-blue-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-600">Total Facturas</p>
                    <p className="text-2xl font-bold text-blue-700">{summaryReport.totalInvoices}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-600">Total Cobrado</p>
                    <p className="text-2xl font-bold text-green-700">S/ {summaryReport.totalPaid.toFixed(2)}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-600">Vencido</p>
                    <p className="text-2xl font-bold text-red-700">S/ {summaryReport.totalOverdue.toFixed(2)}</p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-orange-200 bg-orange-50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-600">Tasa de Cobranza</p>
                    <p className="text-2xl font-bold text-orange-700">{summaryReport.collectionRate.toFixed(1)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Facturado</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-stone-800">
                  S/ {summaryReport.totalAmount.toFixed(2)}
                </div>
                <p className="text-sm text-stone-600 mt-2">En el período seleccionado</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Facturas Pagadas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {summaryReport.paidInvoices}
                </div>
                <p className="text-sm text-stone-600 mt-2">De {summaryReport.totalInvoices} emitidas</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Facturas Vencidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600">
                  {summaryReport.overdueInvoices}
                </div>
                <p className="text-sm text-stone-600 mt-2">Requieren seguimiento</p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};