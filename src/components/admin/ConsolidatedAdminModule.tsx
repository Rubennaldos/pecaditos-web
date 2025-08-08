import { useState, useEffect } from 'react';
import { Settings, Package, Tag, Edit3, Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { db } from '../../config/firebase'; // Ajusta si tu ruta es distinta
import { ref, onValue, set, remove } from 'firebase/database';

// NUEVO: pestaña de promociones separada
import PromotionsTab from './promotions/PromotionsTab';

// -------- INTERFACES --------
interface QuantityDiscount {
  minQty: number | string;
  price: number | string;
}
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
  quantityDiscounts?: QuantityDiscount[];
  isEditing?: boolean;
}

export default function ConsolidatedAdminModule() {
  const { toast } = useToast();

  // ---- PRODUCTOS ----
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsub = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { setProducts([]); return; }
      const arr: Product[] = Object.entries(data).map(([id, p]: any) => ({
        ...p,
        id,
        quantityDiscounts: p.quantityDiscounts || []
      }));
      setProducts(arr);
    });
    return () => unsub();
  }, []);

  const addNewProduct = () => {
    setProducts(prev => [
      {
        id: `prod_${Date.now()}`,
        name: '',
        description: '',
        price: 0,
        wholesalePrice: 0,
        image: '/placeholder.svg',
        category: '',
        stock: 0,
        minOrder: 6,
        isActive: true,
        quantityDiscounts: [],
        isEditing: true
      },
      ...prev
    ]);
  };

  const handleSaveProduct = (product: Product) => {
    if (!product.name || !product.price) {
      toast({ title: "Completa el nombre y precio", variant: "destructive" });
      return;
    }
    const cleanDiscounts = (product.quantityDiscounts || [])
      .filter(d => d.minQty && d.price)
      .map(d => ({
        minQty: Number(d.minQty),
        price: Number(d.price)
      }));
    const refProd = ref(db, `products/${product.id}`);
    set(refProd, {
      ...product,
      quantityDiscounts: cleanDiscounts,
      isEditing: false
    });
    toast({ title: "Producto guardado" });
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm("¿Eliminar este producto?")) {
      remove(ref(db, `products/${productId}`));
      toast({ title: "Producto eliminado" });
    }
  };

  const handleEditProduct = (id: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isEditing: true } : { ...p, isEditing: false }
      )
    );
  };

  // ---- CONFIGURACIÓN GENERAL ----
  const [config, setConfig] = useState({
    minOrderAmount: 300,
    freeShippingThreshold: 500,
    welcomeMessage: '¡Bienvenido al portal mayorista! Descuentos especiales disponibles.',
    termsAndConditions: 'Condiciones mayoristas aplicables...'
  });

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
            <Package className="h-4 w-4" /> Catálogo
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex items-center gap-2">
            <Tag className="h-4 w-4" /> Promociones
          </TabsTrigger>
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings className="h-4 w-4" /> Configuración
          </TabsTrigger>
        </TabsList>

        {/* ----- CATÁLOGO MAYORISTA ----- */}
        <TabsContent value="catalog" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Catálogo de Productos Mayoristas</h2>
            <Button onClick={addNewProduct} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
            </Button>
          </div>
          <div className="grid gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSave={handleSaveProduct}
                onDelete={handleDeleteProduct}
                onEdit={handleEditProduct}
              />
            ))}
          </div>
        </TabsContent>

        {/* ----- PROMOCIONES (separado en componente) ----- */}
        <TabsContent value="promotions" className="space-y-4">
          <PromotionsTab products={products} />
        </TabsContent>

        {/* ----- CONFIGURACIÓN ----- */}
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
}

// --- CARD DE PRODUCTO ---
function ProductCard({
  product,
  onSave,
  onDelete,
  onEdit
}: {
  product: Product;
  onSave: (p: Product) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [editData, setEditData] = useState<Product>(product);
  useEffect(() => { setEditData(product); }, [product]);

  if (product.isEditing) {
    return (
      <Card className="border-2 border-blue-300">
        <CardContent className="p-4 space-y-4 bg-orange-50">
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-800 mb-1">💡 Descuentos por cantidad (mayoreo)</h4>
            <p className="text-sm text-blue-700">
              Ingresa diferentes niveles: A partir de <b>cierta cantidad</b> de unidades, aplica un <b>precio especial</b>. <br />
              El % de descuento se calcula automáticamente.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nombre del producto *</Label>
              <Input
                value={editData.name}
                onChange={e => setEditData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ej: Arroz Extra Premium 5kg"
              />
              <Label>Descripción del producto</Label>
              <Textarea
                value={editData.description}
                onChange={e => setEditData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
                placeholder="Características, presentación, peso..."
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Precio Normal (S/)*</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editData.price}
                    onFocus={e => e.target.select()}
                    onChange={e =>
                      setEditData(prev => ({
                        ...prev,
                        price: parseFloat(e.target.value) || 0
                      }))
                    }
                  />
                </div>
                <div>
                  <Label>Precio Mayorista (S/)*</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={editData.wholesalePrice}
                    onFocus={e => e.target.select()}
                    onChange={e =>
                      setEditData(prev => ({
                        ...prev,
                        wholesalePrice: parseFloat(e.target.value) || 0
                      }))
                    }
                  />
                  {editData.price > 0 && editData.wholesalePrice > 0 && (
                    <span className="block text-xs text-green-600 mt-1">
                      Descuento: {Math.round((1 - editData.wholesalePrice / editData.price) * 100)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
            {/* Descuentos por cantidad */}
            <div>
              <Label>Descuentos por cantidad</Label>
              <div className="space-y-2">
                {(editData.quantityDiscounts || []).map((d, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={d.minQty}
                      placeholder="Unidades"
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        let value = e.target.value;
                        setEditData(prev => ({
                          ...prev,
                          quantityDiscounts: prev.quantityDiscounts?.map((q, i) =>
                            i === idx ? { ...q, minQty: value.replace(/^0+(?=\d)/, '') } : q
                          )
                        }));
                      }}
                      className="w-20"
                    />
                    <span className="text-gray-600">unid. →</span>
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      value={d.price}
                      placeholder="Precio S/"
                      onFocus={e => e.target.select()}
                      onChange={e => {
                        let val = e.target.value;
                        setEditData(prev => ({
                          ...prev,
                          quantityDiscounts: prev.quantityDiscounts?.map((q, i) =>
                            i === idx ? { ...q, price: val.replace(/^0+(?=\d)/, '') } : q
                          )
                        }));
                      }}
                      className="w-24"
                    />
                    <span className="text-xs text-green-700">
                      {(d.price && editData.price > 0)
                        ? `(${Math.round(100 - (Number(d.price) / editData.price) * 100)}% desc.)`
                        : ''}
                    </span>
                    <span className="text-xs text-gray-500">
                      {d.minQty && d.price
                        ? `→ Total: S/ ${(Number(d.minQty) * Number(d.price)).toFixed(2)}`
                        : ''}
                    </span>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-red-600"
                      onClick={() =>
                        setEditData(prev => ({
                          ...prev,
                          quantityDiscounts: prev.quantityDiscounts?.filter((_, i) => i !== idx)
                        }))
                      }
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setEditData(prev => ({
                      ...prev,
                      quantityDiscounts: [
                        ...(prev.quantityDiscounts || []),
                        { minQty: '', price: '' }
                      ]
                    }))
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Agregar nivel de descuento
                </Button>
              </div>
            </div>
          </div>
          <div className="flex gap-2 justify-end pt-4 border-t">
            <Button
              size="sm"
              className="flex-1"
              onClick={() => onSave({ ...editData, isEditing: false })}
              disabled={!editData.name || editData.price <= 0}
            >
              <Save className="h-4 w-4 mr-1" /> Guardar
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="flex-1"
              onClick={() => onEdit(product.id)}
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // --- Visualización normal ---
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-stone-600 text-sm mb-1">{product.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <span>Normal: S/ {product.price?.toFixed(2)}</span>
              <span className="font-medium text-green-600">
                Mayorista: S/ {product.wholesalePrice?.toFixed(2)}
              </span>
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            {product.quantityDiscounts?.length > 0 && (
              <div className="mt-2 space-y-1">
                <b className="text-xs text-blue-700">Descuentos por cantidad:</b>
                {product.quantityDiscounts.map((q, idx) => (
                  <div key={idx} className="text-xs text-gray-700 pl-2">
                    Desde <b>{q.minQty}</b> unid. → S/ {Number(q.price).toFixed(2)} ({Math.round(100 - (Number(q.price) / product.price) * 100)}% desc.)
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(product.id)}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" className="text-red-600" onClick={() => onDelete(product.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
