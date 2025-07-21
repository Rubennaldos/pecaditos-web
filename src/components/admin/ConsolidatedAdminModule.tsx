import { useState } from 'react';
import { 
  Settings, 
  Package, 
  DollarSign, 
  MapPin,
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
  
  // Estados para productos
  const [products, setProducts] = useState<Product[]>([
    {
      id: '1',
      name: 'Galletas de Avena Premium',
      description: 'Galletas integrales de avena con pasas',
      price: 4.50,
      wholesalePrice: 3.20,
      image: '/placeholder.svg',
      category: 'clasicas',
      stock: 100,
      minOrder: 6,
      isActive: true
    }
  ]);

  // Estados para sedes/puntos de venta
  const [salesLocations, setSalesLocations] = useState<SalesLocation[]>([
    {
      id: '1',
      name: 'Minimarket El Sol',
      address: 'Av. Los Olivos 123, San Isidro',
      phone: '+51 999 111 222',
      hours: 'Lun-Dom: 8:00-22:00',
      type: 'tienda',
      isActive: true
    },
    {
      id: '2', 
      name: 'Bodega Santa Rosa',
      address: 'Jr. Las Flores 456, Miraflores',
      phone: '+51 999 333 444',
      hours: 'Lun-Sab: 7:00-23:00',
      type: 'distribuidor',
      isActive: true
    }
  ]);

  // Estados para promociones
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: '1',
      title: 'Descuento Enero 2024',
      description: '15% adicional en pedidos mayores a S/ 500',
      discount: 15,
      validUntil: '2024-01-31',
      products: ['1'],
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

  // FUNCIONES PARA SEDES
  const handleEditLocation = (locationId: string) => {
    setSalesLocations(prev => prev.map(l => 
      l.id === locationId ? { ...l, isEditing: true } : { ...l, isEditing: false }
    ));
  };

  const handleSaveLocation = (locationId: string, updatedData: Partial<SalesLocation>) => {
    setSalesLocations(prev => prev.map(l =>
      l.id === locationId ? { ...l, ...updatedData, isEditing: false } : l
    ));
    toast({
      title: "Punto de venta actualizado",
      description: "La información ha sido guardada exitosamente",
    });
  };

  const handleDeleteLocation = (locationId: string) => {
    if (confirm('¿Eliminar este punto de venta?')) {
      setSalesLocations(prev => prev.filter(l => l.id !== locationId));
      toast({
        title: "Punto de venta eliminado",
        description: "Ha sido eliminado de la lista",
      });
    }
  };

  const addNewLocation = () => {
    const newLocation: SalesLocation = {
      id: `new-${Date.now()}`,
      name: '',
      address: '',
      phone: '',
      hours: '',
      type: 'tienda',
      isActive: true,
      isEditing: true
    };
    setSalesLocations(prev => [newLocation, ...prev]);
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="catalog" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Catálogo
          </TabsTrigger>
          <TabsTrigger value="locations" className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Puntos de Venta
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
            <h2 className="text-xl font-semibold">Catálogo de Productos</h2>
            <Button onClick={() => {/* Agregar producto */}} className="bg-blue-500 hover:bg-blue-600">
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

        {/* TAB: PUNTOS DE VENTA */}
        <TabsContent value="locations" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold">Puntos de Venta</h2>
              <p className="text-sm text-stone-600">
                Gestiona las tiendas y distribuidores donde se venden tus productos
              </p>
            </div>
            <Button onClick={addNewLocation} className="bg-green-500 hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Punto de Venta
            </Button>
          </div>

          <div className="grid gap-4">
            {salesLocations.map((location) => (
              <LocationCard
                key={location.id}
                location={location}
                onEdit={() => handleEditLocation(location.id)}
                onSave={(data) => handleSaveLocation(location.id, data)}
                onDelete={() => handleDeleteLocation(location.id)}
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

// Componente para tarjetas de puntos de venta
interface LocationCardProps {
  location: SalesLocation;
  onEdit: () => void;
  onSave: (data: Partial<SalesLocation>) => void;
  onDelete: () => void;
}

const LocationCard = ({ location, onEdit, onSave, onDelete }: LocationCardProps) => {
  const [editData, setEditData] = useState(location);

  if (location.isEditing) {
    return (
      <Card className="border-2 border-green-300">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <Input
                placeholder="Nombre del establecimiento"
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Dirección completa"
                value={editData.address}
                onChange={(e) => setEditData(prev => ({ ...prev, address: e.target.value }))}
              />
              <Input
                placeholder="Teléfono"
                value={editData.phone}
                onChange={(e) => setEditData(prev => ({ ...prev, phone: e.target.value }))}
              />
              <Input
                placeholder="Horarios"
                value={editData.hours}
                onChange={(e) => setEditData(prev => ({ ...prev, hours: e.target.value }))}
              />
              <Select value={editData.type} onValueChange={(value: any) => setEditData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tienda">Tienda</SelectItem>
                  <SelectItem value="distribuidor">Distribuidor</SelectItem>
                  <SelectItem value="punto_venta">Punto de Venta</SelectItem>
                </SelectContent>
              </Select>
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
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{location.name}</h3>
              <Badge variant="outline">
                {location.type === 'tienda' ? 'Tienda' : 
                 location.type === 'distribuidor' ? 'Distribuidor' : 'Punto de Venta'}
              </Badge>
            </div>
            <div className="space-y-1 text-sm text-stone-600">
              <p>📍 {location.address}</p>
              <p>📞 {location.phone}</p>
              <p>🕐 {location.hours}</p>
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