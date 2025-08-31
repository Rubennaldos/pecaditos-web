// src/components/admin/UsersAdmin.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { db, functions } from '@/config/firebase';
import { ref, onValue, update, remove, get, set } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';

import {
  Users,
  Plus,
  Trash2,
  Edit,
  ToggleRight,
  ToggleLeft,
  Eye,
  EyeOff,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/hooks/use-toast';

type Rol =
  | 'admin'
  | 'adminGeneral'
  | 'pedidos'
  | 'produccion'
  | 'reparto'
  | 'cobranzas'
  | 'mayorista';

const ROLE_LABEL: Record<Rol, string> = {
  admin: 'Admin',
  adminGeneral: 'Admin General',
  pedidos: 'Pedidos',
  produccion: 'Producción',
  reparto: 'Reparto',
  cobranzas: 'Cobranzas',
  mayorista: 'Mayorista',
};

type UserRecord = {
  id: string;           // uid en RTDB (coincide con Auth cuando lo crea la Function)
  nombre: string;
  correo: string;
  rol: Rol;
  activo: boolean;
  createdAt?: string | number | null;
};

const emptyUser: Omit<UserRecord, 'id'> = {
  nombre: '',
  correo: '',
  rol: 'adminGeneral',
  activo: true,
  createdAt: null,
};

// ==== Tipos y helpers Mayorista ====
type WholesaleClient = {
  id: string;
  name: string;
  ruc?: string;
};
type InternalWholesaleRole = 'comprador' | 'aprobador' | 'visor';

// Lee clientId actual de un usuario (si existiera)
async function getUserClientId(uid: string): Promise<string | undefined> {
  const snap = await get(ref(db, `wholesale/users/${uid}`));
  return snap.val()?.clientId;
}

// Enlaza usuario -> cliente (y cliente -> usuario). Desenlaza del anterior si cambió.
async function linkUserToClient(
  uid: string,
  clientId: string,
  internalRole: InternalWholesaleRole
) {
  const prev = await getUserClientId(uid);
  const ops: Promise<any>[] = [];

  if (prev && prev !== clientId) {
    ops.push(remove(ref(db, `wholesale/clients/${prev}/users/${uid}`)));
  }

  ops.push(set(ref(db, `wholesale/users/${uid}`), { clientId, role: internalRole }));
  ops.push(set(ref(db, `wholesale/clients/${clientId}/users/${uid}`), { role: internalRole }));

  await Promise.all(ops);
}

// Elimina por completo el vínculo
async function unlinkUserFromClient(uid: string) {
  const prev = await getUserClientId(uid);
  if (!prev) return;
  await Promise.all([
    remove(ref(db, `wholesale/users/${uid}`)),
    remove(ref(db, `wholesale/clients/${prev}/users/${uid}`)),
  ]);
}

const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [clients, setClients] = useState<WholesaleClient[]>([]); // <-- clientes mayoristas
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserRecord | null>(null);

  // Password UI
  const [pwd, setPwd] = useState('');
  const [pwd2, setPwd2] = useState('');
  const [seePwd, setSeePwd] = useState(false);
  const [seePwd2, setSeePwd2] = useState(false);

  // Form de usuario
  const [form, setForm] = useState<Omit<UserRecord, 'id'>>({ ...emptyUser });
  const [saving, setSaving] = useState(false);

  // Campos de vínculo mayorista (solo si rol === 'mayorista')
  const [clientId, setClientId] = useState<string>(''); // cliente seleccionado
  const [internalRole, setInternalRole] = useState<InternalWholesaleRole>('comprador');

  // Carga usuarios
  useEffect(() => {
    const r = ref(db, 'usuarios');
    const off = onValue(r, (snap) => {
      const val = snap.val() || {};
      const list: UserRecord[] = Object.entries(val).map(([id, u]: [string, any]) => ({
        id,
        nombre: u.nombre || '',
        correo: u.correo || '',
        rol: (u.rol || 'adminGeneral') as Rol,
        activo: u.activo !== false,
        createdAt: u.createdAt ?? null,
      }));
      list.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setUsers(list);
    });
    return () => off();
  }, []);

  // Carga clientes mayoristas
  useEffect(() => {
    const r = ref(db, 'wholesale/clients');
    return onValue(r, (snap) => {
      const val = snap.val() || {};
      const list: WholesaleClient[] = Object.entries(val).map(([id, c]: [string, any]) => ({
        id,
        name: c?.name || c?.razonSocial || id,
        ruc: c?.ruc || '',
      }));
      list.sort((a, b) => a.name.localeCompare(b.name));
      setClients(list);
    });
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.rol.toLowerCase().includes(q)
    );
  }, [users, search]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyUser });
    setPwd('');
    setPwd2('');
    setSeePwd(false);
    setSeePwd2(false);
    // limpiar vínculo mayorista
    setClientId('');
    setInternalRole('comprador');
    setModalOpen(true);
  };

  const openEdit = async (u: UserRecord) => {
    setEditing(u);
    setForm({ nombre: u.nombre, correo: u.correo, rol: u.rol, activo: u.activo, createdAt: u.createdAt ?? null });
    setPwd('');
    setPwd2('');
    setSeePwd(false);
    setSeePwd2(false);

    // precarga vínculo si es mayorista
    if (u.rol === 'mayorista') {
      const currentClient = await getUserClientId(u.id);
      setClientId(currentClient || '');
      setInternalRole('comprador');
    } else {
      setClientId('');
      setInternalRole('comprador');
    }

    setModalOpen(true);
  };

  // Busca uid por correo en /usuarios (cuando createUser no devuelve uid)
  async function findUidByEmail(email: string): Promise<string | null> {
    const snap = await get(ref(db, 'usuarios'));
    const val = snap.val() || {};
    for (const [id, u] of Object.entries<any>(val)) {
      if ((u?.correo || '').toLowerCase() === email.toLowerCase()) return id;
    }
    return null;
  }

  const saveUser = async () => {
    // Validaciones mínimas
    if (!form.nombre.trim()) {
      toast({ title: 'Falta nombre', description: 'Ingresa el nombre completo', variant: 'destructive' });
      return;
    }
    if (!form.correo.trim()) {
      toast({ title: 'Falta email', description: 'Ingresa un correo', variant: 'destructive' });
      return;
    }

    // Si es mayorista, debe elegir cliente
    if (form.rol === 'mayorista' && !clientId) {
      toast({ title: 'Selecciona el Cliente Mayorista', description: 'Este usuario debe pertenecer a un cliente.', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (editing) {
        // ACTUALIZAR (solo RTDB)
        await update(ref(db, `usuarios/${editing.id}`), {
          nombre: form.nombre,
          correo: form.correo,
          rol: form.rol,
          activo: form.activo,
        });

        // Vinculación/desvinculación
        if (form.rol === 'mayorista') {
          await linkUserToClient(editing.id, clientId, internalRole);
        } else {
          await unlinkUserFromClient(editing.id);
        }

        if (pwd || pwd2) {
          toast({
            title: 'Contraseña no cambiada',
            description: 'Para cambiar contraseña en Auth creamos otra función en el siguiente paso.',
          });
        }

        toast({ title: 'Usuario actualizado', description: 'Los datos fueron guardados' });
      } else {
        // CREAR → Cloud Function para Auth + RTDB
        if (!pwd || !pwd2) {
          toast({ title: 'Falta contraseña', description: 'Debes ingresar y confirmar la contraseña', variant: 'destructive' });
          setSaving(false);
          return;
        }
        if (pwd.length < 6) {
          toast({ title: 'Contraseña muy corta', description: 'Mínimo 6 caracteres', variant: 'destructive' });
          setSaving(false);
          return;
        }
        if (pwd !== pwd2) {
          toast({ title: 'No coinciden', description: 'Las contraseñas no coinciden', variant: 'destructive' });
          setSaving(false);
          return;
        }

        const call = httpsCallable(functions, 'createUser');
        const res: any = await call({
          email: form.correo,
          password: pwd,
          nombre: form.nombre,
          rol: form.rol, // puede ser 'mayorista'
        });

        // intentar tomar uid retornado; si no viene, buscar por correo
        let newUid: string | null = res?.data?.uid || res?.data?.userId || null;
        if (!newUid) {
          newUid = await findUidByEmail(form.correo);
        }

        // vincula si es mayorista
        if (form.rol === 'mayorista' && newUid) {
          await linkUserToClient(newUid, clientId, internalRole);
        }

        toast({ title: 'Usuario creado', description: 'Se agregó el nuevo usuario en Auth y RTDB' });
      }

      setModalOpen(false);
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error',
        description: err?.message || 'No se pudo guardar. Intenta de nuevo.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (u: UserRecord) => {
    try {
      await update(ref(db, `usuarios/${u.id}`), { activo: !u.activo });
    } catch {
      toast({ title: 'Error', description: 'No se pudo cambiar el estado.', variant: 'destructive' });
    }
  };

  const deleteUser = async (u: UserRecord) => {
    if (!confirm(`¿Eliminar a ${u.nombre}?`)) return;
    try {
      // Borra el vínculo mayorista si lo tuviera
      await unlinkUserFromClient(u.id);
      // Borra el usuario de RTDB (no elimina en Auth)
      await remove(ref(db, `usuarios/${u.id}`));
      toast({ title: 'Eliminado', description: 'Usuario eliminado de RTDB (no borra de Auth).' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Usuarios</h1>
        <p className="text-stone-600 mt-1">Administra usuarios y perfiles del sistema</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestión de Usuarios
            </span>
            <Dialog open={modalOpen} onOpenChange={setModalOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Usuario
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editing ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
                  <DialogDescription>
                    {editing ? 'Modifica los datos del usuario' : 'Crea un nuevo usuario (Auth + RTDB)'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                  <div>
                    <Label htmlFor="u-nombre">Nombre Completo</Label>
                    <Input
                      id="u-nombre"
                      value={form.nombre}
                      onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="u-correo">Email</Label>
                    <Input
                      id="u-correo"
                      type="email"
                      value={form.correo}
                      onChange={(e) => setForm((p) => ({ ...p, correo: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label>Perfil</Label>
                    <Select
                      value={form.rol}
                      onValueChange={(rol: Rol) => {
                        setForm((p) => ({ ...p, rol }));
                        // si cambia a no-mayorista, limpiamos selección
                        if (rol !== 'mayorista') {
                          setClientId('');
                          setInternalRole('comprador');
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un perfil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="adminGeneral">Admin General</SelectItem>
                        <SelectItem value="pedidos">Pedidos</SelectItem>
                        <SelectItem value="produccion">Producción</SelectItem>
                        <SelectItem value="reparto">Reparto</SelectItem>
                        <SelectItem value="cobranzas">Cobranzas</SelectItem>
                        <SelectItem value="mayorista">Mayorista</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Passwords */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Label htmlFor="u-pwd">{editing ? 'Nueva contraseña (no aplica aún)' : 'Contraseña'}</Label>
                      <Input
                        id="u-pwd"
                        type={seePwd ? 'text' : 'password'}
                        value={pwd}
                        onChange={(e) => setPwd(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => setSeePwd((v) => !v)}
                        className="absolute right-2 top-[34px] p-1 text-muted-foreground hover:text-foreground"
                        aria-label={seePwd ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                      >
                        {seePwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>

                    <div className="relative">
                      <Label htmlFor="u-pwd2">{editing ? 'Confirmar (no aplica aún)' : 'Confirmar contraseña'}</Label>
                      <Input
                        id="u-pwd2"
                        type={seePwd2 ? 'text' : 'password'}
                        value={pwd2}
                        onChange={(e) => setPwd2(e.target.value)}
                        placeholder="Repite la contraseña"
                        disabled={saving}
                      />
                      <button
                        type="button"
                        onClick={() => setSeePwd2((v) => !v)}
                        className="absolute right-2 top-[34px] p-1 text-muted-foreground hover:text-foreground"
                        aria-label={seePwd2 ? 'Ocultar confirmación' : 'Mostrar confirmación'}
                      >
                        {seePwd2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Bloque de vínculo mayorista */}
                  {form.rol === 'mayorista' && (
                    <div className="border rounded-lg p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label>Cliente mayorista</Label>
                          <Select value={clientId} onValueChange={(v: any) => setClientId(v)}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el cliente" />
                            </SelectTrigger>
                            <SelectContent>
                              {clients.map((c) => (
                                <SelectItem key={c.id} value={c.id}>
                                  {c.name}{c.ruc ? ` · ${c.ruc}` : ''}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Rol interno</Label>
                          <Select
                            value={internalRole}
                            onValueChange={(v: any) => setInternalRole(v as InternalWholesaleRole)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="comprador">Comprador</SelectItem>
                              <SelectItem value="aprobador">Aprobador</SelectItem>
                              <SelectItem value="visor">Visor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <p className="text-xs text-stone-500 mt-2">
                        Este usuario podrá operar únicamente para el cliente seleccionado.
                      </p>
                    </div>
                  )}
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
                    Cancelar
                  </Button>
                  <Button onClick={saveUser} disabled={saving}>
                    {saving ? 'Guardando...' : editing ? 'Actualizar' : 'Crear Usuario'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardTitle>
          <CardDescription>Busca, crea, edita, activa/desactiva o elimina usuarios</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Buscador */}
          <div className="flex items-center gap-2">
            <Input
              placeholder="Buscar por nombre, email o perfil..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Tabla */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Perfil</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Creado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nombre}</TableCell>
                    <TableCell>{u.correo}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{ROLE_LABEL[u.rol] ?? u.rol}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={u.activo ? 'default' : 'secondary'}>
                        {u.activo ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-PE') : '—'}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => toggleActive(u)}>
                        {u.activo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEdit(u)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() => deleteUser(u)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron usuarios con los criterios de búsqueda.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersAdmin;
