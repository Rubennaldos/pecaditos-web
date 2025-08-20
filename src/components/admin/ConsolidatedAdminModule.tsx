// src/components/<donde-lo-tengas>/ConsolidatedAdminModule.tsx
import { useEffect, useState } from 'react';
import { Settings, Package, Tag, Edit3, Save, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// RTDB (ajusta si usas alias @)
import { db } from '../../config/firebase';
import { ref, onValue, set, remove } from 'firebase/database';

// Tu pestaña de promociones (ajusta la ruta si cambia)
import PromotionsTab from './promotions/PromotionsTab';

/* ======================== HELPERS DE IMAGEN (compresión ≤ 1.5MB) ======================== */

// Estima bytes reales del dataURL base64
function approxBytesFromDataUrl(dataUrl: string) {
  const b64 = dataUrl.split(',')[1] ?? '';
  return Math.floor((b64.length * 3) / 4);
}

// Mantiene proporción dentro de maxW x maxH
function fitWithin(w: number, h: number, maxW: number, maxH: number) {
  const r = Math.min(maxW / w, maxH / h, 1);
  return { w: Math.round(w * r), h: Math.round(h * r) };
}

// File -> HTMLImageElement
function fileToImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error('No se pudo leer el archivo'));
    fr.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = String(fr.result);
    };
    fr.readAsDataURL(file);
  });
}

// Convierte canvas a dataURL intentando WebP primero y, si no, JPEG
function canvasToDataUrl(canvas: HTMLCanvasElement, quality: number) {
  let url = '';
  try {
    url = canvas.toDataURL('image/webp', quality);
    if (!url.startsWith('data:image/webp')) {
      url = canvas.toDataURL('image/jpeg', quality);
    }
  } catch {
    url = canvas.toDataURL('image/jpeg', quality);
  }
  return url;
}

/**
 * Comprime un archivo de imagen a un dataURL cuyo tamaño sea ≤ targetBytes.
 * 1) Baja calidad gradualmente
 * 2) Si no alcanza, reduce dimensiones (manteniendo proporción)
 */
async function fileToTargetDataUrl(
  file: File,
  targetBytes = Math.floor(1.5 * 1024 * 1024), // 1.5 MB (dataURL)
  startMax = 1600,   // lado mayor inicial
  startQuality = 0.85,
  minMax = 640,      // tamaño mínimo permitido
  minQuality = 0.4   // calidad mínima
): Promise<{ dataUrl: string; bytes: number }> {
  const img = await fileToImage(file);
  let max = startMax;
  let quality = startQuality;

  for (let tries = 0; tries < 8; tries++) {
    const { w, h } = fitWithin(img.width, img.height, max, max);
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;
    ctx.drawImage(img, 0, 0, w, h);

    let dataUrl = canvasToDataUrl(canvas, quality);
    let bytes = approxBytesFromDataUrl(dataUrl);

    if (bytes <= targetBytes) {
      return { dataUrl, bytes };
    }

    // Baja calidad hasta minQuality, luego reduce dimensiones y resetea un poco la calidad
    if (quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.15);
    } else if (max > minMax) {
      max = Math.max(minMax, Math.round(max * 0.75));
      quality = Math.min(0.85, quality + 0.1);
    } else {
      // No se pudo llegar al objetivo, devuelve lo conseguido
      return { dataUrl, bytes };
    }
  }

  // Último intento (mínimos)
  const { w, h } = fitWithin(img.width, img.height, minMax, minMax);
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0, w, h);
  const dataUrl = canvasToDataUrl(canvas, minQuality);
  return { dataUrl, bytes: approxBytesFromDataUrl(dataUrl) };
}

/* ======================== Tipos ======================== */

interface QtyPrice {
  minQty: number | string; // ej: 12
  price: number | string;  // ej: 4.50 (precio unitario al comprar >= minQty)
}
interface Product {
  id: string;
  name: string;
  description: string;
  price: number;                // normal
  wholesalePrice: number;       // mayorista base
  image: string;                // URL o dataURL (base64) de imagen
  category: string;             // key de categoría
  stock: number;
  minOrder: number;             // múltiplo requerido (p.ej. 6)
  isActive: boolean;
  quantityDiscounts?: QtyPrice[]; // [{minQty, price}]
  isEditing?: boolean;
}

/* ======================== Módulo principal ======================== */

export default function ConsolidatedAdminModule() {
  const { toast } = useToast();

  /* -------- Productos -------- */
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsub = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { setProducts([]); return; }
      const arr: Product[] = Object.entries(data).map(([id, p]: any) => ({
        ...p,
        id,
        quantityDiscounts: p.quantityDiscounts || [],
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
        image: '/placeholder.svg', // puedes pegar una URL o se reemplaza al subir
        category: '',
        stock: 0,
        minOrder: 6,
        isActive: true,
        quantityDiscounts: [],
        isEditing: true,
      },
      ...prev,
    ]);
  };

  // Guarda en /products y su proyección en /catalog/products
  const handleSaveProduct = async (product: Product) => {
    try {
      if (!product.name || !product.wholesalePrice) {
        toast({ title: 'Completa nombre y precio mayorista', variant: 'destructive' });
        return;
      }

      // Normaliza descuentos y limpia vacíos
      const cleanDiscounts: QtyPrice[] = (product.quantityDiscounts || [])
        .filter(d => Number(d.minQty) > 0 && Number(d.price) > 0)
        .map(d => ({ minQty: Number(d.minQty), price: Number(d.price) }));

      const imageUrl = product.image || '/placeholder.svg';

      // 1) /products/{id} - TU estructura para gestión
      const rtdbPayload = {
        ...product,
        image: imageUrl,
        quantityDiscounts: cleanDiscounts,
        isEditing: false,
        updatedAt: Date.now(),
      };
      await set(ref(db, `products/${product.id}`), rtdbPayload);

      // 2) /catalog/products/{id} - proyección para catálogo mayorista
      //    [{minQty, price}] -> [{from, discountPct}] respecto a wholesalePrice
      const base = Number(product.wholesalePrice || 0);
      const qtyDiscounts = cleanDiscounts
        .filter(d => base > 0)
        .map(d => {
          const unit = Number(d.price);
          const pct = Math.max(0, Math.min(100, Math.round(100 - (unit / base) * 100)));
          return { from: Number(d.minQty), discountPct: pct };
        });

      const catalogPayload = {
        name: product.name,
        description: product.description || '',
        imageUrl,                                  // clave que consume el catálogo
        unit: 'und.',
        price: Number.isFinite(product.price) ? product.price : undefined,
        wholesalePrice: base,
        categoryId: product.category || 'sin-categoria',
        active: product.isActive ?? true,
        activeWholesale: product.isActive ?? true,
        minMultiple: Number(product.minOrder || 6),
        stock: Number.isFinite(product.stock) ? product.stock : undefined,
        sortOrder: 9999,
        qtyDiscounts,                              // [{from, discountPct}]
      };
      await set(ref(db, `catalog/products/${product.id}`), catalogPayload);

      toast({ title: 'Producto guardado' });
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error al guardar',
        description: err?.message || 'Intenta de nuevo.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Eliminar este producto?')) return;
    await Promise.all([
      remove(ref(db, `products/${productId}`)),
      remove(ref(db, `catalog/products/${productId}`)),
    ]);
    toast({ title: 'Producto eliminado' });
  };

  const handleEditProduct = (id: string) => {
    setProducts(prev =>
      prev.map(p =>
        p.id === id ? { ...p, isEditing: true } : { ...p, isEditing: false }
      )
    );
  };

  /* -------- Config general -------- */
  const [config, setConfig] = useState({
    minOrderAmount: 300,
    freeShippingThreshold: 500,
    welcomeMessage: '¡Bienvenido al portal mayorista! Descuentos especiales disponibles.',
    termsAndConditions: 'Condiciones mayoristas aplicables...',
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

        {/* -------- CATÁLOGO -------- */}
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

        {/* -------- PROMOCIONES -------- */}
        <TabsContent value="promotions" className="space-y-4">
          <PromotionsTab products={products} />
        </TabsContent>

        {/* -------- CONFIG -------- */}
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
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, minOrderAmount: parseFloat(e.target.value) }))
                      }
                    />
                  </div>
                  <div>
                    <Label>Envío Gratis desde (S/)</Label>
                    <Input
                      type="number"
                      value={config.freeShippingThreshold}
                      onChange={(e) =>
                        setConfig((prev) => ({ ...prev, freeShippingThreshold: parseFloat(e.target.value) }))
                      }
                    />
                  </div>
                </div>
                <div>
                  <Label>Mensaje de Bienvenida</Label>
                  <Textarea
                    value={config.welcomeMessage}
                    onChange={(e) => setConfig((prev) => ({ ...prev, welcomeMessage: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Términos y Condiciones</Label>
                  <Textarea
                    value={config.termsAndConditions}
                    onChange={(e) =>
                      setConfig((prev) => ({ ...prev, termsAndConditions: e.target.value }))
                    }
                    rows={6}
                  />
                </div>
                <Button
                  onClick={() => toast({ title: 'Configuración guardada', description: 'Cambios aplicados.' })}
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

/* ======================== CARD DE PRODUCTO ======================== */

function ProductCard({
  product,
  onSave,
  onDelete,
  onEdit,
}: {
  product: Product;
  onSave: (p: Product) => Promise<void> | void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}) {
  const [editData, setEditData] = useState<Product>(product);
  const [processingImage, setProcessingImage] = useState(false);

  useEffect(() => {
    setEditData(product);
    setProcessingImage(false);
  }, [product]);

  if (product.isEditing) {
    return (
      <Card className="border-2 border-blue-300">
        <CardContent className="p-4 space-y-4 bg-orange-50">
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-800 mb-1">💡 Descuentos por cantidad (mayoreo)</h4>
            <p className="text-sm text-blue-700">
              Ingresa niveles: desde <b>cierta cantidad</b> de unidades usa un <b>precio especial</b>.
              El % de descuento se calcula automáticamente en el catálogo.
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

              {/* Imagen: pegar URL y/o subir desde PC con compresión */}
              <div className="space-y-1">
                <Label>Imagen del producto</Label>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded bg-stone-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={editData.image || '/placeholder.svg'}
                      alt="preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <Input
                    type="url"
                    placeholder="Pega aquí una URL (opcional)"
                    value={editData.image}
                    onChange={(e) => setEditData(prev => ({ ...prev, image: e.target.value }))}
                    className="max-w-xs"
                  />
                </div>

                <div className="flex items-center gap-3">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setProcessingImage(true);
                        const { dataUrl } = await fileToTargetDataUrl(
                          file,
                          Math.floor(1.5 * 1024 * 1024) // 1.5 MB dataURL
                        );
                        setEditData(prev => ({ ...prev, image: dataUrl }));
                      } catch (err) {
                        console.error(err);
                      } finally {
                        setProcessingImage(false);
                      }
                    }}
                    className="max-w-xs"
                  />
                  {processingImage && (
                    <span className="text-xs text-stone-500">Procesando imagen…</span>
                  )}
                </div>

                {editData.image && (
                  <p className="text-[11px] text-stone-500">
                    Tamaño aprox.: {(approxBytesFromDataUrl(editData.image) / 1024).toFixed(0)} KB (máx. 1536 KB)
                  </p>
                )}
              </div>

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
                      setEditData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))
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
                      setEditData(prev => ({ ...prev, wholesalePrice: parseFloat(e.target.value) || 0 }))
                    }
                  />
                  {editData.price > 0 && editData.wholesalePrice > 0 && (
                    <span className="block text-xs text-green-600 mt-1">
                      Descuento: {Math.round((1 - editData.wholesalePrice / editData.price) * 100)}%
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Stock</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editData.stock}
                    onChange={e => setEditData(prev => ({ ...prev, stock: Number(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label>Múltiplo (min. por pedido)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editData.minOrder}
                    onChange={e => setEditData(prev => ({ ...prev, minOrder: Number(e.target.value) || 6 }))}
                  />
                </div>
              </div>
            </div>

            {/* Descuentos por cantidad (tu forma: minQty + price) */}
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
                        const value = e.target.value;
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
                        const val = e.target.value;
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
                      {d.price && editData.wholesalePrice > 0
                        ? `(${Math.round(100 - (Number(d.price) / editData.wholesalePrice) * 100)}% desc. vs. mayorista)`
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
              disabled={!editData.name || editData.wholesalePrice <= 0 || processingImage}
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

  // Vista normal (no edición)
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
              <Badge variant={product.isActive ? 'default' : 'secondary'}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>
            {product.quantityDiscounts?.length > 0 && (
              <div className="mt-2 space-y-1">
                <b className="text-xs text-blue-700">Descuentos por cantidad:</b>
                {product.quantityDiscounts.map((q, idx) => (
                  <div key={idx} className="text-xs text-gray-700 pl-2">
                    Desde <b>{q.minQty}</b> unid. → S/ {Number(q.price).toFixed(2)}{' '}
                    {product.wholesalePrice > 0 && (
                      <>
                        (
                        {Math.round(100 - (Number(q.price) / product.wholesalePrice) * 100)}
                        % desc. vs. mayorista)
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => onEdit(product.id)}>
              <Edit3 className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="text-red-600"
              onClick={() => onDelete(product.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
