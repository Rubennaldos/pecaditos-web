import { useEffect, useMemo, useState } from "react";
import { ref, onValue, push, set, update, remove } from "firebase/database";
import { db } from "@/config/firebase";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Plus, Trash2, Link as LinkIcon, Unlink, UserPlus2 } from "lucide-react";

/* ─────────────────────────── Tipos ─────────────────────────── */

type PaymentMethod = "credito" | "contado" | "contra_entrega";

type Site = {
  id: string;
  name: string;                       // Nombre de la sede (p.ej. "Pecaditos Salamanca")
  contactName?: string;               // Encargado de pedidos
  phone?: string;                     // Teléfono
  deliveryHours?: string;             // Horarios de entrega
  address?: {
    province?: string;
    district?: string;
    street?: string;                  // Dirección (calle/av, nro, etc.)
  };
  isCourier?: boolean;                // ¿Es encomienda?
  courierAgency?: string;             // Agencia de encomienda
  isHomeDelivery?: boolean;           // ¿A domicilio?
  surcharge?: number;                 // Recargo S/
  zone?: string;                      // Zona de reparto
  notes?: string;                     // Observaciones
};

type WholesaleClient = {
  id: string;

  // NUEVOS CAMPOS (cabecera)
  commercialName?: string;            // Nombre comercial
  legalName?: string;                 // Razón social
  taxId?: string;                     // RUC
  fiscalAddress?: string;             // Dirección fiscal
  paymentsContact?: string;           // Encargado de pagos
  generalManager?: string;            // Gerente general
  paymentMethod?: PaymentMethod;      // Método de pago

  // Campos existentes útiles
  email?: string;                     // Email principal (lo dejamos opcional)
  contactPhone?: string;              // Teléfono responsable (opcional)

  // Reglas de compra
  minOrder?: number;                  // Pedido mínimo S/
  active?: boolean;

  // Sedes
  sites?: Site[];
  defaultSiteId?: string;             // Sede predeterminada

  // Usuarios vinculados (igual que antes)
  users?: Record<string, { email: string; name?: string; role?: string }>;
};

type RtdbUser = { nombre?: string; correo?: string; rol?: string; activo?: boolean };

const ROOT = "wholesale/clients";

/* ─────────────────────────── Componente ─────────────────────────── */

export default function WholesaleClientsTab() {
  const [clients, setClients] = useState<WholesaleClient[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = useMemo(
    () => clients.find((c) => c.id === selectedId) || null,
    [clients, selectedId]
  );

  // Borrador del formulario
  const [form, setForm] = useState<Omit<WholesaleClient, "id"> | null>(null);

  // Usuarios con rol mayorista (para vincular)
  const [whUsers, setWhUsers] = useState<Array<{ uid: string; name: string; email: string }>>(
    []
  );
  const [userSearch, setUserSearch] = useState("");
  const [userToLink, setUserToLink] = useState("");

  /* ---------- Cargar clientes ---------- */
  useEffect(() => {
    const r = ref(db, ROOT);
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const list: WholesaleClient[] = Object.entries(val).map(([id, v]: [string, any]) => ({
        id,

        commercialName: v?.commercialName || "",
        legalName: v?.legalName || "",
        taxId: v?.taxId || "",
        fiscalAddress: v?.fiscalAddress || "",
        paymentsContact: v?.paymentsContact || "",
        generalManager: v?.generalManager || "",
        paymentMethod: (v?.paymentMethod as PaymentMethod) || "contado",

        email: v?.email || "",
        contactPhone: v?.contactPhone || "",

        minOrder: Number(v?.minOrder || 300),
        active: v?.active !== false,

        sites: Array.isArray(v?.sites) ? v.sites : [],
        defaultSiteId: v?.defaultSiteId || "",

        users: v?.users || undefined,
      }));
      // orden por nombre comercial (fallback a legalName)
      list.sort((a, b) =>
        (a.commercialName || a.legalName || "").localeCompare(
          b.commercialName || b.legalName || ""
        )
      );
      setClients(list);
      if (!selectedId && list.length) setSelectedId(list[0].id);
    });
  }, [selectedId]);

  /* ---------- Cargar usuarios mayoristas ---------- */
  useEffect(() => {
    const r = ref(db, "usuarios");
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const arr: Array<{ uid: string; name: string; email: string }> = [];
      for (const [uid, u] of Object.entries<RtdbUser>(val)) {
        if ((u.rol || "").toLowerCase() === "mayorista") {
          arr.push({ uid, name: u.nombre || "", email: u.correo || "" });
        }
      }
      arr.sort((a, b) => (a.name || a.email).localeCompare(b.name || b.email));
      setWhUsers(arr);
    });
  }, []);

  /* ---------- Sincronizar borrador ---------- */
  useEffect(() => {
    if (!selected) {
      setForm(null);
      return;
    }
    const { id, ...rest } = selected;
    setForm({ ...rest });
  }, [selected]);

  /* ---------- Helpers ---------- */
  const addClient = async () => {
    try {
      const r = push(ref(db, ROOT));
      const id = r.key!;
      await set(r, {
        commercialName: "Nuevo cliente",
        paymentMethod: "contado",
        minOrder: 300,
        active: true,
        sites: [],
        defaultSiteId: "",
        users: {},
      });
      setSelectedId(id);
      toast({ title: "Cliente creado" });
    } catch {
      toast({ title: "Error", description: "No se pudo crear el cliente", variant: "destructive" });
    }
  };

  const removeClient = async (id: string) => {
    if (!confirm("¿Eliminar este cliente mayorista?")) return;
    try {
      await remove(ref(db, `${ROOT}/${id}`));
      toast({ title: "Cliente eliminado" });
    } catch {
      toast({ title: "Error", description: "No se pudo eliminar", variant: "destructive" });
    }
  };

  // Guarda SOLO los campos del formulario (no borra users)
  const save = async () => {
    if (!selected || !form) return;
    try {
      const payload = {
        commercialName: form.commercialName ?? "",
        legalName: form.legalName ?? "",
        taxId: form.taxId ?? "",
        fiscalAddress: form.fiscalAddress ?? "",
        paymentsContact: form.paymentsContact ?? "",
        generalManager: form.generalManager ?? "",
        paymentMethod: (form.paymentMethod as PaymentMethod) ?? "contado",

        email: form.email ?? "",
        contactPhone: form.contactPhone ?? "",

        minOrder: Number(form.minOrder ?? 300),
        active: form.active !== false,

        sites: form.sites ?? [],
        defaultSiteId: form.defaultSiteId ?? "",
      };
      await update(ref(db, `${ROOT}/${selected.id}`), payload);

      // Actualiza nombre en la lista de forma optimista
      setClients((prev) =>
        prev.map((c) =>
          c.id === selected.id ? { ...c, commercialName: payload.commercialName } : c
        )
      );

      toast({ title: "Cambios guardados" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error", description: "No se pudo guardar", variant: "destructive" });
    }
  };

  /* ---------- Sedes ---------- */
  const addSite = () => {
    if (!form) return;
    setForm({
      ...form,
      sites: [
        ...(form.sites || []),
        {
          id: crypto.randomUUID(),
          name: "",
          address: { province: "", district: "", street: "" },
          isCourier: false,
          isHomeDelivery: true,
          surcharge: 0,
        },
      ],
    });
  };

  const setDefaultSite = (siteId: string) => {
    if (!form) return;
    setForm({ ...form, defaultSiteId: siteId });
  };

  const updateSite = (siteId: string, updater: (old: Site) => Site) => {
    if (!form) return;
    setForm({
      ...form,
      sites: (form.sites || []).map((s) => (s.id === siteId ? updater(s) : s)),
    });
  };

  const removeSite = (siteId: string) => {
    if (!form) return;
    setForm({
      ...form,
      sites: (form.sites || []).filter((s) => s.id !== siteId),
      defaultSiteId: form.defaultSiteId === siteId ? "" : form.defaultSiteId,
    });
  };

  /* ---------- Vincular / Desvincular usuarios ---------- */
  const linkedUsers = useMemo(() => {
    if (!form?.users) return [];
    return Object.entries(form.users).map(([uid, v]: [string, any]) => ({
      uid,
      email: v?.email || "",
      name: v?.name || "",
      role: v?.role || "comprador",
    }));
  }, [form?.users]);

  const availableUsers = useMemo(() => {
    const already = new Set(linkedUsers.map((u) => u.uid));
    const q = userSearch.trim().toLowerCase();
    return whUsers
      .filter((u) => !already.has(u.uid))
      .filter(
        (u) =>
          !q ||
          u.email.toLowerCase().includes(q) ||
          (u.name || "").toLowerCase().includes(q)
      );
  }, [whUsers, linkedUsers, userSearch]);

  const linkUser = async (uid: string) => {
    if (!selected || !form) return;
    const user = whUsers.find((u) => u.uid === uid);
    if (!user) return;

    try {
      const nextUsers = {
        ...(form.users || {}),
        [uid]: { email: user.email, name: user.name, role: "comprador" },
      };
      setForm({ ...form, users: nextUsers });

      await update(ref(db, `${ROOT}/${selected.id}/users/${uid}`), {
        email: user.email,
        name: user.name,
        role: "comprador",
      });
      await update(ref(db, `wholesale/users/${uid}`), {
        clientId: selected.id,
        email: user.email,
        name: user.name,
        role: "comprador",
      });

      setUserToLink("");
      toast({ title: "Usuario vinculado" });
    } catch {
      toast({ title: "Error", description: "No se pudo vincular", variant: "destructive" });
    }
  };

  const unlinkUser = async (uid: string) => {
    if (!selected || !form) return;
    if (!confirm("¿Quitar acceso mayorista para este usuario?")) return;

    try {
      const copy = { ...(form.users || {}) };
      delete copy[uid];
      setForm({ ...form, users: Object.keys(copy).length ? copy : undefined });

      await remove(ref(db, `${ROOT}/${selected.id}/users/${uid}`));
      await remove(ref(db, `wholesale/users/${uid}`));
      toast({ title: "Usuario desvinculado" });
    } catch {
      toast({ title: "Error", description: "No se pudo desvincular", variant: "destructive" });
    }
  };

  /* ─────────────────────────── UI ─────────────────────────── */

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      {/* Lista de clientes */}
      <Card className="lg:col-span-1">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Clientes mayoristas</h3>
            <Button size="sm" onClick={addClient}>
              <Plus className="h-4 w-4 mr-1" />
              Nuevo
            </Button>
          </div>

          <div className="space-y-2">
            {clients.map((c) => (
              <div
                key={c.id}
                className={`flex items-center justify-between rounded border p-2 cursor-pointer ${
                  selectedId === c.id ? "bg-amber-50 border-amber-300" : "bg-white"
                }`}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="truncate">
                  <div className="text-sm font-medium truncate">
                    {c.commercialName || c.legalName || "—"}
                  </div>
                  {c.legalName ? (
                    <div className="text-xs text-stone-500 truncate">{c.legalName}</div>
                  ) : null}
                </div>
                <div className="flex items-center gap-1">
                  <Badge variant={c.active ? "default" : "secondary"}>
                    {c.active ? "Activo" : "Inactivo"}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeClient(c.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Detalle */}
      <Card className="lg:col-span-2">
        <CardContent className="p-4 space-y-6">
          <h3 className="font-semibold text-lg">Detalle / Ajustes</h3>

          {!form ? (
            <p className="text-stone-500">Selecciona un cliente para editar.</p>
          ) : (
            <>
              {/* Empresa */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <Label>Nombre comercial</Label>
                  <Input
                    value={form.commercialName || ""}
                    onChange={(e) => setForm({ ...form, commercialName: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Razón social</Label>
                  <Input
                    value={form.legalName || ""}
                    onChange={(e) => setForm({ ...form, legalName: e.target.value })}
                  />
                </div>

                <div>
                  <Label>RUC</Label>
                  <Input
                    value={form.taxId || ""}
                    onChange={(e) => setForm({ ...form, taxId: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Dirección fiscal</Label>
                  <Input
                    value={form.fiscalAddress || ""}
                    onChange={(e) => setForm({ ...form, fiscalAddress: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Encargado de pagos</Label>
                  <Input
                    value={form.paymentsContact || ""}
                    onChange={(e) => setForm({ ...form, paymentsContact: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Gerente general</Label>
                  <Input
                    value={form.generalManager || ""}
                    onChange={(e) => setForm({ ...form, generalManager: e.target.value })}
                  />
                </div>

                <div>
                  <Label>Método de pago</Label>
                  <select
                    className="w-full border rounded h-9 px-3 text-sm"
                    value={form.paymentMethod || "contado"}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })
                    }
                  >
                    <option value="credito">Crédito</option>
                    <option value="contado">Al contado</option>
                    <option value="contra_entrega">Contra entrega</option>
                  </select>
                </div>
                <div>
                  <Label>Pedido mínimo (S/)</Label>
                  <Input
                    type="number"
                    value={form.minOrder ?? 300}
                    onChange={(e) =>
                      setForm({ ...form, minOrder: Number(e.target.value || 0) })
                    }
                  />
                </div>

                {/* opcionales que ya existían */}
                <div>
                  <Label>Email principal (opcional)</Label>
                  <Input
                    value={form.email || ""}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Teléfono responsable (opcional)</Label>
                  <Input
                    value={form.contactPhone || ""}
                    onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
                  />
                </div>
              </div>

              {/* Sedes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base">Sedes</Label>
                  <Button size="sm" variant="outline" onClick={addSite}>
                    <Plus className="h-4 w-4 mr-1" /> Agregar sede
                  </Button>
                </div>

                {(form.sites || []).length === 0 ? (
                  <p className="text-sm text-stone-500">Aún no hay sedes registradas.</p>
                ) : (
                  <div className="space-y-4">
                    {(form.sites || []).map((s, i) => (
                      <div key={s.id} className="border rounded p-3 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="font-medium">
                            Sede #{i + 1}
                            {form.defaultSiteId === s.id && (
                              <Badge className="ml-2" variant="secondary">
                                Predeterminada
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <label className="text-sm flex items-center gap-2">
                              <input
                                type="radio"
                                name="default-site"
                                checked={form.defaultSiteId === s.id}
                                onChange={() => setDefaultSite(s.id)}
                              />
                              Hacer predeterminada
                            </label>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSite(s.id)}
                              title="Eliminar sede"
                            >
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <Label>Nombre de la sede</Label>
                            <Input
                              value={s.name}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({ ...old, name: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <Label>Encargado de pedidos</Label>
                            <Input
                              value={s.contactName || ""}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({
                                  ...old,
                                  contactName: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div>
                            <Label>Teléfono</Label>
                            <Input
                              value={s.phone || ""}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({ ...old, phone: e.target.value }))
                              }
                            />
                          </div>
                          <div>
                            <Label>Horarios de entrega</Label>
                            <Input
                              value={s.deliveryHours || ""}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({
                                  ...old,
                                  deliveryHours: e.target.value,
                                }))
                              }
                            />
                          </div>

                          <div>
                            <Label>Provincia</Label>
                            <Input
                              value={s.address?.province || ""}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({
                                  ...old,
                                  address: {
                                    ...(old.address || {}),
                                    province: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label>Distrito</Label>
                            <Input
                              value={s.address?.district || ""}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({
                                  ...old,
                                  address: {
                                    ...(old.address || {}),
                                    district: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>

                          <div className="md:col-span-2">
                            <Label>Dirección</Label>
                            <Input
                              value={s.address?.street || ""}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({
                                  ...old,
                                  address: {
                                    ...(old.address || {}),
                                    street: e.target.value,
                                  },
                                }))
                              }
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <label className="text-sm flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={!!s.isCourier}
                                onChange={(e) =>
                                  updateSite(s.id, (old) => ({
                                    ...old,
                                    isCourier: e.target.checked,
                                  }))
                                }
                              />
                              ¿Encomienda?
                            </label>

                            <label className="text-sm flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={s.isHomeDelivery !== false}
                                onChange={(e) =>
                                  updateSite(s.id, (old) => ({
                                    ...old,
                                    isHomeDelivery: e.target.checked,
                                  }))
                                }
                              />
                              ¿A domicilio?
                            </label>
                          </div>

                          <div>
                            <Label>Agencia (si es encomienda)</Label>
                            <Input
                              value={s.courierAgency || ""}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({
                                  ...old,
                                  courierAgency: e.target.value,
                                }))
                              }
                            />
                          </div>
                          <div>
                            <Label>Recargo (S/)</Label>
                            <Input
                              type="number"
                              value={s.surcharge ?? 0}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({
                                  ...old,
                                  surcharge: Number(e.target.value || 0),
                                }))
                              }
                            />
                          </div>

                          <div>
                            <Label>Zona de reparto</Label>
                            <Input
                              value={s.zone || ""}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({ ...old, zone: e.target.value }))
                              }
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label>Observaciones</Label>
                            <Input
                              value={s.notes || ""}
                              onChange={(e) =>
                                updateSite(s.id, (old) => ({ ...old, notes: e.target.value }))
                              }
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Usuarios vinculados (igual que antes) */}
              <div className="space-y-2">
                <Label className="text-base">Usuarios vinculados</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <Input
                    placeholder="Buscar usuario mayorista por nombre o correo…"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                  />
                  <select
                    className="border rounded px-3 py-2 text-sm"
                    value={userToLink}
                    onChange={(e) => setUserToLink(e.target.value)}
                  >
                    <option value="">— Selecciona usuario —</option>
                    {availableUsers.map((u) => (
                      <option key={u.uid} value={u.uid}>
                        {u.name ? `${u.name} — ${u.email}` : u.email}
                      </option>
                    ))}
                  </select>
                  <Button onClick={() => userToLink && linkUser(userToLink)} disabled={!userToLink}>
                    <UserPlus2 className="h-4 w-4 mr-2" />
                    Vincular usuario
                  </Button>
                </div>

                {linkedUsers.length === 0 ? (
                  <p className="text-sm text-stone-500">No hay usuarios vinculados.</p>
                ) : (
                  <div className="space-y-2">
                    {linkedUsers.map((u) => (
                      <div key={u.uid} className="flex items-center justify-between border rounded p-2">
                        <div className="truncate">
                          <div className="text-sm font-medium truncate">
                            {u.name || u.email}
                          </div>
                          <div className="text-xs text-stone-500 truncate">{u.email}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary">{u.role}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => unlinkUser(u.uid)}>
                            <Unlink className="h-4 w-4 text-red-600 mr-1" />
                            Quitar
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="pt-1">
                <Button onClick={save}>
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Guardar
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
