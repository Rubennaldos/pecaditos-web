// src/lib/wholesale/saveProduct.ts
import { db } from '@/config/firebase';
import { ref as dbRef, update, set, remove } from 'firebase/database';
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from 'firebase/storage';

export type QuantityDiscount = { from: number; discountPct: number };

export type AdminProductInput = {
  /** Si vienes editando, pásalo; si no, se generará */
  id?: string;

  name: string;
  description?: string;

  /** Tu campo actual en /products (o pasas imageUrl si ya la tienes) */
  image?: string;
  imageUrl?: string;

  unit?: string; // “und.”, “caja”, etc.

  /** Precio normal (opcional) y mayorista (obligatorio) */
  price?: number;
  wholesalePrice: number;

  /** Tu campo actual en /products */
  category: string;

  /** Activo en tu admin */
  isActive?: boolean;

  /** Tu múltiplo actual (mismo nombre que usas en /products) */
  minOrder?: number;

  stock?: number;

  /** Lo que genera tu UI; puede ser array u objeto.
   * Si tu UI entrega un objeto { "0":{from,discountPct}, ... } conviértelo a array antes o pásalo como está y usa normalize abajo
   */
  quantityDiscounts?: QuantityDiscount[] | Record<string, QuantityDiscount>;
};

function toArrayDiscounts(
  src?: QuantityDiscount[] | Record<string, QuantityDiscount>
): QuantityDiscount[] {
  if (!src) return [];
  if (Array.isArray(src)) return src.filter(Boolean);
  return Object.values(src).filter(Boolean);
}

function mapToCatalog(p: AdminProductInput & { id: string }) {
  const imageUrl = p.imageUrl || p.image || undefined;
  const qtyDiscounts = toArrayDiscounts(p.quantityDiscounts);

  return {
    name: p.name,
    description: p.description || '',
    imageUrl,
    unit: p.unit || 'und.',
    price: Number.isFinite(p.price as number) ? (p.price as number) : undefined,
    wholesalePrice: Number(p.wholesalePrice || 0),
    categoryId: p.category || 'sin-categoria',
    active: p.isActive ?? true,
    activeWholesale: p.isActive ?? true,
    minMultiple: Number.isFinite(p.minOrder as number) ? (p.minOrder as number) : 6,
    stock: Number.isFinite(p.stock as number) ? (p.stock as number) : undefined,
    sortOrder: 9999,
    qtyDiscounts,
  };
}

async function uploadImageIfAny(productId: string, file?: File) {
  if (!file) return undefined;
  const storage = getStorage();
  const path = `products/${productId}/${Date.now()}_${file.name}`;
  const fileRef = sRef(storage, path);
  await uploadBytes(fileRef, file);
  return getDownloadURL(fileRef);
}

/**
 * Guarda/actualiza el producto en /products/{id} (tu fuente)
 * y su espejo normalizado en /catalog/products/{id} (lo que ve el mayorista)
 * Opcionalmente sube la imagen y guarda la URL.
 */
export async function saveProductFromAdmin(input: AdminProductInput, file?: File) {
  const id = input.id || `prod_${Date.now()}`;

  // 1) Si hay imagen nueva → Storage → URL
  const imageUrl = await uploadImageIfAny(id, file);

  // 2) Escribe/actualiza en /products (tu estructura actual)
  const sourcePayload = {
    id,
    name: input.name,
    description: input.description || '',
    image: imageUrl ?? input.image ?? input.imageUrl ?? '/placeholder.svg',
    unit: input.unit || 'und.',
    price: Number.isFinite(input.price as number) ? (input.price as number) : undefined,
    wholesalePrice: Number(input.wholesalePrice || 0),
    category: input.category || 'sin-categoria',
    isActive: input.isActive ?? true,
    minOrder: Number.isFinite(input.minOrder as number) ? (input.minOrder as number) : 6,
    stock: Number.isFinite(input.stock as number) ? (input.stock as number) : 0,
    quantityDiscounts: input.quantityDiscounts || [],
    updatedAt: Date.now(),
  };

  await set(dbRef(db, `products/${id}`), sourcePayload);

  // 3) Escribe/actualiza la proyección normalizada en /catalog/products
  const catalogPayload = mapToCatalog({ ...input, id, imageUrl: imageUrl ?? input.imageUrl });
  await set(dbRef(db, `catalog/products/${id}`), catalogPayload);

  return id;
}

/** Borrado en ambos lugares */
export async function deleteProductEverywhere(productId: string) {
  await Promise.all([
    remove(dbRef(db, `products/${productId}`)),
    remove(dbRef(db, `catalog/products/${productId}`)),
  ]);
}
