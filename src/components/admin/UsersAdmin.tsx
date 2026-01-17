// src/components/admin/UsersAdmin.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/config/supabase';

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
  id: string;           // UUID en Supabase Auth
  nombre: string;
  correo: string;
  email: string;        // campo adicional para compatibilidad
  rol: Rol;
  activo: boolean;
  access_modules?: string[];
  created_at?: string;
};

const emptyUser: Omit<UserRecord, 'id'> = {
  nombre: '',
  correo: '',
  email: '',
  rol: 'adminGeneral',
  activo: true,
  access_modules: [],
  created_at: '',
};

// 🔥 MÓDULOS DISPONIBLES - usado para admin/adminGeneral
const ALL_MODULES = [
  'dashboard',
  'catalog',
  'catalogs-admin',
  'orders',
  'tracking',
  'delivery',
  'production',
  'billing',
  'logistics',
  'locations',
  'reports',
  'wholesale'
];

const UsersAdmin: React.FC = () => {
  const [users, setUsers] = useState<UserRecord[]>([]);
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

  // 🔥 Cargar usuarios desde Supabase
  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) {
        console.error('Error cargando usuarios:', error);
        return;
      }

      const list: UserRecord[] = (data || []).map((u: any) => ({
        id: u.id,
        nombre: u.nombre || '',
        correo: u.email || u.correo || '',
        email: u.email || u.correo || '',
        rol: (u.rol || 'adminGeneral') as Rol,
        activo: u.activo !== false,
        access_modules: u.access_modules || [],
        created_at: u.created_at || '',
      }));

      setUsers(list);
    } catch (err) {
      console.error('Error inesperado:', err);
    }
  };

  useEffect(() => {
    loadUsers();
    
    // 🔥 Realtime: escuchar cambios en tabla usuarios
    const channel = supabase
      .channel('usuarios-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'usuarios',
      }, () => {
        loadUsers();
      })
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
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
    setModalOpen(true);
  };

  const openEdit = async (u: UserRecord) => {
    setEditing(u);
    setForm({
      nombre: u.nombre,
      correo: u.correo,
      email: u.email || u.correo,
      rol: u.rol,
      activo: u.activo,
      access_modules: u.access_modules || [],
      created_at: u.created_at || '',
    });
    setPwd('');
    setPwd2('');
    setSeePwd(false);
    setSeePwd2(false);
    setModalOpen(true);
  };

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

    setSaving(true);
    try {
      if (editing) {
        // 🔥 ACTUALIZAR usuario existente
        const { error } = await supabase
          .from('usuarios')
          .update({
            nombre: form.nombre,
            email: form.correo,
            rol: form.rol,
            activo: form.activo,
            access_modules: form.rol === 'admin' || form.rol === 'adminGeneral' ? ALL_MODULES : (form.access_modules || []),
          })
          .eq('id', editing.id);

        if (error) throw error;

        // 🔴 Cambiar contraseña en Auth (si se ingresó)
        if (pwd && pwd2 && pwd === pwd2) {
          const { error: authError } = await supabase.auth.admin.updateUserById(editing.id, {
            password: pwd,
          });
          if (authError) {
            console.warn('No se pudo cambiar contraseña:', authError);
            toast({
              title: 'Usuario actualizado',
              description: 'Datos guardados, pero no se pudo cambiar la contraseña (permisos insuficientes)',
            });
          } else {
            toast({ title: 'Usuario actualizado', description: 'Datos y contraseña actualizados' });
          }
        } else {
          toast({ title: 'Usuario actualizado', description: 'Los datos fueron guardados' });
        }
      } else {
        // 🔥 CREAR usuario nuevo
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

        // Crear usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: form.correo,
          password: pwd,
        });

        if (authError) throw authError;
        if (!authData.user) throw new Error('No se pudo crear el usuario en Auth');

        // Insertar en tabla usuarios
        const { error: dbError } = await supabase
          .from('usuarios')
          .insert({
            id: authData.user.id,
            nombre: form.nombre,
            email: form.correo,
            rol: form.rol,
            activo: true,
            access_modules: form.rol === 'admin' || form.rol === 'adminGeneral' ? ALL_MODULES : [],
          });

        if (dbError) throw dbError;

        toast({ title: 'Usuario creado', description: 'Se agregó el nuevo usuario correctamente' });
      }

      setModalOpen(false);
      await loadUsers();
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
      const { error } = await supabase
        .from('usuarios')
        .update({ activo: !u.activo })
        .eq('id', u.id);

      if (error) throw error;
      await loadUsers();
    } catch {
      toast({ title: 'Error', description: 'No se pudo cambiar el estado.', variant: 'destructive' });
    }
  };

  const deleteUser = async (u: UserRecord) => {
    if (!confirm(`¿Eliminar a ${u.nombre}?`)) return;
    try {
      // Borra el usuario de tabla usuarios
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', u.id);

      if (error) throw error;

      toast({ title: 'Eliminado', description: 'Usuario eliminado correctamente' });
      await loadUsers();
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
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('es-PE') : '—'}
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
