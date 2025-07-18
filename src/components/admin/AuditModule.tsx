import { useState } from 'react';
import { 
  Shield, 
  Filter, 
  Download, 
  Search, 
  Calendar, 
  Clock, 
  User, 
  Eye,
  FileText,
  Database,
  Settings,
  Users,
  ShoppingCart,
  Truck,
  CreditCard,
  Package,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Plus
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';

export const AuditModule = () => {
  const [auditLogs] = useState([
    { 
      id: 1, 
      user: 'Admin General', 
      email: 'admin@pecaditos.com',
      action: 'Creó cliente', 
      module: 'Clientes', 
      timestamp: '2024-07-18 10:30:00', 
      details: 'Cliente: Empresa ABC S.A.C. - RUC: 20123456789',
      ip: '192.168.1.100',
      device: 'Chrome 115 - Windows',
      success: true
    },
    { 
      id: 2, 
      user: 'María García', 
      email: 'pedidos@pecaditos.com',
      action: 'Editó pedido', 
      module: 'Pedidos', 
      timestamp: '2024-07-18 09:15:22', 
      details: 'Pedido #PD-001 - Cambió estado de Pendiente a En Preparación',
      ip: '192.168.1.105',
      device: 'Chrome 115 - Android',
      success: true
    },
    { 
      id: 3, 
      user: 'Carlos López', 
      email: 'reparto@pecaditos.com',
      action: 'Completó entrega', 
      module: 'Reparto', 
      timestamp: '2024-07-18 08:45:10', 
      details: 'Entrega #E-001 - Cliente satisfecho, entrega completada en dirección fiscal',
      ip: '192.168.1.110',
      device: 'Chrome Mobile - iOS',
      success: true
    },
    { 
      id: 4, 
      user: 'Admin General', 
      email: 'admin@pecaditos.com',
      action: 'Desactivó usuario', 
      module: 'Sistema', 
      timestamp: '2024-07-17 16:20:33', 
      details: 'Usuario: Ana Rodríguez (cobranzas@pecaditos.com) - Motivo: Licencia médica',
      ip: '192.168.1.100',
      device: 'Chrome 115 - Windows',
      success: true
    },
    { 
      id: 5, 
      user: 'Jorge Silva', 
      email: 'produccion@pecaditos.com',
      action: 'Actualizó stock', 
      module: 'Producción', 
      timestamp: '2024-07-17 14:10:15', 
      details: 'Producto: Galletas de Chocolate - Stock anterior: 120, Stock nuevo: 150 unidades',
      ip: '192.168.1.115',
      device: 'Firefox 116 - Linux',
      success: true
    },
    { 
      id: 6, 
      user: 'María García', 
      email: 'pedidos@pecaditos.com',
      action: 'Falló eliminación', 
      module: 'Pedidos', 
      timestamp: '2024-07-17 13:30:00', 
      details: 'Intento fallido de eliminar pedido #PD-005 - Error: Pedido ya en producción',
      ip: '192.168.1.105',
      device: 'Chrome 115 - Android',
      success: false
    },
    { 
      id: 7, 
      user: 'Admin General', 
      email: 'admin@pecaditos.com',
      action: 'Envió mensaje', 
      module: 'Mensajes', 
      timestamp: '2024-07-17 11:45:00', 
      details: 'Mensaje: "Nuevo catálogo de productos" enviado a 25 mayoristas y 3 módulos internos',
      ip: '192.168.1.100',
      device: 'Chrome 115 - Windows',
      success: true
    },
    { 
      id: 8, 
      user: 'Ana Rodríguez', 
      email: 'cobranzas@pecaditos.com',
      action: 'Registró pago', 
      module: 'Cobranzas', 
      timestamp: '2024-07-16 15:20:00', 
      details: 'Cliente: Distribuidora Lima SAC - Monto: S/. 2,450.00 - Método: Transferencia bancaria',
      ip: '192.168.1.120',
      device: 'Chrome 115 - Windows',
      success: true
    },
    { 
      id: 9, 
      user: 'Carlos López', 
      email: 'reparto@pecaditos.com',
      action: 'Reportó incidencia', 
      module: 'Reparto', 
      timestamp: '2024-07-16 14:30:00', 
      details: 'Entrega #E-003 - Incidencia: Cliente no disponible, reprogramada para mañana',
      ip: '192.168.1.110',
      device: 'Chrome Mobile - iOS',
      success: true
    },
    { 
      id: 10, 
      user: 'Jorge Silva', 
      email: 'produccion@pecaditos.com',
      action: 'Creó lote', 
      module: 'Producción', 
      timestamp: '2024-07-16 08:00:00', 
      details: 'Lote #L-024 - Producto: Galletas Vainilla - Cantidad: 500 unidades',
      ip: '192.168.1.115',
      device: 'Firefox 116 - Linux',
      success: true
    }
  ]);

  const [filters, setFilters] = useState({
    user: '',
    module: 'all',
    action: 'all',
    dateFrom: '',
    dateTo: '',
    success: 'all'
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 10;

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

  const filteredLogs = auditLogs.filter(log => {
    const matchesUser = !filters.user || log.user.toLowerCase().includes(filters.user.toLowerCase()) || 
                       log.email.toLowerCase().includes(filters.user.toLowerCase());
    const matchesModule = filters.module === 'all' || log.module === filters.module;
    const matchesAction = filters.action === 'all' || log.action.includes(filters.action);
    const matchesSuccess = filters.success === 'all' || log.success.toString() === filters.success;
    const matchesSearch = !searchTerm || 
                         log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesDate = true;
    if (filters.dateFrom) {
      const logDate = new Date(log.timestamp);
      const fromDate = new Date(filters.dateFrom);
      matchesDate = logDate >= fromDate;
    }
    if (filters.dateTo && matchesDate) {
      const logDate = new Date(log.timestamp);
      const toDate = new Date(filters.dateTo + ' 23:59:59');
      matchesDate = logDate <= toDate;
    }

    return matchesUser && matchesModule && matchesAction && matchesSuccess && matchesSearch && matchesDate;
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const startIndex = (currentPage - 1) * logsPerPage;
  const paginatedLogs = filteredLogs.slice(startIndex, startIndex + logsPerPage);

  const getActionIcon = (action, success) => {
    if (!success) return <XCircle className="h-4 w-4 text-red-500" />;
    
    if (action.includes('Creó') || action.includes('Registró')) return <Plus className="h-4 w-4 text-green-500" />;
    if (action.includes('Editó') || action.includes('Actualizó')) return <Edit className="h-4 w-4 text-blue-500" />;
    if (action.includes('Eliminó')) return <Trash2 className="h-4 w-4 text-red-500" />;
    if (action.includes('Completó')) return <CheckCircle className="h-4 w-4 text-green-500" />;
    
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getModuleIcon = (module) => {
    const moduleData = modules.find(m => m.value === module);
    if (moduleData) {
      const Icon = moduleData.icon;
      return <Icon className="h-4 w-4" />;
    }
    return <Database className="h-4 w-4" />;
  };

  const handleExportAudit = (format) => {
    const exportData = {
      filters,
      totalRecords: filteredLogs.length,
      exportDate: new Date().toLocaleString('es-PE'),
      logs: filteredLogs
    };

    // Simular descarga
    toast({
      title: "Exportando auditoría",
      description: `Generando reporte en formato ${format.toUpperCase()}. Se descargará en unos momentos.`,
    });

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

  return (
    <div className="space-y-6">
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

      {/* Tabla de registros */}
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
              {paginatedLogs.length === 0 ? (
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
                        {log.timestamp.split(' ')[0]}
                        <Clock className="h-4 w-4 text-stone-400 ml-2" />
                        {log.timestamp.split(' ')[1]}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <p className="text-sm text-stone-600 truncate">
                        {log.details.length > 50 ? log.details.substring(0, 50) + '...' : log.details}
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