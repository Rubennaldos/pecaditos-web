import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BackToPanelButton } from '@/components/ui/back-to-panel-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { useLogistics } from '@/contexts/LogisticsContext';
import { toast } from '@/hooks/use-toast';

export const SettingsModule = () => {
  const { categories, suppliers, isAdminMode, addCategory, updateCategory, deleteCategory, addSupplier, updateSupplier, deleteSupplier } = useLogistics();
  
  const [newCategoryDialog, setNewCategoryDialog] = useState(false);
  const [newSupplierDialog, setNewSupplierDialog] = useState(false);
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color: '#3B82F6'
  });
  
  const [newSupplier, setNewSupplier] = useState({
    name: '',
    contact: '',
    email: '',
    phone: '',
    address: '',
    categories: [] as string[]
  });

  const handleAddCategory = () => {
    if (!newCategory.name) {
      toast({ title: "Error", description: "El nombre es obligatorio", variant: "destructive" });
      return;
    }
    
    addCategory(newCategory);
    toast({ title: "Categoría agregada", description: `${newCategory.name} ha sido creada` });
    setNewCategoryDialog(false);
    setNewCategory({ name: '', description: '', color: '#3B82F6' });
  };

  const handleAddSupplier = () => {
    if (!newSupplier.name || !newSupplier.contact) {
      toast({ title: "Error", description: "Nombre y contacto son obligatorios", variant: "destructive" });
      return;
    }
    
    addSupplier(newSupplier);
    toast({ title: "Proveedor agregado", description: `${newSupplier.name} ha sido creado` });
    setNewSupplierDialog(false);
    setNewSupplier({ name: '', contact: '', email: '', phone: '', address: '', categories: [] });
  };

  return (
    <div className="space-y-6">
      {/* <BackToPanelButton /> - Removido porque este módulo está dentro de LogisticsPanel */}
      <div>
        <h1 className="text-2xl font-bold">Configuración del Sistema</h1>
        <p className="text-muted-foreground">Gestión de categorías, proveedores y configuraciones</p>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Categorías de Productos</CardTitle>
          <Dialog open={newCategoryDialog} onOpenChange={setNewCategoryDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Categoría
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Categoría</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="catName">Nombre *</Label>
                  <Input
                    id="catName"
                    value={newCategory.name}
                    onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catDesc">Descripción</Label>
                  <Textarea
                    id="catDesc"
                    value={newCategory.description}
                    onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="catColor">Color</Label>
                  <Input
                    id="catColor"
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewCategoryDialog(false)}>Cancelar</Button>
                <Button onClick={handleAddCategory}>Agregar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Color</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(category => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.color}
                    </div>
                  </TableCell>
                  <TableCell>
                    {isAdminMode && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            if (confirm('¿Eliminar categoría?')) {
                              deleteCategory(category.id);
                              toast({ title: "Categoría eliminada" });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Suppliers */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Proveedores</CardTitle>
          <Dialog open={newSupplierDialog} onOpenChange={setNewSupplierDialog}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Proveedor
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Proveedor</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="supName">Nombre *</Label>
                    <Input
                      id="supName"
                      value={newSupplier.name}
                      onChange={(e) => setNewSupplier({...newSupplier, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supContact">Contacto *</Label>
                    <Input
                      id="supContact"
                      value={newSupplier.contact}
                      onChange={(e) => setNewSupplier({...newSupplier, contact: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supEmail">Email</Label>
                    <Input
                      id="supEmail"
                      type="email"
                      value={newSupplier.email}
                      onChange={(e) => setNewSupplier({...newSupplier, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supPhone">Teléfono</Label>
                    <Input
                      id="supPhone"
                      value={newSupplier.phone}
                      onChange={(e) => setNewSupplier({...newSupplier, phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supAddress">Dirección</Label>
                  <Textarea
                    id="supAddress"
                    value={newSupplier.address}
                    onChange={(e) => setNewSupplier({...newSupplier, address: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setNewSupplierDialog(false)}>Cancelar</Button>
                <Button onClick={handleAddSupplier}>Agregar</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map(supplier => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contact}</TableCell>
                  <TableCell>{supplier.email}</TableCell>
                  <TableCell>{supplier.phone}</TableCell>
                  <TableCell>
                    {isAdminMode && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => {
                            if (confirm('¿Eliminar proveedor?')) {
                              deleteSupplier(supplier.id);
                              toast({ title: "Proveedor eliminado" });
                            }
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};