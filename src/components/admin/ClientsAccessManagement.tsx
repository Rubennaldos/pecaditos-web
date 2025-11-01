import { useState, useEffect, useMemo } from 'react';
import { db, functions } from '@/config/firebase';
import { ref, onValue, push, set, update, remove, get } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import UbigeoSelector from '@/components/UbigeoSelector';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

import {
  Search,
  Plus,
  Edit,
  Trash2,
  Building,
  FileText,
  Download,
  Eye,
  EyeOff,
  CheckCircle,
  AlertTriangle,
  XCircle,
  DollarSign,
  MapPin,
  Lock,
  Unlock,
  UserPlus,
  Users,
  ToggleRight,
  ToggleLeft,
  ShoppingCart,
  Truck,
  Factory,
  BarChart3,
  Package,
  Copy,
  RefreshCw,
  Key,
} from 'lucide-react';

// Módulos disponibles
const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard Global', icon: BarChart3, color: 'purple' },
  { id: 'catalog', name: 'Catálogo de Productos', icon: ShoppingCart, color: 'blue' },
  { id: 'catalogs-admin', name: 'Catálogo por Cliente', icon: ShoppingCart, color: 'emerald' },
  { id: 'orders', name: 'Pedidos', icon: Package, color: 'blue' },
  { id: 'tracking', name: 'Seguimiento', icon: Truck, color: 'amber' },
  { id: 'delivery', name: 'Reparto', icon: Truck, color: 'green' },
  { id: 'production', name: 'Producción', icon: Factory, color: 'amber' },
  { id: 'billing', name: 'Cobranzas', icon: DollarSign, color: 'red' },
  { id: 'logistics', name: 'Logística', icon: Truck, color: 'indigo' },
  { id: 'locations', name: 'Ubicaciones', icon: MapPin, color: 'indigo' },
  { id: 'reports', name: 'Reportes', icon: BarChart3, color: 'purple' },
];

// Tipos
interface ClientSede {
  id: string;
  nombre: string;
  direccion: string;
  responsable: string;
  telefono: string;
  principal: boolean;
  googleMapsUrl?: string;
  distrito?: string;
}

interface ClientContact {
  tipo: 'pago' | 'admin' | 'pedidos';
  nombre: string;
  dni: string;
  celular: string;
  correo: string;
}

interface Client {
  id: string;
  razonSocial: string;
  rucDni: string;
  direccionFiscal: string;
  departamento?: string;
  provincia?: string;
  distrito?: string;
  sedes: ClientSede[];
  contactos: ClientContact[];
  listaPrecio: string;
  frecuenciaCompras: string;
  horarioEntrega: string;
  condicionPago: string;
  limiteCredito?: number;
  emailFacturacion: string;
  observaciones: string;
  estado: 'activo' | 'suspendido' | 'moroso';
  fechaCreacion: string;
  authUid?: string;
  accessModules?: string[];
  montoDeuda?: number;
}

type UserRecord = {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  createdAt?: string | number | null;
  permissions?: string[];
};

export const ClientsAccessManagement = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('clients');
  
  // Estados para Clientes
  const [clients, setClients] = useState<Client[]>([]);
  const [searchClients, setSearchClients] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isEditingClient, setIsEditingClient] = useState(false);

  // Estados para Usuarios
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [searchUsers, setSearchUsers] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);

  // Cargar clientes
  useEffect(() => {
    const clientsRef = ref(db, 'clients');
    const unsubscribe = onValue(clientsRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setClients([]);
        return;
      }
      const arr: Client[] = Object.entries(data).map(([id, client]: any) => ({
        ...client,
        id,
        sedes: client.sedes
          ? Object.entries(client.sedes).map(([sid, sede]: any) => ({
              ...sede,
              id: sid,
            }))
          : [],
      }));
      setClients(arr);
    });
    return () => unsubscribe();
  }, []);

  // Cargar usuarios
  useEffect(() => {
    const r = ref(db, 'usuarios');
    const off = onValue(r, (snap) => {
      const val = snap.val() || {};
      const list: UserRecord[] = Object.entries(val).map(([id, u]: any) => ({
        id,
        nombre: u.nombre || '',
        correo: u.correo || '',
        rol: u.rol || 'usuario',
        activo: u.activo !== false,
        createdAt: u.createdAt ?? null,
        permissions: u.permissions || [],
      }));
      list.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setUsers(list);
    });
    return () => off();
  }, []);

  const filteredClients = useMemo(() => {
    const q = searchClients.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter(
      (c) =>
        c.razonSocial?.toLowerCase().includes(q) ||
        c.rucDni?.includes(q) ||
        c.emailFacturacion?.toLowerCase().includes(q)
    );
  }, [clients, searchClients]);

  const filteredUsers = useMemo(() => {
    const q = searchUsers.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.nombre.toLowerCase().includes(q) ||
        u.correo.toLowerCase().includes(q) ||
        u.rol.toLowerCase().includes(q)
    );
  }, [users, searchUsers]);

  const deleteClient = async (id: string, authUid?: string) => {
    if (!confirm('¿Eliminar este cliente?')) return;
    try {
      // Si tiene authUid, también eliminar el usuario
      if (authUid) {
        await remove(ref(db, `usuarios/${authUid}`));
      }
      await remove(ref(db, `clients/${id}`));
      toast({ title: 'Cliente eliminado' });
    } catch (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  const deleteUser = async (u: UserRecord) => {
    if (!confirm(`¿Eliminar a ${u.nombre}?`)) return;
    try {
      await remove(ref(db, `usuarios/${u.id}`));
      toast({ title: 'Usuario eliminado' });
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar', variant: 'destructive' });
    }
  };

  const toggleUserActive = async (u: UserRecord) => {
    try {
      await update(ref(db, `usuarios/${u.id}`), { activo: !u.activo });
    } catch {
      toast({ title: 'Error', description: 'No se pudo cambiar el estado', variant: 'destructive' });
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'activo':
        return (
          <Badge className="bg-green-100 text-green-800 border-green-300">
            <CheckCircle className="h-3 w-3 mr-1" />
            Activo
          </Badge>
        );
      case 'suspendido':
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Suspendido
          </Badge>
        );
      case 'moroso':
        return (
          <Badge className="bg-red-100 text-red-800 border-red-300">
            <XCircle className="h-3 w-3 mr-1" />
            Moroso
          </Badge>
        );
      default:
        return <Badge variant="secondary">{estado}</Badge>;
    }
  };

  const generateClientReportPDF = (client: Client) => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Reporte de Cliente', 14, 16);
    doc.setFontSize(12);
    doc.text(`Razón Social: ${client.razonSocial}`, 14, 26);
    doc.text(`RUC/DNI: ${client.rucDni}`, 14, 34);
    doc.text(`Estado: ${client.estado}`, 14, 42);
    doc.save(`Reporte_${client.razonSocial || client.rucDni}.pdf`);
  };

  const generateClientReportExcel = (client: Client) => {
    const ws = XLSX.utils.json_to_sheet([
      {
        'Razón Social': client.razonSocial,
        'RUC/DNI': client.rucDni,
        Estado: client.estado,
        Email: client.emailFacturacion,
      },
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Cliente');
    XLSX.writeFile(wb, `Reporte_${client.razonSocial || client.rucDni}.xlsx`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-stone-800">Clientes y Accesos</h1>
        <p className="text-stone-600 mt-1">Gestión de clientes con usuarios y permisos de acceso a módulos</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="clients">
            <Building className="h-4 w-4 mr-2" />
            Clientes
          </TabsTrigger>
          <TabsTrigger value="users">
            <Users className="h-4 w-4 mr-2" />
            Usuarios
          </TabsTrigger>
        </TabsList>

        {/* TAB: CLIENTES */}
        <TabsContent value="clients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gestión de Clientes</span>
                <Dialog open={isClientModalOpen} onOpenChange={setIsClientModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setSelectedClient(null);
                        setIsEditingClient(false);
                        setIsClientModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Cliente
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{isEditingClient ? 'Editar Cliente' : 'Crear Cliente'}</DialogTitle>
                    </DialogHeader>
                    <ClientForm
                      client={isEditingClient ? selectedClient || undefined : undefined}
                      onFinish={() => setIsClientModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Clientes con acceso al sistema mediante usuario y contraseña</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <Input
                    placeholder="Buscar por razón social, RUC o email..."
                    value={searchClients}
                    onChange={(e) => setSearchClients(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-4">
                {filteredClients.map((client) => (
                  <div key={client.id} className="border rounded-lg p-4 hover:bg-stone-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-stone-800">{client.razonSocial}</h3>
                          {getStatusBadge(client.estado)}
                          {client.authUid ? (
                            <Badge className="bg-green-100 text-green-800 border-green-300">
                              <Lock className="h-3 w-3 mr-1" />
                              Con Acceso
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                              <Unlock className="h-3 w-3 mr-1" />
                              Sin Acceso
                            </Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-stone-600">
                          <div className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            RUC: {client.rucDni}
                          </div>
                          <div className="flex items-center gap-1">
                            <Building className="h-3 w-3" />
                            {client.sedes.length} sede(s)
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            Deuda: S/. {client.montoDeuda?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        {client.accessModules && client.accessModules.length > 0 && (
                          <div className="mt-2 flex gap-1 flex-wrap">
                            {client.accessModules.map((modId) => {
                              const mod = AVAILABLE_MODULES.find((m) => m.id === modId);
                              return mod ? (
                                <Badge key={modId} variant="outline" className="text-xs">
                                  {mod.name}
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client);
                            setIsEditingClient(true);
                            setIsClientModalOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => generateClientReportPDF(client)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => deleteClient(client.id, client.authUid)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {filteredClients.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Building className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron clientes.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB: USUARIOS */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Gestión de Usuarios</span>
                <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setSelectedUser(null);
                        setIsEditingUser(false);
                        setIsUserModalOpen(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Nuevo Usuario
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>{isEditingUser ? 'Editar Usuario' : 'Crear Usuario'}</DialogTitle>
                      <DialogDescription>
                        {isEditingUser
                          ? 'Modifica los datos del usuario'
                          : 'Usuarios con acceso a módulos específicos (no son clientes)'}
                      </DialogDescription>
                    </DialogHeader>
                    <UserForm
                      user={isEditingUser ? selectedUser || undefined : undefined}
                      onFinish={() => setIsUserModalOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </CardTitle>
              <CardDescription>Usuarios internos con acceso a módulos del sistema</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Buscar por nombre, email o rol..."
                  value={searchUsers}
                  onChange={(e) => setSearchUsers(e.target.value)}
                  className="max-w-sm"
                />
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Usuario</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Módulos</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.nombre}</TableCell>
                        <TableCell>{u.correo}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{u.rol}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap max-w-xs">
                            {u.permissions && u.permissions.length > 0 ? (
                              u.permissions.slice(0, 2).map((modId) => {
                                const mod = AVAILABLE_MODULES.find((m) => m.id === modId);
                                return mod ? (
                                  <Badge key={modId} variant="secondary" className="text-xs">
                                    {mod.name}
                                  </Badge>
                                ) : null;
                              })
                            ) : (
                              <span className="text-xs text-muted-foreground">Sin módulos</span>
                            )}
                            {u.permissions && u.permissions.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{u.permissions.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={u.activo ? 'default' : 'secondary'}>
                            {u.activo ? 'Activo' : 'Inactivo'}
                          </Badge>
                        </TableCell>
                        <TableCell className="space-x-2">
                          <Button variant="outline" size="sm" onClick={() => toggleUserActive(u)}>
                            {u.activo ? <ToggleRight className="h-4 w-4" /> : <ToggleLeft className="h-4 w-4" />}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(u);
                              setIsEditingUser(true);
                              setIsUserModalOpen(true);
                            }}
                          >
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

              {filteredUsers.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No se encontraron usuarios.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ========== FORMULARIO DE CLIENTE ==========
const ClientForm = ({ client, onFinish }: { client?: Client; onFinish: () => void }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    razonSocial: client?.razonSocial || '',
    rucDni: client?.rucDni || '',
    direccionFiscal: client?.direccionFiscal || '',
    departamento: client?.departamento || '',
    provincia: client?.provincia || '',
    distrito: client?.distrito || '',
    emailFacturacion: client?.emailFacturacion || '',
    observaciones: client?.observaciones || '',
    estado: client?.estado || 'activo',
    listaPrecio: client?.listaPrecio || '',
    frecuenciaCompras: client?.frecuenciaCompras || '',
    horarioEntrega: client?.horarioEntrega || '',
    condicionPago: client?.condicionPago || '',
    limiteCredito: client?.limiteCredito || 0,
  });
  const [sedes, setSedes] = useState<ClientSede[]>(client?.sedes || []);
  const [contactos, setContactos] = useState<ClientContact[]>(client?.contactos || []);
  const [accessModules, setAccessModules] = useState<string[]>(client?.accessModules || []);
  
  // Credenciales
  const [email, setEmail] = useState(client?.emailFacturacion || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [generatedCredentials, setGeneratedCredentials] = useState<{ email: string; password: string } | null>(null);

  const generatePassword = () => {
    const pwd = `${formData.rucDni}@Pecaditos`;
    setPassword(pwd);
    setShowPassword(true);
  };

  const toggleModule = (moduleId: string) => {
    setAccessModules((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const addSede = () => {
    const newSede: ClientSede = {
      id: `sede-${Date.now()}`,
      nombre: '',
      direccion: '',
      responsable: '',
      telefono: '',
      principal: sedes.length === 0,
      distrito: '',
    };
    setSedes([...sedes, newSede]);
  };

  const deleteSede = (id: string) => {
    setSedes(sedes.filter((s) => s.id !== id));
  };

  const addContacto = () => {
    setContactos([...contactos, { tipo: 'pago', nombre: '', dni: '', celular: '', correo: '' }]);
  };

  const deleteContacto = (idx: number) => {
    setContactos(contactos.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    if (!formData.razonSocial || !formData.rucDni) {
      toast({ title: 'Error', description: 'Complete razón social y RUC/DNI', variant: 'destructive' });
      return;
    }

    if (!client && !email) {
      toast({ title: 'Error', description: 'Ingrese un email para el acceso', variant: 'destructive' });
      return;
    }

    if (!client && !password) {
      toast({ title: 'Error', description: 'Genere o ingrese una contraseña', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      if (client) {
        // EDITAR CLIENTE
        await update(ref(db, `clients/${client.id}`), {
          ...formData,
          sedes: sedes.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
          contactos,
          accessModules,
        });

        // Actualizar usuario si tiene authUid
        if (client.authUid) {
          await update(ref(db, `usuarios/${client.authUid}`), {
            nombre: formData.razonSocial,
            correo: email,
            permissions: accessModules,
            activo: formData.estado === 'activo',
          });
        }

        toast({ title: 'Cliente actualizado' });
      } else {
        // CREAR CLIENTE + USUARIO
        const call = httpsCallable(functions, 'createUser');
        const res: any = await call({
          email,
          password,
          nombre: formData.razonSocial,
          rol: 'cliente',
        });

        const newUid = res?.data?.uid || res?.data?.userId;
        if (!newUid) {
          throw new Error('No se obtuvo el UID del usuario creado');
        }

        // Crear perfil en usuarios
        await set(ref(db, `usuarios/${newUid}`), {
          nombre: formData.razonSocial,
          correo: email,
          rol: 'cliente',
          activo: true,
          permissions: accessModules,
          createdAt: Date.now(),
        });

        // Crear cliente
        const newClientRef = push(ref(db, 'clients'));
        await set(newClientRef, {
          ...formData,
          authUid: newUid,
          sedes: sedes.reduce((acc, s) => ({ ...acc, [s.id]: s }), {}),
          contactos,
          accessModules,
          fechaCreacion: Date.now(),
        });

        setGeneratedCredentials({ email, password });
        toast({ title: 'Cliente creado exitosamente', description: 'Usuario y accesos configurados' });
      }

      setTimeout(() => {
        onFinish();
      }, 1500);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo guardar',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {generatedCredentials && (
        <div className="bg-green-50 border border-green-300 rounded-lg p-4">
          <h3 className="font-semibold text-green-800 mb-2">✅ Credenciales Creadas</h3>
          <p className="text-sm text-green-700">
            <strong>Email:</strong> {generatedCredentials.email}
          </p>
          <p className="text-sm text-green-700">
            <strong>Contraseña:</strong> {generatedCredentials.password}
          </p>
          <p className="text-xs text-green-600 mt-2">Guarda estas credenciales. El cliente podrá ingresar con ellas.</p>
        </div>
      )}

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sedes">Sedes</TabsTrigger>
          <TabsTrigger value="contactos">Contactos</TabsTrigger>
          <TabsTrigger value="comercial">Comercial</TabsTrigger>
          <TabsTrigger value="access">Acceso</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Razón Social *</Label>
              <Input
                value={formData.razonSocial}
                onChange={(e) => setFormData({ ...formData, razonSocial: e.target.value })}
              />
            </div>
            <div>
              <Label>RUC/DNI *</Label>
              <Input value={formData.rucDni} onChange={(e) => setFormData({ ...formData, rucDni: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Dirección Fiscal</Label>
            <Input
              value={formData.direccionFiscal}
              onChange={(e) => setFormData({ ...formData, direccionFiscal: e.target.value })}
            />
          </div>
          <UbigeoSelector
            departamento={formData.departamento || ''}
            provincia={formData.provincia || ''}
            distrito={formData.distrito || ''}
            onChange={(data) =>
              setFormData({ ...formData, departamento: data.departamento, provincia: data.provincia, distrito: data.distrito })
            }
          />
          <div>
            <Label>Estado</Label>
            <Select value={formData.estado} onValueChange={(v: any) => setFormData({ ...formData, estado: v })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="suspendido">Suspendido</SelectItem>
                <SelectItem value="moroso">Moroso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Observaciones</Label>
            <Textarea
              value={formData.observaciones}
              onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
            />
          </div>
        </TabsContent>

        <TabsContent value="sedes" className="space-y-4">
          <Button onClick={addSede} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Sede
          </Button>
          {sedes.map((sede, idx) => (
            <div key={sede.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Sede {idx + 1}</h4>
                <Button variant="ghost" size="sm" onClick={() => deleteSede(sede.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Input
                placeholder="Nombre de la sede"
                value={sede.nombre}
                onChange={(e) => {
                  const updated = [...sedes];
                  updated[idx].nombre = e.target.value;
                  setSedes(updated);
                }}
              />
              <Input
                placeholder="Dirección"
                value={sede.direccion}
                onChange={(e) => {
                  const updated = [...sedes];
                  updated[idx].direccion = e.target.value;
                  setSedes(updated);
                }}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  placeholder="Responsable"
                  value={sede.responsable}
                  onChange={(e) => {
                    const updated = [...sedes];
                    updated[idx].responsable = e.target.value;
                    setSedes(updated);
                  }}
                />
                <Input
                  placeholder="Teléfono"
                  value={sede.telefono}
                  onChange={(e) => {
                    const updated = [...sedes];
                    updated[idx].telefono = e.target.value;
                    setSedes(updated);
                  }}
                />
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="contactos" className="space-y-4">
          <Button onClick={addContacto} variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Agregar Contacto
          </Button>
          {contactos.map((contacto, idx) => (
            <div key={idx} className="border rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="font-semibold">Contacto {idx + 1}</h4>
                <Button variant="ghost" size="sm" onClick={() => deleteContacto(idx)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
              <Select
                value={contacto.tipo}
                onValueChange={(v: any) => {
                  const updated = [...contactos];
                  updated[idx].tipo = v;
                  setContactos(updated);
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pago">Pago</SelectItem>
                  <SelectItem value="admin">Administración</SelectItem>
                  <SelectItem value="pedidos">Pedidos</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="Nombre"
                value={contacto.nombre}
                onChange={(e) => {
                  const updated = [...contactos];
                  updated[idx].nombre = e.target.value;
                  setContactos(updated);
                }}
              />
              <div className="grid grid-cols-3 gap-3">
                <Input
                  placeholder="DNI"
                  value={contacto.dni}
                  onChange={(e) => {
                    const updated = [...contactos];
                    updated[idx].dni = e.target.value;
                    setContactos(updated);
                  }}
                />
                <Input
                  placeholder="Celular"
                  value={contacto.celular}
                  onChange={(e) => {
                    const updated = [...contactos];
                    updated[idx].celular = e.target.value;
                    setContactos(updated);
                  }}
                />
                <Input
                  placeholder="Correo"
                  value={contacto.correo}
                  onChange={(e) => {
                    const updated = [...contactos];
                    updated[idx].correo = e.target.value;
                    setContactos(updated);
                  }}
                />
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="comercial" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Lista de Precio</Label>
              <Input
                value={formData.listaPrecio}
                onChange={(e) => setFormData({ ...formData, listaPrecio: e.target.value })}
              />
            </div>
            <div>
              <Label>Frecuencia de Compras</Label>
              <Input
                value={formData.frecuenciaCompras}
                onChange={(e) => setFormData({ ...formData, frecuenciaCompras: e.target.value })}
              />
            </div>
            <div>
              <Label>Horario de Entrega</Label>
              <Input
                value={formData.horarioEntrega}
                onChange={(e) => setFormData({ ...formData, horarioEntrega: e.target.value })}
              />
            </div>
            <div>
              <Label>Condición de Pago</Label>
              <Input
                value={formData.condicionPago}
                onChange={(e) => setFormData({ ...formData, condicionPago: e.target.value })}
              />
            </div>
            <div>
              <Label>Límite de Crédito</Label>
              <Input
                type="number"
                value={formData.limiteCredito}
                onChange={(e) => setFormData({ ...formData, limiteCredito: Number(e.target.value) })}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="access" className="space-y-4">
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">🔐 Credenciales de Acceso</h3>
            <p className="text-sm text-blue-700 mb-4">
              {client
                ? 'Actualiza el email o los módulos de acceso del cliente.'
                : 'Crea un usuario para que el cliente pueda acceder al sistema.'}
            </p>

            <div className="space-y-3">
              <div>
                <Label>Email de Acceso *</Label>
                <Input
                  type="email"
                  placeholder="cliente@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              {!client && (
                <div>
                  <Label>Contraseña *</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Contraseña"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <Button type="button" variant="outline" onClick={generatePassword}>
                      <Key className="h-4 w-4 mr-2" />
                      Generar
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Formato: RUC@Pecaditos</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-3">Módulos de Acceso</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {AVAILABLE_MODULES.map((mod) => {
                const Icon = mod.icon;
                const isSelected = accessModules.includes(mod.id);
                return (
                  <div
                    key={mod.id}
                    className={`border rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-stone-50'
                    }`}
                    onClick={() => toggleModule(mod.id)}
                  >
                    <Checkbox checked={isSelected} onCheckedChange={() => toggleModule(mod.id)} />
                    <Icon className="h-5 w-5 text-stone-600" />
                    <span className="text-sm font-medium">{mod.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onFinish} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : client ? 'Actualizar Cliente' : 'Crear Cliente'}
        </Button>
      </div>
    </div>
  );
};

// ========== FORMULARIO DE USUARIO ==========
const UserForm = ({ user, onFinish }: { user?: UserRecord; onFinish: () => void }) => {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    correo: user?.correo || '',
    rol: user?.rol || 'usuario',
    activo: user?.activo ?? true,
  });
  const [permissions, setPermissions] = useState<string[]>(
    (user as any)?.accessModules || user?.permissions || []
  );
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);

  const toggleModule = (moduleId: string) => {
    setPermissions((prev) =>
      prev.includes(moduleId) ? prev.filter((m) => m !== moduleId) : [...prev, moduleId]
    );
  };

  const handleSave = async () => {
    if (!formData.nombre.trim()) {
      toast({ title: 'Error', description: 'Ingresa el nombre completo', variant: 'destructive' });
      return;
    }
    if (!formData.correo.trim()) {
      toast({ title: 'Error', description: 'Ingresa un correo', variant: 'destructive' });
      return;
    }

    if (!user) {
      if (!password || !password2) {
        toast({ title: 'Error', description: 'Ingresa y confirma la contraseña', variant: 'destructive' });
        return;
      }
      if (password.length < 6) {
        toast({ title: 'Error', description: 'Contraseña mínimo 6 caracteres', variant: 'destructive' });
        return;
      }
      if (password !== password2) {
        toast({ title: 'Error', description: 'Las contraseñas no coinciden', variant: 'destructive' });
        return;
      }
    }

    setSaving(true);
    try {
      if (user) {
        // EDITAR
        console.log('Guardando permisos para usuario:', user.id, permissions);
        await update(ref(db, `usuarios/${user.id}`), {
          nombre: formData.nombre,
          correo: formData.correo,
          rol: formData.rol,
          activo: formData.activo,
          permissions,
          accessModules: permissions, // CRÍTICO: guardar en ambos campos
        });
        console.log('Usuario actualizado exitosamente');
        toast({ title: 'Usuario actualizado', description: 'Los cambios se guardaron correctamente' });
      } else {
        // CREAR
        const call = httpsCallable(functions, 'createUser');
        const res: any = await call({
          email: formData.correo,
          password,
          nombre: formData.nombre,
          rol: formData.rol,
        });

        const newUid = res?.data?.uid || res?.data?.userId;
        if (!newUid) {
          // Buscar uid por email
          const snap = await get(ref(db, 'usuarios'));
          const val = snap.val() || {};
          let foundUid: string | null = null;
          for (const [id, u] of Object.entries<any>(val)) {
            if ((u?.correo || '').toLowerCase() === formData.correo.toLowerCase()) {
              foundUid = id;
              break;
            }
          }
          if (foundUid) {
            await update(ref(db, `usuarios/${foundUid}`), {
              nombre: formData.nombre,
              correo: formData.correo,
              rol: formData.rol,
              activo: formData.activo,
              permissions,
              accessModules: permissions, // CRÍTICO: guardar en ambos campos
            });
          } else {
            throw new Error('No se obtuvo el UID del usuario creado');
          }
        } else {
          await set(ref(db, `usuarios/${newUid}`), {
            nombre: formData.nombre,
            correo: formData.correo,
            rol: formData.rol,
            activo: formData.activo,
            permissions,
            accessModules: permissions, // CRÍTICO: guardar en ambos campos
            createdAt: Date.now(),
          });
        }

        toast({ title: 'Usuario creado' });
      }

      setTimeout(() => {
        onFinish();
      }, 1000);
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo guardar',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label>Nombre Completo *</Label>
          <Input value={formData.nombre} onChange={(e) => setFormData({ ...formData, nombre: e.target.value })} />
        </div>
        <div>
          <Label>Email *</Label>
          <Input
            type="email"
            value={formData.correo}
            onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
          />
        </div>
        <div>
          <Label>Rol</Label>
          <Input value={formData.rol} onChange={(e) => setFormData({ ...formData, rol: e.target.value })} />
        </div>

        {!user && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Label>Contraseña *</Label>
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-[34px] text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Label>Confirmar Contraseña *</Label>
              <Input
                type={showPassword2 ? 'text' : 'password'}
                value={password2}
                onChange={(e) => setPassword2(e.target.value)}
                placeholder="Repite la contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword2(!showPassword2)}
                className="absolute right-2 top-[34px] text-muted-foreground"
              >
                {showPassword2 ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Switch checked={formData.activo} onCheckedChange={(v) => setFormData({ ...formData, activo: v })} />
          <Label>Usuario activo</Label>
        </div>
      </div>

      <div>
        <h3 className="font-semibold mb-3">Módulos de Acceso</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {AVAILABLE_MODULES.map((mod) => {
            const Icon = mod.icon;
            const isSelected = permissions.includes(mod.id);
            return (
              <div
                key={mod.id}
                className={`border rounded-lg p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                  isSelected ? 'bg-blue-50 border-blue-300' : 'hover:bg-stone-50'
                }`}
                onClick={() => toggleModule(mod.id)}
              >
                <Checkbox checked={isSelected} onCheckedChange={() => toggleModule(mod.id)} />
                <Icon className="h-5 w-5 text-stone-600" />
                <span className="text-sm font-medium">{mod.name}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={onFinish} disabled={saving}>
          Cancelar
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? 'Guardando...' : user ? 'Actualizar Usuario' : 'Crear Usuario'}
        </Button>
      </div>
    </div>
  );
};

export default ClientsAccessManagement;
