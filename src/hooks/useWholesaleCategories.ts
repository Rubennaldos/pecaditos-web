import { useEffect, useState, useMemo } from 'react';
import { db } from '@/config/firebase';
import { onValue, ref } from 'firebase/database';

export type WholesaleCategory = {
  id: string;
  name: string;
  slug?: string;
  sortOrder?: number;
  active?: boolean;
};

export function useWholesaleCategories() {
  const [items, setItems] = useState<WholesaleCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const r = ref(db, 'catalog/categories');
    const off = onValue(r, (snap) => {
      const val = snap.val() || {};
      const list: WholesaleCategory[] = Object.entries(val).map(([id, v]: [string, any]) => ({
        id,
        name: v?.name ?? id,
        slug: v?.slug ?? id,
        sortOrder: Number(v?.sortOrder ?? 0),
        active: v?.active !== false,
      }));
      setItems(list.filter((c) => c.active));
      setLoading(false);
    });
    return () => off();
  }, []);

  const sorted = useMemo(
    () => [...items].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [items]
  );

  // Siempre inyectamos la opción "todas" al inicio
  const withAll = useMemo<WholesaleCategory[]>(
    () => [{ id: 'todas', name: 'Todas', sortOrder: -1, active: true }, ...sorted],
    [sorted]
  );

  return { loading, categories: withAll };
}
