import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BackToPanelButton } from '@/components/ui/back-to-panel-button';
import {
  Package2,
  Plus,
  LogOut
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AdminProductionProvider, useAdminProduction } from '@/contexts/AdminProductionContext';
import { ProductCard } from '@/components/production/ProductCard';
import { Input } from '@/components/ui/input';

// ----------------- AGREGADO: Modal para Agregar Producto -----------------
const AddProductModal = ({ open, onClose, onAdd, productOptions }: any) => {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [category, setCategory] = useState('1');
  const [minStock, setMinStock] = useState('');
  const [maxStock, setMaxStock] = useState('');
  const [initialStock, setInitialStock] = useState('');

  const handleAdd = () => {
    if (!selectedProductId || !minStock || !maxStock) return;
    onAdd({
      productId: selectedProductId,
      category,
      minStock: Number(minStock),
      maxStock: Number(maxStock),
      initialStock: Number(initialStock) || 0
    });
  };

  return open ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Agregar Producto a Panel</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="font-medium">Seleccionar producto:</label>
            <select
              value={selectedProductId}
              onChange={e => setSelectedProductId(e.target.value)}
              className="w-full mt-1 border rounded p-2"
            >
              <option value="">-- Elige un producto --</option>
              {productOptions.map((prod: any) => (
                <option key={prod.id} value={prod.id}>{prod.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-medium">Categoría:</label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full mt-1 border rounded p-2"
            >
              <option value="1">Producción 1</option>
              <option value="2">Producción 2</option>
            </select>
          </div>
          <div>
            <label className="font-medium">Stock mínimo:</label>
            <Input
              type="number"
              value={minStock}
              onChange={e => setMinStock(e.target.value)}
              placeholder="Ej: 10"
            />
          </div>
          <div>
            <label className="font-medium">Stock máximo:</label>
            <Input
              type="number"
              value={maxStock}
              onChange={e => setMaxStock(e.target.value)}
              placeholder="Ej: 100"
            />
          </div>
          <div>
            <label className="font-medium">Cantidad inicial (opcional):</label>
            <Input
              type="number"
              value={initialStock}
              onChange={e => setInitialStock(e.target.value)}
              placeholder="Ej: 0"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button className="flex-1 bg-green-600 text-white" onClick={handleAdd}>Agregar</Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  ) : null;
};

// ---------------------- MAIN PANEL ----------------------

interface ProductionPanelContentProps {
  /** Si es true, oculta el botón de volver (para cuando está embebido en AdminPanel) */
  embedded?: boolean;
}

const ProductionPanelContent = ({ embedded = false }: ProductionPanelContentProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { isAdminMode } = useAdminProduction();
  // ------------------ FIREBASE: Productos del catálogo ------------------
  // Supón que tienes una función useCatalogProducts() que trae el catálogo de productos creados
  // y otra useProductionProducts() para traer los productos en el panel de producción
  // (o puedes usar tu lógica de Firebase aquí)
  // Ejemplo básico, AJUSTA según tu integración
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [productionProducts, setProductionProducts] = useState<any[]>([]);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // Elimina los mockProducts: ¡no hay productos si no agregas!
  // const mockProducts = [...]

  // --- Simulación de fetch con Firebase (Ajusta por tu integración real)
  useEffect(() => {
    // Traer productos del catálogo
    // TODO: Reemplaza con tu función real de Firebase
    setCatalogProducts([
      // { id: "1", name: "Galletas Integrales Coco" },
      // ... lo que tengas en tu catálogo
    ]);
    // Traer productos del panel de producción (por ahora vacío)
    setProductionProducts([]);
  }, []);

  // ---- FUNCIONES para agregar/quitar productos de la producción (ajusta con Firebase)
  const handleAddProduct = (data: any) => {
    // Aquí va tu integración Firebase:
    // - Buscar en catálogo el producto y agregarlo al panel de producción
    // - Guardar stock min/max, categoría y cantidad inicial
    // Luego actualizas el estado:
    setProductionProducts((prev) => [
      ...prev,
      {
        ...catalogProducts.find((p) => p.id === data.productId),
        currentStock: data.initialStock,
        requiredStock: data.minStock,
        optimalStock: data.maxStock,
        category: data.category
      }
    ]);
    setAddModalOpen(false);
  };

  // ---- Resto igual, pero usando productionProducts en vez de mockProducts
  // ---- Filtrar por categoría
  const production1 = productionProducts.filter((p) => p.category === '1');
  const production2 = productionProducts.filter((p) => p.category === '2');

  // ----- Ejemplo de renderizado (adaptado):
  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-stone-50">
      {!embedded && <BackToPanelButton />}
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center">
              <Package2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-800">Panel de Producción</h1>
              <p className="text-stone-600">Control de stock y producción</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* BOTÓN para agregar producto */}
        <div className="mb-6 flex justify-end">
          <Button className="bg-green-600 text-white" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar Producto
          </Button>
        </div>
        {/* PRODUCCIÓN 1 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800">Producción 1</h2>
            <Badge variant="outline" className="text-sm">{production1.length} productos</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {production1.length === 0 ? (
              <div className="col-span-full text-stone-400 text-center py-10">
                No hay productos en esta categoría.
              </div>
            ) : (
              production1.map((product) => (
                <ProductCard key={product.id} product={product} onAddStock={() => {}} onShowHistory={() => {}} />
              ))
            )}
          </div>
        </div>
        {/* PRODUCCIÓN 2 */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-stone-800">Producción 2</h2>
            <Badge variant="outline" className="text-sm">{production2.length} productos</Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {production2.length === 0 ? (
              <div className="col-span-full text-stone-400 text-center py-10">
                No hay productos en esta categoría.
              </div>
            ) : (
              production2.map((product) => (
                <ProductCard key={product.id} product={product} onAddStock={() => {}} onShowHistory={() => {}} />
              ))
            )}
          </div>
        </div>
      </div>

      {/* MODAL PARA AGREGAR PRODUCTO */}
      <AddProductModal
        open={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onAdd={handleAddProduct}
        productOptions={catalogProducts}
      />
    </div>
  );
};

interface ProductionPanelProps {
  /** Si es true, oculta el botón de volver (para cuando está embebido en AdminPanel) */
  embedded?: boolean;
}

const ProductionPanel = ({ embedded = false }: ProductionPanelProps) => (
  <AdminProductionProvider>
    <ProductionPanelContent embedded={embedded} />
  </AdminProductionProvider>
);

export default ProductionPanel;
