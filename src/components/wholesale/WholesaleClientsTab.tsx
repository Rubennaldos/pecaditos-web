import { useEffect, useMemo, useState } from "react";
import { db } from "@/config/firebase";
import { onValue, ref, set, remove, push, update } from "firebase/database";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Save, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type Branch = { id: string; name: string; address?: string; phone?: string };
type CustomField = { label: string; value: string };

type QtyDiscount = { from: number; discountPct: number };

type Overrides = {
  active?: boolean;
  minMultiple?: number;         // múltiplo por cliente
  minOrder?: number;            // pedido mínimo por cliente
  extraDiscountPct?: number;    // % adicional a aplicar
  customTiers?: QtyDiscount[];  // tramos propios (suma a los del producto)
};

export type WholesaleCustomer = {
  id: string;
  displayName: string;
  email?: string;
  responsibleName?: string;
  responsiblePhone?: string;
  branches: Branch[];
  fields?: CustomField[]; // Campos libres "título: respuesta"
  overrides?: Overrides;
  createdAt?: number;
  updatedAt?: number;
};

function emptyCustomer(): WholesaleCustomer {
  return {
    id: "",
    displayName: "",
    email: "",
    responsibleName: "",
    responsiblePhone: "",
    branches: [],
    fields: [],
    overrides: {
      active: true,
      minMultiple: 6,
      minOrder: 300,
      extraDiscountPct: 0,
      customTiers: [],
    },
  };
}

export default function WholesaleClientsTab() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [list, setList] = useState<WholesaleCustomer[]>([]);
  const [selId, setSelId] = useState<string | null>(null);
  const selected = useMemo(
    () => list.find((c) => c.id === selId) ?? null,
    [list, selId]
  );

  useEffect(() => {
    const r = ref(db, "wholesale/customers");
    const off = onValue(
      r,
      (snap) => {
        const v = (snap.val() || {}) as Record<string, WholesaleCustomer>;
        const arr = Object.entries(v).map(([id, c]) => ({
          ...emptyCustomer(),
          ...c,
          id,
        }));
        arr.sort((a, b) => a.displayName.localeCompare(b.displayName));
        setList(arr);
        setLoading(false);
      },
      () => setLoading(false)
    );
    return () => off();
  }, []);

  const createNew = async () => {
    const id = push(ref(db, "wholesale/customers")).key!;
    const now = Date.now();
    const payload: WholesaleCustomer = {
      ...emptyCustomer(),
      id,
      displayName: "Nuevo cliente",
      createdAt: now,
      updatedAt: now,
    };
    await set(ref(db, `wholesale/customers/${id}`), payload);
    setSelId(id);
    toast({ title: "Cliente creado" });
  };

  const save = async (c: WholesaleCustomer) => {
    const id = c.id || push(ref(db, "wholesale/customers")).key!;
    const toSave = {
      ...c,
      id,
      updatedAt: Date.now(),
    };
    await set(ref(db, `wholesale/customers/${id}`), toSave);
    setSelId(id);
    toast({ title: "Cambios guardados" });
  };

  const del = async (id: string) => {
    if (!confirm("¿Eliminar cliente mayorista?")) return;
    await remove(ref(db, `wholesale/customers/${id}`));
    if (selId === id) setSelId(null);
    toast({ title: "Cliente eliminado" });
  };

  const quickToggleActive = async (id: string, active: boolean) => {
    await update(ref(db, `wholesale/customers/${id}/overrides`), { active });
  };

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* LISTA */}
      <Card className="col-span-12 lg:col-span-4">
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Clientes mayoristas</CardTitle>
          <Button size="sm" onClick={createNew}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo
          </Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <p className="text-sm text-stone-500">Cargando…</p>
          ) : list.length === 0 ? (
            <p className="text-sm text-stone-500">No hay clientes.</p>
          ) : (
            <div className="space-y-2">
              {list.map((c) => (
                <div
                  key={c.id}
                  className={`p-2 rounded border cursor-pointer flex items-center justify-between ${
                    selId === c.id ? "bg-blue-50 border-blue-300" : "bg-white"
                  }`}
                  onClick={() => setSelId(c.id)}
                >
                  <div>
                    <div className="font-medium">{c.displayName}</div>
                    {c.email && (
                      <div className="text-xs text-stone-500">{c.email}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        c.overrides?.active === false ? "secondary" : "default"
                      }
                    >
                      {c.overrides?.active === false ? "Inactivo" : "Activo"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        quickToggleActive(
                          c.id,
                          !(c.overrides?.active !== false)
                        );
                      }}
                      title="Activar/desactivar"
                    >
                      {c.overrides?.active === false ? "⏻" : "⏼"}
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="text-red-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        del(c.id);
                      }}
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* EDITOR */}
      <Card className="col-span-12 lg:col-span-8">
        <CardHeader>
          <CardTitle>Detalle / Ajustes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!selected ? (
            <p className="text-sm text-stone-500">
              Selecciona un cliente para editar.
            </p>
          ) : (
            <Editor customer={selected} onSave={save} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

/* ============ Editor ============ */

function Editor({
  customer,
  onSave,
}: {
  customer: WholesaleCustomer;
  onSave: (c: WholesaleCustomer) => Promise<void>;
}) {
  const [data, setData] = useState<WholesaleCustomer>(customer);

  useEffect(() => setData(customer), [customer]);

  const addBranch = () =>
    setData((p) => ({
      ...p,
      branches: [
        ...(p.branches || []),
        { id: `b_${Date.now()}`, name: "Nueva sede" },
      ],
    }));

  const addField = () =>
    setData((p) => ({
      ...p,
      fields: [...(p.fields || []), { label: "Título", value: "" }],
    }));

  const addTier = () =>
    setData((p) => ({
      ...p,
      overrides: {
        ...(p.overrides || {}),
        customTiers: [
          ...((p.overrides?.customTiers as QtyDiscount[]) || []),
          { from: 12, discountPct: 5 },
        ],
      },
    }));

  return (
    <div className="space-y-6">
      {/* Identidad */}
      <section className="grid sm:grid-cols-2 gap-4">
        <div>
          <Label>Nombre / Razón social</Label>
          <Input
            value={data.displayName}
            onChange={(e) =>
              setData((p) => ({ ...p, displayName: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Email principal</Label>
          <Input
            type="email"
            value={data.email || ""}
            onChange={(e) => setData((p) => ({ ...p, email: e.target.value }))}
          />
        </div>

        <div>
          <Label>Responsable de pedidos</Label>
          <Input
            value={data.responsibleName || ""}
            onChange={(e) =>
              setData((p) => ({ ...p, responsibleName: e.target.value }))
            }
          />
        </div>
        <div>
          <Label>Teléfono responsable</Label>
          <Input
            value={data.responsiblePhone || ""}
            onChange={(e) =>
              setData((p) => ({ ...p, responsiblePhone: e.target.value }))
            }
          />
        </div>
      </section>

      {/* Sedes */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <Label>Sedes</Label>
          <Button size="sm" variant="outline" onClick={addBranch}>
            <Plus className="h-4 w-4 mr-2" /> Agregar sede
          </Button>
        </div>
        {(data.branches || []).map((b, i) => (
          <div key={b.id} className="grid sm:grid-cols-3 gap-2 mb-2">
            <Input
              placeholder="Nombre de la sede"
              value={b.name}
              onChange={(e) =>
                setData((p) => ({
                  ...p,
                  branches: p.branches.map((x, idx) =>
                    idx === i ? { ...x, name: e.target.value } : x
                  ),
                }))
              }
            />
            <Input
              placeholder="Dirección"
              value={b.address || ""}
              onChange={(e) =>
                setData((p) => ({
                  ...p,
                  branches: p.branches.map((x, idx) =>
                    idx === i ? { ...x, address: e.target.value } : x
                  ),
                }))
              }
            />
            <div className="flex gap-2">
              <Input
                placeholder="Teléfono"
                value={b.phone || ""}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    branches: p.branches.map((x, idx) =>
                      idx === i ? { ...x, phone: e.target.value } : x
                    ),
                  }))
                }
              />
              <Button
                variant="outline"
                size="icon"
                className="text-red-600"
                onClick={() =>
                  setData((p) => ({
                    ...p,
                    branches: p.branches.filter((_, idx) => idx !== i),
                  }))
                }
                title="Quitar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </section>

      {/* Campos libres */}
      <section>
        <div className="flex items-center justify-between mb-2">
          <Label>Campos personalizados</Label>
          <Button size="sm" variant="outline" onClick={addField}>
            <Plus className="h-4 w-4 mr-2" /> Agregar campo
          </Button>
        </div>
        {(data.fields || []).map((f, i) => (
          <div key={i} className="grid sm:grid-cols-3 gap-2 mb-2">
            <Input
              placeholder="Título (ej: Nombre del responsable)"
              value={f.label}
              onChange={(e) =>
                setData((p) => ({
                  ...p,
                  fields: p.fields!.map((x, idx) =>
                    idx === i ? { ...x, label: e.target.value } : x
                  ),
                }))
              }
            />
            <div className="sm:col-span-2 flex gap-2">
              <Input
                placeholder="Respuesta"
                value={f.value}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    fields: p.fields!.map((x, idx) =>
                      idx === i ? { ...x, value: e.target.value } : x
                    ),
                  }))
                }
              />
              <Button
                variant="outline"
                size="icon"
                className="text-red-600"
                onClick={() =>
                  setData((p) => ({
                    ...p,
                    fields: p.fields!.filter((_, idx) => idx !== i),
                  }))
                }
                title="Quitar"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </section>

      {/* Overrides de precios / reglas */}
      <section className="grid sm:grid-cols-4 gap-3">
        <div>
          <Label>Múltiplo (min. por pedido)</Label>
          <Input
            type="number"
            min={1}
            value={data.overrides?.minMultiple ?? 6}
            onChange={(e) =>
              setData((p) => ({
                ...p,
                overrides: {
                  ...(p.overrides || {}),
                  minMultiple: Math.max(1, Number(e.target.value) || 6),
                },
              }))
            }
          />
        </div>
        <div>
          <Label>Pedido mínimo (S/)</Label>
          <Input
            type="number"
            min={0}
            value={data.overrides?.minOrder ?? 300}
            onChange={(e) =>
              setData((p) => ({
                ...p,
                overrides: {
                  ...(p.overrides || {}),
                  minOrder: Math.max(0, Number(e.target.value) || 0),
                },
              }))
            }
          />
        </div>
        <div>
          <Label>% desc. adicional</Label>
          <Input
            type="number"
            min={0}
            max={100}
            value={data.overrides?.extraDiscountPct ?? 0}
            onChange={(e) =>
              setData((p) => ({
                ...p,
                overrides: {
                  ...(p.overrides || {}),
                  extraDiscountPct: Math.min(
                    100,
                    Math.max(0, Number(e.target.value) || 0)
                  ),
                },
              }))
            }
          />
        </div>
        <div className="flex items-end">
          <Button variant="outline" size="sm" onClick={addTier}>
            <Plus className="h-4 w-4 mr-2" />
            Agregar tramo
          </Button>
        </div>

        {(data.overrides?.customTiers || []).map((t, i) => (
          <div key={i} className="sm:col-span-4 grid grid-cols-3 gap-2">
            <div>
              <Label>Desde (unid.)</Label>
              <Input
                type="number"
                min={1}
                value={t.from}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    overrides: {
                      ...(p.overrides || {}),
                      customTiers: p.overrides?.customTiers!.map((x, idx) =>
                        idx === i ? { ...x, from: Number(e.target.value) } : x
                      ),
                    },
                  }))
                }
              />
            </div>
            <div>
              <Label>% descuento</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={t.discountPct}
                onChange={(e) =>
                  setData((p) => ({
                    ...p,
                    overrides: {
                      ...(p.overrides || {}),
                      customTiers: p.overrides?.customTiers!.map((x, idx) =>
                        idx === i
                          ? { ...x, discountPct: Number(e.target.value) }
                          : x
                      ),
                    },
                  }))
                }
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                size="icon"
                className="text-red-600"
                onClick={() =>
                  setData((p) => ({
                    ...p,
                    overrides: {
                      ...(p.overrides || {}),
                      customTiers: p.overrides?.customTiers!.filter(
                        (_, idx) => idx !== i
                      ),
                    },
                  }))
                }
                title="Quitar tramo"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </section>

      <div className="pt-2 border-t">
        <Button onClick={() => onSave(data)}>
          <Save className="h-4 w-4 mr-2" />
          Guardar
        </Button>
      </div>
    </div>
  );
}
