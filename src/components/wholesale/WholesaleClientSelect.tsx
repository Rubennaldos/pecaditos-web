import { useEffect, useState } from 'react';
import { ref, onValue } from 'firebase/database';
import { db } from '@/config/firebase';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Client = {
  id: string;
  name: string;
};

export default function WholesaleClientSelect({
  value,
  onChange,
  label = 'Cliente Mayorista',
}: {
  value?: string;
  onChange: (clientId: string) => void;
  label?: string;
}) {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    const r = ref(db, 'wholesale/clients');
    const off = onValue(r, (snap) => {
      const val = snap.val() || {};
      const list: Client[] = Object.entries(val).map(([id, v]: any) => ({
        id,
        name: v?.name || id,
      }));
      setClients(list);
    });
    return () => off();
  }, []);

  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Select value={value ?? ''} onValueChange={onChange}>
        <SelectTrigger><SelectValue placeholder="Selecciona un cliente..." /></SelectTrigger>
        <SelectContent>
          {clients.length === 0 && <div className="px-3 py-2 text-sm text-stone-500">No hay clientes</div>}
          {clients.map((c) => (
            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
