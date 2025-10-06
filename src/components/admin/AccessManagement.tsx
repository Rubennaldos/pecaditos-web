import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Users,
  Shield,
  Search,
  Plus,
  Edit,
  Building2,
  MapPin,
  Package,
  Truck,
  Factory,
  DollarSign,
  BarChart3,
  ArrowLeft,
  UserPlus,
} from "lucide-react";
import { db } from "@/config/firebase"; // 👈 asegúrate de usar esta ruta
import { ref, onValue, update, set } from "firebase/database";
import { useToast } from "@/hooks/use-toast";
import { UserEditModal } from "./UserEditModal";

interface UserProfile {
  id: string;          // En usuarios = userId; En clientes = authUid
  clientId?: string;   // Solo para clientes (id en /clients)
  nombre: string;
  correo: string;
  rol: "admin" | "adminGeneral" | "pedidos" | "reparto" | "produccion" | "cobranzas" | "cliente";
  activo: boolean;
  comercial?: string;
  sede?: string;
  permissions?: string[];
}

const AVAILABLE_MODULES = [
  { id: "dashboard", name: "Dashboard Global", icon: BarChart3, color: "purple" },
  { id: "orders-admin", name: "Módulo Pedidos", icon: Package, color: "blue" },
  { id: "delivery-admin", name: "Módulo Reparto", icon: Truck, color: "green" },
  { id: "production-admin", name: "Módulo Producción", icon: Factory, color: "amber" },
  { id: "billing-admin", name: "Módulo Cobranzas", icon: DollarSign, color: "red" },
  { id: "customers-admin", name: "Módulo Clientes", icon: Building2, color: "blue" },
  { id: "business-admin", name: "Gestión Comercial", icon: Building2, color: "teal" },
  { id: "logistics", name: "Módulo Logística", icon: Truck, color: "indigo" },
  { id: "locations", name: "Ubicaciones", icon: MapPin, color: "indigo" },
];

interface AccessManagementProps {
  onBack?: () => void;
}

export const AccessManagement = ({ onBack }: AccessManagementProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [creatingId, setCreatingId] = useState<string | null>(null);

  // Combinar usuarios y clientes
  const allUsers = [...users, ...clients];

  // ------- USUARIOS (/usuarios) -------
  useEffect(() => {
    const usersRef = ref(db, "usuarios");
    const unsub = onValue(usersRef, (snap) => {
      const data = snap.val();
      if (!data) {
        setUsers([]);
        return;
      }
      const usersList: UserProfile[] = Object.entries<any>(data).map(([id, u]) => ({
        id,
        nombre: u.nombre || "",
        correo: u.correo || "",
        rol: (u.rol || "cliente") as UserProfile["rol"],
        activo: u.activo !== false,
        comercial: u.comercial || "",
        sede: u.sede || "",
        permissions: u.permissions || [],
      }));
      setUsers(usersList);
    });
    return () => unsub();
  }, []);

  // ------- CLIENTES (/clients) -------
  useEffect(() => {
    const clientsRef = ref(db, "clients");
    const unsub = onValue(clientsRef, (snap) => {
      const data = snap.val();
      if (!data) {
        setClients([]);
        return;
      }

      // Solo clientes que tienen cuenta en Auth (authUid)
      const list: UserProfile[] = Object.entries<any>(data)
        .filter(([_, c]) => !!c.authUid)
        .map(([clientId, c]) => ({
          id: c.authUid, // usamos el UID de Auth como id "de usuario"
          clientId,      // guardamos el id del cliente para actualizar /clients
          nombre: c.razonSocial || "Sin nombre",
          correo: c.emailFacturacion || "Sin email",
          rol: "cliente",
          activo: (c.estado || "activo") === "activo",
          comercial: [c.departamento, c.distrito].filter(Boolean).join(" - "),
          sede: c.direccionFiscal || "Sin dirección",
          permissions: [], // los clientes no gestionan módulos acá (puedes añadir luego)
        }));

      setClients(list);
    });
    return () => unsub();
  }, []);

  // ------- Helpers -------
  const filteredUsers = allUsers.filter(
    (u) =>
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Cambia el estado activo (usuarios VS clientes)
  const toggleUserAccess = async (user: UserProfile) => {
    try {
      if (user.rol === "cliente" && user.clientId) {
        // Cliente: el flag activo viene de clients/{clientId}.estado
        const nuevo = user.activo ? "inactivo" : "activo";
        await update(ref(db, `clients/${user.clientId}`), { estado: nuevo });
      } else {
        // Usuario normal: /usuarios/{id}.activo
        await update(ref(db, `usuarios/${user.id}`), { activo: !user.activo });
      }
      toast({
        title: user.activo ? "Acceso deshabilitado" : "Acceso habilitado",
        description: `Usuario ${user.activo ? "bloqueado" : "activado"} exitosamente`,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el acceso",
        variant: "destructive",
      });
    }
  };

  // Cambia permisos de módulos (solo usuarios no-admin; los clientes se ignoran)
  const toggleModuleAccess = async (user: UserProfile, moduleId: string) => {
    if (user.rol === "cliente") return; // no gestionamos módulos para clientes aquí
    const current = user.permissions || [];
    const has = current.includes(moduleId);
    const next = has ? current.filter((p) => p !== moduleId) : [...current, moduleId];

    try {
      await update(ref(db, `usuarios/${user.id}`), { permissions: next });
      toast({
        title: has ? "Acceso removido" : "Acceso otorgado",
        description: `Módulo ${has ? "deshabilitado" : "habilitado"}`,
      });
    } catch (e) {
      toast({
        title: "Error",
        description: "No se pudo actualizar los permisos",
        variant: "destructive",
      });
    }
  };

  // Crea un registro en /usuarios a partir de un cliente (si no existe)
  const createAccessFromClient = async (client: UserProfile) => {
    if (client.rol !== "cliente") return;
    if (!client.id) return; // id = authUid
    try {
      setCreatingId(client.id);
      await set(ref(db, `usuarios/${client.id}`), {
        nombre: client.nombre,
        correo: client.correo ?? null,
        rol: "cliente",
        activo: client.activo,
        permissions: [], // ajústalo si luego das módulos a clientes
        createdAt: Date.now(),
      });
      toast({ title: "Acceso creado", description: "El cliente ahora aparece como usuario." });
    } catch (e: any) {
      toast({ title: "Error", description: e?.message || "No se pudo crear el acceso", variant: "destructive" });
    } finally {
      setCreatingId(null);
    }
  };

  const getRoleBadgeColor = (rol: string) => {
    const colors: Record<string, string> = {
      admin: "bg-purple-100 text-purple-700 border-purple-300",
      adminGeneral: "bg-purple-100 text-purple-700 border-purple-300",
      pedidos: "bg-blue-100 text-blue-700 border-blue-300",
      reparto: "bg-green-100 text-green-700 border-green-300",
      produccion: "bg-amber-100 text-amber-700 border-amber-300",
      cobranzas: "bg-red-100 text-red-700 border-red-300",
      cliente: "bg-stone-100 text-stone-700 border-stone-300",
    };
    return colors[rol] || "bg-stone-100 text-stone-700";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          )}
          <div>
            <h1 className="text-3xl font-bold text-stone-800">Gestión de Accesos</h1>
            <p className="text-stone-600 mt-1">Administra usuarios, perfiles y permisos de módulos</p>
          </div>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Usuario
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-stone-400" />
            <Input
              placeholder="Buscar por nombre, correo o rol..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Total Usuarios</p>
                <p className="text-2xl font-bold text-stone-800">{allUsers.length}</p>
              </div>
              <Users className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Administradores</p>
                <p className="text-2xl font-bold text-stone-800">
                  {allUsers.filter((u) => u.rol === "admin" || u.rol === "adminGeneral").length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Usuarios Activos</p>
                <p className="text-2xl font-bold text-stone-800">{allUsers.filter((u) => u.activo).length}</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-stone-600">Clientes</p>
                <p className="text-2xl font-bold text-stone-800">{allUsers.filter((u) => u.rol === "cliente").length}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <CardTitle>Usuarios y Permisos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredUsers.map((user) => (
              <Card key={`${user.rol}-${user.id}`} className="border-stone-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-stone-800">{user.nombre}</h3>
                        <Badge variant="outline" className={getRoleBadgeColor(user.rol)}>
                          {user.rol}
                        </Badge>
                        {!user.activo && (
                          <Badge variant="outline" className="bg-red-100 text-red-700 border-red-300">
                            Inactivo
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-stone-600">{user.correo}</p>
                      {user.comercial && (
                        <p className="text-xs text-stone-500 mt-1">
                          <Building2 className="h-3 w-3 inline mr-1" />
                          {user.comercial} {user.sede ? `- ${user.sede}` : ""}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-stone-600">Activo</span>
                        <Switch checked={user.activo} onCheckedChange={() => toggleUserAccess(user)} />
                      </div>

                      {/* Para clientes: botón "Crear acceso" (crea /usuarios/{authUid}) */}
                      {user.rol === "cliente" && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={creatingId === user.id}
                          onClick={() => createAccessFromClient(user)}
                          title="Crear un registro en /usuarios para este cliente"
                        >
                          <UserPlus className="h-4 w-4 mr-2" />
                          {creatingId === user.id ? "Creando..." : "Crear acceso"}
                        </Button>
                      )}

                      {/* Editar (usuarios no-cliente) */}
                      {user.rol !== "cliente" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setShowEditModal(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* Módulos: solo para roles internos (no para clientes) */}
                  {(user.rol === "admin" ||
                    user.rol === "adminGeneral" ||
                    user.rol === "pedidos" ||
                    user.rol === "reparto" ||
                    user.rol === "produccion" ||
                    user.rol === "cobranzas") && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <p className="text-xs font-medium text-stone-700 mb-2">Acceso a módulos:</p>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_MODULES.map((module) => {
                          const hasAccess =
                            user.rol === "admin" ||
                            user.rol === "adminGeneral" ||
                            (user.permissions || []).includes(module.id);
                          const ModuleIcon = module.icon;
                          return (
                            <button
                              key={module.id}
                              onClick={() => toggleModuleAccess(user, module.id)}
                              disabled={user.rol === "admin" || user.rol === "adminGeneral"}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                hasAccess
                                  ? "bg-green-100 text-green-700 border border-green-300"
                                  : "bg-stone-100 text-stone-600 border border-stone-200"
                              } ${
                                user.rol !== "admin" && user.rol !== "adminGeneral"
                                  ? "hover:scale-105 cursor-pointer"
                                  : "opacity-50 cursor-not-allowed"
                              }`}
                            >
                              <ModuleIcon className="h-3 w-3" />
                              {module.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      <UserEditModal
        user={selectedUser}
        open={showEditModal}
        onOpenChange={(open) => {
          setShowEditModal(open);
          if (!open) setSelectedUser(null);
        }}
      />
    </div>
  );
};
