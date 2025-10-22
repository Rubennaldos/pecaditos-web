import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { db, auth } from '@/config/firebase';
import { ref, update, remove } from 'firebase/database';
import {
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendPasswordResetEmail,
} from 'firebase/auth';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Trash2,
  Save,
  Shield,
  Package,
  Truck,
  Factory,
  DollarSign,
  BarChart3,
  Building2,
  MapPin,
} from 'lucide-react';

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

interface UserEditModalProps {
  user: UserProfile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AVAILABLE_MODULES = [
  { id: 'dashboard', name: 'Dashboard Global', icon: BarChart3, color: 'purple' },
  { id: 'access-management', name: 'Gestión de Accesos', icon: Shield, color: 'rose' },
  { id: 'orders-admin', name: 'Módulo Pedidos', icon: Package, color: 'blue' },
  { id: 'delivery-admin', name: 'Módulo Reparto', icon: Truck, color: 'green' },
  { id: 'production-admin', name: 'Módulo Producción', icon: Factory, color: 'amber' },
  { id: 'billing-admin', name: 'Módulo Cobranzas', icon: DollarSign, color: 'red' },
  { id: 'customers-admin', name: 'Módulo Clientes', icon: Shield, color: 'blue' },
  { id: 'catalogs-admin', name: 'Catálogos por Cliente', icon: Package, color: 'emerald' },
  { id: 'business-admin', name: 'Gestión Comercial', icon: Building2, color: 'teal' },
  { id: 'logistics', name: 'Módulo Logística', icon: Truck, color: 'indigo' },
  { id: 'locations', name: 'Ubicaciones', icon: MapPin, color: 'indigo' },
];

export const UserEditModal = ({ user, open, onOpenChange }: UserEditModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Profile edit state
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [comercial, setComercial] = useState('');
  const [sede, setSede] = useState('');

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Permissions state
  const [permissions, setPermissions] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setNombre(user.nombre || '');
      setCorreo(user.correo || '');
      setComercial(user.comercial || '');
      setSede(user.sede || '');
      setPermissions(user.permissions || []);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  }, [user]);

  if (!user) return null;

  const isSelf = auth.currentUser?.uid === user.id;

  const handleUpdateProfile = async () => {
    setLoading(true);
    try {
      await update(ref(db, `usuarios/${user.id}`), {
        nombre,
        correo,
        comercial,
        sede,
        permissions, // <-- añadimos permisos al guardar el perfil
      });

      toast({
        title: 'Perfil actualizado',
        description: 'Los datos del usuario se han actualizado correctamente',
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      toast({
        title: 'Error',
        description: 'No se pudo actualizar el perfil',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cambia la contraseña REAL del usuario actual (no escribe nada en RTDB).
   * Requiere reautenticación.
   */
  const handleChangeOwnPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      toast({
        title: 'Error',
        description: 'La nueva contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast({
        title: 'Error',
        description: 'Las contraseñas no coinciden',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const curr = auth.currentUser;
      if (!curr) throw new Error('No hay sesión activa.');

      const currentEmail = curr.email || correo;
      if (!currentEmail) {
        throw new Error('No se encontró correo para reautenticación.');
      }
      if (!currentPassword) {
        throw new Error('Debes ingresar tu contraseña actual para confirmar el cambio.');
      }

      // Reautenticar
      const cred = EmailAuthProvider.credential(currentEmail, currentPassword);
      await reauthenticateWithCredential(curr, cred);

      // Cambiar password
      await updatePassword(curr, newPassword);

      toast({
        title: 'Contraseña actualizada',
        description: 'Tu contraseña fue cambiada correctamente.',
      });

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error al cambiar contraseña propia:', error);
      const msg =
        ({
          'auth/wrong-password': 'La contraseña actual es incorrecta.',
          'auth/invalid-credential': 'La contraseña actual es incorrecta.',
          'auth/too-many-requests': 'Demasiados intentos. Intenta nuevamente en unos minutos.',
        } as Record<string, string>)[error?.code] || error?.message || 'No se pudo cambiar la contraseña';
      toast({ title: 'Error', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Envía email de restablecimiento a otro usuario.
   * Esto SÍ cambia su contraseña de Firebase Auth cuando haga clic en el correo.
   */
  const handleSendResetToOther = async () => {
    if (!correo || !correo.includes('@')) {
      toast({
        title: 'Correo inválido',
        description: 'Este usuario no tiene un correo válido configurado.',
        variant: 'destructive',
      });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, correo.trim());
      toast({
        title: 'Correo enviado',
        description: 'Se envió un email para restablecer la contraseña.',
      });
    } catch (error: any) {
      console.error('Error al enviar restablecimiento:', error);
      toast({
        title: 'Error',
        description: error?.message || 'No se pudo enviar el correo de restablecimiento',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    setLoading(true);
    try {
      // IMPORTANTE: esto elimina solo el perfil en RTDB (no borra la cuenta de Auth)
      await remove(ref(db, `usuarios/${user.id}`));
      toast({
        title: 'Usuario eliminado',
        description: 'Se eliminó el perfil del usuario en la base de datos.',
      });
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el usuario',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleModulePermission = (moduleId: string) => {
    setPermissions((prev) => (prev.includes(moduleId) ? prev.filter((p) => p !== moduleId) : [...prev, moduleId]));
  };

  const handleSavePermissions = async () => {
    setLoading(true);
    try {
      await update(ref(db, `usuarios/${user.id}`), {
        nombre, // <-- añadimos los campos de perfil para mantener consistencia
        correo,
        comercial,
        sede,
        permissions,
      });
      toast({ title: 'Datos actualizados', description: 'Se guardaron los cambios correctamente.' });
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      toast({ title: 'Error', description: 'No se pudo actualizar los permisos', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifica los datos del usuario, cambia su contraseña o elimina la cuenta
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="profile">
                <User className="h-4 w-4 mr-2" />
                Perfil
              </TabsTrigger>
              <TabsTrigger value="permissions">
                <Shield className="h-4 w-4 mr-2" />
                Permisos
              </TabsTrigger>
              <TabsTrigger value="password">
                <Lock className="h-4 w-4 mr-2" />
                Contraseña
              </TabsTrigger>
              <TabsTrigger value="danger">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </TabsTrigger>
            </TabsList>

            {/* Perfil */}
            <TabsContent value="profile" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Juan Pérez" />
                </div>

                <div>
                  <Label htmlFor="correo">Correo electrónico</Label>
                  <Input id="correo" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="usuario@ejemplo.com" />
                </div>

                <div>
                  <Label htmlFor="comercial">Nombre comercial</Label>
                  <Input id="comercial" value={comercial} onChange={(e) => setComercial(e.target.value)} placeholder="Empresa S.A." />
                </div>

                <div>
                  <Label htmlFor="sede">Sede</Label>
                  <Input id="sede" value={sede} onChange={(e) => setSede(e.target.value)} placeholder="Lima - San Isidro" />
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleUpdateProfile} disabled={loading}>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar cambios
                  </Button>
                </div>
              </div>
            </TabsContent>

            {/* Permisos */}
            <TabsContent value="permissions" className="space-y-4 mt-4">
              <div className="space-y-4">
                {user.rol === 'admin' || user.rol === 'adminGeneral' ? (
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <h3 className="font-semibold text-purple-800">Acceso Total</h3>
                    </div>
                    <p className="text-sm text-purple-700">
                      Este usuario tiene rol de <span className="font-semibold">{user.rol}</span> y tiene acceso automático a todos los módulos del sistema.
                    </p>
                  </div>
                ) : (
                  <>
                    <div>
                      <Label className="text-base font-semibold">Control de acceso a módulos</Label>
                      <p className="text-sm text-stone-600 mt-1 mb-4">Selecciona los módulos a los que este usuario tendrá acceso</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {AVAILABLE_MODULES.map((module) => {
                        const hasAccess = permissions.includes(module.id);
                        const ModuleIcon = module.icon;
                        return (
                          <button
                            key={module.id}
                            onClick={() => toggleModulePermission(module.id)}
                            className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                              hasAccess ? 'border-green-400 bg-green-50' : 'border-stone-200 bg-white hover:border-stone-300'
                            }`}
                          >
                            <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${hasAccess ? 'bg-green-100' : 'bg-stone-100'}`}>
                              <ModuleIcon className={`h-5 w-5 ${hasAccess ? 'text-green-700' : 'text-stone-600'}`} />
                            </div>
                            <div className="flex-1 text-left">
                              <p className={`font-medium ${hasAccess ? 'text-green-900' : 'text-stone-800'}`}>{module.name}</p>
                              <p className="text-xs text-stone-500">{hasAccess ? 'Acceso habilitado' : 'Sin acceso'}</p>
                            </div>
                            {hasAccess && (
                              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-500">
                                <svg className="w-4 h-4 text-white" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                                  <path d="M5 13l4 4L19 7"></path>
                                </svg>
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="pt-4 flex justify-end gap-2 border-t">
                      <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                      </Button>
                      <Button onClick={handleSavePermissions} disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        Guardar permisos
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            {/* Contraseña */}
            <TabsContent value="password" className="space-y-4 mt-4">
              {isSelf ? (
                // Cambiar la propia contraseña
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="currentPassword">Contraseña actual</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Tu contraseña actual"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="newPassword">Nueva contraseña</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Nueva contraseña (mínimo 6 caracteres)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword">Confirmar nueva contraseña</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirma la nueva contraseña"
                    />
                  </div>

                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleChangeOwnPassword} disabled={loading || !newPassword}>
                      <Lock className="h-4 w-4 mr-2" />
                      Cambiar contraseña
                    </Button>
                  </div>
                </div>
              ) : (
                // Restablecer contraseña de otro usuario (vía email)
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <p className="text-sm text-amber-800">
                      Para cambiar la contraseña de <b>{user.nombre}</b> debes enviar un correo de
                      restablecimiento. El usuario podrá definir una nueva contraseña desde ese enlace.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="w-32">Correo</Label>
                    <Input value={correo} onChange={(e) => setCorreo(e.target.value)} placeholder="usuario@ejemplo.com" />
                  </div>
                  <div className="pt-4 flex justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSendResetToOther} disabled={loading || !correo}>
                      <Lock className="h-4 w-4 mr-2" />
                      Enviar correo de restablecimiento
                    </Button>
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Eliminar */}
            <TabsContent value="danger" className="space-y-4 mt-4">
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="font-semibold text-red-800 mb-2">Zona de peligro</h3>
                  <p className="text-sm text-red-700 mb-4">
                    Esta acción es permanente y no se puede deshacer. Se eliminará el perfil en la base de datos (no elimina la cuenta de Auth).
                  </p>
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeleteDialog(true)}
                    className="w-full"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar perfil
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará el perfil de{' '}
              <span className="font-semibold">{user.nombre}</span> en la base de datos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={loading}
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
