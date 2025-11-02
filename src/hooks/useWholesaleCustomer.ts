import { useEffect, useMemo, useState } from 'react';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { onValue, ref, off } from 'firebase/database';
import { db } from '@/config/firebase';

export type WholesaleCustomer = {
  uid: string;
  nombreComercial?: string;
  razonSocial?: string;
  nombre?: string;
  email?: string;
  telefono?: string;
  whatsapp?: string;
  direcciones?: Record<string, any>;
};

/**
 * Lee el perfil del cliente mayorista desde RTDB.
 * Busca en varios paths y se queda con el primero que tenga datos.
 * Si quieres, puedes pasar tus propios paths: useWholesaleCustomer([...paths])
 */
export function useWholesaleCustomer(customPaths?: string[]) {
  const auth = getAuth();
  const [user, setUser] = useState<User | null>(auth.currentUser);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<WholesaleCustomer | null>(null);

  // Escuchar sesión
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsub();
  }, [auth]);

  // Leer perfil en RTDB
  useEffect(() => {
    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    setLoading(true);

    // Orden de búsqueda (ajústalo si tu estructura es distinta)
    const PATHS =
      customPaths ?? [
        `wholesale/customers/${user.uid}/profile`, // recomendado
        `clientes/${user.uid}`,
        `mayoristas/${user.uid}`,
        `usuarios/${user.uid}`,
      ];

    let resolved = false;
    const unsubs: Array<() => void> = [];

    PATHS.forEach((p) => {
      const r = ref(db, p);
      const unsub = onValue(
        r,
        (snap) => {
          if (resolved) return; // ya encontramos un perfil válido
          const v = snap.val();
          if (!v) return;

          resolved = true;

          setData({
            uid: user.uid,
            email: v.email ?? user.email ?? '',
            nombreComercial: v.nombreComercial ?? v.businessName ?? v.comercial ?? '',
            razonSocial: v.razonSocial ?? v.razon ?? '',
            nombre: v.nombre ?? v.contactName ?? '',
            telefono: v.telefono ?? '',
            whatsapp: v.whatsapp ?? '',
            direcciones: v.direcciones ?? {},
          });

          setLoading(false);

          // Detener TODOS los listeners abiertos
          unsubs.forEach((fn) => {
            try {
              fn();
            } catch { /* no-op */ }
          });
        },
        () => {
          // ignoramos errores individuales de path
        }
      );

      // guardamos cómo desuscribir este path
      unsubs.push(() => {
        try {
          off(r);
  } catch { /* no-op */ }
        try {
          unsub();
  } catch { /* no-op */ }
      });
    });

    // Si ninguno devuelve datos, cortar el loading
    const t = setTimeout(() => {
      if (!resolved) setLoading(false);
    }, 600);

    return () => {
      clearTimeout(t);
      unsubs.forEach((fn) => {
        try {
          fn();
  } catch { /* no-op */ }
      });
    };
  }, [user, customPaths]);

  const displayName = useMemo(() => {
    if (!user && !data) return 'Invitado';
    return (
      data?.nombreComercial ||
      data?.razonSocial ||
      data?.nombre ||
      user?.displayName ||
      (user?.email ? user.email.split('@')[0] : 'Cliente')
    );
  }, [data, user]);

  return { uid: user?.uid ?? null, loading, data, displayName };
}
