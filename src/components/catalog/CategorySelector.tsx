// src/components/catalog/CategorySelector.tsx
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { db } from '@/config/firebase'; // si no usas alias, usa: import { db } from '../../config/firebase';
import { onValue, ref } from 'firebase/database';

interface CategorySelectorProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

type DbCategory = {
  name?: string;
  slug?: string;
  sortOrder?: number;
  active?: boolean;
  description?: string;
};

type UiCategory = {
  id: string;
  name: string;
  slug?: string;
  sortOrder: number;
  active: boolean;
  description?: string;
};

export const CategorySelector = ({
  selectedCategory,
  onCategoryChange,
}: CategorySelectorProps) => {
  const [categories, setCategories] = useState<UiCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const r = ref(db, 'catalog/categories');
    const off = onValue(
      r,
      (snap) => {
        const val = (snap.val() || {}) as Record<string, DbCategory>;
        const list: UiCategory[] = Object.entries(val).map(([id, c]) => ({
          id,
          name: c?.name ?? id,
          slug: c?.slug,
          sortOrder: Number.isFinite(c?.sortOrder) ? (c!.sortOrder as number) : 9999,
          active: c?.active !== false,
          description: c?.description,
        }));

        // Solo activas y ordenadas
        list
          .sort(
            (a, b) =>
              (a.sortOrder ?? 9999) - (b.sortOrder ?? 9999) ||
              a.name.localeCompare(b.name)
          );

        setCategories(list.filter((c) => c.active));
        setLoading(false);
      },
      () => setLoading(false)
    );

    return () => off();
  }, []);

  const selectedDescription = useMemo(() => {
    if (selectedCategory === 'todas') return '';
    const found = categories.find((c) => c.id === selectedCategory);
    return found?.description ?? '';
  }, [categories, selectedCategory]);

  return (
    <section className="bg-stone-50 py-8 border-b border-stone-200">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-display font-bold text-stone-800 mb-2">
            Nuestras Categorías
          </h2>
          <p className="text-stone-600">
            Encuentra tus galletas favoritas por sabor y tipo
          </p>
        </div>

        {/* Botones de categorías */}
        <div className="flex flex-wrap justify-center gap-3 md:gap-4">
          {/* Botón "Todas" */}
          <Button
            key="todas"
            variant={selectedCategory === 'todas' ? 'default' : 'outline'}
            size="lg"
            onClick={() => onCategoryChange('todas')}
            className={`px-6 py-3 rounded-full font-semibold transition-all duration-200
              ${
                selectedCategory === 'todas'
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md transform scale-105'
                  : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300 hover:border-amber-400'
              }`}
          >
            <span className="text-sm md:text-base">Todas</span>
          </Button>

          {/* Dinámicas desde RTDB */}
          {loading ? (
            // Skeleton simple mientras carga
            <>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`s-${i}`}
                  className="h-10 md:h-12 w-28 md:w-32 rounded-full bg-stone-200 animate-pulse"
                />
              ))}
            </>
          ) : categories.length === 0 ? (
            <span className="text-stone-500 text-sm">
              No hay categorías activas.
            </span>
          ) : (
            categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? 'default' : 'outline'}
                size="lg"
                onClick={() => onCategoryChange(category.id)}
                className={`px-6 py-3 rounded-full font-semibold transition-all duration-200
                  ${
                    selectedCategory === category.id
                      ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-md transform scale-105'
                      : 'bg-white hover:bg-stone-50 text-stone-700 border-stone-300 hover:border-amber-400'
                  }`}
              >
                <span className="text-sm md:text-base">{category.name}</span>
              </Button>
            ))
          )}
        </div>

        {/* Descripción de la categoría seleccionada */}
        {selectedCategory !== 'todas' && selectedDescription && (
          <div className="text-center mt-4">
            <p className="text-stone-600 text-sm">{selectedDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
};
