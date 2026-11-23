'use client';

import { ProductCategory } from '@/types';

interface CategoryNavProps {
  selectedCategory: ProductCategory | 'todas';
  onSelectCategory: (cat: ProductCategory | 'todas') => void;
  productCounts: Record<string, number>;
}

const CATEGORIES: { id: ProductCategory | 'todas'; label: string; icon: string }[] = [
  { id: 'todas', label: 'Todo el Minimarket', icon: '🛒' },
  { id: 'combos', label: 'Combos & Sancochos', icon: '🍲' },
  { id: 'frutas', label: 'Frutas Tropicales', icon: '🥭' },
  { id: 'verduras', label: 'Verduras Frescas', icon: '🥬' },
  { id: 'tuberculos', label: 'Tubérculos & Plátanos', icon: '🥔' },
  { id: 'despensa', label: 'Despensa & Abarrotes', icon: '🥚' },
  { id: 'hierbas_aromaticas', label: 'Hierbas & Sazón', icon: '🌿' },
];

export default function CategoryNav({
  selectedCategory,
  onSelectCategory,
  productCounts,
}: CategoryNavProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 no-scrollbar scroll-smooth">
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const count = productCounts[cat.id] ?? 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer shrink-0 border ${
              isSelected
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-md shadow-emerald-700/20 scale-102'
                : 'bg-white text-stone-700 border-stone-200/80 hover:bg-stone-100 hover:border-stone-300'
            }`}
          >
            <span className="text-base sm:text-lg">{cat.icon}</span>
            <span>{cat.label}</span>
            {count > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
