import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit3, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/config/firebase'; // <- si no tienes alias "@", usa '../../../config/firebase'
import { ref, onValue, push, set, update, remove } from 'firebase/database';

// ---- Tipos locales (puedes moverlos a /src/types si quieres)
interface Product {
  id: string;
  name: string;
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

type DraftPromotion = Omit<Promotion, 'id'>;

export default function PromotionsTab({ products = [] as Product[] }: { products?: Product[] }) {
  const { toast } = useToast();

  // Lista
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);

  // Formulario (crear/editar)
  const emptyDraft: DraftPromotion = {
    title: '',
    description: '',
    discount: 0,
    validUntil: '',
    products: [],
    isActive: true,
  };
  const [showCreate, setShowCreate] = useState(false);
  const [editing, setEditing] = useState<Promotion | null>(null);
  const [draft, setDraft] = useState<DraftPromotion>(emptyDraft);

  // ---- Cargar promociones
  useEffect(() => {
    const promosRef = ref(db, 'promotions');
    const unsub = onValue(promosRef, (snap) => {
      const data = snap.val();
      const list: Promotion[] = data
        ? Object.entries<any>(data).map(([id, v]) => ({
            id,
            title: v.title ?? '',
            description: v.description ?? '',
            discount: Number(v.discount ?? 0),
            validUntil: v.validUntil ?? '',
            products: Array.isArray(v.products) ? v.products : [],
            isActive: Boolean(v.isActive),
          }))
        : [];
      setPromotions(list);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // ---- Helpers
  const resetForm = () => {
    setDraft(emptyDraft);
    setShowCreate(false);
    setEditing(null);
  };

  // ---- Crear
  const handleCreate = async () => {
    if (!draft.title || draft.discount <= 0) {
      toast({ title: 'Completa título y descuento', variant: 'destructive' });
      return;
    }
    const key = push(ref(db, 'promotions')).key!;
    await set(ref(db, `promotions/${key}`), draft);
    toast({ title: 'Promoción creada' });
    resetForm();
  };

  // ---- Editar/Actualizar
  const startEdit = (p: Promotion) => {
    setEditing(p);
    setDraft({
      title: p.title,
      description: p.description,
      discount: p.discount,
      validUntil: p.validUntil,
      products: p.products,
      isActive: p.isActive,
    });
    setShowCreate(false);
  };

  const handleUpdate = async () => {
    if (!editing) return;
    if (!draft.title || draft.discount <= 0) {
      toast({ title: 'Completa título y descuento', variant: 'destructive' });
      return;
    }
    await update(ref(db, `promotions/${editing.id}`), draft);
    toast({ title: 'Promoción actualizada' });
    resetForm();
  };

  // ---- Eliminar
  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta promoción?')) return;
    await remove(ref(db, `promotions/${id}`));
    toast({ title: 'Promoción eliminada' });
  };

  // ---- UI formulario inline (vale para crear/editar)
  const Form = (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Label>Título *</Label>
            <Input
              value={draft.title}
              onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
              placeholder="Ej: 20% en línea de arroces"
            />
          </div>
          <div>
            <Label>Descuento (%) *</Label>
            <Input
              type="number"
              min={0}
              max={100}
              value={draft.discount}
              onChange={(e) =>
                setDraft((p) => ({ ...p, discount: Number(e.target.value) || 0 }))
              }
            />
          </div>
          <div className="md:col-span-2">
            <Label>Descripción</Label>
            <Textarea
              rows={2}
              value={draft.description}
              onChange={(e) => setDraft((p) => ({ ...p, description: e.target.value }))}
              placeholder="Condiciones, categorías, etc."
            />
          </div>
          <div>
            <Label>Válido hasta</Label>
            <Input
              type="date"
              value={draft.validUntil}
              onChange={(e) => setDraft((p) => ({ ...p, validUntil: e.target.value }))}
            />
          </div>
          <div className="flex items-center gap-2 mt-6">
            <input
              id="isActive"
              type="checkbox"
              checked={draft.isActive}
              onChange={(e) => setDraft((p) => ({ ...p, isActive: e.target.checked }))}
            />
            <Label htmlFor="isActive">Activa</Label>
          </div>
          <div className="md:col-span-2">
            <Label>Productos incluidos</Label>
            <div className="flex flex-wrap gap-2 mt-2">
              {products.length === 0 && (
                <span className="text-xs text-stone-500">
                  (Aún no hay productos cargados)
                </span>
              )}
              {products.map((pr) => {
                const selected = draft.products.includes(pr.id);
                return (
                  <Button
                    key={pr.id}
                    type="button"
                    size="sm"
                    variant={selected ? 'default' : 'outline'}
                    onClick={() =>
                      setDraft((p) => ({
                        ...p,
                        products: selected
                          ? p.products.filter((id) => id !== pr.id)
                          : [...p.products, pr.id],
                      }))
                    }
                  >
                    {pr.name}
                  </Button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          {editing ? (
            <Button onClick={handleUpdate} disabled={!draft.title || draft.discount <= 0}>
              <Save className="h-4 w-4 mr-1" /> Actualizar
            </Button>
          ) : (
            <Button onClick={handleCreate} disabled={!draft.title || draft.discount <= 0}>
              <Save className="h-4 w-4 mr-1" /> Guardar
            </Button>
          )}
          <Button variant="outline" onClick={resetForm}>
            <X className="h-4 w-4 mr-1" /> Cancelar
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Promociones</h2>
        <Button
          className="bg-purple-500 hover:bg-purple-600"
          onClick={() => {
            setEditing(null);
            setDraft(emptyDraft);
            setShowCreate(true);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Nueva Promoción
        </Button>
      </div>

      {showCreate && Form}
      {editing && Form}

      {loading && <div className="text-center text-gray-400">Cargando promociones…</div>}
      {!loading && promotions.length === 0 && (
        <div className="text-center text-gray-500">No hay promociones activas.</div>
      )}

      {promotions.map((promotion) => (
        <Card key={promotion.id}>
          <CardContent className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{promotion.title}</h3>
                <p className="text-stone-600 mb-2">{promotion.description}</p>
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary">{promotion.discount}% descuento</Badge>
                  <span>Válido hasta: {promotion.validUntil || '—'}</span>
                  <Badge variant={promotion.isActive ? 'default' : 'secondary'}>
                    {promotion.isActive ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startEdit(promotion)}>
                  <Edit3 className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={() => handleDelete(promotion.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
