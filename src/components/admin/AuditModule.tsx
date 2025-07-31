import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/config/firebase';
import {
  Shield, Filter, Download, Search, Calendar, Clock, User, Eye,
  FileText, Database, Settings, Users, ShoppingCart, Truck, CreditCard, Package,
  AlertTriangle, CheckCircle, XCircle, Edit, Trash2, Plus
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

// Ajusta el tipo para tus logs
type AuditLog = {
  id: string;
  timestamp?: string;
  user?: string;
  email?: string;
  action?: string;
  module?: string;
  details?: string;
  ip?: string;
  device?: string;
  success?: boolean | string;
  [key: string]: any;
};

export const AuditModule = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

// Carga desde Firebase
useEffect(() => {
  const auditRef = ref(db, 'auditLogs');
  const unsubscribe = onValue(auditRef, (snap) => {
    const data = snap.val() || {};
    const arr: AuditLog[] = [];
    Object.entries(data).forEach(([id, value]) => {
      if (typeof value === 'object' && value !== null && 'timestamp' in value) {
        arr.push({
          id,
          ...(value as Record<string, any>)
        });
      }
    });
    arr.sort((a, b) => {
      const dateB = new Date(b.timestamp ?? 0).getTime();
      const dateA = new Date(a.timestamp ?? 0).getTime();
      return dateB - dateA;
    });
    setAuditLogs(arr);
    setLoading(false);
  });
  return () => unsubscribe();
}, []);

  // Estados
  const [filters, setFilters] = useState({
    user: '',
    module: 'all',
    action: 'all',
    dateFrom: '',
    dateTo: '',
    success: 'all'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

  // Opciones de módulos y acciones
  const modules = [
    { value: 'all', label: 'Todos los módulos', icon: Database },
    { value: 'Clientes', label: 'Clientes', icon: Users },
    { value: 'Pedidos', label: 'Pedidos', icon: ShoppingCart },
    { value: 'Reparto', label: 'Reparto', icon: Truck },
    { value: 'Producción', label: 'Producción', icon: Package },
    { value: 'Cobranzas', label: 'Cobranzas', icon: CreditCard },
    { value: 'Sistema', label: 'Sistema', icon: Settings },
    { value: 'Mensajes', label: 'Mensajes', icon: FileText }
  ];
  const actions = [
    { value: 'all', label: 'Todas las acciones' },
    { value: 'Creó', label: 'Creaciones' },
    { value: 'Editó', label: 'Ediciones' },
    { value: 'Eliminó', label: 'Eliminaciones' },
    { value: 'Completó', label: 'Completados' },
    { value: 'Actualizó', label: 'Actualizaciones' },
    { value: 'Envió', label: 'Envíos' },
    { value: 'Registró', label: 'Registros' }
  ];

  // Filtrado robusto
  const filteredLogs = auditLogs.filter(log => {
    const matchesUser = !filters.user || (log.user && log.user.toLowerCase().includes(filters.user.toLowerCase())) ||
      (log.email && log.email.toLowerCase().includes(filters.user.toLowerCase()));
    const matchesModule = filters.module === 'all' || log.module === filters.module;
    const matchesAction = filters.action === 'all' || (log.action && log.action.includes(filters.action));
    const matchesSuccess = filters.success === 'all' || String(log.success) === filters.success;
    const matchesSearch = !searchTerm ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.user && log.user.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (log.action && log.action.toLowerCase().includes(searchTerm.toLowerCase()));
    let matchesDate = true;
    if (filters.dateFrom) {
      const logDate = new Date(log.timestamp ?? 0);
      const fromDate = new Date(filters.dateFrom);
      matchesDate = logDate >= fromDate;
    }
    if (filters.dateTo && matchesDate) {
      const logDate = new Date(log.timestamp ?? 0);
      const toDate = new Date(filters.dateTo + ' 23:59:59');
      matchesDate = logDate <= toDate;
    }
    return matchesUser && matchesModule && matchesAction && matchesSuccess && matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  // Iconos de acción y módulo
  const getActionIcon = (action?: string, success?: boolean | string) => {
    if (!success || success === 'false') return <XCircle className="h-4 w-4 text-red-500" />;
    if (action && (action.includes('Creó') || action.includes('Registró'))) return <Plus className="h-4 w-4 text-green-500" />;
    if (action && (action.includes('Editó') || action.includes('Actualizó'))) return <Edit className="h-4 w-4 text-blue-500" />;
    if (action && action.includes('Eliminó')) return <Trash2 className="h-4 w-4 text-red-500" />;
    if (action && action.includes('Completó')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };
  const getModuleIcon = (module?: string) => {
    const moduleData = modules.find(m => m.value === module);
    if (moduleData) {
      const Icon = moduleData.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Database className="h-4 w-4" />;
  };

  // Export simulado
  const handleExportAudit = (format: string) => {
    const exportData = {
      filters,
      totalRecords: filteredLogs.length,
      exportDate: new Date().toLocaleString('es-PE'),
      logs: filteredLogs
    };
    toast({
      title: "Exportando auditoría",
      description: `Generando reporte en formato ${format.toUpperCase()}. Se descargará en unos momentos.`,
    });
    // Aquí va tu lógica real de export
    console.log('Datos a exportar:', exportData);
  };

  const clearFilters = () => {
    setFilters({
      user: '',
      module: 'all',
      action: 'all',
      dateFrom: '',
      dateTo: '',
      success: 'all'
    });
    setSearchTerm('');
    setCurrentPage(1);
  };

  // --- Render ---
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Auditoría del Sistema</h1>
          <p className="text-stone-600 mt-1">Historial completo de acciones y cambios en el sistema</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleExportAudit('excel')}>
            <Download className="h-4 w-4 mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={() => handleExportAudit('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            PDF
          </Button>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Total de Registros</p>
                <p className="text-2xl font-bold text-stone-800">{auditLogs.length}</p>
              </div>
              <Database className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Acciones Exitosas</p>
                <p className="text-2xl font-bold text-green-600">
                  {auditLogs.filter(log => log.success).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Errores</p>
                <p className="text-2xl font-bold text-red-600">
                  {auditLogs.filter(log => !log.success).length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-stone-800">
                  {new Set(auditLogs.map(log => log.user)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros de Búsqueda
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="user-filter">Usuario</Label>
              <Input
                id="user-filter"
                placeholder="Nombre o email"
                value={filters.user}
                onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="module-filter">Módulo</Label>
              <Select value={filters.module} onValueChange={(value) => setFilters(prev => ({ ...prev, module: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem key={module.value} value={module.value}>
                      {module.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="action-filter">Acción</Label>
              <Select value={filters.action} onValueChange={(value) => setFilters(prev => ({ ...prev, action: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {actions.map((action) => (
                    <SelectItem key={action.value} value={action.value}>
                      {action.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="date-from">Fecha desde</Label>
              <Input
                id="date-from"
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="date-to">Fecha hasta</Label>
              <Input
                id="date-to"
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <Select value={filters.success} onValueChange={(value) => setFilters(prev => ({ ...prev, success: value }))}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="true">Solo exitosos</SelectItem>
                  <SelectItem value="false">Solo errores</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-stone-600">
                Mostrando {filteredLogs.length} de {auditLogs.length} registros
              </span>
            </div>
            <Button variant="outline" onClick={clearFilters}>
              Limpiar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabla */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Estado</TableHead>
                <TableHead>Usuario</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Fecha y Hora</TableHead>
                <TableHead>Detalles</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">Cargando...</TableCell>
                </TableRow>
              ) : paginatedLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <Shield className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">No hay registros</h3>
                    <p className="text-gray-500">No se encontraron registros que coincidan con los filtros.</p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedLogs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-stone-50">
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getActionIcon(log.action, log.success)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{log.user}</p>
                        <p className="text-sm text-stone-500">{log.email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={log.success ? "default" : "destructive"}>
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getModuleIcon(log.module)}
                        <span>{log.module}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm">
                        <Calendar className="h-4 w-4 text-stone-400" />
                        {log.timestamp && log.timestamp.split(' ')[0]}
                        <Clock className="h-4 w-4 text-stone-400 ml-2" />
                        {log.timestamp && log.timestamp.split(' ')[1]}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-stone-600 truncate">
                        {log.details && log.details.length > 50 ? log.details.substring(0, 50) + '...' : log.details}
                      </p>
                    </TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLog(log)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <Button
            variant="outline"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
          >
            Anterior
          </Button>
          <span className="text-sm text-stone-600">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
          >
            Siguiente
          </Button>
        </div>
      )}

      {/* Modal de detalle */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedLog && getActionIcon(selectedLog.action, selectedLog.success)}
              Detalle del Registro de Auditoría
            </DialogTitle>
            <DialogDescription>
              Información completa del registro seleccionado
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-stone-600">Usuario</Label>
                  <p className="font-medium">{selectedLog.user}</p>
                  <p className="text-sm text-stone-500">{selectedLog.email}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-stone-600">Estado</Label>
                  <div className="flex items-center gap-2">
                    {getActionIcon(selectedLog.action, selectedLog.success)}
                    <Badge variant={selectedLog.success ? "default" : "destructive"}>
                      {selectedLog.success ? 'Exitoso' : 'Error'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-stone-600">Acción</Label>
                  <p className="font-medium">{selectedLog.action}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-stone-600">Módulo</Label>
                  <div className="flex items-center gap-2">
                    {getModuleIcon(selectedLog.module)}
                    <span className="font-medium">{selectedLog.module}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-stone-600">Fecha y Hora</Label>
                  <p className="font-medium">{selectedLog.timestamp}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-stone-600">Dirección IP</Label>
                  <p className="font-medium">{selectedLog.ip}</p>
                </div>
              </div>
              <Separator />
              <div>
                <Label className="text-sm font-medium text-stone-600">Dispositivo/Navegador</Label>
                <p className="font-medium">{selectedLog.device}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-stone-600">Detalles Completos</Label>
                <div className="p-3 bg-stone-50 rounded-lg">
                  <p className="text-sm">{selectedLog.details}</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedLog(null)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AuditModule;
