// src/components/<donde-lo-tengas>/ConsolidatedAdminModule.tsx
import { useEffect, useState } from 'react';
import { Settings, Package, Tag, Edit3, Save, Plus, Trash2 } from 'lucide-react';
import { Upload, FileSpreadsheet, Download } from 'lucide-react'; // nuevos iconos
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
import { ref, onValue, set, remove, get, push } from 'firebase/database'; // ampliar firebase

// Tu pestaña de promociones (ajusta la ruta si cambia)
import PromotionsTab from './promotions/PromotionsTab';
import * as XLSX from 'xlsx';

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

    if (quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.15);
    } else if (max > minMax) {
      max = Math.max(minMax, Math.round(max * 0.75));
      quality = Math.min(0.85, quality + 0.1);
    } else {
      return { dataUrl, bytes };
    }
  }

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

// NUEVO MODELO: paquetes (Y unidades por total S/ Z)
interface BundleDiscount {
  qty: number | string;   // Y unidades
  total: number | string; // Z total del paquete
}

// Solo numérico para cálculos
type BundleNum = { qty: number; total: number };

interface LegacyQtyPrice {
  minQty: number | string; // compatibilidad con data antigua
  price: number | string;  // precio unitario
}

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;                // normal (retail opcional)
  wholesalePrice: number;       // **Precio unitario base** (mayorista)
  image: string;                // URL o dataURL (base64) de imagen
  category: string;
  stock: number;
  minOrder: number;             // **Múltiplo** requerido (p.ej. 6)
  isActive: boolean;
  bundleDiscounts?: BundleDiscount[];  // [{qty,total}]
  quantityDiscounts?: LegacyQtyPrice[]; // legado
  isEditing?: boolean;          // UI only
  isNew?: boolean;              // UI only (para cerrar al cancelar si es nuevo)
}

/* ======================== Helpers UI y números ======================== */
const fmtMoney = (n: number) => `S/ ${Number(n || 0).toFixed(2)}`;
const pct = (n: number) => `${Math.max(0, Math.min(100, Math.round(n)))}%`;

// Redondea cantidad al múltiplo (hacia arriba, mínimo el propio múltiplo)
function toMultiple(qty: number, multiple: number) {
  const m = Math.max(1, Number(multiple || 1));
  const q = Math.max(0, Math.floor(Number(qty || 0)));
  if (m <= 1) return q;
  return Math.max(m, Math.ceil(q / m) * m);
}

/* ======================== Módulo principal ======================== */

export default function ConsolidatedAdminModule() {
  const { toast } = useToast();

  const [products, setProducts] = useState<Product[]>([]);
  const [isBulkImporting, setIsBulkImporting] = useState(false); // estado nuevo

  useEffect(() => {
    const productsRef = ref(db, 'products');
    const unsub = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) { setProducts([]); return; }

      const arr: Product[] = Object.entries(data).map(([id, p]: any) => {
        // Compatibilidad: si hay quantityDiscounts (unitario), convertir a paquetes
        let bundleDiscounts: BundleDiscount[] = p.bundleDiscounts || [];
        if ((!bundleDiscounts || bundleDiscounts.length === 0) && Array.isArray(p.quantityDiscounts)) {
          bundleDiscounts = p.quantityDiscounts
            .filter((d: any) => Number(d?.minQty) > 0 && Number(d?.price) > 0)
            .map((d: any) => ({
              qty: Number(d.minQty),
              total: Number(d.price) * Number(d.minQty),
            }));
        }

        return {
          ...p,
          id,
          bundleDiscounts,
        } as Product;
      });

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
        bundleDiscounts: [],
        isEditing: true,
        isNew: true, // marcar como nuevo
      },
      ...prev,
    ]);
  };

  // Guarda en /products y su proyección en /catalog/products
  const handleSaveProduct = async (product: Product) => {
    try {
      if (!product.name || !product.wholesalePrice) {
        toast({ title: 'Completa nombre y precio unitario', variant: 'destructive' });
        return;
      }

      // Normaliza paquetes a SOLO NÚMEROS y al múltiplo
      const step = Math.max(1, Number(product.minOrder || 1));
      const cleanBundles: BundleNum[] = (product.bundleDiscounts || [])
        .map(b => {
          const q = toMultiple(Number(b.qty || 0), step);
          const t = Number(b.total || 0);
          return { qty: q, total: t };
        })
        .filter(b => b.qty > 0 && b.total > 0);

      const imageUrl = product.image || '/placeholder.svg';
      const base = Number(product.wholesalePrice || 0);

      // No guardamos flags de UI en RTDB
      const { isEditing, isNew, quantityDiscounts, ...rest } = product;

      // 1) /products/{id}
      const rtdbPayload = {
        ...rest,
        image: imageUrl,
        bundleDiscounts: cleanBundles as unknown as BundleDiscount[],
        updatedAt: Date.now(),
      };
      await set(ref(db, `products/${product.id}`), rtdbPayload);

      // 2) /catalog/products/{id} - proyección para catálogo mayorista
      const qtyDiscounts = cleanBundles
        .filter(b => base > 0)
        .map(b => {
          const unitAtTier = b.total / b.qty;
          const discountPct = Math.max(0, Math.min(100, Math.round((1 - unitAtTier / base) * 100)));
          return { from: b.qty, discountPct };
        })
        .sort((a, b) => a.from - b.from);

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
        minMultiple: step,
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

  // Cancelar: si es nuevo, cerrar (eliminar de la lista). Si no, sólo salir de edición.
  const handleCancelProduct = (prod: Product) => {
    setProducts(prev => {
      if (prod.isNew) {
        return prev.filter(p => p.id !== prod.id);
      }
      return prev.map(p => (p.id === prod.id ? { ...p, isEditing: false } : p));
    });
  };

  // ====== Plantilla productos mayoristas ======
  const generateProductsTemplate = () => {
    const wb = XLSX.utils.book_new();
    const instructions = [
      ['PLANTILLA IMPORTACIÓN MASIVA PRODUCTOS'],
      [],
      ['INSTRUCCIONES:'],
      ['1. Llene la hoja "Productos". Campos obligatorios: SKU*, Nombre*, Precio Unitario Base*.'],
      ['2. Puede dejar vacíos los demás campos.'],
      ['3. Activo (SI/NO). Imágenes se suben manualmente luego.'],
      ['4. Paquetes opcionales: Cantidad y Total (hasta 3).'],
      [],
      ['COLUMNAS:'],
      ['SKU*','Nombre*','Descripción','Categoría','Subcategoría','Unidad Medida','Precio Unitario Base*','Múltiplo Pedido','Stock','Activo (SI/NO)',
       'Paquete1 Cantidad','Paquete1 Total','Paquete2 Cantidad','Paquete2 Total','Paquete3 Cantidad','Paquete3 Total']
    ];
    const wsI = XLSX.utils.aoa_to_sheet(instructions);
    XLSX.utils.book_append_sheet(wb, wsI, 'Instrucciones');

    const sample = [
      ['SKU*','Nombre*','Descripción','Categoría','Subcategoría','Unidad Medida','Precio Unitario Base*','Múltiplo Pedido','Stock','Activo (SI/NO)',
       'Paquete1 Cantidad','Paquete1 Total','Paquete2 Cantidad','Paquete2 Total','Paquete3 Cantidad','Paquete3 Total'],
      ['GAL-AV-MZ-12','Galleta avena y manzana','Galleta sin preservantes','Galletas','Avena','Unidad','3.83','6','460','SI','12','46.00','','','','','']
    ];
    const wsP = XLSX.utils.aoa_to_sheet(sample);
    XLSX.utils.book_append_sheet(wb, wsP, 'Productos');
    XLSX.writeFile(wb, 'Plantilla_Productos_Mayoristas.xlsx');
  };

  // ====== Exportar productos ======
  const exportProductsToExcel = async () => {
    try {
      const snap = await get(ref(db, 'products'));
      const data = snap.val() || {};
      const arr = Object.entries(data).map(([id, p]: any) => {
        const bundles = (p.bundleDiscounts || []).slice(0, 3);
        const flat: any = {
          id,
          SKU: p.sku || '',
          Nombre: p.name || '',
          Descripción: p.description || '',
          Categoría: p.category || '',
          Subcategoría: p.subcategory || '',
          'Unidad Medida': p.unit || p.unidadMedida || '',
          'Precio Unitario Base': p.wholesalePrice ?? '',
          'Múltiplo Pedido': p.minOrder ?? '',
          Stock: p.stock ?? '',
          Activo: p.isActive ? 'SI' : 'NO'
        };
        bundles.forEach((b: any, i: number) => {
          flat[`Paquete${i+1} Cantidad`] = b.qty || '';
          flat[`Paquete${i+1} Total`] = b.total || '';
        });
        return flat;
      });
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(arr);
      XLSX.utils.book_append_sheet(wb, ws, 'Productos');
      XLSX.writeFile(wb, 'Export_Productos_Mayoristas.xlsx');
      toast({ title: 'Exportado', description: `${arr.length} productos` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo exportar', variant: 'destructive' });
    }
  };

  // ====== Importar productos ======
  const processBulkProductsImport = async (file: File) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async e => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const wb = XLSX.read(data, { type: 'array' });
          const sheet = wb.Sheets['Productos'];
          if (!sheet) throw new Error('Hoja "Productos" no encontrada');
          const rows: any[] = XLSX.utils.sheet_to_json(sheet);
          let created = 0;
          for (const r of rows) {
            const sku = (r['SKU*'] || '').toString().trim();
            const nombre = (r['Nombre*'] || '').toString().trim();
            const base = r['Precio Unitario Base*'];
            if (!sku || !nombre || base === undefined || base === '') continue;

            const bundles: BundleDiscount[] = [];
            for (let i = 1; i <= 3; i++) {
              const qty = r[`Paquete${i} Cantidad`];
              const total = r[`Paquete${i} Total`];
              if (qty && total) bundles.push({ qty, total });
            }

            const prodRef = push(ref(db, 'products'));
            await set(prodRef, {
              sku,
              name: nombre,
              description: r['Descripción'] || '',
              category: r['Categoría'] || '',
              subcategory: r['Subcategoría'] || '',
              unit: r['Unidad Medida'] || '',
              wholesalePrice: Number(base) || 0,
              minOrder: Number(r['Múltiplo Pedido']) || 1,
              stock: r['Stock'] === '' || r['Stock'] === undefined ? 0 : Number(r['Stock']),
              isActive: (r['Activo (SI/NO)'] || '').toString().toUpperCase() === 'SI',
              bundleDiscounts: bundles,
              image: '/placeholder.svg',
              createdAt: Date.now()
            });
            created++;
          }
          toast({ title: 'Importación completa', description: `${created} productos creados` });
          resolve();
        } catch (err: any) {
          toast({ title: 'Error importando', description: err.message, variant: 'destructive' });
          reject(err);
        }
      };
      reader.onerror = () => {
        toast({ title: 'Error lectura', description: 'No se pudo leer el archivo', variant: 'destructive' });
        reject(new Error('read error'));
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleProductsFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsBulkImporting(true);
    try {
      await processBulkProductsImport(file);
    } finally {
      setIsBulkImporting(false);
      e.target.value = '';
    }
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
          <h1 className="text-3xl font-bold text-stone-800">Administrador de Catálogo Mayorista</h1>
          <p className="text-stone-600">Gestión integral de productos mayoristas, promociones y configuración</p>
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
          {/* Botones masivos */}
          <div className="flex flex-wrap gap-2 justify-end">
            <Button variant="outline" onClick={generateProductsTemplate}>
              <FileSpreadsheet className="h-4 w-4 mr-2" /> Plantilla Productos
            </Button>
            <Button
              variant="outline"
              disabled={isBulkImporting}
              onClick={() => document.getElementById('bulk-products-input')?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              {isBulkImporting ? 'Importando...' : 'Importar Productos'}
            </Button>
            <input
              id="bulk-products-input"
              type="file"
              accept=".xlsx,.xls"
              onChange={handleProductsFileImport}
              className="hidden"
            />
            <Button variant="outline" onClick={exportProductsToExcel}>
              <Download className="h-4 w-4 mr-2" /> Exportar Productos
            </Button>
          </div>

          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Catálogo de Productos Mayoristas</h2>
            <Button onClick={addNewProduct} className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" /> Nuevo Producto
            </Button>
          </div>

          {/* ...existing code listado productos... */}
          <div className="grid gap-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSave={handleSaveProduct}
                onDelete={handleDeleteProduct}
                onEdit={handleEditProduct}
                onCancel={handleCancelProduct}
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

/* ======================== CARD DE PRODUCTO (VERSIÓN SIMPLE) ======================== */

function ProductCard({
  product,
  onSave,
  onDelete,
  onEdit,
  onCancel,
}: {
  product: Product;
  onSave: (p: Product) => Promise<void> | void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onCancel: (p: Product) => void;
}) {
  const [editData, setEditData] = useState<Product>(product);
  const [processingImage, setProcessingImage] = useState(false);

  useEffect(() => {
    setEditData(product);
    setProcessingImage(false);
  }, [product]);

  // Ajusta automáticamente paquetes al cambiar el múltiplo
  useEffect(() => {
    const step = Math.max(1, Number(editData.minOrder || 1));
    setEditData((p) => ({
      ...p,
      bundleDiscounts: (p.bundleDiscounts || []).map((b) => ({
        qty: String(toMultiple(Number(b.qty || 0), step)),
        total: b.total,
      })),
    }));
     
  }, [editData.minOrder]);

  // info de cada paquete (X unidades por Total Z) -> unitario y % desc. vs base
  const packInfo = (qty: number, total: number, base: number) => {
    if (!qty || !total || !base) return { unit: 0, discount: 0 };
    const unit = total / qty;
    const discount = (1 - unit / base) * 100;
    return { unit, discount };
  };

  if (product.isEditing) {
    const step = Math.max(1, Number(editData.minOrder || 1));

    return (
      <Card className="border-2 border-blue-300">
        <CardContent className="p-4 space-y-4 bg-orange-50">
          <div className="bg-blue-50 p-3 rounded-lg mb-4 border-l-4 border-blue-400">
            <h4 className="font-medium text-blue-800 mb-1">
              💡 Descuentos por cantidad (simple)
            </h4>
            <p className="text-sm text-blue-700">
              Define el <b>Precio unitario</b> y agrega opciones de <b>X unidades por Total S/ Z</b>.
              Calculamos el precio por unidad del paquete y el % de descuento automáticamente.
              El valor <b>X</b> debe ser <b>múltiplo de {step}</b>.
            </p>
          </div>

          {/* Nombre + Descripción */}
          <div className="space-y-2">
            <Label>Nombre del producto *</Label>
            <Input
              value={editData.name}
              onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
              placeholder="Ej: Galleta de avena"
            />
          </div>

          <div className="space-y-2">
            <Label>Descripción del producto</Label>
            <Textarea
              value={editData.description}
              onChange={(e) => setEditData((p) => ({ ...p, description: e.target.value }))}
              rows={2}
              placeholder="Características, presentación, peso…"
            />
          </div>

          {/* Imagen: URL + subir desde PC con compresión */}
          <div className="space-y-2">
            <Label>Imagen del producto</Label>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded bg-stone-100 overflow-hidden">
                {/* eslint-disable-next-line */}
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
                onChange={(e) => setEditData((p) => ({ ...p, image: e.target.value }))}
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
                      Math.floor(1.5 * 1024 * 1024) // 1.5 MB
                    );
                    setEditData((p) => ({ ...p, image: dataUrl }));
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
                Tamaño aprox.: {(approxBytesFromDataUrl(editData.image) / 1024).toFixed(0)} KB
                (máx. 1536 KB)
              </p>
            )}
          </div>

          {/* Precio unitario + Múltiplo */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Precio unitario (S/)*</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                value={editData.wholesalePrice}
                onFocus={(e) => e.target.select()}
                onChange={(e) =>
                  setEditData((p) => ({
                    ...p,
                    wholesalePrice: parseFloat(e.target.value) || 0,
                  }))
                }
              />
            </div>

            <div>
              <Label>Múltiplo (min. por pedido)</Label>
              <Input
                type="number"
                min={1}
                value={editData.minOrder}
                onChange={(e) =>
                  setEditData((p) => ({ ...p, minOrder: Number(e.target.value) || 1 }))
                }
              />
            </div>
          </div>

          {/* Opciones: X unidades por Total S/ Z */}
          <div>
            <Label>Precio por X unidades</Label>
            <div className="space-y-2">
              {(editData.bundleDiscounts || []).map((d, idx) => {
                const qty = Number(d.qty || 0);
                const total = Number(d.total || 0);
                const notMultiple = qty > 0 && qty % step !== 0;
                const info = packInfo(qty, total, Number(editData.wholesalePrice || 0));

                return (
                  <div key={idx} className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={step}
                        step={step}
                        value={d.qty}
                        placeholder="X (unidades)"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditData((p) => ({
                            ...p,
                            bundleDiscounts: (p.bundleDiscounts || []).map((row, i) =>
                              i === idx ? { ...row, qty: val.replace(/^0+(?=\d)/, '') } : row
                            ),
                          }));
                        }}
                        onBlur={(e) => {
                          const fixed = toMultiple(Number(e.target.value || 0), step);
                          setEditData((p) => ({
                            ...p,
                            bundleDiscounts: (p.bundleDiscounts || []).map((row, i) =>
                              i === idx ? { ...row, qty: String(fixed) } : row
                            ),
                          }));
                        }}
                        className="w-28"
                      />
                      <span className="text-gray-600">unid. por</span>
                      <Input
                        type="number"
                        min={0}
                        step="0.01"
                        value={d.total}
                        placeholder="Total S/ (Z)"
                        onFocus={(e) => e.target.select()}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditData((p) => ({
                            ...p,
                            bundleDiscounts: (p.bundleDiscounts || []).map((row, i) =>
                              i === idx ? { ...row, total: val.replace(/^0+(?=\d)/, '') } : row
                            ),
                          }));
                        }}
                        className="w-36"
                      />

                      <span className="text-xs text-stone-600">
                        {qty > 0 && total > 0 && editData.wholesalePrice > 0
                          ? <>({fmtMoney(info.unit)} c/u · {pct(info.discount)} desc.)</>
                          : ''}
                      </span>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-red-600"
                        onClick={() =>
                          setEditData((p) => ({
                            ...p,
                            bundleDiscounts: (p.bundleDiscounts || []).filter((_, i) => i !== idx),
                          }))
                        }
                        title="Eliminar opción"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    {notMultiple && (
                      <span className="text-[11px] text-red-600 pl-1">
                        La cantidad debe ser múltiplo de {step}.
                      </span>
                    )}
                  </div>
                );
              })}

              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() =>
                    setEditData((p) => ({
                      ...p,
                      bundleDiscounts: [...(p.bundleDiscounts || []), { qty: '', total: '' }],
                    }))
                  }
                >
                  <Plus className="h-4 w-4 mr-1" /> Agregar opción
                </Button>

                {editData.wholesalePrice > 0 ? (
                  <span className="text-xs text-stone-500">
                    Precio unitario base: <b>{fmtMoney(editData.wholesalePrice)}</b>
                  </span>
                ) : (
                  <span className="text-xs text-red-600">
                    Define el <b>Precio unitario</b> para calcular descuentos.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Acciones */}
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
              onClick={() => onCancel(product)} // <<---- ahora sí cierra
            >
              Cancelar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ── Vista normal (no edición) ────────────────────────────────────────────────
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-stone-600 text-sm mb-1 whitespace-pre-line">
              {product.description}
            </p>
            <div className="flex items-center gap-4 text-sm">
              <span>Precio unitario: {fmtMoney(product.wholesalePrice)}</span>
              <Badge variant={product.isActive ? 'default' : 'secondary'}>
                {product.isActive ? 'Activo' : 'Inactivo'}
              </Badge>
            </div>

            {/* Lista de opciones (X por Z) */}
            {product.bundleDiscounts?.length ? (
              <div className="mt-3 space-y-1">
                <b className="text-xs text-blue-700">Opciones:</b>
                {product.bundleDiscounts.map((b, i) => {
                  const qty = Number(b.qty || 0);
                  const total = Number(b.total || 0);
                  const unit = qty > 0 ? total / qty : 0;
                  const discount =
                    product.wholesalePrice > 0
                      ? Math.round((1 - unit / product.wholesalePrice) * 100)
                      : 0;
                  return (
                    <div key={i} className="text-xs text-gray-700 pl-2">
                      {qty} unid. → Total {fmtMoney(total)} ({fmtMoney(unit)} c/u ·{' '}
                      {Math.max(0, discount)}% desc.)
                    </div>
                  );
                })}
              </div>
            ) : null}
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
