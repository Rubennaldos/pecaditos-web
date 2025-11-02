import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Phone, MapPin, Mail } from 'lucide-react';

import { getAuth } from 'firebase/auth';
import { db } from '@/config/firebase';
import { onValue, ref, update } from 'firebase/database';
import { toast } from '@/hooks/use-toast';

interface WholesaleProfileEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (data: Profile) => void;
}

type Profile = {
  name: string;           // Nombre del negocio
  email: string;          // Email de contacto (no cambia Auth)
  phone: string;          // Teléfono de contacto
  address: string;        // Dirección fiscal (texto libre)
  ruc: string;            // RUC
  contactPerson: string;  // Persona de contacto
};

const EMPTY: Profile = {
  name: '',
  email: '',
  phone: '',
  address: '',
  ruc: '',
  contactPerson: '',
};

export const WholesaleProfileEditor = ({ isOpen, onClose, onSave }: WholesaleProfileEditorProps) => {
  const [formData, setFormData] = useState<Profile>(EMPTY);
  const [clientId, setClientId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Cargar clientId del usuario y luego el perfil del cliente
  useEffect(() => {
    if (!isOpen) return;

    const uid = getAuth().currentUser?.uid;
    if (!uid) return;

    const userRef = ref(db, `wholesale/users/${uid}`);
    let offClient: (() => void) | null = null;

    const offUser = onValue(userRef, (snap) => {
      const cId = snap.val()?.clientId as string | undefined;
      setClientId(cId || '');

      // Limpia suscripción anterior si cambia el cliente
      if (offClient) {
        offClient();
        offClient = null;
      }

      if (!cId) {
        setFormData(EMPTY);
        setLoading(false);
        return;
      }

      const profileRef = ref(db, `wholesale/clients/${cId}/profile`);
      offClient = onValue(profileRef, (snap2) => {
        const v = snap2.val() || {};
        setFormData({
          name: v?.name || v?.businessName || '',
          email: v?.email || '',
          phone: v?.phone || '',
          address: v?.address || '',
          ruc: v?.ruc || '',
          contactPerson: v?.contactPerson || '',
        });
        setLoading(false);
      });
    });

    return () => {
      offUser?.();
      if (offClient) offClient();
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      toast({
        title: 'No se puede guardar',
        description: 'No se encontró el cliente vinculado a tu cuenta.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      await update(ref(db, `wholesale/clients/${clientId}/profile`), {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        ruc: formData.ruc.trim(),
        contactPerson: formData.contactPerson.trim(),
        updatedAt: Date.now(),
      });

      toast({ title: 'Cambios guardados', description: 'Tu perfil mayorista fue actualizado.' });
      onSave?.(formData);
      onClose();
    } catch (err: any) {
      console.error(err);
      toast({
        title: 'Error al guardar',
        description: err?.message || 'Intenta nuevamente.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Editar Datos Personales
          </DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-10 text-center text-stone-400">Cargando…</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Nombre del Negocio
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1"
                placeholder="Nombre comercial"
              />
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1"
                placeholder="correo@empresa.com"
              />
            </div>

            <div>
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Teléfono
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1"
                placeholder="+51 999 999 999"
              />
            </div>

            <div>
              <Label htmlFor="address" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Dirección
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="mt-1"
                rows={3}
                placeholder="Calle / Av., distrito, provincia…"
              />
            </div>

            <div>
              <Label htmlFor="ruc">RUC</Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                className="mt-1"
                placeholder="20XXXXXXXXX"
              />
            </div>

            <div>
              <Label htmlFor="contactPerson">Persona de Contacto</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                className="mt-1"
                placeholder="Nombre y apellido"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={saving || !clientId}>
                {saving ? 'Guardando…' : 'Guardar Cambios'}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
