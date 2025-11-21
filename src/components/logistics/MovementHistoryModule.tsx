import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToPanelButton } from '@/components/ui/back-to-panel-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Download, ArrowUp, ArrowDown } from 'lucide-react';
import { useLogistics } from '@/contexts/LogisticsContext';

export const MovementHistoryModule = () => {
  const { movements, inventory } = useLogistics();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');

  const filteredMovements = movements.filter(movement => {
    const matchesSearch = movement.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movement.userName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || movement.type === typeFilter;
    
    const matchesDate = !dateFilter || movement.timestamp.includes(dateFilter);
    
    return matchesSearch && matchesType && matchesDate;
  });

  const handlePrint = () => {
    const printContent = filteredMovements.map(movement => 
      `${movement.timestamp} | ${movement.type === 'in' ? 'INGRESO' : 'EGRESO'} | ${movement.itemName} | ${movement.quantity} | ${movement.userName} | ${movement.reason}`
    ).join('\n');
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Historial de Movimientos - ${new Date().toLocaleDateString()}</title></head>
          <body>
            <h1>Historial de Movimientos</h1>
            <p>Fecha: ${new Date().toLocaleDateString()}</p>
            <pre>${printContent}</pre>
          </body>
        </html>
      `);
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* <BackToPanelButton /> - Removido porque este módulo está dentro de LogisticsPanel */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Historial de Movimientos</h1>
          <p className="text-muted-foreground">Registro de todos los ingresos y egresos</p>
        </div>
        <Button onClick={handlePrint} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Exportar
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Producto, usuario, motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="in">Ingresos</SelectItem>
                  <SelectItem value="out">Egresos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input
                id="date"
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setDateFilter('');
              }}>
                Limpiar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movimientos ({filteredMovements.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Stock Anterior</TableHead>
                  <TableHead>Stock Nuevo</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Usuario</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMovements.map(movement => (
                  <TableRow key={movement.id}>
                    <TableCell>
                      {new Date(movement.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={movement.type === 'in' ? 'default' : 'destructive'} className="flex items-center w-fit">
                        {movement.type === 'in' ? (
                          <ArrowUp className="w-3 h-3 mr-1" />
                        ) : (
                          <ArrowDown className="w-3 h-3 mr-1" />
                        )}
                        {movement.type === 'in' ? 'Ingreso' : 'Egreso'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{movement.itemName}</div>
                        {movement.lot && (
                          <div className="text-xs text-muted-foreground">Lote: {movement.lot}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={movement.type === 'in' ? 'text-green-600' : 'text-red-600'}>
                        {movement.type === 'in' ? '+' : '-'}{movement.quantity}
                      </span>
                    </TableCell>
                    <TableCell>{movement.previousQuantity}</TableCell>
                    <TableCell>{movement.newQuantity}</TableCell>
                    <TableCell>{movement.reason}</TableCell>
                    <TableCell>{movement.userName}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};