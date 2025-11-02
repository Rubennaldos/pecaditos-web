import React, { useState, useEffect } from 'react';
import { 
  Edit3, 
  Save, 
  X, 
  Plus, 
  Trash2, 
  Upload,
  Package,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/use-toast';

// Interfaz para un producto (reemplaza la importación de mockData)
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  available: boolean;
  ingredients: string[];
  featured: boolean;
}

// Firebase imports for storage and realtime database
import { storage, db } from '@/config/firebase';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { ref as databaseRef, set, push, update, onValue, remove } from 'firebase/database';

/**
 * EDITOR DE CATÁLOGO MAYORISTA (ADMIN)
 * 
 * Permite al administrador editar productos del catálogo mayorista:
 * - Editar imágenes, precios, stock, descripciones
 * - Crear nuevos productos
 * - Eliminar productos existentes
 * - Gestión inline para máxima eficiencia
 */

interface EditingProduct extends Product {
  isEditing?: boolean;
  isNew?: boolean;
}

export const WholesaleCatalogEditor = () => {
  const [products, setProducts] = useState<EditingProduct[]>([]);
  const [filter, setFilter] = useState<string>('todas');
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Estado de carga

  const handleEdit = (productId: string) => {
    setProducts(prev => prev.map(product => 
      product.id === productId 
        ? { ...product, isEditing: true }
        : { ...product, isEditing: false }
    ));
  };

  const handleSave = async (productId: string, updatedData: Partial<Product>) => {
    setIsSaving(true);

    // Limpiar datos temporales de la UI antes de guardar
    const dataToSave = { ...updatedData };
    delete (dataToSave as any).isEditing;
    delete (dataToSave as any).isNew;

    try {
      let realProductId = productId;
      let successTitle = "Producto actualizado";

      if (productId.startsWith('new-')) {
        // --- CREAR NUEVO PRODUCTO ---
        successTitle = "Producto creado";
        const productsRef = databaseRef(db, 'products');
        const newProductRef = push(productsRef);
        realProductId = newProductRef.key!; // Obtenemos el ID real de Firebase

        await set(newProductRef, {
          ...dataToSave,
          id: realProductId // Guardamos el ID de Firebase dentro del objeto
        });

      } else {
        // --- ACTUALIZAR PRODUCTO EXISTENTE ---
        const productRef = databaseRef(db, `products/${productId}`);
        await update(productRef, dataToSave);
      }

      // Actualizar el estado local (optimistic update)
      // Esto es para que la UI reaccione de inmediato.
      setProducts(prev => prev.map(product =>
        product.id === productId // Buscamos por el ID temporal (ej: 'new-123')
          ? { 
              ...product, 
              ...dataToSave,
              id: realProductId, // Actualizamos al ID real de Firebase
              isEditing: false,
              isNew: false
            }
          : product
      ));

      toast({
        title: successTitle,
        description: "Los cambios se guardaron en la base de datos.",
      });

    } catch (error) {
      console.error("Error guardando producto:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar en la base de datos.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = (productId: string) => {
    setProducts(prev => {
      if (prev.find(p => p.id === productId)?.isNew) {
        return prev.filter(p => p.id !== productId);
      }
      return prev.map(product =>
        product.id === productId
          ? { ...product, isEditing: false }
          : product
      );
    });
  };

  const handleDelete = async (productId: string) => {
    // Usamos el ID del producto que ya tenemos guardado
    if (!productId || productId.startsWith('new-')) {
      toast({ title: "Error", description: "ID de producto no válido."});
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar este producto? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      // 1. Referencia al producto en RTDB
      const productRef = databaseRef(db, `products/${productId}`);

      // 2. Eliminar de RTDB
      await remove(productRef);

      toast({
        title: "Producto eliminado",
        description: "El producto se eliminó de la base de datos.",
      });

      // NOTA: No necesitamos 'setProducts'. El listener 'onValue' 
      // que configuramos en el useEffect se encargará 
      // de actualizar la UI automáticamente.

    } catch (error) {
      console.error("Error eliminando producto:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el producto.",
        variant: "destructive",
      });
    }
  };

  const handleAddNew = () => {
    const newProduct: EditingProduct = {
      id: `new-${Date.now()}`,
      name: '',
      description: '',
      price: 0,
      image: '/placeholder.svg',
      category: 'clasicas',
      available: true,
      ingredients: [],
      featured: false,
      isEditing: true,
      isNew: true
    };

    setProducts(prev => [newProduct, ...prev]);
  };

  const filteredProducts = products.filter(product => 
    filter === 'todas' || product.category === filter
  );

  useEffect(() => {
    setIsLoading(true);
    const productsRef = databaseRef(db, 'products');

    // Escuchar cambios en tiempo real
    const unsubscribe = onValue(productsRef, (snapshot) => {
      if (snapshot.exists()) {
        const productsData = snapshot.val();
        // Convertir el objeto de Firebase (ej: { id1: {...}, id2: {...} }) a un array
        const productsList: EditingProduct[] = Object.values(productsData);
        setProducts(productsList.reverse()); // .reverse() para mostrar nuevos primero
      } else {
        setProducts([]); // No hay productos
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error cargando productos:", error);
      toast({
        title: "Error al cargar datos",
        description: "No se pudieron obtener los productos.",
        variant: "destructive"
      });
      setIsLoading(false);
    });

    // Limpiar el 'listener' cuando el componente se desmonte
    return () => unsubscribe();
  }, []); // El array vacío [] asegura que esto solo se ejecute una vez

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-stone-800">Editor de Catálogo Mayorista</h2>
          <p className="text-stone-600">Gestiona productos, precios e inventario</p>
        </div>
        
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-stone-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="todas">Todas las categorías</option>
            <option value="clasicas">Galletas Clásicas</option>
            <option value="especiales">Galletas Especiales</option>
            <option value="combos">Combos</option>
          </select>
          
          <Button
            onClick={handleAddNew}
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Indicador de Carga */}
      {isLoading && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-stone-400 mx-auto mb-4 animate-pulse" />
          <h3 className="text-lg font-semibold text-stone-700">Cargando productos...</h3>
        </div>
      )}

      {/* Lista de Productos */}
      {!isLoading && (
        <div className="grid gap-6">
          {filteredProducts.map((product) => (
            <ProductEditCard
              key={product.id}
              product={product}
              isSaving={isSaving}
              onEdit={() => handleEdit(product.id)}
              onSave={(data) => handleSave(product.id, data)}
              onCancel={() => handleCancel(product.id)}
              onDelete={() => handleDelete(product.id)}
            />
          ))}
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-stone-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-stone-800 mb-2">
            No hay productos en esta categoría
          </h3>
          <p className="text-stone-600 mb-4">
            Crea el primer producto para comenzar
          </p>
          <Button onClick={handleAddNew} className="bg-blue-500 hover:bg-blue-600 text-white">
            <Plus className="h-4 w-4 mr-2" />
            Crear Primer Producto
          </Button>
        </div>
      )}
    </div>
  );
};

interface ProductEditCardProps {
  product: EditingProduct;
  isSaving: boolean;
  onEdit: () => void;
  onSave: (data: Partial<Product>) => void;
  onCancel: () => void;
  onDelete: () => void;
}

const ProductEditCard = ({ product, isSaving, onEdit, onSave, onCancel, onDelete }: ProductEditCardProps) => {
  const [editData, setEditData] = useState<Partial<Product>>({
    name: product.name,
    description: product.description,
    price: product.price,
    category: product.category,
    available: product.available,
    image: product.image
  });

  // Estado para controlar carga de imagenes
  const [isUploading, setIsUploading] = useState(false);

  const handleSave = () => {
    if (!editData.name?.trim()) {
      toast({
        title: "Error de validación",
        description: "El nombre del producto es obligatorio",
        variant: "destructive"
      });
      return;
    }

    if (!editData.price || editData.price <= 0) {
      toast({
        title: "Error de validación", 
        description: "El precio debe ser mayor a 0",
        variant: "destructive"
      });
      return;
    }

    onSave(editData);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast({ title: "Subiendo imagen...", description: "Por favor espera." });

    try {
      // 1. Crear un nombre único para el archivo (ej: products/1678886400000-mi-imagen.jpg)
      const fileName = `products/${Date.now()}-${file.name}`;
      const fileRef = storageRef(storage, fileName);

      // 2. Subir el archivo a Firebase Storage
      const snapshot = await uploadBytes(fileRef, file);

      // 3. Obtener la URL de descarga pública
      const downloadURL = await getDownloadURL(snapshot.ref);

      // 4. Actualizar el estado 'editData' con la nueva URL de Firebase
      setEditData(prev => ({ ...prev, image: downloadURL }));

      toast({
        title: "Imagen subida",
        description: "La imagen está lista para guardar.",
      });

    } catch (error) {
      console.error("Error subiendo imagen: ", error);
      toast({
        title: "Error al subir imagen",
        description: "No se pudo subir la imagen. Intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  if (product.isEditing) {
    return (
      <Card className="border-2 border-blue-300 shadow-lg">
        <CardHeader className="bg-blue-50">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Edit3 className="h-5 w-5 text-blue-600" />
              <span className="text-blue-800">
                {product.isNew ? 'Nuevo Producto' : 'Editando Producto'}
              </span>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSave} className="bg-green-500 hover:bg-green-600" disabled={isUploading || isSaving}>
                <Save className="h-4 w-4 mr-1" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </Button>
              <Button size="sm" variant="outline" onClick={onCancel} disabled={isUploading || isSaving}>
                <X className="h-4 w-4 mr-1" />
                Cancelar
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Imagen y upload */}
            <div className="space-y-4">
              <div className="relative group">
                <img
                  src={editData.image || '/placeholder.svg'}
                  alt="Vista previa"
                  className="w-full h-48 object-cover rounded-lg border-2 border-dashed border-stone-300"
                />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                  <label className="cursor-pointer bg-white/90 px-4 py-2 rounded-lg flex items-center">
                    {isUploading ? (
                      <span className="text-blue-600">Subiendo...</span>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 inline mr-2" />
                        Cambiar Imagen
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={isUploading}
                    />
                  </label>
                </div>
              </div>
              
              <Input
                placeholder="URL de imagen"
                value={editData.image || ''}
                onChange={(e) => setEditData(prev => ({ ...prev, image: e.target.value }))}
                className="text-sm"
              />
            </div>

            {/* Datos del producto */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Nombre del Producto *
                </label>
                <Input
                  value={editData.name || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Galletas de Avena Premium"
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Descripción
                </label>
                <Textarea
                  value={editData.description || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe el producto..."
                  className="w-full h-20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Precio Unitario (S/) *
                  </label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editData.price || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">
                    Estado
                  </label>
                  <select
                    value={editData.available ? 'disponible' : 'no-disponible'}
                    onChange={(e) => setEditData(prev => ({ ...prev, available: e.target.value === 'disponible' }))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="disponible">Disponible</option>
                    <option value="no-disponible">No Disponible</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  Categoría
                </label>
                <select
                  value={editData.category || 'clasicas'}
                  onChange={(e) => setEditData(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="clasicas">Galletas Clásicas</option>
                  <option value="especiales">Galletas Especiales</option>
                  <option value="combos">Combos</option>
                </select>
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.available || false}
                    onChange={(e) => setEditData(prev => ({ ...prev, available: e.target.checked }))}
                    className="rounded"
                  />
                  <span className="text-sm text-stone-700">Producto disponible</span>
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Vista normal (no editando)
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex gap-4">
          <img
            src={product.image}
            alt={product.name}
            className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-stone-800 mb-1">
                  {product.name}
                </h3>
                <p className="text-sm text-stone-600 line-clamp-2 mb-2">
                  {product.description}
                </p>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-green-600" />
                    <span className="font-medium">S/ {product.price.toFixed(2)}</span>
                  </div>
                  <Badge 
                    variant={product.category === 'clasicas' ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {product.category}
                  </Badge>
                  <Badge 
                    variant={product.available ? "default" : "secondary"}
                    className={product.available ? "bg-green-100 text-green-800" : ""}
                  >
                    {product.available ? 'Disponible' : 'No disponible'}
                  </Badge>
                </div>
              </div>
              
              <div className="flex gap-2 ml-4">
                <Button size="sm" variant="outline" onClick={onEdit}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700 hover:border-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};