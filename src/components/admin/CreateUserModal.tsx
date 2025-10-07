import { useState } from 'react';
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
import { functions } from '@/config/firebase';
import { httpsCallable } from 'firebase/functions';
import { Eye, EyeOff, UserPlus } from 'lucide-react';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CreateUserModal = ({ open, onOpenChange }: CreateUserModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Form state
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol] = useState<string>('cliente');

  const resetForm = () => {
    setNombre('');
    setEmail('');
    setPassword('');
    setRol('cliente');
    setShowPassword(false);
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
      // Llamar a la Cloud Function
      const createUser = httpsCallable(functions, 'createUser');
      const result = await createUser({
        email: email.trim(),
        password: password.trim(),
        nombre: nombre.trim(),
        rol,
      });

      toast({
        title: 'Usuario creado',
        description: `Usuario ${nombre} creado exitosamente. Ya puede iniciar sesión.`,
      });

      resetForm();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error al crear usuario:', error);
      
      let errorMessage = 'No se pudo crear el usuario';
      
      // Manejar errores específicos de Firebase
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'El correo ya está registrado';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'El correo no es válido';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'La contraseña es muy débil';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
            <Select value={rol} onValueChange={setRol} disabled={loading}>
              <SelectTrigger id="rol">
                <SelectValue placeholder="Selecciona un rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="adminGeneral">Admin General</SelectItem>
                <SelectItem value="pedidos">Pedidos</SelectItem>
                <SelectItem value="reparto">Reparto</SelectItem>
                <SelectItem value="produccion">Producción</SelectItem>
                <SelectItem value="cobranzas">Cobranzas</SelectItem>
                <SelectItem value="logistica">Logística</SelectItem>
                <SelectItem value="cliente">Cliente</SelectItem>
              </SelectContent>
            </Select>
          </div>

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
