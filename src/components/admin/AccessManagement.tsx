import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Users,
  Shield,
  Search,
  Plus,
  Edit,
  Trash2,
  Building2,
  MapPin,
  Package,
  Truck,
  Factory,
  DollarSign,
  BarChart3,
  ArrowLeft,
} from 'lucide-react';
import { db } from '@/config/firebase';
import { ref, onValue, update, set, remove } from 'firebase/database';
import { useToast } from '@/hooks/use-toast';
import { UserEditModal } from './UserEditModal';

interface UserProfile {
  id: string;
  nombre: string;
  correo: string;
  rol: string;
  activo: boolean;
  comercial?: string;
  sede?: string;
  permissions?: string[];
}

const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard Global', icon: BarChart3, color: 'purple' },
  { id: 'orders-admin', name: 'Módulo Pedidos', icon: Package, color: 'blue' },
  { id: 'delivery-admin', name: 'Módulo Reparto', icon: Truck, color: 'green' },
  { id: 'production-admin', name: 'Módulo Producción', icon: Factory, color: 'amber' },
  { id: 'billing-admin', name: 'Módulo Cobranzas', icon: DollarSign, color: 'red' },
  { id: 'customers-admin', name: 'Módulo Clientes', icon: Building2, color: 'blue' },
  { id: 'business-admin', name: 'Gestión Comercial', icon: Building2, color: 'teal' },
  { id: 'logistics', name: 'Módulo Logística', icon: Truck, color: 'indigo' },
  { id: 'locations', name: 'Ubicaciones', icon: MapPin, color: 'indigo' },
];

interface AccessManagementProps {
  onBack?: () => void;
}

export const AccessManagement = ({ onBack }: AccessManagementProps) => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [clients, setClients] = useState<UserProfile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Combinar usuarios y clientes en un solo array
  const allUsers = [...users, ...clients];

  useEffect(() => {
    const usersRef = ref(db, 'usuarios');
    
    // Cargar usuarios desde /usuarios
    const unsubscribeUsers = onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersList = Object.entries(data).map(([id, user]: [string, any]) => ({
          id,
          nombre: user.nombre || '',
          correo: user.correo || '',
          rol: user.rol || 'cliente',
          activo: user.activo !== false,
          comercial: user.comercial || '',
          sede: user.sede || '',
          permissions: user.permissions || [],
        }));
        setUsers(usersList);
      } else {
        setUsers([]);
      }
    });

    return () => {
      unsubscribeUsers();
    };
  }, []);

  useEffect(() => {
    const clientsRef = ref(db, 'clients');
    
    // Cargar clientes desde /clients (solo los que tienen authUid)
    const unsubscribeClients = onValue(clientsRef, (snapshot) => {
      const data = snapshot.val();
      console.log('📊 [AccessManagement] Datos de clients:', data);
      
      if (data) {
        const allClients = Object.entries(data);
        console.log('📊 [AccessManagement] Total clientes en DB:', allClients.length);
        
        const clientsWithAuth = allClients.filter(([_, client]: [string, any]) => client.authUid);
        console.log('📊 [AccessManagement] Clientes con authUid:', clientsWithAuth.length);
        
        const clientsList = clientsWithAuth.map(([clientId, client]: [string, any]) => {
          console.log('📊 [AccessManagement] Cliente:', {
            clientId,
            authUid: client.authUid,
            razonSocial: client.razonSocial,
            email: client.emailFacturacion,
            estado: client.estado
          });
          
          return {
            id: client.authUid, // Usar el authUid como ID
            clientId, // Guardar el ID del cliente para referencia
            nombre: client.razonSocial || 'Sin nombre',
            correo: client.emailFacturacion || 'Sin email',
            rol: 'cliente',
            activo: client.estado === 'activo',
            comercial: `${client.departamento || ''} - ${client.distrito || ''}`.trim(),
            sede: client.direccionFiscal || 'Sin dirección',
            permissions: [],
          };
        });
        
        console.log('📊 [AccessManagement] Clientes procesados:', clientsList);
        setClients(clientsList);
      } else {
        console.log('⚠️ [AccessManagement] No hay datos en /clients');
        setClients([]);
      }
    });

    return () => {
      unsubscribeClients();
    };
  }, []);

  const filteredUsers = allUsers.filter(
    (user) =>
      user.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.correo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.rol.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUserAccess = async (userId: string, currentStatus: boolean) => {
    try {
      await update(ref(db, `usuarios/${userId}`), {
        activo: !currentStatus,
      });
      toast({
        title: currentStatus ? 'Acceso deshabilitado' : 'Acceso habilitado',
        description: `Usuario ${currentStatus ? 'bloqueado' : 'activado'} exitosamente`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el acceso del usuario',
        variant: 'destructive',
      });
    }
  };

  const toggleModuleAccess = async (userId: string, moduleId: string, currentPermissions: string[]) => {
    const hasAccess = currentPermissions.includes(moduleId);
    const newPermissions = hasAccess
      ? currentPermissions.filter((p) => p !== moduleId)
      : [...currentPermissions, moduleId];

    try {
      await update(ref(db, `usuarios/${userId}`), {
        permissions: newPermissions,
      });
      toast({
        title: hasAccess ? 'Acceso removido' : 'Acceso otorgado',
        description: `Módulo ${hasAccess ? 'deshabilitado' : 'habilitado'} para el usuario`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo actualizar los permisos',
        variant: 'destructive',
      });
    }
  };

  const getRoleBadgeColor = (rol: string) => {
    const colors: Record<string, string> = {
      admin: 'bg-purple-100 text-purple-700 border-purple-300',
      adminGeneral: 'bg-purple-100 text-purple-700 border-purple-300',
      pedidos: 'bg-blue-100 text-blue-700 border-blue-300',
      reparto: 'bg-green-100 text-green-700 border-green-300',
      produccion: 'bg-amber-100 text-amber-700 border-amber-300',
      cobranzas: 'bg-red-100 text-red-700 border-red-300',
      cliente: 'bg-stone-100 text-stone-700 border-stone-300',
    };
    return colors[rol] || 'bg-stone-100 text-stone-700';
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
                  {allUsers.filter((u) => u.rol === 'admin' || u.rol === 'adminGeneral').length}
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
                <p className="text-2xl font-bold text-stone-800">{allUsers.filter((u) => u.rol === 'cliente').length}</p>
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
              <Card key={user.id} className="border-stone-200">
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
                          {user.comercial} - {user.sede}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-stone-600">Activo</span>
                        <Switch checked={user.activo} onCheckedChange={() => toggleUserAccess(user.id, user.activo)} />
                      </div>
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
                    </div>
                  </div>

                  {/* Module Permissions */}
                  {(user.rol === 'admin' ||
                    user.rol === 'adminGeneral' ||
                    user.rol === 'pedidos' ||
                    user.rol === 'reparto' ||
                    user.rol === 'produccion' ||
                    user.rol === 'cobranzas') && (
                    <div className="mt-3 pt-3 border-t border-stone-200">
                      <p className="text-xs font-medium text-stone-700 mb-2">Acceso a módulos:</p>
                      <div className="flex flex-wrap gap-2">
                        {AVAILABLE_MODULES.map((module) => {
                          const hasAccess =
                            user.rol === 'admin' ||
                            user.rol === 'adminGeneral' ||
                            (user.permissions || []).includes(module.id);
                          const ModuleIcon = module.icon;
                          return (
                            <button
                              key={module.id}
                              onClick={() => toggleModuleAccess(user.id, module.id, user.permissions || [])}
                              disabled={user.rol === 'admin' || user.rol === 'adminGeneral'}
                              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                hasAccess
                                  ? 'bg-green-100 text-green-700 border border-green-300'
                                  : 'bg-stone-100 text-stone-600 border border-stone-200'
                              } ${
                                user.rol !== 'admin' && user.rol !== 'adminGeneral'
                                  ? 'hover:scale-105 cursor-pointer'
                                  : 'opacity-50 cursor-not-allowed'
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
