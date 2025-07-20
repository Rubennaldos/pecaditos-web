import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Edit, Trash2, Plus, Save, X, Upload, Package, Settings, Image, DollarSign, Tag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WholesaleProduct {
  id: string;
  name: string;
  price: number;
  wholesalePrice: number;
  description: string;
  image: string;
  category: string;
  stock: number;
  minOrder: number;
  discount: number;
  isActive: boolean;
}

interface EditingProduct extends WholesaleProduct {
  isEditing?: boolean;
  isNew?: boolean;
}

interface WholesaleConfig {
  minOrderAmount: number;
  freeShippingThreshold: number;
  bulkDiscounts: Array<{
    minQuantity: number;
    discount: number;
  }>;
  termsAndConditions: string;
  welcomeMessage: string;
}

export const WholesaleAdminModule = () => {
  const { toast } = useToast();
  
  const [products, setProducts] = useState<EditingProduct[]>([
    {
      id: '1',
      name: 'Alfajor de Chocolate Premium',
      price: 4.50,
      wholesalePrice: 3.20,
      description: 'Delicioso alfajor con cobertura de chocolate',
      image: '/placeholder.svg',
      category: 'chocolate',
      stock: 100,
      minOrder: 6,
      discount: 25,
      isActive: true
    },
    {
      id: '2',
      name: 'Alfajor de Dulce de Leche',
      price: 5.00,
      wholesalePrice: 3.50,
      description: 'Tradicional alfajor relleno de dulce de leche',
      image: '/placeholder.svg',
      category: 'dulce-leche',
      stock: 150,
      minOrder: 6,
      discount: 20,
      isActive: true
    }
  ]);
  
  const [config, setConfig] = useState<WholesaleConfig>({
    minOrderAmount: 300,
    freeShippingThreshold: 500,
    bulkDiscounts: [
      { minQuantity: 6, discount: 10 },
      { minQuantity: 12, discount: 15 },
      { minQuantity: 24, discount: 25 }
    ],
    termsAndConditions: 'Condiciones mayoristas aplicables...',
    welcomeMessage: '¡Bienvenido al portal mayorista! Descuentos especiales disponibles.'
  });
  
  const [filter, setFilter] = useState<string>('todas');

  const handleEdit = (productId: string) => {
    setProducts(products.map(p => 
      p.id === productId ? { ...p, isEditing: true } : { ...p, isEditing: false }
    ));
  };

  const handleSave = (productId: string, updatedData: Partial<WholesaleProduct>) => {
    setProducts(products.map(p => 
      p.id === productId 
        ? { ...p, ...updatedData, isEditing: false, isNew: false }
        : p
    ));
    toast({
      title: "Producto actualizado",
      description: "Los cambios se han guardado correctamente.",
    });
  };

  const handleCancel = (productId: string) => {
    setProducts(products.map(p => {
      if (p.id === productId) {
        if (p.isNew) {
          return null; // Will be filtered out
        }
        return { ...p, isEditing: false };
      }
      return p;
    }).filter(Boolean) as EditingProduct[]);
  };

  const handleDelete = (productId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      setProducts(products.filter(p => p.id !== productId));
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del catálogo.",
      });
    }
  };

  const handleAddNew = () => {
    const newProduct: EditingProduct = {
      id: `new-${Date.now()}`,
      name: '',
      price: 0,
      wholesalePrice: 0,
      description: '',
      image: '/placeholder.svg',
      category: 'chocolate',
      stock: 0,
      minOrder: 6,
      discount: 0,
      isActive: true,
      isEditing: true,
      isNew: true
    };
    setProducts([newProduct, ...products]);
  };

  const categories = [
    { value: 'todas', label: 'Todas las categorías' },
    { value: 'chocolate', label: 'Chocolate' },
    { value: 'dulce-leche', label: 'Dulce de leche' },
    { value: 'frutas', label: 'Frutas' },
    { value: 'especiales', label: 'Especiales' }
  ];

  const filteredProducts = filter === 'todas' 
    ? products 
    : products.filter(p => p.category === filter);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">Administración Portal Mayorista</h1>
          <p className="text-stone-600">Control total del catálogo y configuración mayorista</p>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Catálogo
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Precios
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        <TabsContent value="catalog" className="space-y-4">
          <div className="flex justify-between items-center">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button onClick={handleAddNew} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Agregar Producto
            </Button>
          </div>

          <div className="grid gap-4">
            {filteredProducts.map((product) => (
              <ProductEditCard
                key={product.id}
                product={product}
                onEdit={() => handleEdit(product.id)}
                onSave={(data) => handleSave(product.id, data)}
                onCancel={() => handleCancel(product.id)}
                onDelete={() => handleDelete(product.id)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="pricing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Configuración de Precios Mayoristas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Pedido Mínimo (S/)</Label>
                  <Input
                    type="number"
                    value={config.minOrderAmount}
                    onChange={(e) => setConfig({
                      ...config,
                      minOrderAmount: parseFloat(e.target.value)
                    })}
                  />
                </div>
                <div>
                  <Label>Envío Gratis desde (S/)</Label>
                  <Input
                    type="number"
                    value={config.freeShippingThreshold}
                    onChange={(e) => setConfig({
                      ...config,
                      freeShippingThreshold: parseFloat(e.target.value)
                    })}
                  />
                </div>
              </div>

              <div>
                <Label>Descuentos por Volumen</Label>
                <div className="space-y-2 mt-2">
                  {config.bulkDiscounts.map((discount, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <Input
                        placeholder="Min. cantidad"
                        type="number"
                        value={discount.minQuantity}
                        onChange={(e) => {
                          const newDiscounts = [...config.bulkDiscounts];
                          newDiscounts[index].minQuantity = parseInt(e.target.value);
                          setConfig({ ...config, bulkDiscounts: newDiscounts });
                        }}
                      />
                      <Input
                        placeholder="% Descuento"
                        type="number"
                        value={discount.discount}
                        onChange={(e) => {
                          const newDiscounts = [...config.bulkDiscounts];
                          newDiscounts[index].discount = parseInt(e.target.value);
                          setConfig({ ...config, bulkDiscounts: newDiscounts });
                        }}
                      />
                      <span className="text-sm text-stone-600">%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuración General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Mensaje de Bienvenida</Label>
                <Textarea
                  value={config.welcomeMessage}
                  onChange={(e) => setConfig({
                    ...config,
                    welcomeMessage: e.target.value
                  })}
                  rows={3}
                />
              </div>

              <div>
                <Label>Términos y Condiciones</Label>
                <Textarea
                  value={config.termsAndConditions}
                  onChange={(e) => setConfig({
                    ...config,
                    termsAndConditions: e.target.value
                  })}
                  rows={6}
                />
              </div>

              <Button 
                onClick={() => {
                  toast({
                    title: "Configuración guardada",
                    description: "Los cambios han sido aplicados exitosamente.",
                  });
                }}
                className="w-full"
              >
                Guardar Configuración
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Component for individual product cards
interface ProductEditCardProps {
  product: EditingProduct;
  onEdit: () => void;
  onSave: (data: Partial<WholesaleProduct>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const ProductEditCard = ({ product, onEdit, onSave, onCancel, onDelete }: ProductEditCardProps) => {
  const [editData, setEditData] = useState(product);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setEditData({ ...editData, image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  if (product.isEditing) {
    return (
      <Card className="border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {product.isNew ? 'Nuevo Producto' : 'Editando Producto'}
            </span>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => onSave(editData)}>
                <Save className="h-4 w-4 mr-1" />
                Guardar
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre del Producto</Label>
              <Input
                id="name"
                value={editData.name}
                onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                placeholder="Nombre del producto"
              />
            </div>

            <div>
              <Label htmlFor="category">Categoría</Label>
              <Select 
                value={editData.category} 
                onValueChange={(value) => setEditData({ ...editData, category: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chocolate">Chocolate</SelectItem>
                  <SelectItem value="dulce-leche">Dulce de leche</SelectItem>
                  <SelectItem value="frutas">Frutas</SelectItem>
                  <SelectItem value="especiales">Especiales</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={editData.description}
                onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                placeholder="Descripción del producto"
                rows={3}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="active"
                checked={editData.isActive}
                onCheckedChange={(checked) => setEditData({ ...editData, isActive: checked })}
              />
              <Label htmlFor="active">Producto activo</Label>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="image">Imagen del Producto</Label>
              <div className="space-y-2">
                <img 
                  src={editData.image} 
                  alt="Preview"
                  className="w-full h-32 object-cover rounded border"
                />
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="price">Precio Minorista (S/)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={editData.price}
                  onChange={(e) => setEditData({ ...editData, price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="wholesalePrice">Precio Mayorista (S/)</Label>
                <Input
                  id="wholesalePrice"
                  type="number"
                  step="0.01"
                  value={editData.wholesalePrice}
                  onChange={(e) => setEditData({ ...editData, wholesalePrice: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="stock">Stock</Label>
                <Input
                  id="stock"
                  type="number"
                  value={editData.stock}
                  onChange={(e) => setEditData({ ...editData, stock: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="minOrder">Pedido Mín.</Label>
                <Input
                  id="minOrder"
                  type="number"
                  value={editData.minOrder}
                  onChange={(e) => setEditData({ ...editData, minOrder: parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="discount">Descuento (%)</Label>
              <Input
                id="discount"
                type="number"
                value={editData.discount}
                onChange={(e) => setEditData({ ...editData, discount: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img 
            src={product.image} 
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg"
          />
          
          <div className="flex-1">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-stone-800">{product.name}</h3>
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="outline" onClick={onDelete}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <p className="text-sm text-stone-600 mb-2">{product.description}</p>
            
            <div className="flex gap-4 text-sm">
              <span>Precio: <strong>S/ {product.price.toFixed(2)}</strong></span>
              <span>Mayorista: <strong>S/ {product.wholesalePrice.toFixed(2)}</strong></span>
              <span>Stock: <strong>{product.stock}</strong></span>
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};