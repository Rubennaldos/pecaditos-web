import { useState, useEffect, useMemo } from 'react';
import { db } from '@/config/firebase';
import { ref, onValue, set } from 'firebase/database';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Package, 
  DollarSign, 
  Plus, 
  Trash2, 
  Save,
  Eye,
  EyeOff
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: string;
  razonSocial: string;
  authUid?: string;
  emailFacturacion?: string;
}

interface Product {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  wholesalePrice: number;
  unit?: string;
  categoryId?: string;
}

interface ClientProduct {
  productId: string;
  customPrice: number;
  active: boolean;
}

export const ClientCatalogManager = () => {
  const { toast } = useToast();
  const [clients, setClients] = useState<Client[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientProducts, setClientProducts] = useState<Record<string, ClientProduct>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'assigned' | 'available'>('assigned');
  const [unsavedChanges, setUnsavedChanges] = useState(false);

  // Cargar clientes con authUid
  useEffect(() => {
    const clientsRef = ref(db, 'clients');
    const unsubscribe = onValue(clientsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setClients([]);
        return;
      }
      const clientsList: Client[] = Object.entries(data)
        .map(([id, client]: any) => ({
          id,
          razonSocial: client.razonSocial || 'Sin nombre',
          authUid: client.authUid,
          emailFacturacion: client.emailFacturacion
        }))
        .filter(c => c.authUid); // Solo clientes con authUid
      setClients(clientsList);
    });
    return () => unsubscribe();
  }, []);

  // Cargar productos del catálogo general
  useEffect(() => {
    const productsRef = ref(db, 'catalog/products');
    const unsubscribe = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setProducts([]);
        return;
      }
      const productsList: Product[] = Object.entries(data)
        .map(([id, product]: any) => ({
          id,
          name: product.name || 'Sin nombre',
          description: product.description,
          imageUrl: product.imageUrl,
          wholesalePrice: Number(product.wholesalePrice) || 0,
          unit: product.unit || 'und',
          categoryId: product.categoryId
        }))
        .filter(p => p.wholesalePrice > 0);
      setProducts(productsList);
    });
    return () => unsubscribe();
  }, []);

  // Cargar productos del cliente seleccionado
  useEffect(() => {
    if (!selectedClient?.authUid) {
      setClientProducts({});
      return;
    }

    const clientCatalogRef = ref(db, `clientCatalogs/${selectedClient.authUid}/products`);
    const unsubscribe = onValue(clientCatalogRef, (snapshot) => {
      const data = snapshot.val() || {};
      setClientProducts(data);
      setUnsavedChanges(false);
    });
    return () => unsubscribe();
  }, [selectedClient]);

  // Agregar producto al catálogo del cliente
  const addProductToClient = (product: Product) => {
    if (!selectedClient?.authUid) return;

    const newClientProducts = {
      ...clientProducts,
      [product.id]: {
        productId: product.id,
        customPrice: product.wholesalePrice,
        active: true
      }
    };
    setClientProducts(newClientProducts);
    setUnsavedChanges(true);
  };

  // Remover producto del catálogo del cliente
  const removeProductFromClient = (productId: string) => {
    const newClientProducts = { ...clientProducts };
    delete newClientProducts[productId];
    setClientProducts(newClientProducts);
    setUnsavedChanges(true);
  };

  // Actualizar precio personalizado
  const updateCustomPrice = (productId: string, price: number) => {
    setClientProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        customPrice: price
      }
    }));
    setUnsavedChanges(true);
  };

  // Toggle activo/inactivo
  const toggleProductActive = (productId: string) => {
    setClientProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        active: !prev[productId].active
      }
    }));
    setUnsavedChanges(true);
  };

  // Guardar cambios en Firebase
  const saveChanges = async () => {
    if (!selectedClient?.authUid) return;

    try {
      const clientCatalogRef = ref(db, `clientCatalogs/${selectedClient.authUid}/products`);
      await set(clientCatalogRef, clientProducts);
      
      toast({
        title: "Cambios guardados",
        description: `Catálogo de ${selectedClient.razonSocial} actualizado exitosamente`
      });
      setUnsavedChanges(false);
    } catch (error) {
      toast({
        title: "Error al guardar",
        description: "No se pudieron guardar los cambios",
        variant: "destructive"
      });
    }
  };

  // Productos asignados y disponibles
  const assignedProducts = useMemo(() => {
    return products
      .filter(p => clientProducts[p.id])
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, clientProducts, searchTerm]);

  const availableProducts = useMemo(() => {
    return products
      .filter(p => !clientProducts[p.id])
      .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [products, clientProducts, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Catálogos por Cliente</h2>
          <p className="text-stone-600">Personaliza productos y precios para cada cliente mayorista</p>
        </div>
      </div>

      {/* Selector de cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Seleccionar Cliente</CardTitle>
        </CardHeader>
        <CardContent>
          <select
            value={selectedClient?.id || ''}
            onChange={(e) => {
              const client = clients.find(c => c.id === e.target.value);
              setSelectedClient(client || null);
            }}
            className="w-full px-4 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">-- Seleccione un cliente --</option>
            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.razonSocial} ({client.emailFacturacion})
              </option>
            ))}
          </select>
          {clients.length === 0 && (
            <p className="text-sm text-amber-600 mt-2">
              ⚠️ No hay clientes con acceso de autenticación. Crea clientes con email de facturación primero.
            </p>
          )}
        </CardContent>
      </Card>

      {selectedClient && (
        <>
          {/* Barra de búsqueda y acciones */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
              <Input
                placeholder="Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            {unsavedChanges && (
              <Button onClick={saveChanges} className="bg-green-600 hover:bg-green-700">
                <Save className="h-4 w-4 mr-2" />
                Guardar Cambios
              </Button>
            )}
          </div>

          {/* Tabs: Productos asignados vs disponibles */}
          <Tabs value={filterTab} onValueChange={(v) => setFilterTab(v as any)}>
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="assigned">
                Asignados ({assignedProducts.length})
              </TabsTrigger>
              <TabsTrigger value="available">
                Disponibles ({availableProducts.length})
              </TabsTrigger>
            </TabsList>

            {/* Productos asignados */}
            <TabsContent value="assigned" className="space-y-4">
              {assignedProducts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-16 w-16 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-600">No hay productos asignados a este cliente</p>
                    <p className="text-sm text-stone-500 mt-2">
                      Ve a la pestaña "Disponibles" para agregar productos
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {assignedProducts.map(product => {
                    const clientProduct = clientProducts[product.id];
                    return (
                      <Card key={product.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center gap-4">
                            <img
                              src={product.imageUrl || '/placeholder.svg'}
                              alt={product.name}
                              className="w-16 h-16 object-cover rounded"
                              onError={(e) => {
                                e.currentTarget.src = '/placeholder.svg';
                              }}
                            />
                            <div className="flex-1">
                              <h3 className="font-semibold text-stone-800">{product.name}</h3>
                              <p className="text-sm text-stone-600">
                                Precio base: S/ {product.wholesalePrice.toFixed(2)}
                              </p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4 text-stone-500" />
                                <Input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={clientProduct.customPrice}
                                  onChange={(e) => updateCustomPrice(product.id, parseFloat(e.target.value) || 0)}
                                  className="w-24"
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={clientProduct.active}
                                  onCheckedChange={() => toggleProductActive(product.id)}
                                />
                                {clientProduct.active ? (
                                  <Eye className="h-4 w-4 text-green-600" />
                                ) : (
                                  <EyeOff className="h-4 w-4 text-stone-400" />
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeProductFromClient(product.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* Productos disponibles */}
            <TabsContent value="available" className="space-y-4">
              {availableProducts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-16 w-16 text-stone-300 mx-auto mb-4" />
                    <p className="text-stone-600">
                      {searchTerm 
                        ? 'No se encontraron productos con ese criterio'
                        : 'Todos los productos ya están asignados'}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {availableProducts.map(product => (
                    <Card key={product.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.imageUrl || '/placeholder.svg'}
                            alt={product.name}
                            className="w-16 h-16 object-cover rounded"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder.svg';
                            }}
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold text-stone-800">{product.name}</h3>
                            <p className="text-sm text-stone-600">
                              Precio mayorista: S/ {product.wholesalePrice.toFixed(2)}
                            </p>
                            {product.description && (
                              <p className="text-xs text-stone-500 line-clamp-1 mt-1">
                                {product.description}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => addProductToClient(product)}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Agregar
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};
