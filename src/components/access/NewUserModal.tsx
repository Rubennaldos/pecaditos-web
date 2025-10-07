import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { createUserAdmin } from "@/services/adminUsers";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onCreated?: () => void; // para refrescar lista luego de crear
};

export default function NewUserModal({ open, onOpenChange, onCreated }: Props) {
  const { toast } = useToast();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<"admin"|"adminGeneral"|"pedidos"|"reparto"|"produccion"|"cobranzas"|"logistica"|"mayorista"|"cliente">("cliente");
  const [loading, setLoading] = useState(false);

  const onCreate = async () => {
    if (!nombre || !email || !password || !rol) {
      toast({ title: "Completa los campos", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      const { ok, uid } = await createUserAdmin({ nombre, email, password, rol });
      if (ok) {
        toast({ title: "Usuario creado", description: `UID: ${uid}` });
        onOpenChange(false);
        setNombre(""); setEmail(""); setPassword("");
        onCreated?.();
      }
    } catch (e: any) {
      toast({
        title: "Error al crear usuario",
        description: e?.message ?? "Intenta nuevamente",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Usuario</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Nombre completo</Label>
            <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Juan Pérez" />
          </div>
          <div>
            <Label>Correo</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="usuario@ejemplo.com" />
          </div>
          <div>
            <Label>Contraseña</Label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <Label>Rol</Label>
            <select
              className="w-full h-10 rounded-md border px-3 text-sm"
              value={rol}
              onChange={(e) => setRol(e.target.value as any)}
            >
              <option value="cliente">cliente</option>
              <option value="admin">admin</option>
              <option value="adminGeneral">adminGeneral</option>
              <option value="pedidos">pedidos</option>
              <option value="reparto">reparto</option>
              <option value="produccion">produccion</option>
              <option value="cobranzas">cobranzas</option>
              <option value="logistica">logistica</option>
              <option value="mayorista">mayorista</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button onClick={onCreate} disabled={loading}>
              {loading ? "Creando..." : "Crear Usuario"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
