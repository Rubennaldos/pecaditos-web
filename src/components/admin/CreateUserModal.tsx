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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { db, functions } from '@/config/firebase';
import { ref, update } from 'firebase/database';
import { httpsCallable } from 'firebase/functions';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

type Rol =
  | 'admin'
  | 'adminGeneral'
  | 'pedidos'
  | 'reparto'
  | 'produccion'
  | 'cobranzas'
  | 'logistica'
  | 'mayorista'
  | 'cliente';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  prefilledData?: {
    nombre?: string;
    email?: string;
    rol?: string;
    clientId?: string;
  };
}

export const CreateUserModal = ({ open, onOpenChange, prefilledData }: CreateUserModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<Rol>('cliente');
  const [clientId, setClientId] = useState<string>('');

  // Pre-llenar datos cuando abre y hay prefilledData
  useEffect(() => {
    if (open && prefilledData) {
      setNombre(prefilledData.nombre || '');
      setEmail(prefilledData.email || '');
      setRol(((prefilledData.rol as Rol) || 'cliente') as Rol);
      setClientId(prefilledData.clientId || '');
    }
    if (open && !prefilledData) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('cliente');
    setClientId('');
    setShowPassword(false);
  };

  const mapErrorMessage = (error: any) => {
    const code: string | undefined = error?.code;
    const msg: string | undefined = error?.message;

    // Posibles mensajes retornados por HttpsError o Firebase Admin
    if (code === 'functions/internal' || code === 'internal') {
      // Mensaje del backend suele venir ya legible en `message`
      if (msg?.toLowerCase().includes('email already') || msg?.toLowerCase().includes('already exists')) {
        return 'El correo ya está registrado';
      }
      return msg || 'Error interno al crear usuario';
    }

    if (code === 'auth/email-already-in-use') return 'El correo ya está registrado';
    if (code === 'auth/invalid-email') return 'El correo no es válido';
    if (code === 'auth/weak-password') return 'La contraseña es muy débil';

    return msg || 'No se pudo crear el usuario';
  };

  const handleCreate = async () => {
    // Validación
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      toast({
        title: 'Error',
        description: 'Por favor completa todos los campos',
        variant: 'destructive',
      });
      return;
    }

    if (password.length < 6) {
      toast({
        title: 'Error',
        description: 'La contraseña debe tener al menos 6 caracteres',
        variant: 'destructive',
      });
      return;
    }

    if (!email.includes('@')) {
      toast({
        title: 'Error',
        description: 'Por favor ingresa un correo válido',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Llamar a la Cloud Function (createUser)
      const createUser = httpsCallable(functions, 'createUser');
      const result = (await createUser({
        email: email.trim(),
        password: password.trim(),
        nombre: nombre.trim(),
        rol,
      })) as { data?: { ok?: boolean; uid?: string } };

      const uid = result?.data?.uid;

      // Si es un cliente vinculado desde /clients, guardamos su UID y activamos
      if (clientId && uid) {
        await update(ref(db, `clients/${clientId}`), {
          authUid: uid,
          estado: 'activo',
        });
      }

      toast({
        title: 'Usuario creado',
        description: `Usuario ${nombre} creado exitosamente${uid ? ` (UID: ${uid})` : ''}.`,
      });

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      toast({
        title: 'Error',
        description: mapErrorMessage(error),
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <UserPlus className="h-6 w-6 text-purple-600" />
            Crear Nuevo Usuario
          </DialogTitle>
          <DialogDescription>
            Crea una cuenta de usuario que podrá iniciar sesión en el sistema
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="nombre">Nombre completo *</Label>
            <Input
              id="nombre"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Juan Pérez"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email">Correo electrónico *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password">Contraseña *</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                disabled={loading}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-stone-500 mt-1">
              El usuario usará esta contraseña para iniciar sesión
            </p>
          </div>

          <div>
            <Label htmlFor="rol">Rol *</Label>
            <Select
              value={rol}
              onValueChange={(v) => setRol(v as Rol)}
              disabled={loading}
            >
              <SelectTrigger id="rol">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cliente">Cliente</SelectItem>
                <SelectItem value="mayorista">Mayorista</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="adminGeneral">Admin General</SelectItem>
                <SelectItem value="pedidos">Pedidos</SelectItem>
                <SelectItem value="reparto">Reparto</SelectItem>
                <SelectItem value="produccion">Producción</SelectItem>
                <SelectItem value="cobranzas">Cobranzas</SelectItem>
                <SelectItem value="logistica">Logística</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Si viene desde un cliente, opcionalmente muestra el clientId (solo lectura) */}
          {clientId ? (
            <div>
              <Label>Cliente vinculado</Label>
              <Input value={clientId} readOnly className="bg-stone-50" />
              <p className="text-xs text-stone-500 mt-1">
                Se asignará el UID creado a este cliente y quedará en estado <b>activo</b>.
              </p>
            </div>
          ) : null}

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                onOpenChange(false);
              }}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreate}
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {loading ? 'Creando...' : 'Crear Usuario'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
