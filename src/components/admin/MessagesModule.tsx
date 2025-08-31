// src/components/admin/MessagesModule.tsx
import { useEffect, useMemo, useState } from "react";
import { ref, push, onValue, update } from "firebase/database";
import { db } from "@/config/firebase";
import {
  MessageSquare, Plus, Send, X, Eye, Search, Clock,
  Pencil, Archive, ArchiveRestore, Power
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";

type UsuarioActual = {
  id: string;
  rol: "admin" | "cliente";
  email: string;
};

type Profile = {
  value: string;   // id
  label: string;   // Nombre visible
  rol: "admin" | "cliente";
};

type Message = {
  id?: string;
  title: string;
  content: string;
  image: string;            // dataURL (opcional)
  recipients: string[];     // ["all"] o ids de usuario

  // NUEVO
  startAt?: string;         // ISO (datetime-local)
  endAt?: string;           // ISO
  active?: boolean;         // default true
  archived?: boolean;       // default false
  toRole?: "admin" | "cliente" | null; // marcador de envío por rol

  // meta
  sentBy: string;
  sentAt: string;
  status: string;
  readBy: string[];
};

interface Props { usuarioActual: UsuarioActual; }

// util: hoy en zona local -> value para input datetime-local (sin segundos)
function asLocalInput(dt: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const y = dt.getFullYear();
  const m = pad(dt.getMonth() + 1);
  const d = pad(dt.getDate());
  const hh = pad(dt.getHours());
  const mm = pad(dt.getMinutes());
  return `${y}-${m}-${d}T${hh}:${mm}`;
}

console.log("MessagesModule NUEVO cargado - módulo importado");

const MessagesModule: React.FC<Props> = ({ usuarioActual }) => {
  useEffect(() => {
    console.log("MessagesModule montado", { usuarioActual });
  }, []);

  // ---------- state ----------
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"todos"|"admin"|"cliente">("todos");
  const [userFilter, setUserFilter] = useState<string>("all");
  const [archiveFilter, setArchiveFilter] = useState<"activos"|"archivados"|"todos">("activos");

  const [showNewModal, setShowNewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<null|Message>(null);
  const [selectedMessage, setSelectedMessage] = useState<Message|null>(null);

  // popup (controlado)
  const [showPopup, setShowPopup] = useState(false);
  const [activePopupMessage, setActivePopupMessage] = useState<Message | null>(null);

  // form crear/editar
  const emptyForm: Omit<Message, "id"|"sentBy"|"sentAt"|"status"|"readBy"> = {
    title: "",
    content: "",
    image: "",
    recipients: [],
    startAt: asLocalInput(new Date()),
    endAt: "",
    active: true,
    archived: false,
    toRole: null,
  };
  const [newMessage, setNewMessage] = useState<typeof emptyForm>(emptyForm);

  // ---------- cargar usuarios ----------
  useEffect(() => {
    const usersRef = ref(db, "usuarios");
    return onValue(usersRef, (snap) => {
      const data = snap.val() || {};
      const arr: Profile[] = Object.entries(data).map(([id, v]: [string, any]) => ({
        value: id,
        label: v?.nombre ? `${v?.rol === "admin" ? "Administrador" : "Cliente"}: ${v.nombre}` : (v?.email || id),
        rol: v?.rol === "admin" ? "admin" : "cliente",
      }));
      setProfiles(arr);
    });
  }, []);

  // ---------- cargar mensajes ----------
  useEffect(() => {
    const messagesRef = ref(db, "mensajes");
    return onValue(messagesRef, (snap) => {
      const data = snap.val() || {};
      const arr: Message[] = Object.entries(data)
        .map(([id, val]: [string, any]) => ({
          id, ...val,
          active: val?.active !== false,
          archived: !!val?.archived,
          toRole: (val?.toRole ?? null),
        }))
        .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
      setMessages(arr);
    });
  }, []);

  // ---------- utilidades de vigencia/activo ----------
  const withinRange = (m: Message) => {
    const now = Date.now();
    const start = m.startAt ? new Date(m.startAt).getTime() : -Infinity;
    const end = m.endAt ? new Date(m.endAt).getTime() : Infinity;
    return now >= start && now <= end;
  };

  const effectiveActive = (m: Message) => (m.active !== false) && withinRange(m) && !m.archived;

  // ---------- popup por destinatario (SOLO clientes) ----------
  // FIX: Evitamos que se abra en módulos de administración. Solo clientes.
  //      Además, respeta vigencia/activo/no archivado y “no repetido” por sesión.
  useEffect(() => {
    if (!usuarioActual || usuarioActual.rol !== "cliente") return;

    const candidate = messages.find(m =>
      effectiveActive(m) &&
      Array.isArray(m.recipients) &&
      (m.recipients.includes("all") || m.recipients.includes(usuarioActual.id)) &&
      !sessionStorage.getItem(`msg_dismissed_${m.id}`) // no repetido esta sesión
    );

    if (candidate) {
      setActivePopupMessage(candidate);
      setShowPopup(true);
    }
  }, [messages, usuarioActual]); // eslint-disable-line react-hooks/exhaustive-deps

  // FIX: Centralizamos el cierre para marcar “descartado”
  const closePopup = () => {
    if (activePopupMessage?.id) {
      sessionStorage.setItem(`msg_dismissed_${activePopupMessage.id}`, "1");
    }
    setShowPopup(false);
  };

  // ---------- helpers ----------
  const adminsIds = useMemo(
    () => profiles.filter(p => p.rol === "admin").map(p => p.value),
    [profiles]
  );
  const clientsIds = useMemo(
    () => profiles.filter(p => p.rol === "cliente").map(p => p.value),
    [profiles]
  );

  const handleRecipientBulk = (kind: "all"|"admins"|"clients"|"none") => {
    if (kind === "all") {
      setNewMessage(p => ({ ...p, recipients: ["all"], toRole: null }));
    } else if (kind === "admins") {
      setNewMessage(p => ({ ...p, recipients: adminsIds, toRole: "admin" }));
    } else if (kind === "clients") {
      setNewMessage(p => ({ ...p, recipients: clientsIds, toRole: "cliente" }));
    } else {
      setNewMessage(p => ({ ...p, recipients: [], toRole: null }));
    }
  };

  const handleRecipientToggle = (id: string, checked: boolean) => {
    setNewMessage(prev => {
      const s = new Set(prev.recipients);
      if (checked) s.add(id); else s.delete(id);
      // si seleccionas a mano, quitamos "all" y toRole
      s.delete("all");
      return { ...prev, recipients: Array.from(s), toRole: null };
    });
  };

  // ---------- filtros de la grilla ----------
  const filtered = messages.filter(m => {
    // Archivado
    if (archiveFilter === "activos" && m.archived) return false;
    if (archiveFilter === "archivados" && !m.archived) return false;

    // Filtro rol: usamos m.toRole si existe o inferimos por recipients
    if (roleFilter !== "todos") {
      const targetRole = m.toRole
        ?? (m.recipients.includes("all") ? "todos" :
            (m.recipients.every(id => adminsIds.includes(id)) ? "admin" :
             m.recipients.every(id => clientsIds.includes(id)) ? "cliente" : "todos"));
      if (roleFilter !== targetRole) return false;
    }

    // Filtro usuario específico (solo aplica si eliges uno)
    if (userFilter !== "all") {
      if (!(m.recipients.includes("all") || m.recipients.includes(userFilter))) return false;
    }

    // search
    const q = searchTerm.toLowerCase();
    return !q || m.title.toLowerCase().includes(q) || m.content.toLowerCase().includes(q);
  });

  // ---------- enviar / editar ----------
  const handleSend = async (isEdit?: string) => {
    if (!newMessage.title.trim() || !newMessage.content.trim() || newMessage.recipients.length === 0) {
      toast({ title: "Completa los campos", description: "Título, contenido y destinatarios.", variant: "destructive" });
      return;
    }
    const payload: Omit<Message, "id"> = {
      ...newMessage,
      sentBy: usuarioActual?.email ?? "Admin",
      sentAt: new Date().toISOString(),
      status: "enviado",
      readBy: [],
      active: newMessage.active !== false,
      archived: !!newMessage.archived,
      toRole: newMessage.toRole ?? null
    };

    try {
      if (isEdit) {
        await update(ref(db, `mensajes/${isEdit}`), payload);
        toast({ title: "Mensaje actualizado" });
      } else {
        await push(ref(db, "mensajes"), payload);
        toast({ title: "Mensaje enviado" });
      }
      setShowNewModal(false);
      setShowEditModal(null);
      setNewMessage(emptyForm);
    } catch {
      toast({ title: "Error", description: "No se pudo guardar.", variant: "destructive" });
    }
  };

  const openEdit = (m: Message) => {
    setNewMessage({
      title: m.title,
      content: m.content,
      image: m.image || "",
      recipients: m.recipients || [],
      startAt: m.startAt || "",
      endAt: m.endAt || "",
      active: m.active !== false,
      archived: !!m.archived,
      toRole: m.toRole ?? null,
    });
    setShowEditModal(m);
  };

  const toggleActive = async (m: Message) => {
    await update(ref(db, `mensajes/${m.id}`), { active: !(m.active !== false) });
  };

  const toggleArchive = async (m: Message) => {
    await update(ref(db, `mensajes/${m.id}`), { archived: !m.archived });
  };

  // ---------- UI ----------
  const renderRecipientsChips = (message: Message) => {
    if (message.recipients.includes("all")) {
      return <Badge variant="secondary">Todos los usuarios</Badge>;
    }
    return (
      <>
        {message.toRole && <Badge variant="secondary">Solo {message.toRole}</Badge>}
        {message.recipients.map(id => {
          const p = profiles.find(x => x.value === id);
          return <Badge key={id} variant="secondary">{p?.label || id}</Badge>;
        })}
      </>
    );
  };

  return (
    <div className="space-y-6">
      {/* POPUP opcional (controlado) */}
      {showPopup && activePopupMessage && (
        <Dialog
          open={showPopup}
          // FIX: marcar como “descartado” si se cierra por backdrop/esc
          onOpenChange={(o) => { if (!o) closePopup(); }}
        >
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>{activePopupMessage.title}</DialogTitle>
              <DialogDescription>Mensaje importante del sistema</DialogDescription>
            </DialogHeader>
            {activePopupMessage.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={activePopupMessage.image} alt="" className="w-full rounded-xl mb-3" />
            )}
            <p className="text-stone-700">{activePopupMessage.content}</p>
            <DialogFooter>
              <Button onClick={closePopup}>Cerrar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* CABECERA */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-stone-800">Mensajes del Sistema</h1>
          <p className="text-stone-600 mt-1">Avisos, anuncios y recordatorios a usuarios y perfiles</p>
        </div>
        <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Nuevo Mensaje</Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Mensaje</DialogTitle>
              <DialogDescription>Define vigencia, destinatarios y contenido</DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Título</Label>
                <Input value={newMessage.title}
                  onChange={(e)=>setNewMessage(p=>({...p,title:e.target.value}))}
                  placeholder="Ej: Mantenimiento del sistema" />
              </div>

              <div className="md:col-span-2">
                <Label>Contenido</Label>
                <Textarea rows={4} value={newMessage.content}
                  onChange={(e)=>setNewMessage(p=>({...p,content:e.target.value}))}
                  placeholder="Escribe tu mensaje aquí" />
              </div>

              <div>
                <Label>Inicio</Label>
                <Input type="datetime-local"
                  value={newMessage.startAt || ""}
                  onChange={(e)=>setNewMessage(p=>({...p,startAt:e.target.value}))} />
              </div>
              <div>
                <Label>Fin</Label>
                <Input type="datetime-local"
                  value={newMessage.endAt || ""}
                  onChange={(e)=>setNewMessage(p=>({...p,endAt:e.target.value}))} />
              </div>

              <div>
                <Label>Imagen (opcional)</Label>
                <Input type="file" accept="image/*"
                  onChange={(e)=>{
                    const f=(e.target as HTMLInputElement).files?.[0];
                    if(!f) return;
                    const fr=new FileReader();
                    fr.onload=(ev)=> setNewMessage(p=>({...p,image: String(ev.target?.result||"")} ));
                    fr.readAsDataURL(f);
                  }}/>
                {newMessage.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={newMessage.image} alt="" className="w-24 h-24 mt-2 rounded border object-cover" />
                )}
              </div>

              <div className="space-y-2">
                <Label>Accesos rápidos</Label>
                <div className="flex gap-2 flex-wrap">
                  <Button type="button" variant="outline" onClick={()=>handleRecipientBulk("all")}>Todos</Button>
                  <Button type="button" variant="outline" onClick={()=>handleRecipientBulk("admins")}>Solo administradores</Button>
                  <Button type="button" variant="outline" onClick={()=>handleRecipientBulk("clients")}>Solo clientes</Button>
                  <Button type="button" variant="outline" onClick={()=>handleRecipientBulk("none")}>Limpiar</Button>
                </div>
              </div>

              <div className="md:col-span-2">
                <Label>Seleccionar usuarios</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 max-h-48 overflow-auto border rounded p-2">
                  {profiles.map(p=>(
                    <label key={p.value} className="flex items-center gap-2">
                      <Checkbox
                        checked={newMessage.recipients.includes(p.value) || newMessage.recipients.includes("all")}
                        onCheckedChange={(c)=>handleRecipientToggle(p.value, Boolean(c))}
                        disabled={newMessage.recipients.includes("all")}
                      />
                      <span>{p.label}</span>
                    </label>
                  ))}
                </div>
                {newMessage.recipients.includes("all") && (
                  <p className="text-xs text-stone-500 mt-1">Seleccionaste “Todos los usuarios”.</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  checked={newMessage.active !== false}
                  onCheckedChange={(c)=>setNewMessage(p=>({...p,active:Boolean(c)}))}
                />
                <Label>Activo</Label>
              </div>
            </div>

            <DialogFooter className="pt-4">
              <Button variant="outline" onClick={()=>setShowNewModal(false)}><X className="h-4 w-4 mr-2"/>Cancelar</Button>
              <Button onClick={()=>handleSend()} className="bg-blue-600 hover:bg-blue-700">
                <Send className="h-4 w-4 mr-2"/>Guardar / Enviar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* FILTROS */}
      <Card>
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input className="pl-10" placeholder="Buscar mensajes..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
          </div>

          <Select value={roleFilter} onValueChange={(v:any)=>setRoleFilter(v)}>
            <SelectTrigger><SelectValue placeholder="Rol destino" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos los roles</SelectItem>
              <SelectItem value="admin">Administradores</SelectItem>
              <SelectItem value="cliente">Clientes</SelectItem>
            </SelectContent>
          </Select>

          <Select value={userFilter} onValueChange={(v:any)=>setUserFilter(v)}>
            <SelectTrigger><SelectValue placeholder="Usuario destino" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los usuarios</SelectItem>
              {profiles.map(p=>(
                <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={archiveFilter} onValueChange={(v:any)=>setArchiveFilter(v)}>
            <SelectTrigger><SelectValue placeholder="Estado" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="activos">Activos</SelectItem>
              <SelectItem value="archivados">Archivados</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* LISTA */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <Card><CardContent className="p-8 text-center">
            <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-600 mb-2">No hay mensajes</h3>
            <p className="text-gray-500">Prueba con otros filtros.</p>
          </CardContent></Card>
        ) : filtered.map(m => {
          const isActiveNow = effectiveActive(m);
          return (
            <Card key={m.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg text-stone-800">{m.title}</h3>
                    <div className="flex flex-wrap gap-2">{renderRecipientsChips(m)}</div>
                    <div className="flex items-center gap-4 text-sm text-stone-500 mt-2">
                      <span className="flex items-center gap-1"><Clock className="h-4 w-4"/>{new Date(m.sentAt).toLocaleString("es-PE")}</span>
                      {m.startAt && <span>Inicio: {new Date(m.startAt).toLocaleString("es-PE")}</span>}
                      {m.endAt && <span>Fin: {new Date(m.endAt).toLocaleString("es-PE")}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={()=>setSelectedMessage(m)} title="Ver">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={()=>openEdit(m)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={()=>toggleActive(m)} title="Activar/Desactivar"
                      className={isActiveNow ? "text-green-600 border-green-300" : "text-stone-500"}>
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={()=>toggleArchive(m)} title={m.archived ? "Restaurar" : "Archivar"}
                      className={m.archived ? "text-amber-700 border-amber-300" : ""}>
                      {m.archived ? <ArchiveRestore className="h-4 w-4" /> : <Archive className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {m.image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={m.image} alt="" className="w-full max-w-xs rounded-lg mb-4 border object-contain" />
                )}

                <p className="text-stone-700">{m.content.length > 240 ? m.content.slice(0,240)+"…" : m.content}</p>

                <Separator className="my-4" />
                <div className="flex justify-between items-center text-sm text-stone-500">
                  <span>Por: {m.sentBy}</span>
                  <span className="flex items-center gap-1"><Eye className="h-4 w-4" />{m.readBy?.length || 0} visto(s)</span>
                  <Badge variant={isActiveNow ? "default" : "outline"}>{isActiveNow ? "Activo" : "Inactivo"}</Badge>
                  {m.archived && <Badge variant="outline">Archivado</Badge>}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* DETALLE */}
      <Dialog open={!!selectedMessage} onOpenChange={()=>setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.title}</DialogTitle>
            <DialogDescription>Detalles del mensaje</DialogDescription>
          </DialogHeader>
          {selectedMessage && (
            <div className="space-y-4">
              {selectedMessage.image && (
                <div className="flex justify-center mb-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={selectedMessage.image} alt="" className="max-w-sm max-h-64 rounded-lg object-contain"/>
                </div>
              )}
              <p className="text-stone-700 whitespace-pre-wrap">{selectedMessage.content}</p>
              <div className="flex flex-wrap gap-2">{renderRecipientsChips(selectedMessage)}</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-stone-600">Enviado:</span><p className="font-medium">{new Date(selectedMessage.sentAt).toLocaleString("es-PE")}</p></div>
                <div><span className="text-stone-600">Leído por:</span><p className="font-medium">{selectedMessage.readBy?.length || 0} usuarios</p></div>
              </div>
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={()=>setSelectedMessage(null)}>Cerrar</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* EDITAR */}
      <Dialog open={!!showEditModal} onOpenChange={()=>setShowEditModal(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Editar Mensaje</DialogTitle>
            <DialogDescription>Actualiza los campos y guarda</DialogDescription>
          </DialogHeader>
          {showEditModal && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Título</Label>
                <Input value={newMessage.title} onChange={(e)=>setNewMessage(p=>({...p,title:e.target.value}))}/>
              </div>
              <div className="md:col-span-2">
                <Label>Contenido</Label>
                <Textarea rows={4} value={newMessage.content} onChange={(e)=>setNewMessage(p=>({...p,content:e.target.value}))}/>
              </div>
              <div>
                <Label>Inicio</Label>
                <Input type="datetime-local" value={newMessage.startAt || ""} onChange={(e)=>setNewMessage(p=>({...p,startAt:e.target.value}))}/>
              </div>
              <div>
                <Label>Fin</Label>
                <Input type="datetime-local" value={newMessage.endAt || ""} onChange={(e)=>setNewMessage(p=>({...p,endAt:e.target.value}))}/>
              </div>
              <div className="flex items-center gap-2">
                <Checkbox checked={newMessage.active !== false} onCheckedChange={(c)=>setNewMessage(p=>({...p,active:Boolean(c)}))}/>
                <Label>Activo</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={()=>setShowEditModal(null)}><X className="h-4 w-4 mr-2"/>Cancelar</Button>
            <Button onClick={()=>showEditModal && handleSend(showEditModal.id!)} className="bg-blue-600 hover:bg-blue-700">
              <Send className="h-4 w-4 mr-2"/>Guardar cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MessagesModule;
