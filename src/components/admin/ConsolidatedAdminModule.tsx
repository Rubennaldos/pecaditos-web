import { useState } from 'react';
import { 
  Settings, 
  Package, 
  DollarSign, 
  Users,
  Tag,
  Edit3,
  Save,
  Plus,
  Trash2,
  Upload
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { mockProducts } from '@/data/mockData';

/**
 * MÓDULO CONSOLIDADO DE ADMINISTRACIÓN GENERAL
 * 
 * Integra en una sola interfaz:
 * 1. Editor de Catálogo Mayorista
 * 2. Portal Mayorista (configuración)
 * 3. Promociones
 * 4. Gestión de Sedes/Puntos de Venta
 * 
 * Diseño simplificado y sin redundancia
 */

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  wholesalePrice: number;
  image: string;
  category: string;
  stock: number;
  minOrder: number;
  isActive: boolean;
  isEditing?: boolean;
}

interface SalesLocation {
  id: string;
  name: string;
  address: string;
  phone: string;
  hours: string;
  type: 'tienda' | 'distribuidor' | 'punto_venta';
  isActive: boolean;
  isEditing?: boolean;
}

interface Promotion {
  id: string;
  title: string;
  description: string;
  discount: number;
  validUntil: string;
  products: string[];
  isActive: boolean;
}

export const ConsolidatedAdminModule = () => {
  const { toast } = useToast();
  
  // Estados para productos - usar datos reales del mockData
  const [products, setProducts] = useState<Product[]>(
    mockProducts.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      wholesalePrice: product.wholesalePrice || product.price * 0.75, // 25% descuento mayorista por defecto
      image: product.image,
      category: product.category,
      stock: 100, // Stock inicial
      minOrder: 6, // Cantidad mínima para mayoristas
      isActive: product.available
    }))
  );

  // Estados para promociones
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      title: 'Descuento Enero 2024',
      description: '15% adicional en pedidos mayores a S/ 500',
      discount: 15,
      validUntil: '2024-01-31',
      products: ['prod_001'],
      isActive: true
    }
  ]);

  // Configuración general
  const [config, setConfig] = useState({
    minOrderAmount: 300,
    freeShippingThreshold: 500,
    welcomeMessage: '¡Bienvenido al portal mayorista! Descuentos especiales disponibles.',
    termsAndConditions: 'Condiciones mayoristas aplicables...'
  });

  // FUNCIONES PARA PRODUCTOS
  const handleEditProduct = (productId: string) => {
    setProducts(prev => prev.map(p => 
      p.id === productId ? { ...p, isEditing: true } : { ...p, isEditing: false }
    ));
  };

  const handleSaveProduct = (productId: string, updatedData: Partial<Product>) => {
    setProducts(prev => prev.map(p =>
      p.id === productId ? { ...p, ...updatedData, isEditing: false } : p
    ));
    toast({
      title: "Producto actualizado",
      description: "Los cambios han sido guardados exitosamente",
    });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('¿Eliminar este producto?')) {
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del catálogo",
      });
    }
  };

  const addNewProduct = () => {
    const newProduct: Product = {
      id: `prod_${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      wholesalePrice: 0,
      image: '/placeholder.svg',
      category: 'clasicas',
      stock: 0,
      minOrder: 6,
      isActive: true,
      isEditing: true
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Administración General</h1>
          <p className="text-stone-600">Portal unificado de gestión mayorista y puntos de venta</p>
        </div>
      </div>

      <Tabs defaultValue="catalog" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Catálogo
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Promociones
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configuración
          </TabsTrigger>
        </TabsList>

        {/* TAB: CATÁLOGO MAYORISTA */}
        <TabsContent value="catalog" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Catálogo de Productos Mayoristas</h2>
            <Button onClick={addNewProduct} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Producto
            </Button>
          </div>

          <div className="grid gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={() => handleEditProduct(product.id)}
                onSave={(data) => handleSaveProduct(product.id, data)}
                onDelete={() => handleDeleteProduct(product.id)}
              />
            ))}
          </div>
        </TabsContent>

        {/* TAB: PROMOCIONES */}
        <TabsContent value="promotions" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Promociones Activas</h2>
            <Button className="bg-purple-500 hover:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Nueva Promoción
            </Button>
          </div>

          <div className="grid gap-4">
            {promotions.map((promotion) => (
              <Card key={promotion.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-lg">{promotion.title}</h3>
                      <p className="text-stone-600 mb-2">{promotion.description}</p>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge variant="secondary">{promotion.discount}% descuento</Badge>
                        <span>Válido hasta: {promotion.validUntil}</span>
                        <Badge variant={promotion.isActive ? "default" : "secondary"}>
                          {promotion.isActive ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* TAB: CONFIGURACIÓN */}
        <TabsContent value="config" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Portal Mayorista</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Pedido Mínimo (S/)</Label>
                    <Input
                      type="number"
                      value={config.minOrderAmount}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        minOrderAmount: parseFloat(e.target.value)
                      }))}
                    />
                  </div>
                  <div>
                    <Label>Envío Gratis desde (S/)</Label>
                    <Input
                      type="number"
                      value={config.freeShippingThreshold}
                      onChange={(e) => setConfig(prev => ({
                        ...prev,
                        freeShippingThreshold: parseFloat(e.target.value)
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <Label>Mensaje de Bienvenida</Label>
                  <Textarea
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      welcomeMessage: e.target.value
                    }))}
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Términos y Condiciones</Label>
                  <Textarea
                    value={config.termsAndConditions}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      termsAndConditions: e.target.value
                    }))}
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
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Componente para tarjetas de productos
interface ProductCardProps {
  product: Product;
  onEdit: () => void;
  onSave: (data: Partial<Product>) => void;
  onDelete: () => void;
}

const ProductCard = ({ product, onEdit, onSave, onDelete }: ProductCardProps) => {
  const [editData, setEditData] = useState(product);

  if (product.isEditing) {
    return (
      <Card className="border-2 border-blue-300">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input
                placeholder="Nombre del producto"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              />
              <Textarea
                placeholder="Descripción"
                value={editData.description}
                onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="number"
                  placeholder="Precio normal"
                  value={editData.price}
                  onChange={(e) => setEditData(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                />
                <Input
                  type="number"
                  placeholder="Precio mayorista"
                  value={editData.wholesalePrice}
                  onChange={(e) => setEditData(prev => ({ ...prev, wholesalePrice: parseFloat(e.target.value) }))}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button size="sm" onClick={() => onSave(editData)}>
                <Save className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline" onClick={onEdit}>
                Cancelar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-stone-600 text-sm mb-2">{product.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span>Normal: S/ {product.price.toFixed(2)}</span>
              <span className="font-medium text-green-600">
                Mayorista: S/ {product.wholesalePrice.toFixed(2)}
              </span>
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={onEdit}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onDelete} className="text-red-600">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};