// src/components/admin/FooterEditor.tsx
import { useEffect, useState } from 'react';
import { db } from '../../config/firebase';
import { ref, onValue, update } from 'firebase/database';

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';

import { Plus, Trash2, ArrowUp, ArrowDown, Link as LinkIcon, Type, Save } from 'lucide-react';

type FooterItem = {
  type: 'text' | 'link';
  label: string;
  value: string; // texto o URL
};

type FooterSection = {
  title: string;
  items: FooterItem[];
};

function FooterEditor() {
  const [sections, setSections] = useState<FooterSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>('0');

  // Cargar desde RTDB
  useEffect(() => {
    const footerRef = ref(db, '/footer/sections');
    const off = onValue(footerRef, (snap) => {
      const val = snap.val() || [];
      setSections(Array.isArray(val) ? val : []);
      setLoading(false);
    });
    return () => off();
  }, []);

  // ---- helpers de orden ----
  const moveSection = (index: number, dir: 'up' | 'down') => {
    const to = dir === 'up' ? index - 1 : index + 1;
    if (to < 0 || to >= sections.length) return;
    const copy = [...sections];
    [copy[index], copy[to]] = [copy[to], copy[index]];
    setSections(copy);
    setActiveTab(String(to));
  };

  const moveItem = (secIdx: number, itemIdx: number, dir: 'up' | 'down') => {
    const list = sections[secIdx]?.items || [];
    const to = dir === 'up' ? itemIdx - 1 : itemIdx + 1;
    if (to < 0 || to >= list.length) return;
    const copy = [...sections];
    const newItems = [...list];
    [newItems[itemIdx], newItems[to]] = [newItems[to], newItems[itemIdx]];
    copy[secIdx].items = newItems;
    setSections(copy);
  };

  // ---- CRUD secciones ----
  const addSection = () => {
    const copy = [...sections, { title: '', items: [] }];
    setSections(copy);
    setActiveTab(String(copy.length - 1));
  };

  const removeSection = (idx: number) => {
    const copy = sections.filter((_, i) => i !== idx);
    setSections(copy);
    setActiveTab('0');
  };

  const setSectionTitle = (idx: number, title: string) => {
    const copy = [...sections];
    copy[idx].title = title;
    setSections(copy);
  };

  // ---- CRUD items ----
  const addItem = (secIdx: number) => {
    const copy = [...sections];
    copy[secIdx].items = [
      ...(copy[secIdx].items || []),
      { type: 'text', label: '', value: '' },
    ];
    setSections(copy);
  };

  const removeItem = (secIdx: number, itemIdx: number) => {
    const copy = [...sections];
    copy[secIdx].items = (copy[secIdx].items || []).filter((_, i) => i !== itemIdx);
    setSections(copy);
  };

  const setItemField = (secIdx: number, itemIdx: number, field: keyof FooterItem, value: string) => {
    const copy = [...sections];
    const items = [...(copy[secIdx].items || [])];
    items[itemIdx] = { ...items[itemIdx], [field]: value } as FooterItem;
    copy[secIdx].items = items;
    setSections(copy);
  };

  // ---- Guardar ----
  const saveFooter = async () => {
    try {
      await update(ref(db, '/footer'), { sections });
      toast({ title: 'Footer guardado', description: 'Cambios aplicados correctamente.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Error al guardar', description: 'Intenta nuevamente.', variant: 'destructive' });
    }
  };

  // ---- UI ----
  if (loading) return <div className="text-stone-400 py-6">Cargando footer…</div>;

  return (
    <Card>
      <CardHeader className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">Editor del Footer (Secciones & Enlaces)</CardTitle>
            <CardDescription>Administra el contenido, orden y tipo de cada elemento.</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={addSection}>
              <Plus className="w-4 h-4 mr-2" /> Agregar Sección
            </Button>
            <Button onClick={saveFooter}>
              <Save className="w-4 h-4 mr-2" /> Guardar Footer
            </Button>
          </div>
        </div>

        {/* Pestañas por sección (muestran orden) */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="flex flex-wrap gap-2">
            {sections.length === 0 && (
              <div className="text-sm text-stone-500 px-2">Sin secciones. Agrega una para comenzar.</div>
            )}
            {sections.map((s, i) => (
              <TabsTrigger key={i} value={String(i)} className="px-3">
                {i + 1}. {s.title?.trim() || 'Sin título'}
              </TabsTrigger>
            ))}
          </TabsList>

          {sections.map((section, i) => (
            <TabsContent key={i} value={String(i)} className="mt-4">
              {/* Cabecera de la sección */}
              <div className="flex flex-col md:flex-row md:items-end gap-3 mb-4">
                <div className="flex-1">
                  <Label>Título de la sección</Label>
                  <Input
                    placeholder="Ej: Contacto, Información, Recursos…"
                    value={section.title}
                    onChange={(e) => setSectionTitle(i, e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => moveSection(i, 'up')} disabled={i === 0}>
                    <ArrowUp className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="outline" onClick={() => moveSection(i, 'down')} disabled={i === sections.length - 1}>
                    <ArrowDown className="w-4 h-4" />
                  </Button>
                  <Button type="button" variant="outline" onClick={() => removeSection(i)}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Items */}
              <div className="space-y-3">
                {(section.items || []).map((item, j) => {
                  const isLink = item.type === 'link';
                  return (
                    <div key={j} className="border rounded-lg p-3 bg-stone-50">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                        <div className="lg:col-span-2">
                          <Label>Tipo</Label>
                          <Select
                            value={item.type}
                            onValueChange={(v: 'text' | 'link') => setItemField(i, j, 'type', v)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="text">
                                <div className="flex items-center gap-2">
                                  <Type className="w-4 h-4" /> Texto
                                </div>
                              </SelectItem>
                              <SelectItem value="link">
                                <div className="flex items-center gap-2">
                                  <LinkIcon className="w-4 h-4" /> Link
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="lg:col-span-4">
                          <Label>{isLink ? 'Etiqueta del enlace' : 'Título'}</Label>
                          <Input
                            placeholder={isLink ? 'Ej: Contáctanos' : 'Ej: Dirección'}
                            value={item.label}
                            onChange={(e) => setItemField(i, j, 'label', e.target.value)}
                          />
                        </div>

                        <div className="lg:col-span-5">
                          <Label>{isLink ? 'URL' : 'Contenido'}</Label>
                          <Input
                            placeholder={isLink ? 'https://...' : 'Texto a mostrar'}
                            value={item.value}
                            onChange={(e) => setItemField(i, j, 'value', e.target.value)}
                          />
                        </div>

                        <div className="lg:col-span-1 flex items-end gap-2">
                          <Button type="button" variant="outline" onClick={() => moveItem(i, j, 'up')} disabled={j === 0}>
                            <ArrowUp className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => moveItem(i, j, 'down')}
                            disabled={j === (section.items?.length || 0) - 1}
                          >
                            <ArrowDown className="w-4 h-4" />
                          </Button>
                        </div>

                        <div className="flex items-end">
                          <Button type="button" variant="outline" onClick={() => removeItem(i, j)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}

                <Button variant="outline" onClick={() => addItem(i)}>
                  <Plus className="w-4 h-4 mr-2" /> Agregar elemento
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardHeader>

      <CardContent>
        <p className="text-xs text-stone-500">
          Tip: usa <b>Texto</b> para líneas simples (dirección, teléfono, aviso legal). Usa <b>Link</b> para páginas y redes sociales.
        </p>
      </CardContent>

      <CardFooter className="flex justify-end">
        <Button onClick={saveFooter}>
          <Save className="w-4 h-4 mr-2" /> Guardar Footer
        </Button>
      </CardFooter>
    </Card>
  );
}

export default FooterEditor;
