import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToPanelButton } from '@/components/ui/back-to-panel-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Download, 
  AlertTriangle, 
  MinusCircle, 
  PlusCircle,
  Trash2,
  Edit,
  Thermometer
} from 'lucide-react';
import { useLogistics, InventoryItem } from '@/contexts/LogisticsContext';
import { toast } from '@/hooks/use-toast';

export const InventoryModule = () => {
  const { 
    inventory, 
    categories, 
    suppliers, 
    alerts,
    isAdminMode, 
    addInventoryItem, 
    updateInventoryItem, 
    deleteInventoryItem,
    addMovement 
  } = useLogistics();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newItemDialog, setNewItemDialog] = useState(false);
  const [editItemDialog, setEditItemDialog] = useState(false);
  const [movementDialog, setMovementDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showExpired, setShowExpired] = useState(true);

  // New item form
  const [newItem, setNewItem] = useState({
    name: '',
    category: '',
    currentQuantity: 0,
    minQuantity: 0,
    maxQuantity: 0,
    needsRefrigeration: false,
    suppliers: [] as string[],
    expirationDate: '',
    cost: 0,
    location: '',
    barcode: '',
    lot: ''
  });

  // Movement form
  const [movement, setMovement] = useState({
    type: 'in' as 'in' | 'out',
    quantity: 0,
    reason: '',
    supplier: '',
    lot: '',
    expirationDate: '',
    notes: ''
  });

  // Filter inventory
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.lot?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    
    let matchesStatus = true;
    if (statusFilter === 'low_stock') {
      matchesStatus = item.currentQuantity <= item.minQuantity;
    } else if (statusFilter === 'out_of_stock') {
      matchesStatus = item.currentQuantity === 0;
    } else if (statusFilter === 'expired') {
      if (item.expirationDate) {
        const expDate = new Date(item.expirationDate);
        matchesStatus = expDate < new Date();
      } else {
        matchesStatus = false;
      }
    } else if (statusFilter === 'expiring_soon') {
      if (item.expirationDate) {
        const expDate = new Date(item.expirationDate);
        const daysUntilExp = Math.ceil((expDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        matchesStatus = daysUntilExp <= 7 && daysUntilExp >= 0;
      } else {
        matchesStatus = false;
      }
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Reset forms
  const resetNewItemForm = () => {
    setNewItem({
      name: '',
      category: '',
      currentQuantity: 0,
      minQuantity: 0,
      maxQuantity: 0,
      needsRefrigeration: false,
      suppliers: [],
      expirationDate: '',
      cost: 0,
      location: '',
      barcode: '',
      lot: ''
    });
  };

  const resetMovementForm = () => {
    setMovement({
      type: 'in',
      quantity: 0,
      reason: '',
      supplier: '',
      lot: '',
      expirationDate: '',
      notes: ''
    });
  };

  // Handle new item
  const handleAddItem = () => {
    if (!newItem.name || !newItem.category || newItem.minQuantity < 0 || newItem.maxQuantity <= newItem.minQuantity) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos obligatorios correctamente",
        variant: "destructive"
      });
      return;
    }

    addInventoryItem(newItem);
    toast({
      title: "Producto agregado",
      description: `${newItem.name} ha sido agregado al inventario`,
    });
    
    setNewItemDialog(false);
    resetNewItemForm();
  };

  // Handle movement
  const handleMovement = () => {
    if (!selectedItem || movement.quantity <= 0) {
      toast({
        title: "Error",
        description: "Datos de movimiento inválidos",
        variant: "destructive"
      });
      return;
    }

    const newQuantity = movement.type === 'in' 
      ? selectedItem.currentQuantity + movement.quantity
      : selectedItem.currentQuantity - movement.quantity;

    if (newQuantity < 0) {
      toast({
        title: "Error",
        description: "No hay suficiente stock para realizar esta salida",
        variant: "destructive"
      });
      return;
    }

    // Check if removing old products first
    if (movement.type === 'out' && selectedItem.expirationDate) {
      const itemExpDate = new Date(selectedItem.expirationDate);
      const hasNewerItems = inventory.some(item => 
        item.name === selectedItem.name && 
        item.expirationDate && 
        new Date(item.expirationDate) > itemExpDate &&
        item.currentQuantity > 0
      );

      if (hasNewerItems) {
        toast({
          title: "⚠️ Advertencia - FIFO",
          description: "Verifique que está sacando primero los productos más antiguos",
          variant: "destructive"
        });
      }
    }

    addMovement({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      type: movement.type,
      quantity: movement.quantity,
      previousQuantity: selectedItem.currentQuantity,
      newQuantity,
      reason: movement.reason,
      supplier: movement.supplier,
      lot: movement.lot,
      expirationDate: movement.expirationDate,
      userId: 'current_user',
      userName: 'Usuario Actual',
      notes: movement.notes
    });

    toast({
      title: "Movimiento registrado",
      description: `${movement.type === 'in' ? 'Ingreso' : 'Egreso'} de ${movement.quantity} unidades de ${selectedItem.name}`,
    });

    setMovementDialog(false);
    resetMovementForm();
    setSelectedItem(null);
  };

  // Get status info
  const getItemStatus = (item: InventoryItem) => {
    if (item.currentQuantity === 0) {
      return { status: 'out_of_stock', color: 'destructive', text: 'Agotado' };
    }
    if (item.currentQuantity <= item.minQuantity) {
      return { status: 'low_stock', color: 'destructive', text: 'Stock Bajo' };
    }
    if (item.currentQuantity >= item.maxQuantity) {
      return { status: 'high_stock', color: 'default', text: 'Stock Alto' };
    }
    return { status: 'normal', color: 'default', text: 'Normal' };
  };

  // Get expiration status
  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;
    
    const expDate = new Date(expirationDate);
    const now = new Date();
    const daysUntilExp = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExp < 0) {
      return { status: 'expired', color: 'destructive', text: 'Vencido' };
    }
    if (daysUntilExp <= 3) {
      return { status: 'expiring', color: 'destructive', text: `Vence en ${daysUntilExp}d` };
    }
    if (daysUntilExp <= 7) {
      return { status: 'expiring_soon', color: 'secondary', text: `Vence en ${daysUntilExp}d` };
    }
    return null;
  };

  const getCategoryName = (categoryId: string) => {
    return categories.find(cat => cat.id === categoryId)?.name || categoryId;
  };

  const getSupplierNames = (supplierIds: string[]) => {
    return supplierIds.map(id => 
      suppliers.find(sup => sup.id === id)?.name || id
    ).join(', ');
  };

  // Print functionality
  const handlePrint = () => {
    const printContent = filteredInventory.map(item => {
      const status = getItemStatus(item);
      const expStatus = getExpirationStatus(item.expirationDate);
      return `${item.name} | ${item.currentQuantity}/${item.minQuantity}-${item.maxQuantity} | ${status.text} | ${getCategoryName(item.category)}`;
    }).join('\n');
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Inventario - ${new Date().toLocaleDateString()}</title></head>
          <body>
            <h1>Reporte de Inventario</h1>
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestión de Inventario</h1>
          <p className="text-muted-foreground">Control de productos e insumos en almacén</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handlePrint} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Imprimir
          </Button>
          <Dialog open={newItemDialog} onOpenChange={setNewItemDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Producto
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Producto</DialogTitle>
                <DialogDescription>
                  Complete todos los campos para agregar un producto al inventario
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    placeholder="Ej: Harina Integral"
                    value={newItem.name}
                    onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Categoría *</Label>
                  <Select value={newItem.category} onValueChange={(value) => setNewItem({...newItem, category: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentQuantity">Cantidad Inicial</Label>
                  <Input
                    id="currentQuantity"
                    type="number"
                    value={newItem.currentQuantity}
                    onChange={(e) => setNewItem({...newItem, currentQuantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cost">Costo Unitario</Label>
                  <Input
                    id="cost"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.cost}
                    onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="minQuantity">Cantidad Mínima *</Label>
                  <Input
                    id="minQuantity"
                    type="number"
                    placeholder="Stock mínimo de alerta"
                    value={newItem.minQuantity}
                    onChange={(e) => setNewItem({...newItem, minQuantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="maxQuantity">Cantidad Máxima *</Label>
                  <Input
                    id="maxQuantity"
                    type="number"
                    placeholder="Capacidad máxima"
                    value={newItem.maxQuantity}
                    onChange={(e) => setNewItem({...newItem, maxQuantity: parseInt(e.target.value) || 0})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="location">Ubicación</Label>
                  <Input
                    id="location"
                    placeholder="Ej: Almacén A - Estante 1"
                    value={newItem.location}
                    onChange={(e) => setNewItem({...newItem, location: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="lot">Lote</Label>
                  <Input
                    id="lot"
                    placeholder="Número de lote"
                    value={newItem.lot}
                    onChange={(e) => setNewItem({...newItem, lot: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="expirationDate">Fecha de Vencimiento</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={newItem.expirationDate}
                    onChange={(e) => setNewItem({...newItem, expirationDate: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <Input
                    id="barcode"
                    placeholder="Código de barras/QR"
                    value={newItem.barcode}
                    onChange={(e) => setNewItem({...newItem, barcode: e.target.value})}
                  />
                </div>
                
                <div className="col-span-full space-y-2">
                  <Label>Proveedores</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {suppliers.map(supplier => (
                      <div key={supplier.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={supplier.id}
                          checked={newItem.suppliers.includes(supplier.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setNewItem({...newItem, suppliers: [...newItem.suppliers, supplier.id]});
                            } else {
                              setNewItem({...newItem, suppliers: newItem.suppliers.filter(s => s !== supplier.id)});
                            }
                          }}
                        />
                        <Label htmlFor={supplier.id} className="text-sm">{supplier.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="col-span-full">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="refrigeration"
                      checked={newItem.needsRefrigeration}
                      onCheckedChange={(checked) => setNewItem({...newItem, needsRefrigeration: checked as boolean})}
                    />
                    <Label htmlFor="refrigeration">Necesita refrigeración</Label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6">
                <Button variant="outline" onClick={() => setNewItemDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleAddItem}>
                  Agregar Producto
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Alerts Summary */}
      {alerts.length > 0 && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Alertas Activas ({alerts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {alerts.slice(0, 6).map(alert => (
                <div key={alert.id} className="text-sm p-2 bg-destructive/10 rounded border">
                  <strong>{alert.itemName}</strong>: {alert.message}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar producto</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nombre, ubicación, lote..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="category-filter">Categoría</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas las categorías</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="low_stock">Stock bajo</SelectItem>
                  <SelectItem value="out_of_stock">Agotado</SelectItem>
                  <SelectItem value="expiring_soon">Por vencer</SelectItem>
                  <SelectItem value="expired">Vencido</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setStatusFilter('all');
              }}>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventario ({filteredInventory.length} productos)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Vencimiento</TableHead>
                  <TableHead>Proveedores</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map(item => {
                  const status = getItemStatus(item);
                  const expStatus = getExpirationStatus(item.expirationDate);
                  
                  return (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium flex items-center">
                            {item.name}
                            {item.needsRefrigeration && (
                              <Thermometer className="w-4 h-4 ml-2 text-blue-500" />
                            )}
                          </div>
                          {item.lot && (
                            <div className="text-xs text-muted-foreground">Lote: {item.lot}</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {getCategoryName(item.category)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">
                            {item.currentQuantity}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Min: {item.minQuantity} | Max: {item.maxQuantity}
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                item.currentQuantity <= item.minQuantity ? 'bg-red-500' :
                                item.currentQuantity >= item.maxQuantity ? 'bg-green-500' :
                                'bg-blue-500'
                              }`}
                              style={{ 
                                width: `${Math.min(100, (item.currentQuantity / item.maxQuantity) * 100)}%` 
                              }}
                            />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.color as any}>
                          {status.text}
                        </Badge>
                        {expStatus && (
                          <Badge variant={expStatus.color as any} className="ml-1">
                            {expStatus.text}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.location}
                      </TableCell>
                      <TableCell className="text-sm">
                        {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {getSupplierNames(item.suppliers)}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item);
                              setMovement({...movement, type: 'in'});
                              setMovementDialog(true);
                            }}
                          >
                            <PlusCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedItem(item);
                              setMovement({...movement, type: 'out'});
                              setMovementDialog(true);
                            }}
                            disabled={item.currentQuantity === 0}
                          >
                            <MinusCircle className="w-4 h-4" />
                          </Button>
                          {isAdminMode && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedItem(item);
                                  setEditItemDialog(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => {
                                  if (confirm('¿Está seguro de eliminar este producto?')) {
                                    deleteInventoryItem(item.id);
                                    toast({
                                      title: "Producto eliminado",
                                      description: `${item.name} ha sido eliminado del inventario`,
                                    });
                                  }
                                }}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Movement Dialog */}
      <Dialog open={movementDialog} onOpenChange={setMovementDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {movement.type === 'in' ? 'Ingreso' : 'Egreso'} de Producto
            </DialogTitle>
            <DialogDescription>
              {selectedItem?.name} - Stock actual: {selectedItem?.currentQuantity}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={movement.quantity}
                onChange={(e) => setMovement({...movement, quantity: parseInt(e.target.value) || 0})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo</Label>
              <Select value={movement.reason} onValueChange={(value) => setMovement({...movement, reason: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar motivo" />
                </SelectTrigger>
                <SelectContent>
                  {movement.type === 'in' ? (
                    <>
                      <SelectItem value="compra">Compra</SelectItem>
                      <SelectItem value="devolucion">Devolución</SelectItem>
                      <SelectItem value="ajuste_positivo">Ajuste de inventario (+)</SelectItem>
                      <SelectItem value="donacion">Donación recibida</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="produccion">Uso en producción</SelectItem>
                      <SelectItem value="venta">Venta directa</SelectItem>
                      <SelectItem value="merma">Merma/Desperdicio</SelectItem>
                      <SelectItem value="vencimiento">Producto vencido</SelectItem>
                      <SelectItem value="ajuste_negativo">Ajuste de inventario (-)</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            
            {movement.type === 'in' && (
              <div className="space-y-2">
                <Label htmlFor="supplier">Proveedor</Label>
                <Select value={movement.supplier} onValueChange={(value) => setMovement({...movement, supplier: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers.map(supplier => (
                      <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            {movement.type === 'in' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="movementLot">Lote</Label>
                  <Input
                    id="movementLot"
                    placeholder="Número de lote"
                    value={movement.lot}
                    onChange={(e) => setMovement({...movement, lot: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="movementExpiration">Fecha de Vencimiento</Label>
                  <Input
                    id="movementExpiration"
                    type="date"
                    value={movement.expirationDate}
                    onChange={(e) => setMovement({...movement, expirationDate: e.target.value})}
                  />
                </div>
              </>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notas adicionales</Label>
              <Textarea
                id="notes"
                placeholder="Observaciones sobre el movimiento..."
                value={movement.notes}
                onChange={(e) => setMovement({...movement, notes: e.target.value})}
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMovementDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleMovement}>
              Registrar {movement.type === 'in' ? 'Ingreso' : 'Egreso'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};