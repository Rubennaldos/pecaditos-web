// src/components/catalog/CategorySelector.tsx
import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { db } from '@/config/firebase';
import { onValue, ref } from 'firebase/database';
import { Cookie, Cake, Package, Sparkles } from 'lucide-react';

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

const categoryIcons: Record<string, any> = {
  todas: Sparkles,
  clasicas: Cookie,
  especiales: Cake,
  combos: Package,
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

        list.sort(
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

  const getCategoryIcon = (catId: string) => {
    const Icon = categoryIcons[catId] || Cookie;
    return Icon;
  };

  return (
    <section className="py-4 px-4">
      <div className="container mx-auto">
        {/* Scroll horizontal en móvil */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
            {/* Botón "Todas" */}
            <button
              onClick={() => onCategoryChange('todas')}
              className={`flex-shrink-0 snap-start transition-all duration-300 ${
                selectedCategory === 'todas'
                  ? 'scale-105'
                  : 'scale-100 hover:scale-105'
              }`}
            >
              <div
                className={`relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                  selectedCategory === 'todas'
                    ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/40'
                    : 'bg-white border-2 border-stone-200 hover:border-amber-300 shadow-md'
                }`}
              >
                <Sparkles
                  className={`w-7 h-7 ${
                    selectedCategory === 'todas' ? 'text-white' : 'text-stone-600'
                  }`}
                />
                <span
                  className={`text-xs font-bold ${
                    selectedCategory === 'todas' ? 'text-white' : 'text-stone-700'
                  }`}
                >
                  Todas
                </span>
                {selectedCategory === 'todas' && (
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                )}
              </div>
            </button>

            {/* Categorías dinámicas */}
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`s-${i}`}
                  className="flex-shrink-0 w-20 h-20 rounded-2xl bg-stone-200 animate-pulse"
                />
              ))
            ) : categories.length === 0 ? (
              <div className="flex-shrink-0 px-4 py-6 text-stone-500 text-sm">
                No hay categorías activas.
              </div>
            ) : (
              categories.map((category) => {
                const Icon = getCategoryIcon(category.id);
                return (
                  <button
                    key={category.id}
                    onClick={() => onCategoryChange(category.id)}
                    className={`flex-shrink-0 snap-start transition-all duration-300 ${
                      selectedCategory === category.id
                        ? 'scale-105'
                        : 'scale-100 hover:scale-105'
                    }`}
                  >
                    <div
                      className={`relative w-20 h-20 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all duration-300 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-br from-amber-400 to-orange-500 shadow-xl shadow-amber-500/40'
                          : 'bg-white border-2 border-stone-200 hover:border-amber-300 shadow-md'
                      }`}
                    >
                      <Icon
                        className={`w-7 h-7 ${
                          selectedCategory === category.id
                            ? 'text-white'
                            : 'text-stone-600'
                        }`}
                      />
                      <span
                        className={`text-xs font-bold truncate max-w-full px-1 ${
                          selectedCategory === category.id
                            ? 'text-white'
                            : 'text-stone-700'
                        }`}
                      >
                        {category.name}
                      </span>
                      {selectedCategory === category.id && (
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-white rounded-full"></div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Gradient fade edges */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none"></div>
        </div>

        {/* Descripción seleccionada */}
        {selectedCategory !== 'todas' && selectedDescription && (
          <div className="text-center mt-4 animate-fade-in">
            <p className="text-sm text-stone-600 bg-amber-50 px-4 py-2 rounded-full inline-block">
              {selectedDescription}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
