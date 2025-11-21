import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToPanelButton } from '@/components/ui/back-to-panel-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Search, 
  Download, 
  Mail, 
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Clock,
  X
} from 'lucide-react';
import { useLogistics, PurchaseOrder, PurchaseOrderItem } from '@/contexts/LogisticsContext';
import { toast } from '@/hooks/use-toast';

export const PurchaseOrdersModule = () => {
  const { 
    inventory, 
    suppliers, 
    purchaseOrders, 
    isAdminMode,
    addPurchaseOrder, 
    updatePurchaseOrder, 
    deletePurchaseOrder 
  } = useLogistics();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [newOrderDialog, setNewOrderDialog] = useState(false);
  const [editOrderDialog, setEditOrderDialog] = useState(false);
  const [viewOrderDialog, setViewOrderDialog] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [autoOrderDialog, setAutoOrderDialog] = useState(false);

  // New order form
  const [newOrder, setNewOrder] = useState({
    supplier: '',
    items: [] as PurchaseOrderItem[],
    notes: ''
  });

  // Auto order items (low stock items)
  const lowStockItems = inventory.filter(item => item.currentQuantity <= item.minQuantity);

  // Filter orders
  const filteredOrders = purchaseOrders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Reset forms
  const resetNewOrderForm = () => {
    setNewOrder({
      supplier: '',
      items: [],
      notes: ''
    });
  };

  // Add item to order
  const addItemToOrder = () => {
    const newItem: PurchaseOrderItem = {
      itemId: '',
      itemName: '',
      quantity: 1,
      unitCost: 0,
      totalCost: 0
    };
    setNewOrder({
      ...newOrder,
      items: [...newOrder.items, newItem]
    });
  };

  // Update order item
  const updateOrderItem = (index: number, field: keyof PurchaseOrderItem, value: any) => {
    const updatedItems = [...newOrder.items];
    updatedItems[index] = { ...updatedItems[index], [field]: value };
    
    // Update total cost
    if (field === 'quantity' || field === 'unitCost') {
      updatedItems[index].totalCost = updatedItems[index].quantity * updatedItems[index].unitCost;
    }
    
    // Update item name if itemId changed
    if (field === 'itemId') {
      const item = inventory.find(inv => inv.id === value);
      if (item) {
        updatedItems[index].itemName = item.name;
        updatedItems[index].unitCost = item.cost;
        updatedItems[index].totalCost = updatedItems[index].quantity * item.cost;
      }
    }
    
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  // Remove item from order
  const removeOrderItem = (index: number) => {
    const updatedItems = newOrder.items.filter((_, i) => i !== index);
    setNewOrder({ ...newOrder, items: updatedItems });
  };

  // Calculate total
  const calculateTotal = (items: PurchaseOrderItem[]) => {
    return items.reduce((total, item) => total + item.totalCost, 0);
  };

  // Handle create order
  const handleCreateOrder = () => {
    if (!newOrder.supplier || newOrder.items.length === 0) {
      toast({
        title: "Error",
        description: "Selecciona un proveedor y agrega al menos un producto",
        variant: "destructive"
      });
      return;
    }

    const hasInvalidItems = newOrder.items.some(item => !item.itemId || item.quantity <= 0);
    if (hasInvalidItems) {
      toast({
        title: "Error",
        description: "Todos los productos deben tener cantidad válida",
        variant: "destructive"
      });
      return;
    }

    addPurchaseOrder({
      supplier: newOrder.supplier,
      status: 'draft',
      items: newOrder.items,
      totalAmount: calculateTotal(newOrder.items),
      createdBy: 'current_user',
      notes: newOrder.notes
    });

    toast({
      title: "Orden creada",
      description: "Orden de compra creada exitosamente",
    });

    setNewOrderDialog(false);
    resetNewOrderForm();
  };

  // Generate auto order
  const generateAutoOrder = () => {
    if (lowStockItems.length === 0) {
      toast({
        title: "Sin productos",
        description: "No hay productos con stock bajo",
      });
      return;
    }

    // Group by supplier
    const supplierGroups: { [key: string]: any[] } = {};
    
    lowStockItems.forEach(item => {
      item.suppliers.forEach(supplierId => {
        if (!supplierGroups[supplierId]) {
          supplierGroups[supplierId] = [];
        }
        supplierGroups[supplierId].push({
          itemId: item.id,
          itemName: item.name,
          quantity: item.maxQuantity - item.currentQuantity,
          unitCost: item.cost,
          totalCost: (item.maxQuantity - item.currentQuantity) * item.cost
        });
      });
    });

    // Create orders for each supplier
    Object.entries(supplierGroups).forEach(([supplierId, items]) => {
      addPurchaseOrder({
        supplier: supplierId,
        status: 'draft',
        items,
        totalAmount: calculateTotal(items),
        createdBy: 'current_user',
        notes: 'Orden automática generada por stock bajo'
      });
    });

    toast({
      title: "Órdenes generadas",
      description: `Se generaron ${Object.keys(supplierGroups).length} órdenes automáticas`,
    });

    setAutoOrderDialog(false);
  };

  // Get status info
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'draft':
        return { color: 'secondary', text: 'Borrador', icon: Edit };
      case 'sent':
        return { color: 'default', text: 'Enviada', icon: Mail };
      case 'confirmed':
        return { color: 'default', text: 'Confirmada', icon: CheckCircle };
      case 'received':
        return { color: 'default', text: 'Recibida', icon: CheckCircle };
      case 'cancelled':
        return { color: 'destructive', text: 'Cancelada', icon: X };
      default:
        return { color: 'secondary', text: status, icon: Clock };
    }
  };

  const getSupplierName = (supplierId: string) => {
    return suppliers.find(sup => sup.id === supplierId)?.name || supplierId;
  };

  // Send order by email
  const sendOrderByEmail = (order: PurchaseOrder) => {
    const supplier = suppliers.find(s => s.id === order.supplier);
    if (!supplier?.email) {
      toast({
        title: "Error",
        description: "El proveedor no tiene email configurado",
        variant: "destructive"
      });
      return;
    }

    // Simulate sending email
    const emailContent = `
      Orden de Compra: ${order.orderNumber}
      Proveedor: ${supplier.name}
      Fecha: ${new Date(order.createdAt).toLocaleDateString()}
      
      Productos:
      ${order.items.map(item => 
        `- ${item.itemName}: ${item.quantity} unidades x S/ ${item.unitCost.toFixed(2)} = S/ ${item.totalCost.toFixed(2)}`
      ).join('\n')}
      
      Total: S/ ${order.totalAmount.toFixed(2)}
      
      ${order.notes ? `Notas: ${order.notes}` : ''}
    `;

    console.log(`📧 Enviando orden a ${supplier.email}:`, emailContent);
    
    // Update order status
    updatePurchaseOrder({ ...order, status: 'sent' });
    
    toast({
      title: "Orden enviada",
      description: `Orden enviada a ${supplier.name} (${supplier.email})`,
    });
  };

  // Print order
  const printOrder = (order: PurchaseOrder) => {
    const supplier = suppliers.find(s => s.id === order.supplier);
    const printContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <h1>ORDEN DE COMPRA</h1>
        <p><strong>Número:</strong> ${order.orderNumber}</p>
        <p><strong>Fecha:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Proveedor:</strong> ${supplier?.name}</p>
        <p><strong>Contacto:</strong> ${supplier?.contact}</p>
        <p><strong>Email:</strong> ${supplier?.email}</p>
        <p><strong>Teléfono:</strong> ${supplier?.phone}</p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f3f4f6;">
              <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Producto</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Cantidad</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Precio Unit.</th>
              <th style="border: 1px solid #ddd; padding: 8px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr>
                <td style="border: 1px solid #ddd; padding: 8px;">${item.itemName}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">${item.quantity}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">S/ ${item.unitCost.toFixed(2)}</td>
                <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">S/ ${item.totalCost.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr style="background-color: #f3f4f6; font-weight: bold;">
              <td colspan="3" style="border: 1px solid #ddd; padding: 8px; text-align: right;">TOTAL:</td>
              <td style="border: 1px solid #ddd; padding: 8px; text-align: right;">S/ ${order.totalAmount.toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
        
        ${order.notes ? `<p><strong>Notas:</strong> ${order.notes}</p>` : ''}
        
        <div style="margin-top: 40px;">
          <p>_______________________</p>
          <p>Firma y Fecha</p>
        </div>
      </div>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Orden de Compra - ${order.orderNumber}</title></head>
          <body>${printContent}</body>
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
          <h1 className="text-2xl font-bold">Órdenes de Compra</h1>
          <p className="text-muted-foreground">Gestión de compras y proveedores</p>
        </div>
        <div className="flex gap-2">
          {lowStockItems.length > 0 && (
            <Dialog open={autoOrderDialog} onOpenChange={setAutoOrderDialog}>
              <DialogTrigger asChild>
                <Button variant="outline" className="border-destructive text-destructive">
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Auto-Orden ({lowStockItems.length})
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Generar Orden Automática</DialogTitle>
                  <DialogDescription>
                    Se generarán órdenes de compra para productos con stock bajo
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4">
                  <div className="text-sm">
                    <strong>Productos con stock bajo:</strong>
                    <ul className="mt-2 space-y-1">
                      {lowStockItems.map(item => (
                        <li key={item.id} className="flex justify-between">
                          <span>{item.name}</span>
                          <span className="text-destructive">
                            {item.currentQuantity}/{item.minQuantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setAutoOrderDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={generateAutoOrder}>
                    Generar Órdenes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          )}
          
          <Dialog open={newOrderDialog} onOpenChange={setNewOrderDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nueva Orden
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Nueva Orden de Compra</DialogTitle>
                <DialogDescription>
                  Crea una nueva orden de compra seleccionando proveedor y productos
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Supplier Selection */}
                <div className="space-y-2">
                  <Label htmlFor="supplier">Proveedor *</Label>
                  <Select value={newOrder.supplier} onValueChange={(value) => setNewOrder({...newOrder, supplier: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar proveedor" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name} - {supplier.contact}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Items */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label>Productos</Label>
                    <Button type="button" onClick={addItemToOrder} size="sm">
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Producto
                    </Button>
                  </div>
                  
                  {newOrder.items.length > 0 && (
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Producto</TableHead>
                            <TableHead>Cantidad</TableHead>
                            <TableHead>Precio Unit.</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead></TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {newOrder.items.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <Select 
                                  value={item.itemId} 
                                  onValueChange={(value) => updateOrderItem(index, 'itemId', value)}
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccionar producto" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {inventory.map(invItem => (
                                      <SelectItem key={invItem.id} value={invItem.id}>
                                        {invItem.name} (Stock: {invItem.currentQuantity})
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  min="1"
                                  value={item.quantity}
                                  onChange={(e) => updateOrderItem(index, 'quantity', parseInt(e.target.value) || 0)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  type="number"
                                  step="0.01"
                                  value={item.unitCost}
                                  onChange={(e) => updateOrderItem(index, 'unitCost', parseFloat(e.target.value) || 0)}
                                />
                              </TableCell>
                              <TableCell>
                                S/ {item.totalCost.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button
                                  type="button"
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => removeOrderItem(index)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                      <div className="p-4 bg-muted">
                        <div className="text-right font-bold">
                          Total: S/ {calculateTotal(newOrder.items).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Observaciones adicionales..."
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder({...newOrder, notes: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewOrderDialog(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleCreateOrder}>
                  Crear Orden
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar orden</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Número de orden, proveedor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status-filter">Estado</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los estados</SelectItem>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="sent">Enviada</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="received">Recibida</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-end">
              <Button variant="outline" onClick={() => {
                setSearchTerm('');
                setStatusFilter('all');
              }}>
                Limpiar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Compra ({filteredOrders.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Orden</TableHead>
                  <TableHead>Proveedor</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map(order => {
                  const status = getStatusInfo(order.status);
                  const StatusIcon = status.icon;
                  
                  return (
                    <TableRow key={order.id}>
                      <TableCell>
                        <div className="font-medium">{order.orderNumber}</div>
                      </TableCell>
                      <TableCell>
                        {getSupplierName(order.supplier)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={status.color as any} className="flex items-center w-fit">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.text}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {order.items.length} productos
                      </TableCell>
                      <TableCell>
                        S/ {order.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(order.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedOrder(order);
                              setViewOrderDialog(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => printOrder(order)}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          
                          {(order.status === 'draft' || order.status === 'confirmed') && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendOrderByEmail(order)}
                            >
                              <Mail className="w-4 h-4" />
                            </Button>
                          )}
                          
                          {isAdminMode && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => {
                                if (confirm('¿Está seguro de eliminar esta orden?')) {
                                  deletePurchaseOrder(order.id);
                                  toast({
                                    title: "Orden eliminada",
                                    description: "La orden de compra ha sido eliminada",
                                  });
                                }
                              }}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
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

      {/* View Order Dialog */}
      <Dialog open={viewOrderDialog} onOpenChange={setViewOrderDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Orden de Compra - {selectedOrder?.orderNumber}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Proveedor</Label>
                  <p>{getSupplierName(selectedOrder.supplier)}</p>
                </div>
                <div>
                  <Label>Estado</Label>
                  <div className="flex items-center">
                    {(() => {
                      const status = getStatusInfo(selectedOrder.status);
                      const StatusIcon = status.icon;
                      return (
                        <Badge variant={status.color as any} className="flex items-center w-fit">
                          <StatusIcon className="w-3 h-3 mr-1" />
                          {status.text}
                        </Badge>
                      );
                    })()}
                  </div>
                </div>
                <div>
                  <Label>Fecha de Creación</Label>
                  <p>{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label>Total</Label>
                  <p className="font-bold">S/ {selectedOrder.totalAmount.toFixed(2)}</p>
                </div>
              </div>
              
              <div>
                <Label>Productos</Label>
                <Table className="mt-2">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Producto</TableHead>
                      <TableHead>Cantidad</TableHead>
                      <TableHead>Precio Unit.</TableHead>
                      <TableHead>Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedOrder.items.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell>{item.itemName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>S/ {item.unitCost.toFixed(2)}</TableCell>
                        <TableCell>S/ {item.totalCost.toFixed(2)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {selectedOrder.notes && (
                <div>
                  <Label>Notas</Label>
                  <p className="mt-1">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          )}
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setViewOrderDialog(false)}>
              Cerrar
            </Button>
            {selectedOrder && (
              <Button onClick={() => printOrder(selectedOrder)}>
                <Download className="w-4 h-4 mr-2" />
                Imprimir
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};